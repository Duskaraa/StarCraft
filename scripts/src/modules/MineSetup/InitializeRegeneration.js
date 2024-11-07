import { system, world, BlockVolume } from "@minecraft/server";
import { generateBlockList, generateRandomBlocks } from "./Regeneration";
import { Vector3 } from "../../libraries/Math/index";

//MinePvP

export const MinePvP = {
  NameId: "§cPvP",
  VectorA: new Vector3(17022, 47, 15026),
  VectorB: new Vector3(16980, 29, 14984),
  BlockVolume: new BlockVolume(new Vector3(17022, 47, 15026), new Vector3(16980, 29, 14984)),
  blockTypes: {
    "minecraft:stone": 50,
    "minecraft:iron_ore": 30,
    "minecraft:gold_ore": 26,
    "minecraft:diamond_ore": 24,
    "minecraft:lapis_ore": 38,
    "minecraft:redstone_ore": 32,
    "minecraft:coal_ore": 40,
    "minecraft:copper_ore": 43,
    "minecraft:emerald_ore": 22,
    "minecraft:ancient_debris": 14,
    "minecraft:emerald_block": 2,
    "minecraft:diamond_block": 3,
    "minecraft:iron_block": 7,
    "minecraft:gold_block": 5,
    "minecraft:netherite_block": 0.1
  }
};

export const MinePvE = {
  NameId: "§aPvE",
  VectorA: new Vector3(17236, 28, 14978),
  VectorB: new Vector3(17278, 48, 15020),
  BlockVolume: new BlockVolume(new Vector3(17236, 28, 14978), new Vector3(17278, 48, 15020)),
  blockTypes: {
    "minecraft:stone":86,
    "minecraft:iron_ore": 19,
    "minecraft:gold_ore": 13,
    "minecraft:diamond_ore": 6,
    "minecraft:lapis_ore": 15,
    "minecraft:redstone_ore": 17,
    "minecraft:coal_ore": 18,
    "minecraft:copper_ore": 28,
    "minecraft:emerald_ore": 5,
    "minecraft:ancient_debris": 1,
    "minecraft:iron_block": 0.35,
    "minecraft:gold_block": 0.35,
  }
};


export const MineVip = {
  NameId: "§eVIP",
  VectorA: new Vector3(2927, 176, 2751),
  VectorB: new Vector3(2957, 158, 2721),
  BlockVolume: new BlockVolume(new Vector3(2927, 176, 2751), new Vector3(2957, 158, 2721)),
  blockTypes: {
    "minecraft:diamond_ore": 60,
    "minecraft:emerald_ore": 50,
    "minecraft:ancient_debris": 25,
    "minecraft:iron_block": 10,
    "minecraft:gold_block": 10,
    "minecraft:diamond_block": 5,
    "minecraft:emerald_block": 4,
  }
};


export function RegenerateMinePvP(BlockVolumeMineViP, blockTypesMineViP) {
const blockList = generateBlockList(blockTypesMineViP);
generateRandomBlocks(BlockVolumeMineViP, blockList);
}


//-----------------------------------------------------------------------------------------------------//
