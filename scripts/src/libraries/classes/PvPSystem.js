import { world, system, Player } from "@minecraft/server";

export class PvPManager {
    constructor() {
        try {
            if (!world.getDynamicProperty("pvpData")) {
                world.setDynamicProperty("pvpData", JSON.stringify({}));
            }

            this.dynamicPropertyKey = "pvpData";
            this.pvpData = JSON.parse(world.getDynamicProperty(this.dynamicPropertyKey)) || {};
            this.pvpIntervals = {};
            this.messageIntervals = {};
        } catch (error) {
            console.error(`Error initializing PvPManager: ${error}`);
        }
    }

    setPvP(player, seconds) {
        if (!player || !seconds) return;
        this.pvpData[player.nameTag] = seconds;
        this.saveState();
    }

    decreasePvP(player) {
        try {
            if (this.pvpData[player.nameTag] > 0) {
                this.pvpData[player.nameTag]--;
                if (this.pvpData[player.nameTag] <= 0) {
                    this.endPvP(player);
                }
                this.saveState();
            }
        } catch (error) {
            this.clearIntervals(player);
            console.error(`Error in decreasePvP: ${error}`);
        }
    }

    resetPvP(player) {
        try {
            if (!player) return;
            delete this.pvpData[player.nameTag];
            player.removeTag("TagProhibition");
            player.removeTag("OnPVP");
            this.clearIntervals(player);
            this.saveState();
        } catch (error) {
            console.error(`Error resetting PvP: ${error}`);
        }
    }

    saveState() {
        try {
            world.setDynamicProperty(this.dynamicPropertyKey, JSON.stringify(this.pvpData));
        } catch (error) {
            console.error(`Error saving state: ${error}`);
        }
    }

    startPvP(player1, player2) {
        try {
            if (!player1 || !player2) return;
            this.setPvP(player1, 15);
            this.setPvP(player2, 15);
            player1.sendMessage(`§7[§bServidor§7] §cEstás en Zona PvP, ¡No podrás escapar!`);
            player2.sendMessage(`§7[§bServidor§7] §cEstás en Zona PvP, ¡No podrás escapar!`);
            player1.addTag("TagProhibition");
            player1.addTag("OnPVP");
            player2.addTag("TagProhibition");
            player2.addTag("OnPVP");

            this.clearIntervals(player1);
            this.clearIntervals(player2);

            const pvpInterval = system.runInterval(() => {
                try {
                    this.decreasePvP(player1);
                    this.decreasePvP(player2);
                } catch (error) {
                    this.clearIntervals(player1);
                    this.clearIntervals(player2);
                    console.error(`Error in interval: ${error}`);
                }
            }, 20);

            this.pvpIntervals[player1.nameTag] = pvpInterval;
            this.pvpIntervals[player2.nameTag] = pvpInterval;

            this.clearMessageIntervals();

            const messageInterval = system.runInterval(() => {
                try {
                    this.sendPvPStatusMessages(player1);
                    this.sendPvPStatusMessages(player2);
                } catch (error) {
                    console.error(`Error sending PvP status messages: ${error}`);
                }
            }, 20);

            this.messageIntervals[player1.nameTag] = messageInterval;
            this.messageIntervals[player2.nameTag] = messageInterval;
        } catch (error) {
            console.error(`Error starting PvP: ${error}`);
        }
    }

    startPvP1Player(player) {
        try {
            if (!player) return;
            this.setPvP(player, 15);
            player.addTag("TagProhibition");
            player.addTag("OnPVP");

            this.clearIntervals(player);

            const pvpInterval = system.runInterval(() => {
                try {
                    this.decreasePvP(player);
                } catch (error) {
                    this.clearIntervals(player);
                    console.error(`Error in interval: ${error}`);
                }
            }, 20);

            this.pvpIntervals[player.nameTag] = pvpInterval;

            this.clearMessageIntervals();

            const messageInterval = system.runInterval(() => {
                try {
                    this.sendPvPStatusMessages(player);
                } catch (error) {
                    console.error(`Error sending PvP status messages: ${error}`);
                }
            }, 20);

            this.messageIntervals[player.nameTag] = messageInterval;
        } catch (error) {
            console.error(`Error starting PvP: ${error}`);
        }
    }

    sendPvPStatusMessages(player) {
        try {
            if (this.pvpData[player.nameTag]) {
                player.sendMessage(`z§p§cCombate§7: §8[§b${this.pvpData[player.nameTag]}§8]`);
            }
        } catch (error) {
            console.error(`Error sending PvP status message: ${error}`);
        }
    }

