import { world, system, MolangVariableMap, StructureSaveMode, StructureRotation } from "@minecraft/server";
import { Vector3 } from "../../libraries/Math/index";
import { commandBuilder } from "../../libraries/classes/CommandBuilder";
import { formatMinecraftItem, initiateTeleport, sellable_items, SellItems, teleportPlayer } from "../../libraries/functions";
import { findClosestCommand } from "../../libraries/levenshtein";
import "./MoneyTransfer";
import { PermissionManager } from "../../libraries/classes/Permission";
import { ProtectedAreas } from "../../libraries/classes/ProtectedAreas";
import { loadInventory, saveInventory } from "../../extensions/saveInventory";
import { Vector } from "../../libraries/Math/main";
import { CuboidShape } from "../../libraries/classes/CuboidShap";
import { PvPManager } from "../../libraries/classes/PvPSystem";
import { MoneyFormatter } from "../../libraries/classes/StaticClasses";

const commandBuild = new commandBuilder();

/**
 * Get the rank of the player.
 * @param {Object} player - The player whose rank needs to be determined.
 * @returns {string} - The rank of the player.
 */
export function getPlayerRank(player) {
    for (const tag of player.getTags()) {
        if (tag.startsWith("rank:")) {
            return tag.slice(5);
        }
    }
    return '';
}

export function getPlayerPermission(player) {
    const manager = new PermissionManager();
    const playerPermissions = manager.getPlayerPermissions(player.name);

    if (Object.keys(playerPermissions).length > 0) {
        const pvpManager = new PvPManager()

        if(pvpManager.isInPvP(player)) {
        const sortedPermissions = Object.values(playerPermissions).sort((a, b) => b.permissionValue - a.permissionValue);
        return sortedPermissions[0].permissionValue;
        } else {
            player.sendMessage("§cEstas en Combate, no puedes hacer esto!!")
        }
    }

    return 2; // Default value if no permissions are found
}

export function getPermissionLevel(value) {
    const permissionLevels = {
        10: 'allperms',
        9: 'owner',
        8: 'developer',
        7: 'moderator',
        6: 'admin',
        5: 'staff',
        4: 'staffpre',
        3: 'builder',
        2: 'member',
        1: 'default',
        0: 'noperms'
    };
    return permissionLevels[value] || 'member';
}

world.beforeEvents.chatSend.subscribe((data) => {
    const player = data.sender;
    const message = data.message;

    if (!message.startsWith('-') && !message.startsWith(".") && !message.startsWith('!') && !message.startsWith(";")) {
        const playerRank = getPlayerRank(player);
        const coloredMessage = `§r§8[§r${playerRank}§r§8]§r §f${player.name} §7-> §f${message}`;

        data.cancel = true;

        for (const p of world.getPlayers()) {
            p.sendMessage(coloredMessage);
        }
        return;
    }

    data.cancel = true;
    const args = message.slice(1).split(/\s+/g);
    const cmd = args.shift();
    
    // Busca el comando más cercano que incluya alias
    const closestCommand = findClosestCommand(cmd, commandBuild.commands, 2);
    if (!closestCommand) {
        return player.sendMessage(`§cComando desconocido: ${message.slice(1)}. Por favor verifique que el comando exista y que tienes permiso para usarlo`);
    }

    const playerPermissionValue = getPlayerPermission(player);
    const commandPermissionLevel = closestCommand.permission_level;

    if (playerPermissionValue < commandPermissionLevel) {
        return player.sendMessage('§cNo tienes permiso para usar este comando!');
    }

    try {
        system.run(() => closestCommand.callback(player, args));
    } catch (error) {
        player.sendMessage('§cError al ejecutar el comando. Intenta nuevamente.');
        console.error('Command execution error:', error);
    }
});

system.runInterval(() => {
    const players = world.getAllPlayers();
    for (const player of players) {
        const rank = getPlayerRank(player);
        player.nameTag = `§b${player.name}\n§8[§r${rank}§8]§r`;
    }
});

