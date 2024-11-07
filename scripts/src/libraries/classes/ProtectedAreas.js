import { world, BlockVolume, EffectTypes, ItemStack, system, Effect } from "@minecraft/server";
import { Vector3 } from "../Math/index";
import { PvPManager } from "./PvPSystem";
import { ProtectedSubAreas } from "./ProtectedSubAreas";

export class ProtectedAreas {
  constructor() {
    if (!world.getDynamicProperty("protectedAreas")) {
      world.setDynamicProperty("protectedAreas", JSON.stringify([]));
    }
    if (!world.getDynamicProperty("areaAdmins")) {
      world.setDynamicProperty("areaAdmins", JSON.stringify([]));
    }
  }

  getAreas() {
    try {
      return JSON.parse(world.getDynamicProperty("protectedAreas"));
    } catch (error) {
      console.error("Error parsing protected areas:", error);
      return [];
    }
  }

  getAdmins() {
    try {
      return JSON.parse(world.getDynamicProperty("areaAdmins"));
    } catch (error) {
      console.error("Error parsing area admins:", error);
      return [];
    }
  }

  addAdmin({ player }) {
    const admins = this.getAdmins();
    if (!admins.includes(player)) {
      admins.push(player);
      this.updateAdmins({ admins });
      console.warn(`§b${player}§f §eadded to the admins list!`);
    }
  }

  setArea({ name, start, end, damage, flight, effect }) {
    if (!(start instanceof Vector3) || !(end instanceof Vector3)) {
      console.error(`§eInvalid parameters! Expected§f §bVector§f`);
      return;
    }

    const areas = this.getAreas();
    if (areas.some(area => area.id === name)) {
      console.error(`§b${name}§f §eis already in use, choose another area name!`);
      return;
    }

    const newArea = {
      id: name,
      start: { x: start.x, y: start.y, z: start.z },
      end: { x: end.x, y: end.y, z: end.z },
      damage,
      effect: effect ? this.parseEffect(effect) : null,
      flight,
      subAreas: []
    };

    const areaVolume = new BlockVolume(newArea.start, newArea.end);
    const overlaps = areas.some(area =>
      areaVolume.intersects(new BlockVolume(area.start, area.end))
    );

    if (!overlaps) {
      areas.push(newArea);
      this.updateAreas({ areas });
      console.warn(`§b${name}§f §eadded to protected areas!`);
    } else {
      console.warn(`§b${name}§f §ecan't be created due to overlap with another area!`);
    }

    if (effect) {
      this.applyAreaEffect(newArea, effect);
    }
  }

  parseEffect(effect) {
    return {
      name: effect.name || "",
      duration: effect.duration || 1,
      showParticles: effect.showParticles !== undefined ? effect.showParticles : false,
      amplifier: effect.amplifier || 1,
    };
  }

  applyAreaEffect(area, effect) {
    const effectType = EffectTypes[effect.name];
    if (!effectType) {
      console.error(`Invalid effect name: ${effect.name}`);
      return;
    }

    const playersInArea = world.getPlayers().filter(player =>
      new Area(area).isPlayerInside(player.location)
    );

    playersInArea.forEach(player => {
      player.addEffect(new Effect(effectType, effect.duration, { showParticles: effect.showParticles }));
    });
  }

  updateAreas({ areas }) {
    world.setDynamicProperty("protectedAreas", JSON.stringify(areas));
  }

  updateAdmins({ admins }) {
    world.setDynamicProperty("areaAdmins", JSON.stringify(admins));
  }
}


export class Area {
    constructor(AreaBox) {
      this.left = Math.min(AreaBox.start.x, AreaBox.end.x);
      this.right = Math.max(AreaBox.start.x, AreaBox.end.x);
      this.back = Math.min(AreaBox.start.z, AreaBox.end.z);
      this.front = Math.max(AreaBox.start.z, AreaBox.end.z);
      this.bottom = Math.min(AreaBox.start.y, AreaBox.end.y);
      this.top = Math.max(AreaBox.start.y, AreaBox.end.y);
    }
  
    calculateSideArea(start, end) {
      const locations = [];
      for (let x = start.x; x <= end.x; x++) {
        for (let y = start.y; y <= end.y; y++) {
          for (let z = start.z; z <= end.z; z++) {
            locations.push({ x, y, z });
          }
        }
      }
      return locations;
    }
  
    frontSideArea() {
      this.sideArea = { start: { x: this.left, y: this.bottom, z: this.front }, end: { x: this.right, y: this.top, z: this.front } };
      return this.calculateSideArea(this.sideArea.start, this.sideArea.end);
    }
  
    backSideArea() {
      this.sideArea = { start: { x: this.left, y: this.bottom, z: this.back }, end: { x: this.right, y: this.top, z: this.back } };
      return this.calculateSideArea(this.sideArea.start, this.sideArea.end);
    }
  
    leftSideArea() {
      this.sideArea = { start: { x: this.left, y: this.bottom, z: this.back }, end: { x: this.left, y: this.top, z: this.front } };
      return this.calculateSideArea(this.sideArea.start, this.sideArea.end);
    }
  