    handlePvP(player1, player2) {
        try {
            if (!player1.hasTag("TagProhibition") || !player2.hasTag("TagProhibition")) {
                this.startPvP(player1, player2);
            } else {
                this.setPvP(player1, 15);
                this.setPvP(player2, 15);
            }
        } catch (error) {
            console.error(`Error handling PvP: ${error}`);
        }
    }

    handlePvP1Player(player) {
        try {
            if (!player.hasTag("TagProhibition")) {
                this.startPvP1Player(player);
            } else {
                this.setPvP(player, 15);
            }
        } catch (error) {
            console.error(`Error handling PvP: ${error}`);
        }
    }

    handlePlayerDeath(player) {
        try {
            if (this.pvpData[player.nameTag]) {
                this.resetPvP(player);
                player.sendMessage(`§7[§bServidor§7] §6El PvP ha terminado para ti debido a tu muerte`);
            }
        } catch (error) {
            console.error(`Error handling player death: ${error}`);
        }
    }

    handlePlayerKill(player) {
        try {
            if (this.pvpData[player.nameTag]) {
                this.endPvP(player);
                this.startPvP1Player(player);
                player.sendMessage(`§7[§bServidor§7] §6El PvP ha terminado para el otro jugador debido a su muerte!`);
            }
        } catch (error) {
            console.error(`Error handling player kill: ${error}`);
        }
    }

    clearIntervals(player) {
        try {
            if (player && this.pvpIntervals[player.nameTag]) {
                system.clearRun(this.pvpIntervals[player.nameTag]);
                delete this.pvpIntervals[player.nameTag];
            }
        } catch (error) {
            console.error(`Error clearing intervals: ${error}`);
        }
    }

    clearMessageIntervals() {
        try {
            for (const key in this.messageIntervals) {
                if (this.messageIntervals[key]) {
                    system.clearRun(this.messageIntervals[key]);
                    delete this.messageIntervals[key];
                }
            }
        } catch (error) {
            console.error(`Error clearing message intervals: ${error}`);
        }
    }

    isInPvP(player) {
        return this.pvpData.hasOwnProperty(player.nameTag);
    }

    endPvP(player) {
        try {
            delete this.pvpData[player.nameTag];
            player.removeTag("TagProhibition");
            player.removeTag("OnPVP");
            player.sendMessage(`§7[§bServidor§7] §aSe ha terminado el enfrentamiento en Zona PvP`);
            player.playSound("random.levelup");
            this.clearIntervals(player);
        } catch (error) {
            console.error(`Error ending PvP: ${error}`);
        }
    }
}

const pvpManager = new PvPManager();
/*
// Evento de golpe entre entidades
world.afterEvents.entityHitEntity.subscribe((data) => {
    try {
        const player = data.damagingEntity;
        const target = data.hitEntity;

        if (player instanceof Player && target instanceof Player) {
            if (target.hasTag("OnZonePvP") && player.hasTag("OnZonePvP")) {
                pvpManager.handlePvP(player, target);
            }

            if (player.hasTag("NoDealsDamage") && target.hasTag("OnZonePvP")) {
                player.sendMessage(`§7[§bServidor§7] §cSi no estás en la zona PvP, no pegues a gente dentro de PvP`);
            }

            if (target.hasTag("NoDealsDamage") && player.hasTag("OnZonePvP")) {
                player.sendMessage(`§7[§bServidor§7] §cLa persona a la que atacas está fuera de la zona PvP`);
            }
        }
    } catch (error) {
        console.error(`Error in entityHitEntity event: ${error}`);
    }
});

// Evento de muerte del jugador
world.afterEvents.entityDie.subscribe((data) => {
    try {
        const player = data.deadEntity;
        if (player instanceof Player) {
            pvpManager.handlePlayerDeath(player);
        }
    } catch (error) {
        console.error(`Error in playerDie event: ${error}`);
    }
});

// Evento de desconexión del jugador
world.afterEvents.playerLeave.subscribe((data) => {
    try {
        const player = data.player;
        if (player.hasTag("OnPVP")) {
            pvpManager.endPvP(player);
        }
    } catch (error) {
        console.error(`Error in playerLeave event: ${error}`);
    }
});

// Evento de reingreso del jugador
world.afterEvents.playerJoin.subscribe((data) => {
    try {
        const player = data.playerName;
        if (pvpManager.isInPvP(player)) {
            pvpManager.resetPvP(player);
        }
    } catch (error) {
        console.error(`Error in playerJoin event: ${error}`);
    }
});
*/