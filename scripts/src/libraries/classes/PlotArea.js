import { world, BlockVolume } from "@minecraft/server";
import { Vector3 } from "../Math/index";

export class PlotManager {
    constructor() {
        if (!world.getDynamicProperty("plots")) {
            world.setDynamicProperty("plots", JSON.stringify([]));
        }
        if (!world.getDynamicProperty("plotAdmins")) {
            world.setDynamicProperty("plotAdmins", JSON.stringify([]));
        }
    }

    getAllPlots() {
        try {
            return JSON.parse(world.getDynamicProperty("plots"));
        } catch (error) {
            console.error("Error parsing plots data:", error);
            return [];
        }
    }

    getPlot({ id }) {
        const plots = this.getAllPlots();
        return new Plot(plots.find(plot => plot.id === id) || {});
    }

    getAdmins() {
        try {
            return JSON.parse(world.getDynamicProperty("plotAdmins"));
        } catch (error) {
            console.error("Error parsing admins data:", error);
            return [];
        }
    }

    addAdmin({ player }) {
        const admins = this.getAdmins();
        if (!admins.includes(player)) {
            admins.push(player);
            this.updateAdmins({ data: admins });
            console.warn(`§b${player}§f §eadded to the plot admins list!`);
        } else {
            console.warn(`§b${player}§f §eis already an admin!`);
        }
    }

    removeAdmin({ player }) {
        const admins = this.getAdmins();
        const index = admins.indexOf(player);
        if (index > -1) {
            admins.splice(index, 1);
            this.updateAdmins({ data: admins });
            console.warn(`§b${player}§f §eremoved from the plot admins list!`);
        } else {
            console.warn(`§b${player}§f §ewas not found in the admins list!`);
        }
    }

    setPlot({ name, from, to, dealsDamage, canFly, nightVision }) {
        if (!(from instanceof Vector3) || !(to instanceof Vector3)) {
            console.error(`§eParameters must be of type Vector3!`);
            return;
        }

        const plots = this.getAllPlots();
        if (plots.some(plot => plot.id === name)) {
            console.error(`§b${name}§f §eis already in use, choose another plot name!`);
            return;
        }

        const newPlot = {
            id: name,
            whitelist: [],
            from: { x: from.x, y: from.y, z: from.z },
            to: { x: to.x, y: to.y, z: to.z },
            dealsDamage,
            nightVision,
            canFly,
            friends: [],
            permissions: []
        };

        const newPlotVolume = new BlockVolume(newPlot.from, newPlot.to);
        const intersects = plots.some(plot =>
            newPlotVolume.intersects(new BlockVolume(plot.from, plot.to))
        );

        if (!intersects) {
            plots.push(newPlot);
            this.update({ data: plots });
            console.warn(`§b${name}§f §eadded to protected plots!§f`);
        } else {
            console.warn(`§b${name}§f §ecannot be created because it intersects with another plot!`);
        }
    }

    update({ data }) {
        world.setDynamicProperty("plots", JSON.stringify(data));
    }

    updateAdmins({ data }) {
        world.setDynamicProperty("plotAdmins", JSON.stringify(data));
    }

    searchPlotsByName(name) {
        const plots = this.getAllPlots();
        return plots.filter(plot => plot.id.toLowerCase().includes(name.toLowerCase()));
    }

    searchPlotsByLocation(location) {
        const plots = this.getAllPlots();
        return plots.filter(plot => {
            const plotVolume = new BlockVolume(plot.from, plot.to);
            return plotVolume.contains(location);
        });
    }

    updatePlot({ id, updates }) {
        const plots = this.getAllPlots();
        const plotIndex = plots.findIndex(plot => plot.id === id);
        if (plotIndex !== -1) {
            plots[plotIndex] = { ...plots[plotIndex], ...updates };
            this.update({ data: plots });
            console.warn(`§b${id}§f §eupdated successfully!`);
        } else {
            console.error(`§b${id}§f §eplot not found!`);
        }
    }

    deletePlot({ id }) {
        const plots = this.getAllPlots();
        const plotIndex = plots.findIndex(plot => plot.id === id);
        if (plotIndex !== -1) {
            plots.splice(plotIndex, 1);
            this.update({ data: plots });
            console.warn(`§b${id}§f §edeleted successfully!`);
        } else {
            console.error(`§b${id}§f §eplot not found!`);
        }
    }
}

class Plot {
    constructor(data) {
        this.id = data.id || '';
        this.whitelist = data.whitelist || [];
        this.from = data.from || { x: 0, y: 0, z: 0 };
        this.to = data.to || { x: 0, y: 0, z: 0 };
        this.dealsDamage = data.dealsDamage || false;
        this.nightVision = data.nightVision || false;
        this.canFly = data.canFly || false;
        this.friends = data.friends || [];
        this.permissions = data.permissions || [];
    }
}

const plotManager = new PlotManager();

// Crear los vectores de coordenadas
const from = new Vector3(-20033, 64, -19853);
const to = new Vector3(-19987, 53, -19899);

// Definir los parámetros del nuevo plot
const plotName = "MyPlotName"; // Puedes cambiar esto al nombre deseado
const dealsDamage = false;
const canFly = true;
const nightVision = true;

// Llamar al método setPlot para crear el nuevo plot
plotManager.setPlot({
    name: plotName,
    from: from,
    to: to,
    dealsDamage: dealsDamage,
    canFly: canFly,
    nightVision: nightVision
});