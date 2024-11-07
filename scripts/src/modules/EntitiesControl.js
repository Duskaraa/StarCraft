import { world, system, Player } from "@minecraft/server";
import { ParticlesAction, SellItems, initiateTeleport, manipulateEntities, teleportPlayer } from "../libraries/functions.js";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Vector3 } from "../libraries/Math/index.js";
import { ShopVisual, MinesMenu, SurvivalMenu, WumpusForm, TestForm } from "../visuals/Menus/Lobby/Visual.js";

// Define teleport actions
const teleportActions = {
  "source:entity1": TestForm,
  "source:entity2": SellItems,
  "source:entity3": ShopVisual,
  "source:entity4": SurvivalMenu,
  "source:entity5": MinesMenu,
  "source:entity6": Message3,
  "source:entity7": Message2,
  "source:entity8": Message2,
  "source:entity9": Message2,
  "source:entitylobby": TpLobby,
  "source:wumpus": WumpusForm,
  "source:wumpusboost": WumpusForm
};

// Action functions
function Message1(player) {
  player.sendMessage("§cLamentablemente esta opcion es una beta experimental y aun faltan recursos para poder abrirla");
}

function Message2(player) {
  player.sendMessage("§cProximamente!");
}

function Message3(player) {
  player.sendMessage("§cEsto se ha previsto para una actualizacion en adelante!! (Es increiblemente dificil)");
}

function TpLobby(player) {
  initiateTeleport(player, new Vector3(-4999.50, -12.00, -4999.50), 4);
}

// Event handlers
world.afterEvents.entityHitEntity.subscribe(async (data) => {
  const player = data.damagingEntity;
  const target = data.hitEntity;
  const action = teleportActions[target.typeId];
  if (action) {
    ParticlesAction(player, target, action);
  }
});

world.beforeEvents.playerInteractWithEntity.subscribe(async (data) => {
  const player = data.player;
  const target = data.target;
  const action = teleportActions[target.typeId];
  if (action) {
    system.run(() => { ParticlesAction(player, target, action); })
  }
});

world.afterEvents.projectileHitEntity.subscribe(evd => {
  const { source: attacker, projectile } = evd;
  const victim = evd.getEntityHit()?.entity;

  if (attacker && victim) {
    const action = teleportActions[victim.typeId];
    if (action) {
      const originalLocation = entityManipulations.find(entity => entity.type === victim.typeId)?.location;

      if (originalLocation) {
        victim.teleport(originalLocation);
      } else {
        console.log(`No original location found for entity type: ${victim.typeId}`);
      }

      projectile.remove();
      ParticlesAction(attacker, victim, action); 
    }
  }
});

//manipulateEntities(entityType, nameTag, location, faceLocation, tagName)

const entityManipulations = [
  {
    entityType: "source:entity1",
    nameTag: "§§"
  }
];
for (const manipulation of entityManipulations) {
  system.runInterval(() => {
      manipulateEntities(manipulation.type, manipulation.nameTag, manipulation.location, manipulation.faceLocation, manipulation.tagName);
  }, 135);
}

system.run(() => {
  for (const entity of entityManipulations) {
    const entityType = entity?.type;
    if (entityType && entityType.includes("source:entity")) {
      const dimension = world.getDimension("overworld");
      if (dimension) {
        const entities = dimension.getEntities({ type: entityType });
        for (const e of entities) {
          e.playAnimation("animation.waiting", { blendOutTime: 20000000 });
        }
      }
    }
  }
});

function spawnEntities(entityManipulations) {
  let delay = 0;
  let entitiesGenerated = 0;

  world.sendMessage("§7[§6Status Console§7] §bStarting Spawn Entities");

  for (const manipulation of entityManipulations) {
    system.runTimeout(() => {
      if (manipulation.location) {
        const { x, y, z } = manipulation.location;

        if (x !== undefined && y !== undefined && z !== undefined) {
          const floorX = Math.floor(x);
          const floorY = Math.floor(y);
          const floorZ = Math.floor(z);
          const tickingAreaName = `TickingA${floorX}${floorY}${floorZ}`;

          world.sendMessage(`§cEntity§7: ${manipulation.type}, §6Tickingarea§7: ${tickingAreaName}, §bNumber: ${entitiesGenerated}`);
          entitiesGenerated++;

          // Add the ticking area
          world.getDimension("overworld").runCommand(`tickingarea add circle ${floorX} ${floorY} ${floorZ} 2 "${tickingAreaName}"`);

          system.runTimeout(() => {
            // Remove existing entities
            const existingEntities = world.getDimension("overworld").getEntities({
              location: manipulation.location,
              maxDistance: 5,
              type: manipulation.type
            });
            existingEntities.forEach(entity => entity.remove());

            // Spawn new entity
            const entity = world.getDimension("overworld").spawnEntity(manipulation.type, manipulation.location);
            if (manipulation.nameTag) entity.nameTag = manipulation.nameTag;
            if (manipulation.tagName) entity.addTag(manipulation.tagName);

            manipulateEntities(manipulation.type, manipulation.nameTag, manipulation.location, manipulation.faceLocation, manipulation.tagName);

            system.runTimeout(() => {
              // Remove the ticking area
              world.getDimension("overworld").runCommand(`tickingarea remove ${floorX} ${floorY} ${floorZ}`);
              world.sendMessage(`§aTickingarea §fwith the name §b${tickingAreaName} §cRemoved Successfully`);
            }, 4);
          }, 2);
        } else {
          world.sendMessage(`§cSkipping entity §6${manipulation.type} §cdue to undefined location coordinates.`);
        }
      } else {
        world.sendMessage(`§cSkipping entity §6${manipulation.type} §cwith undefined location.`);
      }
    }, delay);

    delay += 8;
  }
}



world.beforeEvents.itemUse.subscribe((data) => {
  const player = data.source

  if(data.itemStack.typeId === "minecraft:brush" && player.hasTag("@#%&*!?^$+=/\\<>~|;:°£©✓±¤§")) {
    spawnEntities(entityManipulations)
  }
})