    rightSideArea() {
      this.sideArea = { start: { x: this.right, y: this.bottom, z: this.back }, end: { x: this.right, y: this.top, z: this.front } };
      return this.calculateSideArea(this.sideArea.start, this.sideArea.end);
    }
  
    bottomSideArea() {
      this.sideArea = { start: { x: this.left, y: this.bottom, z: this.back }, end: { x: this.right, y: this.bottom, z: this.front } };
      return this.calculateSideArea(this.sideArea.start, this.sideArea.end);
    }
  
    topSideArea() {
      this.sideArea = { start: { x: this.left, y: this.top, z: this.back }, end: { x: this.right, y: this.top, z: this.front } };
      return this.calculateSideArea(this.sideArea.start, this.sideArea.end);
    }
  
    area() {
      const left = this.leftSideArea();
      const right = this.rightSideArea();
      const top = this.topSideArea();
      const bottom = this.bottomSideArea();
      const back = this.backSideArea();
      const front = this.frontSideArea();
      return [...left, ...right, ...top, ...bottom, ...back, ...front];
    }
  
    isInsideArea(position) {
      return (
        position.x >= this.left && position.x <= this.right &&
        position.z >= this.back && position.z <= this.front &&
        position.y >= this.bottom && position.y <= this.top
      );
    }
  }
  

export class AreaUtils {
  static isInside(BlockLocation, Area) {
    return (
      BlockLocation.x >= Area.left &&
      BlockLocation.x <= Area.right &&
      BlockLocation.z <= Area.front &&
      BlockLocation.z >= Area.back &&
      BlockLocation.y >= Area.bottom &&
      BlockLocation.y <= Area.top
    );
  }

  static getAreaFromBlockLocation(BlockLocation, AreaArray) {
    return AreaArray.find(
      area =>
        BlockLocation.x >= new Area(area).left &&
        BlockLocation.x <= new Area(area).right &&
        BlockLocation.z <= new Area(area).front &&
        BlockLocation.z >= new Area(area).back &&
        BlockLocation.y >= new Area(area).bottom &&
        BlockLocation.y <= new Area(area).top
    );
  }

  static intersects(AreaA, AreaB) {
    return (
      AreaA.left <= AreaB.right &&
      AreaA.right >= AreaB.left &&
      AreaA.top >= AreaB.bottom &&
      AreaA.bottom <= AreaB.top &&
      AreaA.front >= AreaB.back &&
      AreaA.back <= AreaB.front
    );
  }
}


const protectedAreas = new ProtectedAreas();

function getBlockFromFace(block, face) {
    switch (face) {
        case "Up":
            return block.above();
        case "Down":
            return block.below();
        case "North":
            return block.north();
        case "South":
            return block.south();
        case "West":
            return block.west();
        case "East":
            return block.east();
        default:
            return block;
    }
}

function isBlockInsideProtectedArea(blockLocation, areas) {
    return areas.some(area => {
        const areaObj = new Area(area);
        if (AreaUtils.isInside(blockLocation, areaObj)) {
            const subArea = area.subAreas?.find(sub =>
                ProtectedSubAreas.isInsideSubArea(blockLocation, new Area(sub))
            );
            return !subArea; 
        }
        return false;
    });
}

function handlePlayerInteractWithBlock({ player, block, data }) {
    const areas = protectedAreas.getAreas(); // Cambiado a getAreas
    const blockLocation = block.location;

    const blockInsideProtectedArea = isBlockInsideProtectedArea(blockLocation, areas);
    const playerIsAdmin = protectedAreas.getAdmins().includes(player.name);

    if (playerIsAdmin) {
        return; 
    } else if (blockInsideProtectedArea) {
        data.cancel = true; // Block interaction without whitelist check
    }
}

world.beforeEvents.playerPlaceBlock.subscribe(data => {
    const { block, player, face } = data;
    const interactedBlock = getBlockFromFace(block, face);
    handlePlayerInteractWithBlock({ player, block: interactedBlock, data });
});

world.beforeEvents.playerInteractWithBlock.subscribe(data => {
    const { block, player } = data;
    handlePlayerInteractWithBlock({ player, block, data });

    const allowedBlockTypes = ["shulker_box", "table", "furnace", "anvil", "chest"];
    if (allowedBlockTypes.some(type => block.typeId.includes(type))) {
        data.cancel = false;
    }
});

world.beforeEvents.playerBreakBlock.subscribe(data => {
    const { block, player } = data;
    handlePlayerInteractWithBlock({ player, block, data });
});