// Agregar alias a los comandos
commandBuild.create(
    {
        name: 'setrank',
        description: 'Set a player\'s rank',
        permission_level: 6,
    }, (player, args) => {
        if (args.length < 2) {
            return player.sendMessage('§cUsage: !setrank <player> <rank>');
        }

        const targetPlayerName = args[0];
        const rankName = args[1].toLowerCase();

        const validRanks = ['admin', 'developer', 'moderator', 'builder', 'staff', 'default'];
        if (!validRanks.includes(rankName)) {
            return player.sendMessage(`§cInvalid rank: ${rankName}. Valid ranks are: ${validRanks.join(', ')}`);
        }

        const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName);
        if (!targetPlayer) {
            return player.sendMessage(`§cPlayer not found: ${targetPlayerName}`);
        }

        targetPlayer.getTags().forEach(tag => {
            if (tag.startsWith("rank:")) {
                targetPlayer.removeTag(tag);
            }
        });

        targetPlayer.addTag(`rank:${rankName}`);

        player.sendMessage(`§aSet ${targetPlayerName}'s rank to ${rankName}`);
        targetPlayer.sendMessage(`§aYour rank has been set to ${rankName}`);
    }
);

commandBuild.create(
    {
        name: 'lobby',
        description: 'Teleports to the lobby',
        permission_level: 2,
        aliases: ['hub', 'spawn']
    }, (player, args) => { 
      initiateTeleport(player, new Vector3(-4999.50, -14.00, -4999.50), 4);
    }
);

commandBuild.create(
    {
        name: 'lobby',
        description: 'Teleports to the lobby',
        permission_level: 2,
        aliases: ['hub', 'spawn']
    }, (player, args) => { 
      initiateTeleport(player, new Vector3(-4999.50, -14.00, -4999.50), 4);
    }
);

commandBuild.create(
    {
        name: 'debugger',
        description: 'Teleports to the lobby',
        permission_level: 2,
    }, (player, args) => { 
        if(args[0]) {
            
        }
    }
);

commandBuild.create(
    {
        name: 'saveinventory',
        description: 'Teleports to the lobby',
        permission_level: 2
    }, (player, args) => { 
        saveInventory(player, args[0], player)
    }
);
commandBuild.create(
    {
        name: 'loadinventory',
        description: 'Teleports to the lobby',
        permission_level: 2
    }, (player, args) => { 
        loadInventory(player, args[0], player);

    }
);

commandBuild.create(
    {
        name: 'sell',
        description: 'Sell Your Items In The Inventory',
        is_staff: true
    },
    (player, args) => {
        if (!args[0]) {
            // No arguments provided, sell items
            SellItems(player);
        } else if (args[0] === "prices") {
            // Show item prices
            let pricesMessage = {
                rawtext: [
                    {
                        text: "§6Precios de los elementos vendibles:\n"
                    }
                ]
            };
            for (let itemId in sellable_items) {
                const itemName = formatMinecraftItem(itemId) || itemId; // Use translated name or item ID if not translated
                pricesMessage.rawtext.push({
                    text: `§b${itemName}§7: §a$${MoneyFormatter.formatMoney(sellable_items[itemId])}\n`
                });
            }
            player.sendMessage(pricesMessage);
        } else {
            // Invalid argument
            player.sendMessage("§cUso del comando inválido. Usa '/sell' para vender ítems o '/sell prices' para ver los precios.");
        }
    }
);

