import { world, system } from "@minecraft/server";
import { Scoreboard } from "./classes/ObjectivesClass";
import { Vector3 } from "./Math/index";
import { PvPManager } from "./classes/PvPSystem";

class MoneyFormatter {
    static formatMoney(amount) {
        const units = ['k', 'M', 'B', 'T', 'P', 'E'];
        let unitIndex = -1;

        while (amount >= 1000 && unitIndex < units.length - 1) {
            amount /= 1000;
            unitIndex++;
        }

        if (unitIndex === -1) {
            return amount.toString();
        } else {
            return amount.toFixed(1) + units[unitIndex];
        }
    }
}

// Ejemplos de uso
console.log(MoneyFormatter.formatMoney(1000));         // 1.0k
console.log(MoneyFormatter.formatMoney(1500));         // 1.5k
console.log(MoneyFormatter.formatMoney(1000000));      // 1.0M
console.log(MoneyFormatter.formatMoney(2500000));      // 2.5M
console.log(MoneyFormatter.formatMoney(1000000000));   // 1.0B
console.log(MoneyFormatter.formatMoney(1234567890));   // 1.2B
console.log(MoneyFormatter.formatMoney(1000000000000)); // 1.0T
console.log(MoneyFormatter.formatMoney(1500000000000)); // 1.5T
console.log(MoneyFormatter.formatMoney(1000000000000000)); // 1.0P
console.log(MoneyFormatter.formatMoney(1234567890123456)); // 1.2P
console.log(MoneyFormatter.formatMoney(1000000000000000000)); // 1.0E
console.log(MoneyFormatter.formatMoney(1234567890123456789)); // 1.2E


// Funciones de manipulación de inventario
function saveInventory(player, dynamic) {
    system.run(() => {
        const inventory = [];
        const playerInv = player.getComponent('inventory').container;

        for (let i = 0; i < playerInv.size; i++) {
            const item = playerInv.getItem(i);
            if (item) {
                inventory.push({
                    slot: i,
                    item: {
                        typeId: item.typeId,
                        amount: item.amount
                    }
                });
            }
        }
        player.setDynamicProperty(player.name, JSON.stringify(inventory));
        player.sendMessage('Inventario guardado');
    });
}

function loadInventory(player, dynamic) {
    system.run(() => {
        const invString = player.getDynamicProperty(player.name);
        if (invString) {
            const inv = JSON.parse(invString);
            const playerInv = player.getComponent('inventory').container;

            for (const itemData of inv) {
                const slot = itemData.slot;
                if (itemData.item && itemData.item.typeId) {
                    const item = new ItemStack(itemData.item.typeId, itemData.item.amount);
                    playerInv.setItem(slot, item);
                } else {
                    console.error('Invalid item data:', itemData);
                }
            }
            player.sendMessage('Inventario restaurado');
        }
    });
}

export function teleportPlayer(player, Vector3, warning) {
    player.sendMessage(`§fTeletransportando...`);
    player.playSound(`note.guitar`);
    system.runTimeout(() => {
        player.teleport(Vector3);
        system.runTimeout(() => {
            player.playSound(`mob.chicken.plop`);
            player.runCommand(`particle zedafox:explosionfire_1 ~~1~`);
            if (warning === true) {
                player.sendMessage("§bEste lugar permite el pvp ten cuidado!")
                player.sendMessage("§fTeletransportado§7/§fa correctamente");
            } else {
                player.sendMessage("§fTeletransportado§7/§fa correctamente");
            }
        }, 1);
    }, 40);
}


export function MessageDelayed(player) {
    player.sendMessage(`§cEsto se retrasó y no se pudo terminar. Espera a la siguiente actualización!!!`)
}
export function manipulateEntities(entityType, nameTag, location, faceLocation, tagName) {
    const entities = world.getDimension("overworld").getEntities({ type: entityType });
    
    for (const entity of entities) {   
        if (entityType === entity.typeId && (tagName === undefined || entity.hasTag(tagName))) {
            if (nameTag !== undefined) {
                entity.nameTag = nameTag;
                entity.name = nameTag;
            }
            if (location !== undefined) {
                const facingLocation = {
                    x: faceLocation && faceLocation.x !== undefined ? faceLocation.x : entity.location.x,
                    y: faceLocation && faceLocation.y !== undefined ? faceLocation.y : entity.location.y,
                    z: faceLocation && faceLocation.z !== undefined ? faceLocation.z : entity.location.z
                };
                entity.teleport({ x: location.x, y: location.y, z: location.z }, { facingLocation: facingLocation });
            } else {
                console.log("Warning: No location provided. Skipping teleportation.");
            }
        }
    }
}