world.beforeEvents.explosion.subscribe(data => {
    const areas = protectedAreas.getAreas(); 
    const impactedBlocks = data.getImpactedBlocks();

    const blockIsInsideArea = areas.some(area => {
        const areaObj = new Area(area);
        return impactedBlocks.some(block => {
            const blockLocation = block.location;
            if (AreaUtils.isInside(blockLocation, areaObj)) {
                const subArea = area.subAreas?.find(sub => 
                    SubAreaUtils.isInsideSubArea(blockLocation, new Area(sub))
                );
                return !subArea; 
            }
            return false;
        });
    });

    data.cancel = blockIsInsideArea;
});

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (!entity.isValid()) return;

    const hostileMobs = [
        "minecraft:zombie", "minecraft:skeleton", "minecraft:creeper", "minecraft:slime",
        "minecraft:spider", "minecraft:enderman", "minecraft:cave_spider", "minecraft:sheep", 
        "minecraft:cow", "minecraft:chicken", "minecraft:pig"
    ];

    const family = entity.getComponent('type_family')?.hasTypeFamily('monster');
    const entityPosition = entity.location;
    const areas = protectedAreas.getAreas();

    const isInProtectedArea = areas.some(area => {
        const areaObj = new Area(area);
        return AreaUtils.isInside(entityPosition, areaObj);
    });

    if (isInProtectedArea && (hostileMobs.includes(entity.typeId) || family)) {
        return entity.remove();
    }
});

system.runInterval(() => {
    try {
        const areas = protectedAreas.getAreas();
        const pvpSystem = new PvPManager();

        for (const player of world.getPlayers()) {
            const playerPosition = player.location;
            let isInDamageFreeArea = false;

            for (const area of areas) {
                const areaObj = new Area(area);

                if (AreaUtils.isInside(playerPosition, areaObj)) {

                    if (area.dealsdamage === false) {
                        isInDamageFreeArea = true;
                    }

                    if (area.effects) {
                        area.effects.forEach(effect => {
                            if (!player.getEffect(effect.type)) {
                                player.addEffect(effect.type, effect.duration, { amplifier: effect.amplifier, showParticles: effect.showParticles });
                            }
                        });
                    }
                }
            }

            if (isInDamageFreeArea) {
                if (!player.hasTag("NDLSMGOSIRIS")) {
                    player.addTag("NDLSMGOSIRIS");
                }
                if (player.hasTag("DLSMGOSIRIS")) {
                    player.removeTag("DLSMGOSIRIS");
                }
            } else {
                if (player.hasTag("NDLSMGOSIRIS")) {
                    player.removeTag("NDLSMGOSIRIS");
                }
                if (!player.hasTag("DLSMGOSIRIS")) {
                    player.addTag("DLSMGOSIRIS");
                }
            }
        }
    } catch (error) {
        console.error(`Error in system run interval: ${error}`);
    }
}, 20);

system.runInterval(() => {
    const areas = protectedAreas?.getAreas();

    for (const player of world.getPlayers()) {
        const playerPosition = player.location;
        const isAdmin = protectedAreas.getAdmins().includes(player.name);

        if (isAdmin) {
            if (player.getGameMode() == "survival") {
                applyMayflyLogic(player, playerPosition, areas);
            } else if (player.getGameMode() == "creative") {
                if (!player.hasTag('MayFlyTrue')) {
                    system.run(() => {
                        player.runCommandAsync('ability @s mayfly true');
                        player.addTag('MayFlyTrue');
                        player.removeTag('MayFlyFalse');
                    });
                }
            }
        } else {
            applyMayflyLogic(player, playerPosition, areas);
        }
    }
}, 10);

function applyMayflyLogic(player, playerPosition, areas) {
    const inFlyArea = areas.some(area => {
        if (area.fly === true) {
            const areaObj = new Area(area);
            return AreaUtils.isInside(playerPosition, areaObj);
        }
        return false;
    });

    if (inFlyArea) {
        if (!player.hasTag('MayFlyTrue')) {
            player.runCommandAsync('ability @s mayfly true')
                .then(() => {
                    player.addTag('MayFlyTrue');
                    player.removeTag('MayFlyFalse');
                })
                .catch(error => player.sendMessage(`Failed to apply mayfly ability: ${error}`));
        }
    } else {
        if (!player.hasTag('MayFlyFalse')) {
            player.runCommandAsync('ability @s mayfly false')
                .then(() => {
                    player.addTag('MayFlyFalse');
                    player.removeTag('MayFlyTrue');
                })
                .catch(error => player.sendMessage(`Failed to remove mayfly ability: ${error}`));
        }
    }
}

const restrictedItems = [
    "minecraft:bow",
    "minecraft:trident",
    "minecraft:snowball",
    "minecraft:fishing_rod",
    "minecraft:wind_charge",
    "minecraft:splash_potion",
    "minecraft:lingering_potion",
    "minecraft:crossbow",
    "minecraft:experience_bottle"
];

world.beforeEvents.itemUse.subscribe((data) => {
    const player = data.source;
    const areas = protectedAreas.getAreas(); 

    const playerPosition = player.location;
    let inProtectedArea = false;

    for (const area of areas) {
        const areaObj = new Area(area);

        if (AreaUtils.isInside(playerPosition, areaObj)) {
            if (!area.dealsdamage) { 
                inProtectedArea = true;
                break; 
            }
        }
    }

    if (restrictedItems.includes(data.itemStack.typeId) && inProtectedArea) {
        player.sendMessage("§cNo puedes usar este ítem en zonas protegidas al Combate!");
        data.cancel = true;
    }
});
