import { BlockVolume, Player, system, world } from "@minecraft/server";
import { Vector3 } from "../../libraries/Math/index";

const dimension = world.getDimension("overworld")

export function calculateAirPercentage(blockVolume) {
    let airCount = 0;
    const minX = Math.min(blockVolume.from.x, blockVolume.to.x);
    const minY = Math.min(blockVolume.from.y, blockVolume.to.y);
    const minZ = Math.min(blockVolume.from.z, blockVolume.to.z);
    const maxX = Math.max(blockVolume.from.x, blockVolume.to.x);
    const maxY = Math.max(blockVolume.from.y, blockVolume.to.y);
    const maxZ = Math.max(blockVolume.from.z, blockVolume.to.z);

    let totalBlocks = 0;

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {``
                totalBlocks++;
                const block = dimension.getBlock(new Vector3(x, y, z));
                if (block && block.typeId === "minecraft:air") {
                    airCount++;
                }
            }
        }
    }

    const airPercentage = (airCount / totalBlocks) * 100;
    return airPercentage;
}