export function initiateTeleport(player, Vector3, seconds) {
    if (player.hasTag("InCourse")) {
        player.sendMessage("§cNo puedes teleportarte mientras estés en un curso");
        return;
    }
    const pvpManager = new PvPManager()

    if(pvpManager.isInPvP(player)) { //Problema
        player.sendMessage("§cNo puedes teleportarte mientras estés en un Combate");
        return;
    }

    player.sendMessage("§8[§bTeletransportacion§8] §cTeletransportando... ¡No te muevas!");
    player.addTag("InCourse");
    player.playSound("note.guitar");

    let delay = seconds;

    let intervalId2 = system.runInterval(() => {
        if (Math.abs(player.getVelocity().x) > 0 || Math.abs(player.getVelocity().z) > 0) {
            player.sendMessage("§cSe detectó movimiento... Cancelando teletransportación");
            cancelTeleportation(player, intervalId, intervalId2);
            return;
        }
    }, 5);
    let intervalId = system.runInterval(() => {
        delay--;

        let countdownMessage = getCountdownMessage(delay);
        player.playSound("mob.chicken.plop");
        player.sendMessage(countdownMessage);

        if (delay <= 0) {
            player.sendMessage("§8[§bTeletransportacion§8] §a¡Teletransportado correctamente!");
            system.runTimeout(() => {
            player.playSound("random.levelup");
            }, 1)
            player.teleport(Vector3);
            finishTeleportation(player, intervalId, intervalId2);
        }
    }, 20);
}

function getCountdownMessage(delay) {
    switch (delay) {
        case 3:
            return "§8Teletransportando.... §a3..";
        case 2:
            return "§8Teletransportando.... §62..";
        case 1:
            return "§8Teletransportando.... §c1....";
        default:
            return `§8Teletransportando.... §b${delay}...`;
    }
}

function cancelTeleportation(player, intervalId, intervalId2) {
    system.clearRun(intervalId);
    system.clearRun(intervalId2);
    player.removeTag("InCourse");
}

function finishTeleportation(player, intervalId, intervalId2) {
    system.clearRun(intervalId);
    system.clearRun(intervalId2);
    player.removeTag("InCourse");
}

export function ParticlesAction(player, target, action) {
    world.getDimension("overworld").spawnParticle(`zedafox:magic`, new Vector3(target.location.x, target.location.y + 1, target.location.z));
    world.getDimension("overworld").spawnParticle(`zedafox:magic`, new Vector3(target.location.x, target.location.y + 1, target.location.z));
    world.getDimension("overworld").spawnParticle(`zedafox:magic`, new Vector3(target.location.x, target.location.y + 1, target.location.z));
    world.getDimension("overworld").spawnParticle(`zedafox:loading_2`, new Vector3(target.location.x, target.location.y, target.location.z));
    player.playSound("mob.chicken.plop");
  
    system.runTimeout(() => {
        action(player);   
    }, 5);
  }

  export  const sellable_items = {
    "minecraft:cobblestone": 1,
    "minecraft:iron_ingot": 200,
    "minecraft:gold_ingot": 350,
    "minecraft:netherite_ingot": 400,
    "minecraft:netherite_block": 900,
    "minecraft:diamond_block": 450,
    "minecraft:iron_block": 400,
    "minecraft:gold_block": 410,
    "minecraft:lapis_block": 200,
    "minecraft:emerald_block": 530,
    "minecraft:coal_block": 100,
    "minecraft:copper_block": 90,
    "minecraft:diamond": 130,
    "minecraft:emerald": 130,
    "minecraft:coal": 50,
    "minecraft:lapis_lazuli": 80,
    "minecraft:quartz": 70,
    "minecraft:quartz_block": 100,
    "minecraft:iron_nugget": 5,
    "minecraft:gold_nugget": 5,
    "minecraft:raw_gold": 100,
    "minecraft:raw_iron": 100,
    "minecraft:raw_copper": 70,
    "minecraft:netherite_scrap": 300,
    "minecraft:redstone": 40,
    "minecraft:redstone_block": 120,
    "minecraft:nether_star": 2000,
    "minecraft:copper_ingot": 30,
};

export function formatMinecraftItem(typeid) {
    return typeid
        .replace(/^minecraft:/, '') // Remove the "minecraft:" prefix
        .replace(/_\d+/g, '')        // Remove underscores followed by numbers
        .replace(/_/g, ' ')          // Replace underscores with spaces
        .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize the first letter of each word
}

export function SellItems(player) {
    const Objective = Scoreboard.getObjective("Money") ?? Scoreboard.addObjective("Money");
    const inventory = player.getComponent("inventory").container;

    let amount = 0;
    let item_count = 0;

    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (!item) continue;

        const item_price = sellable_items[item.typeId];
        if (item_price) {
            amount += item_price * item.amount;
            item_count += item.amount;

            inventory.setItem(i, null);
        }
    }

    if (item_count > 0) {
        Objective.addScore(player, amount);
        player.sendMessage(`§a¡Enhorabuena! §fHas vendido un total de §7( §c${item_count} §7) objetos por un total de §7( §g$§b${MoneyFormatter.formatMoney(amount)} §7). ¡Sigue así y continúa teniendo éxito en tus operaciones financieras!`);
    } else {
        player.sendMessage(`§cNo tienes objetos para vender.`);
    }
}
