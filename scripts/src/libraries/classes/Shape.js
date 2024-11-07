import { Block } from "@minecraft/server";

var ChunkStatus;
(function (ChunkStatus) {
    ChunkStatus[ChunkStatus["EMPTY"] = 0] = "EMPTY";
    ChunkStatus[ChunkStatus["FULL"] = 1] = "FULL";
    ChunkStatus[ChunkStatus["DETAIL"] = 2] = "DETAIL";
})(ChunkStatus || (ChunkStatus = {}));
/**
 * A base shape class for generating blocks in a variety of formations.
 */
export class Shape {
    constructor() {
        /**
         * Whether the shape is being used in a brush.
         * Shapes used in a brush may handle history recording differently from other cases.
         */
        this.usedInBrush = false;
    }
    /**
     * Deduces what kind of chunk is being processed.
     * @param relLocMin relative location of the chunks minimum block corner
     * @param relLocMax relative location of the chunks maximum block corner
     * @param genVars
     * @returns
     * - `ChunkStatus.FULL` will use fast fill operations when simple patterns and masks are used.
     * - `ChunkStatus.EMPTY` will get ignored.
     * - `ChunkStatus.DETAIL` will place blocks one at a time.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getChunkStatus(relLocMin, relLocMax, genVars) {
        return ChunkStatus.DETAIL;
    }
    /**
     * Returns blocks that are in the shape.
     */
    *getBlocks(loc, options) {
        const range = this.getRegion(loc);
        this.genVars = {};
        this.prepGeneration(this.genVars, options);
        for (const block of regionIterateBlocks(...range)) {
            if (this.inShape(Vector.sub(block, loc).floor(), this.genVars)) {
                yield block;
            }
        }
    }
    inShapeHollow(relLoc, genVars) {
        const block = this.inShape(relLoc, genVars);
        if (genVars.hollow && block) {
            const thickness = genVars.hollowThickness ?? 1;
            let neighbourCount = 0;
            for (const offset of [
                [0, thickness, 0],
                [0, -thickness, 0],
                [thickness, 0, 0],
                [-thickness, 0, 0],
                [0, 0, thickness],
                [0, 0, -thickness],
            ]) {
                neighbourCount += this.inShape(relLoc.add(offset), genVars) ? 1 : 0;
            }
            return neighbourCount == 6 ? false : block;
        }
        else {
            return block;
        }
    }
    /**
     * Generates a block formation at a certain location.
     * @param loc The location the shape will be generated at
     * @param pattern The pattern that the shape will be made with
     * @param mask The mask to decide where the shape will generate blocks
     * @param session The session that's using this shape
     * @param options A group of options that can change how the shape is generated
     */
    *generate(loc, pattern, mask, session, options) {
        const [min, max] = this.getRegion(loc);
        console.warn(min, max);
        const player = session.getPlayer();
        const dimension = player.dimension;
        const [minY, maxY] = getWorldHeightLimits(dimension);
        min.y = Math.max(minY, min.y);
        max.y = Math.min(maxY, max.y);
        const canGenerate = max.y >= min.y;
        pattern.setContext(session, [min, max]);
        if (!Jobs.inContext())
            assertCanBuildWithin(player, min, max);
        let blocksAffected = 0;
        const blocksAndChunks = [];
        mask = mask ?? new Mask();
        const history = options?.recordHistory ?? true ? session.getHistory() : null;
        const record = history?.record(this.usedInBrush);
        try {
            let count = 0;
            if (canGenerate) {
                this.genVars = {};
                this.prepGeneration(this.genVars, options);
                // TODO: Localize
                let activeMask = mask;
                const globalMask = options?.ignoreGlobalMask ?? false ? new Mask() : session.globalMask;
                activeMask = !activeMask ? globalMask : globalMask ? mask.intersect(globalMask) : activeMask;
                const simple = pattern.isSimple() && (!mask || mask.isSimple());
                let progress = 0;
                const volume = regionVolume(min, max);
                const inShapeFunc = this.customHollow ? "inShape" : "inShapeHollow";
                yield Jobs.nextStep("Calculating shape...");
                // Collect blocks and areas that will be changed.
                for (const [chunkMin, chunkMax] of regionIterateChunks(min, max)) {
                    yield Jobs.setProgress(progress / volume);
                    const chunkStatus = this.getChunkStatus(Vector.sub(chunkMin, loc).floor(), Vector.sub(chunkMax, loc).floor(), this.genVars);
                    if (chunkStatus === ChunkStatus.FULL && simple) {
                        const volume = regionVolume(chunkMin, chunkMax);
                        progress += volume;
                        blocksAffected += volume;
                        const prev = blocksAndChunks[blocksAndChunks.length - 1];
                        if (Array.isArray(prev) &&
                            regionVolume(...prev) + volume > 32768 &&
                            prev[1].y + 1 === chunkMin.y &&
                            prev[0].x === chunkMin.x &&
                            prev[1].x === chunkMax.x &&
                            prev[0].z === chunkMin.z &&
                            prev[1].z === chunkMax.z) {
                            // Merge chunks in the same column
                            prev[1].y = chunkMax.y;
                        }
                        else {
                            blocksAndChunks.push([chunkMin, chunkMax]);
                        }
                    }
                    else if (chunkStatus === ChunkStatus.EMPTY) {
                        const volume = regionVolume(chunkMin, chunkMax);
                        progress += volume;
                    }
                    else {
                        for (const blockLoc of regionIterateBlocks(chunkMin, chunkMax)) {
                            yield Jobs.setProgress(progress / volume);
                            progress++;
                            if (this[inShapeFunc](Vector.sub(blockLoc, loc).floor(), this.genVars)) {
                                let block;
                                do {
                                    if (Jobs.inContext()) {
                                        block = Jobs.loadBlock(blockLoc);
                                        if (!block)
                                            yield sleep(1);
                                    }
                                    else {
                                        block = dimension.getBlock(blockLoc);
                                    }
                                } while (!block && Jobs.inContext());
                                if (!activeMask.empty() && !activeMask.matchesBlock(block))
                                    continue;
                                blocksAndChunks.push(block);
                                blocksAffected++;
                            }
                            yield;
                        }
                    }
                }
                progress = 0;
                yield Jobs.nextStep("Generating blocks...");
                yield history?.addUndoStructure(record, min, max);
                for (let block of blocksAndChunks) {
                    if (block instanceof Block) {
                        if (!block.isValid() && Jobs.inContext()) {
                            const loc = block.location;
                            block = undefined;
                            do {
                                block = Jobs.loadBlock(loc);
                                if (!block)
                                    yield sleep(1);
                            } while (!block);
                        }
                        if (pattern.setBlock(block))
                            count++;
                        if (iterateChunk())
                            yield Jobs.setProgress(progress / blocksAffected);
                        progress++;
                    }
                    else {
                        const [min, max] = block;
                        const volume = regionVolume(min, max);
                        if (Jobs.inContext())
                            while (!Jobs.loadBlock(min))
                                yield sleep(1);
                        if (pattern.fillSimpleArea(dimension, min, max, mask))
                            count += volume;
                        yield Jobs.setProgress(progress / blocksAffected);
                        progress += volume;
                    }
                }
                yield history?.addRedoStructure(record, min, max);
            }
            history?.commit(record);
            return count;
        }
        catch (e) {
            history?.cancel(record);
            throw e;
        }
    }
}
Shape.ChunkStatus = ChunkStatus;