commandBuild.create(
    {
        name: 'generatePlott',
        description: 'Generates a structure below the player with the block beneath them as the center',
        permission_level: 2
    }, (player, args) => { 
        world.structureManager.delete("myplugin:21X21PCONS")
        // Obtener la ubicación del jugador
        const playerPos = player.location;
        
        // Definir las dimensiones de la estructura
        const structureWidth = 20; // Ejemplo de ancho de la estructura
        const structureLength = 20; // Ejemplo de largo de la estructura
        const structureHeight = 20; // Ejemplo de altura de la estructura
        
        // Calcular el bloque bajo el jugador
        const blockBelowPos = new Vector3(
            Math.floor(playerPos.x),
            Math.floor(playerPos.y - 11) - 1, // Un bloque por debajo del jugador
            Math.floor(playerPos.z)
        );

        // Definir las coordenadas para colocar la estructura con el bloque bajo el jugador como centro
        const startPos = new Vector3(
            -19982, 53, -19904
        );
        const endPos = new Vector3(
            -20038, 76, -19848
        );
        
        // Verificar y crear la estructura si no existe
        if (!world.structureManager.get("myplugin:21X21PCONS")) {
            world.structureManager.createFromWorld(
                "myplugin:21X21PCONS", 
                world.getDimension("overworld"),
                startPos,
                endPos,
                {
                    includeBlocks: true,
                    includeEntities: false,
                    saveMode: StructureSaveMode.Memory
                }
            );
        }
        if (!world.structureManager.get("myplugin:10X10PSIDE")) {
            world.structureManager.createFromWorld(
                "myplugin:10X10PSIDE", 
                world.getDimension("overworld"),
                new Vector3(-20031, 64, -19899), // Ajustar según sea necesario
                new Vector3(-20033, 53, -19853), // Ajustar según sea necesario
                {
                    includeBlocks: true,
                    includeEntities: false,
                    saveMode: StructureSaveMode.World
                }
            );
        }

        // Colocar la estructura centrada en el bloque bajo el jugador
        world.structureManager.place(
            "myplugin:21X21PCONS",
            world.getDimension("overworld"),
            blockBelowPos
        );
    }
);
class PlotBuilder {
    constructor(startPos, plotWidth, plotDepth, plotsPerRow, structures, pattern) {
        this.currentPlot = 1;
        this.startPos = startPos;
        this.plotWidth = plotWidth;
        this.plotDepth = plotDepth;
        this.plotsPerRow = plotsPerRow;
        this.structures = structures;
        this.pattern = pattern;
        this.plotInterval = null;
    }

    initializeStructures() {
        if (!world.structureManager.get(this.structures.corner)) {
            world.structureManager.createFromWorld(this.structures.corner, world.getDimension("overworld"), new Vector3(39833, 82, 40050), new Vector3(39883, 39, 40000));
        }
        if (!world.structureManager.get(this.structures.cornerE)) {
            world.structureManager.createFromWorld(this.structures.cornerE, world.getDimension("overworld"), new Vector3(39814, 40, 40063), new Vector3(39864, 83, 40113));
        }
        if (!world.structureManager.get(this.structures.edge)) {
            world.structureManager.createFromWorld(this.structures.edge, world.getDimension("overworld"), new Vector3(39929, 82, 40050), new Vector3(39885, 39, 40000));
        }
        if (!world.structureManager.get(this.structures.center)) {
            world.structureManager.createFromWorld(this.structures.center, world.getDimension("overworld"), new Vector3(39929, 70, 39998), new Vector3(39885, 39, 39954));
        }
        if (!world.structureManager.get(this.structures.doubleEdge)) {
            world.structureManager.createFromWorld(this.structures.doubleEdge, world.getDimension("overworld"), new Vector3(39788, 39, 40057), new Vector3(39832, 82, 40113));
        }
        if (!world.structureManager.get(this.structures.corner3Sides)) {
            world.structureManager.createFromWorld(this.structures.corner3Sides, world.getDimension("overworld"), new Vector3(39925, 39, 40057), new Vector3(39975, 82, 40113));
        }
        if (!world.structureManager.get(this.structures.base4Sides)) {
            world.structureManager.createFromWorld(this.structures.base4Sides, world.getDimension("overworld"), new Vector3(39925, 39, 40057), new Vector3(39981, 82, 40113));
        }
        if (!world.structureManager.get(this.structures.corner3SidesE)) {
            world.structureManager.createFromWorld(this.structures.corner3SidesE, world.getDimension("overworld"), new Vector3(39866, 40, 40063), new Vector3(39922, 83, 40113));
        }
    }

