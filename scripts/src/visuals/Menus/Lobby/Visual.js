import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Vector2, Vector3 } from "../../../libraries/Math/index";
import { initiateTeleport } from "../../../libraries/functions";
import { Scoreboard } from "../../../libraries/classes/ObjectivesClass";
import { MoneyFormatter } from "../../../libraries/classes/StaticClasses";


export function ShopVisual(player, target) {
  const form = new ActionFormData()
  form.title("§c§o§s§a§e§t§i§c§o§a§r§cTienda")
  form.body(`§sTu dinero§7: §c${MoneyFormatter.formatMoney(Scoreboard.getObjective("Money").getScore(player))}`)
  form.button("§fIr a la §btienda §8(§cFisica§8)", "textures/ui/sidebar_icons/realms")
  form.show(player).then((result) => {
    if (result.selection === 0) {
      initiateTeleport(player, new Vector3(-14956.50, 111.00, -14999.50), 4)
    }
  })
}

export function MinesMenu(player, target) {
  const form = new ActionFormData();
  form.title("§c§o§s§a§e§t§i§c§o§a§r§cMinas")
  form.button("§bMina §cPvP\n§9PvP: §cActivado", "font/icons/teleporter_purple")
  form.button("§bMina §aPvE\n§9PvP: §aDesactivado", "font/icons/teleporter_cyan")
  form.show(player).then((result) => {
    if (result.selection === 0) {
      initiateTeleport(player, new Vector3(16965.50, 50.00, 15005.509), 4);
    }
    if (result.selection === 1) {
      initiateTeleport(player, new Vector3(17285.50, 50.00, 14998.50), 4);
    }
  });
}
export function SurvivalMenu(player, target) {
  const form = new ActionFormData()
  form.title("§aSurvival")
  form.body("§fEstas listo para ir al lugar de las aventuras?")
  form.button("§6Ir §bAl Survival", "font/icons/teleporter")
  form.show(player).then((result) => {
    if (result.selection === 0) {
      initiateTeleport(player, new Vector3(4000.50, 119.00, 4000.50), 4);
    }
  })
}


export function TestForm(player, target) {
  const form = new ActionFormData()
  form.title("§fBienvenido!!")
  form.body("Hola, bienvenido al servidor de §gStar§bCraft\n")
  form.button("§aReclamar Kit §bInicial", "textures/ui/n/finish_flag")
  form.show(player).then((result) => {
    if (result.selection === 0) {
    }
  })
}
export function WumpusForm(player, target) {
  player.sendMessage('§aBienvenido/a§c!! §bEstaria genial que te pasaras por nuestro servidor de §9discord§c!! §6"§9https://discord.gg/uHvJrjq9QE§6"')
}


for (const player of world.getAllPlayers()) {
  player.playSound("note.bass", { pitch: 2 })
}

for (
  const Player of world.getAllPlayers(

  )) {
  Player.playSound("note.bass", { pitch: 2 })
}

/*
            {
                "quick_travel_modal@quick_travel_modal.main_panel": {
                    "enabled": false,
                    "visible": false,
                    "bindings": [
                        {
                            "binding_type": "global",
                            "binding_condition": "none",
                            "binding_name": "#title_text",
                            "binding_name_override": "#title_text"
                        },
                        {
                            "source_property_name": "((not ((#title_text - $flag_quick_travel_modal) = #title_text)) and ((#text - '§n§o§x') = #text))",
                            "binding_type": "view",
                            "target_property_name": "#visible"
                        },
                        {
                            "source_property_name": "((not ((#title_text - $flag_quick_travel_modal) = #title_text)) and ((#text - '§n§o§x') = #text))",
                            "binding_type": "view",
                            "target_property_name": "#enabled"
                        }
                    ]
                }
            }
                */