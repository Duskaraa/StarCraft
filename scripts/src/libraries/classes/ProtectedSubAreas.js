import { world, BlockVolume } from "@minecraft/server";
import { Vector3 } from "../Math/index";

export class ProtectedSubAreas {
    constructor() {
        this.load();
    }

    load() {
        if (!world.getDynamicProperty("protectedAreas")) {
            world.setDynamicProperty("protectedAreas", JSON.stringify([]));
        }
    }

    getProtectedSubAreas() {
        try {
            return JSON.parse(world.getDynamicProperty("protectedAreas"));
        } catch (error) {
            console.error("Error parsing protected sub-areas:", error);
            return [];
        }
    }

    getArea({ id }) {
        const protectedSubAreas = this.getProtectedSubAreas();
        return protectedSubAreas.find(area => area.id === id);
    }

    getSubAreas({ parentId }) {
        const parentArea = this.getArea({ id: parentId });
        return parentArea ? parentArea.subAreas || [] : [];
    }

    getSubArea({ parentId, subAreaId }) {
        const subAreas = this.getSubAreas({ parentId });
        return subAreas.find(subArea => subArea.id === subAreaId);
    }

    addSubArea({ parentId, subAreaId, from, to, effect, dealsDamage }) {
        const parentArea = this.getArea({ id: parentId });
        if (!parentArea) {
            console.error(`Parent area ${parentId} does not exist!`);
            return;
        }

        if (!Array.isArray(parentArea.subAreas)) {
            parentArea.subAreas = [];
        }

        const subAreas = this.getSubAreas({ parentId });
        if (subAreas.some(subArea => subArea.id === subAreaId)) {
            console.error(`Sub-area ${subAreaId} is already in use. Try another sub-area name!`);
            return;
        }

        if (from instanceof Vector3 && to instanceof Vector3) {
            const newSubArea = {
                id: subAreaId,
                from: { x: from.x, y: from.y, z: from.z },
                to: { x: to.x, y: to.y, z: to.z },
                effect: effect ? this.validateEffect(effect) : null,
                dealsDamage: dealsDamage ?? true 
            };

            const newSubAreaForm = new BlockVolume(newSubArea.from, newSubArea.to);
            const hasIntersection = subAreas.some(subArea =>
                newSubAreaForm.intersects(new BlockVolume(subArea.from, subArea.to))
            );

            if (!hasIntersection) {
                parentArea.subAreas.push(newSubArea);
                this.update();
                console.warn(`Sub-area ${subAreaId} added to subareas of ${parentId}!`);
            } else {
                console.warn(`Sub-area ${subAreaId} cannot be created because it intersects another sub-area boundary!`);
            }
        } else {
            console.error(`Parameters do not match the required types! Expected Vector3.`);
        }
    }

    validateEffect(effect) {
        const defaultEffect = {
            name: "night_vision",
            duration: 6000,
            showParticles: true
        };

        return {
            name: effect.name || defaultEffect.name,
            duration: effect.duration || defaultEffect.duration,
            showParticles: effect.showParticles !== undefined ? effect.showParticles : defaultEffect.showParticles
        };
    }

    update() {
        world.setDynamicProperty("protectedAreas", JSON.stringify(this.getProtectedSubAreas()));
    }

    updateSubArea({ parentId, subAreaId, data }) {
        const protectedSubAreas = this.getProtectedSubAreas();
        const parentArea = protectedSubAreas.find(area => area.id === parentId);
        if (!parentArea) {
            console.error(`Parent area ${parentId} does not exist!`);
            return;
        }

        const subAreaIndex = parentArea.subAreas.findIndex(subArea => subArea.id === subAreaId);
        if (subAreaIndex > -1) {
            parentArea.subAreas[subAreaIndex] = { ...parentArea.subAreas[subAreaIndex], ...data };
            this.update();
        } else {
            console.error(`Sub-area ${subAreaId} does not exist in ${parentId}!`);
        }
    }

    deleteSubArea({ parentId, subAreaId }) {
        const protectedSubAreas = this.getProtectedSubAreas();
        const parentArea = protectedSubAreas.find(area => area.id === parentId);
        if (!parentArea) {
            console.error(`Parent area ${parentId} does not exist!`);
            return;
        }

        const subAreaIndex = parentArea.subAreas.findIndex(subArea => subArea.id === subAreaId);
        if (subAreaIndex > -1) {
            const removedSubArea = parentArea.subAreas.splice(subAreaIndex, 1)[0].id;
            console.warn(`Sub-area ${removedSubArea} deleted from subareas of ${parentId}!`);
            this.update();
        } else {
            console.error(`Sub-area ${subAreaId} does not exist in ${parentId}!`);
        }
    }

    deleteAllSubAreas({ parentId }) {
        const parentArea = this.getArea({ id: parentId });
        if (!parentArea) {
            console.error(`Parent area ${parentId} does not exist!`);
            return;
        }

        parentArea.subAreas = [];
        console.warn(`All subareas of ${parentId} have been deleted!`);
        this.update();
    }

    static isInsideSubArea(position, subArea) {
        const subAreaBox = new BlockVolume(subArea.from, subArea.to);
        return subAreaBox.contains(position);
    }

    getSubAreaFromPosition(position, parentId) {
        const subAreas = this.getSubAreas({ parentId });
        return subAreas.find(subArea => this.isInsideSubArea(position, subArea));
    }

    isPvPAllowed(position, parentId) {
        const subArea = this.getSubAreaFromPosition(position, parentId);
        if (subArea && subArea.dealsDamage !== undefined) {
            return subArea.dealsDamage;
        }
        return true;
    }
}
