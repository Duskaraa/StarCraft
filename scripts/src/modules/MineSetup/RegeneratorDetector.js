import { system, world } from "@minecraft/server";
import { calculateAirPercentage } from "./Percentage";
import { MinePvE, MinePvP, MineVip,  RegenerateMinePvP } from "./InitializeRegeneration";

let cooldownButton1 = 0;

world.afterEvents.playerInteractWithEntity.subscribe(handlePlayerInteraction);

const interval = system.runInterval(handleCooldown, 20);

/**
 * Handle player interaction with entities.
 * @param {Object} data - The interaction data.
 */
function handlePlayerInteraction(data) {
  const player = data.player;
  const target = data.target;
  target.playAnimation(`animation.wave.option_button_press`, { players: [player.name], blendOutTime: 20 });
  if (target.typeId === "source:option_button_up" && target.hasTag("Button1")) {
    if (cooldownButton1 > 0) {
      player.sendMessage(`§8[§7Sistema§8] §cEspera, no puedes ejecutar este proceso tan rapido!! Podras reutilizarlo en §7${Number(cooldownButton1)} §bSegundos`);
    } else {
      initiateRegeneration(player, MinePvP);
    }
  }
  if (target.typeId === "source:option_button_up" && target.hasTag("Button2")) {
    if (cooldownButton1 > 0) {
      player.sendMessage(`§8[§7Sistema§8] §cEspera, no puedes ejecutar este proceso tan rapido!! Podras reutilizarlo en §7${Number(cooldownButton1)} §bSegundos`);
    } else {
      initiateRegeneration(player, MinePvE);
    }
  }
  if (target.typeId === "source:option_button_up" && target.hasTag("Button3")) {
    if (cooldownButton1 > 0) {
      player.sendMessage(`§8[§7Sistema§8] §cEspera, no puedes ejecutar este proceso tan rapido!! Podras reutilizarlo en §7${Number(cooldownButton1)} §bSegundos`);
    } else {
      initiateRegeneration(player, MineVip);
    }
  }
}

/**
 * Initiate the regeneration process if conditions are met.
 * @param {Object} player - The player interacting with the button.
 */
function initiateRegeneration(player, MinePrefix) {
  console.log(`Cooldown before regeneration: ${cooldownButton1}`);
  cooldownButton1 = 90;
  console.log(`Cooldown after setting: ${cooldownButton1}`);

  const calculatedAirPercentage = calculateAirPercentage(MinePrefix.BlockVolume);
  if (calculatedAirPercentage >= 80) {
    RegenerateMinePvP(MinePrefix.BlockVolume, MinePrefix.blockTypes);
    player.sendMessage("§8[§7Sistema§8] §fLa mina comenzo a regenerarse!")
    world.sendMessage(`§8[§7Sistema§8] §cAviso. §bLa mina §8"§r${MinePrefix.NameId}§8" §bSe esta regenerando en estos instantes!!`)
  } else {
    const remainingPercentage = 100 - calculatedAirPercentage.toFixed(2);
    player.sendMessage(`§8[§7Sistema§8] §cLa mina tiene que estar un 80% minada, lamentablemente el porcentaje actual esta en §7${remainingPercentage} §b%`);
  }
}

/**
 * Handle cooldown decrement every second.
 */
function handleCooldown() {
  if (cooldownButton1 > 0) {
    cooldownButton1--;
    console.log(`Cooldown updated: ${cooldownButton1}`);
  }
}