    setPlot(player, count = 1, specificPatternIndex = null) {
        this.initializeStructures();

        let plotsCreated = 0;
        this.plotInterval = system.runInterval(() => {
            if (plotsCreated >= count) {
                system.clearRun(this.plotInterval);
                return;
            }

            const row = Math.floor((this.currentPlot - 1) / this.plotsPerRow);
            const col = (this.currentPlot - 1) % this.plotsPerRow;

            let newX = this.startPos.x + (this.plotWidth * col);
            let newZ = this.startPos.z - (this.plotDepth * row);

            if (row > 0) {
                newZ += 6 * row;
            }

            if (col === 2) {
                newX -= 6;
            }

            let patternIndex = specificPatternIndex !== null ? specificPatternIndex : (row === 0 ? col : (col % this.pattern.slice(3).length));
            let patternEntry = row === 0 ? this.pattern[patternIndex] : this.pattern[3 + patternIndex];

            let structureToPlace = patternEntry.structure;
            let rotation = patternEntry.rotation;

            console.log(`Placing structure: ${structureToPlace}`);
            console.log(`Position: X: ${newX + 5}, Y: ${this.startPos.y - 8}, Z: ${newZ + 5}`);
            console.log(`Rotation: ${rotation}`);
            console.log(`Current Plot: ${this.currentPlot}`);

            world.structureManager.place(structureToPlace, world.getDimension("overworld"), new Vector3(newX, this.startPos.y - 8, newZ), { rotation });

            this.currentPlot++;
            plotsCreated++;
        }, 5); // Intervalo de 1 segundo
    }

    deletePlot(plotNumber) {
        const row = Math.floor((plotNumber - 1) / this.plotsPerRow);
        const col = (plotNumber - 1) % this.plotsPerRow;

        let plotX = this.startPos.x + (this.plotWidth * col);
        let plotZ = this.startPos.z - (this.plotDepth * row);

        if (row > 0) {
            plotZ += 6 * row;
        }

        if (col === 2) {
            plotX -= 6;
        }

        console.log(`Deleting plot at X: ${plotX}, Z: ${plotZ}`);
        // Aquí puedes agregar la lógica para eliminar el plot en las coordenadas plotX, plotZ
    }
}

const plotBuilder = new PlotBuilder(
    new Vector3(39527, -20, 40053),
    50,
    50,
    3,
    {
        corner: "starplots:corner_structure",
        cornerE: "starplots:cornerE_structure",
        edge: "starplots:edge_structure",
        center: "starplots:center_structure",
        doubleEdge: "starplots:double_edge_structure",
        corner3Sides: "starplots:corner_3_sides_structure",
        corner3SidesE: "starplots:corner_3_sidesE_structure",
        base4Sides: "starplots:base_4_sides_structure"
    },
    [
        { structure: "starplots:base_4_sides_structure", rotation: StructureRotation.None },
        { structure: "starplots:corner_3_sides_structure", rotation: StructureRotation.Rotate180 },
        { structure: "starplots:corner_3_sides_structure", rotation: StructureRotation.Rotate180 },
        { structure: "starplots:corner_3_sidesE_structure", rotation: StructureRotation.None },
        { structure: "starplots:cornerE_structure", rotation: StructureRotation.Rotate180 },
        { structure: "starplots:corner_structure", rotation: StructureRotation.Rotate180 }
    ]
);

commandBuild.create(
    {
        name: 'setPlot',
        description: 'Generates multiple plots with a 1-second interval, allows choosing a specific plot pattern',
        permission_level: 2
    },
    (player, args) => {
        const count = args[0] || 1; // Número de plots a generar
        const specificPatternIndex = args[1] || null; // Índice del patrón específico (opcional)
        plotBuilder.setPlot(player, count, specificPatternIndex);
    }
);

commandBuild.create(
    {
        name: 'deletePlot',
        description: 'Deletes a specific plot by its plot number',
        permission_level: 2
    },
    (player, args) => {
        const plotNumber = args[0];
        plotBuilder.deletePlot(plotNumber);
    }
);
