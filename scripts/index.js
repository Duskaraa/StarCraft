//Imports


import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Scoreboard } from "./src/libraries/classes/ObjectivesClass";
import { ProtectedAreas } from "./src/libraries/classes/ProtectedAreas";
import "./src/modules/MineSetup/InitializeRegeneration";
import "./src/modules/MineSetup/Percentage";
import "./src/modules/MineSetup/Regeneration";
import "./src/modules/MineSetup/Texts";
import "./src/modules/MineSetup/RegeneratorDetector";
import "./src/modules/ShopSystem/Kits/list";
import "./src/modules/ShopSystem/Kits/setup";
import "./src/modules/ChatHandler/command";
import "./src/modules/pressureplat";
import "./src/modules/Sidebar/index";
import "./src/modules/PlayerFunctions/AFksetup";
import "./src/modules/PlayerFunctions/PlayerComplementArmorEnchantments";
import "./src/modules/ShopSystem/Kits/list";
import "./src/libraries/classes/CommandBuilder";
import "./src/libraries/classes/Permission";
import "./src/libraries/classes/PlotArea"
import "./src/libraries/functions";
import "./src/modules/EntitiesControl";
import "./src/modules/ProtectedHandlerAreas/List";
import "./src/modules/ProtectedHandlerAreas/Constructors";
import "./src/libraries/classes/ProtectedAreas"
import "./src/libraries/Math/index";
import "./src/libraries/classes/PvPSystem";

import { AreaLobby, AreaShop, AreaSurvivalLobby, ZoneMinePVE, ZoneMinePVP } from "./src/modules/ProtectedHandlerAreas/List";

system.beforeEvents.watchdogTerminate.subscribe((event) => {
    event.cancel = true;
    world.sendMessage(
        `§8[§7SistemaCritico§8]  §cAVISO. §4CRITICO §6"${event.terminateReason}" §bExecucion de miles de procesos, ejecutando cancelacion de procesos!!!`
    );
});
