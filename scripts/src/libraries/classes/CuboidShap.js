import { MolangVariableMap } from "@minecraft/server";
import { Vector } from "../Math/main";
import { Shape } from "./Shape";

export class CuboidShape extends Shape {
  constructor(length, width, depth) {
      super();
      this.size = [0, 0, 0];
      this.customHollow = true;
      this.size = [length, width, depth];
  }
  getRegion(loc) {
      return [loc, loc.offset(this.size[0] - 1, this.size[1] - 1, this.size[2] - 1)];
  }
  getYRange() {
      return [0, this.size[1] - 1];
  }
  draw(loc, player, global) {
      const dimension = player.dimension;
      try {
          const size = Vector.from(this.size);
          const spawnAt = Vector.add(player.getHeadLocation(), Vector.from(player.getViewDirection()).mul(20));
          spawnAt.y = Math.min(Math.max(spawnAt.y, dimension.heightRange.min), dimension.heightRange.max);
          const molangVars = new MolangVariableMap();
          molangVars.setFloat("alpha_selection", 0.1);
          molangVars.setFloat("alpha_background", 0.2);
          molangVars.setVector3("offset", Vector.sub(loc, spawnAt).add(size.mul(0.5)));
          molangVars.setVector3("size", size);
          (global ? dimension : player).spawnParticle("wedit:selection_cuboid", spawnAt, molangVars);
      }
      catch {
          /* pass */
      }
  }
  prepGeneration(genVars, options) {
      genVars.isHollow = options?.hollow ?? false;
      genVars.isWall = options?.wall ?? false;
      genVars.hollowOffset = options?.hollowThickness ?? 0;
      genVars.end = this.size.map((v) => v - (genVars.isHollow || genVars.isWall ? options?.hollowThickness ?? 1 : 1));
      if (!genVars.isHollow && !genVars.isWall) {
          genVars.isSolidCuboid = true;
      }
  }
  getChunkStatus(relLocMin, relLocMax, genVars) {
      return genVars.isWall || genVars.isHollow ? Shape.ChunkStatus.DETAIL : Shape.ChunkStatus.FULL;
  }
  inShape(relLoc, genVars) {
      const end = genVars.end;
      const hollowOffset = genVars.hollowOffset;
      if (genVars.isWall && relLoc.x > hollowOffset && relLoc.x < end[0] && relLoc.z > hollowOffset && relLoc.z < end[2]) {
          return false;
      }
      else if (genVars.isHollow && relLoc.x > hollowOffset && relLoc.x < end[0] && relLoc.y > hollowOffset && relLoc.y < end[1] && relLoc.z > hollowOffset && relLoc.z < end[2]) {
          return false;
      }
      return true;
  }
}
