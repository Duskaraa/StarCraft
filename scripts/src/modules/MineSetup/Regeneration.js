import { BlockVolume, system, world } from "@minecraft/server";
import { Vector3 } from "../../libraries/Math/index";

const dimension = world.getDimension("overworld");

/**
 * Generate a list of blocks based on their frequencies.
 * @param {Object} blockTypes - An object where keys are block type IDs and values are their frequencies.
 * @returns {string[]} - A list of block type IDs.
 */
export function generateBlockList(blockTypes) {
    const blockList = [];
    for (const blockType in blockTypes) {
        for (let i = 0; i < blockTypes[blockType]; i++) {
            blockList.push(blockType);
        }
    }
    return blockList;
}

/**
 * Generates random blocks within a specified volume layer by layer.
 * @param {BlockVolume} blockVolume - The volume in which to generate blocks.
 * @param {string[]} blockList - A list of block types to use for random generation.
 */
export function generateRandomBlocks(blockVolume, blockList) {
    const minX = Math.min(blockVolume.from.x, blockVolume.to.x);
    const minY = Math.min(blockVolume.from.y, blockVolume.to.y);
    const minZ = Math.min(blockVolume.from.z, blockVolume.to.z);
    const maxX = Math.max(blockVolume.from.x, blockVolume.to.x);
    const maxY = Math.max(blockVolume.from.y, blockVolume.to.y);
    const maxZ = Math.max(blockVolume.from.z, blockVolume.to.z);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const airBlock = "minecraft:air";

    // Primer fill air en la mitad superior del volumen
    const firstHalfVolume = new BlockVolume(
        { x: minX, y: minY, z: minZ },
        { x: maxX, y: Math.floor((minY + maxY) / 2), z: maxZ }
    );
    dimension.fillBlocks(firstHalfVolume, airBlock);

    // Segundo fill air en la mitad inferior del volumen
    const secondHalfVolume = new BlockVolume(
        { x: minX, y: Math.floor((minY + maxY) / 2) + 1, z: minZ },
        { x: maxX, y: maxY, z: maxZ }
    );
    dimension.fillBlocks(secondHalfVolume, airBlock);

    let currentY = minY;

    const regenerateLayer = () => {
        if (currentY > maxY) {
            const players = dimension.getEntities({ type: "minecraft:player", location: new Vector3(centerX, centerY, centerZ), maxDistance: 20 });
            for (const player of players) {
                player.playSound("note.guitar");
            }
            spawnParticlesAboveLayer(blockVolume, maxY);
            return;
        }

        for (let x = minX; x <= maxX; x++) {
            for (let z = minZ; z <= maxZ; z++) {
                const randomIndex = Math.floor(Math.random() * blockList.length);
                const randomBlockType = blockList[randomIndex];
                const blockPosition = new Vector3(x, currentY, z);
                const singleBlockVolume = new BlockVolume(blockPosition, blockPosition);
                dimension.fillBlocks(singleBlockVolume, randomBlockType);
            }
        }

        const players = dimension.getEntities({ type: "minecraft:player", location: new Vector3(centerX, centerY, centerZ), maxDistance: 20 });
        for (const player of players) {
            player.playSound("dig.stone");
        }

        currentY++;
        system.runTimeout(regenerateLayer, 5);
    };

    regenerateLayer();
}


/**
 * Spawns particles above the highest layer of the generated blocks.
 * @param {BlockVolume} volume - The volume where the particles will be spawned.
 * @param {number} maxY - The maximum Y coordinate of the volume.
 */
function spawnParticlesAboveLayer(volume, maxY) {
    const centerX = (volume.from.x + volume.to.x) / 2;
    const centerZ = (volume.from.z + volume.to.z) / 2;
    const particleY = maxY + 4; // 4 blocks above the last layer

    const particlePosition = new Vector3(centerX, particleY, centerZ);
    dimension.spawnParticle("zedafox:explosionfire", particlePosition); 
}