import { system, world } from "@minecraft/server";
import { Scoreboard } from "../../libraries/classes/ObjectivesClass";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { MoneyFormatter } from "../../libraries/classes/StaticClasses";
import { getPlayerRank } from "../ChatHandler/command";



system.runInterval(() => {
  const players = world.getAllPlayers();

  for (const player of players) {
    const Money = Scoreboard.getObjective("Money") || Scoreboard.addObjective("Money");
    const Time = Scoreboard.getObjective("PlayedTime") || Scoreboard.addObjective("PlayedTime");
    const playerMoney = Money.getScore(player) || 0;
    const playerTime = Time.getScore(player) || 0;
    const playerRank = getPlayerRank(player)

    const days = Math.floor(playerTime / 86400);
    const hours = Math.floor((playerTime % 86400) / 3600);
    const minutes = Math.floor((playerTime % 3600) / 60);
    const seconds = playerTime % 60;

    const moneyText = ` §7> §g Dinero§8: §c[§b${MoneyFormatter.formatMoney(playerMoney)}§c]`;
    const rangoText = ` §7> §6 Rango§8: §r${playerRank}§r`;
    const nameText = ` §7> §b Nombre§8: §7"§f${player.name}§7"`;
    const clanText = ` §7> §9 Clan§8: §7"§fNinguno§7"`;
    const connectedPlayers = ` §7> §3 Jugadores en linea§8: §7"§c${world.getAllPlayers().length}§7"`;
    const playedTimeText = ` §7> §c Tiempo Jugado§8: \n    §8[ §cD: ${days},§6H: ${hours},§gM: ${minutes},§aS: ${seconds}§8]`;

    const maxLength = Math.max(
      moneyText.length,
      rangoText.length,
      nameText.length,
      clanText.length,
      connectedPlayers.length,
      playedTimeText.length
    );

    let border = "§f|-----------------------------|";

    if (connectedPlayers.length > border.length) {
      const additionalLength = connectedPlayers.length - border.length + 2;
      border = "§f|" + "-".repeat(additionalLength + 15) + "|";
    }

      player.onScreenDisplay.setTitle(
        `§a§b\n`.repeat(7) +
        border + "\n" +
        "\n" +
        "       §bEstadisticas\n" +
        "\n" + "\n" +
        nameText + "\n" +
        "\n" +
        moneyText + "\n" +
        "\n" +
        rangoText + "\n" +
        "\n" +
        clanText + "\n" +
        "\n" +
        connectedPlayers + "\n" +
        "\n" +
        playedTimeText + "\n" +
        "\n" +
        border + "\n" +
        "\n" 
      );

    
  }
}, 20);

system.runInterval(() => {
  const players = world.getAllPlayers();

  for (const player of players) {
    Scoreboard.getObjective("PlayedTime").addScore(player, 1);
  }
}, 20);

world.beforeEvents.itemUse.subscribe((data) => {
  const player = data.source;
  const Objective = Scoreboard.getObjective("Money")

  if (data.itemStack.typeId === "minecraft:compass" && player.hasTag('@#%&*!?^$+=/\\<>~|;:°£©✓±¤§')) {
    system.run(() => {
      const form = new ModalFormData();
      form.title("Adjdust Money");
      form.slider("Money Amount", 1, 1000000000, 1, 1);
      form.toggle("Add or Remove"); 
      form.show(player).then((result) => {
        if (result.formValues[1] === true) {
          Objective.setScore(player, result.formValues[0]);
        } else if (result.formValues[1] === false) {
          Objective.removeScore(player, result.formValues[0]);
        }
      });
    });
  }
});