import { system, world } from "@minecraft/server";
import { ProtectedAreas } from "../../libraries/classes/ProtectedAreas";
import { AreaLobby, AreaShop, AreaSurvivalLobby, ZoneMinePVE, ZoneMinePVP } from "./List";
import { Vector3 } from "../../libraries/Math/index";
import { ActionFormData } from "@minecraft/server-ui";
import { ProtectedSubAreas } from "../../libraries/classes/ProtectedSubAreas";

world.clearDynamicProperties();

const SubAreaManager = new ProtectedSubAreas()
const AreaManager = new ProtectedAreas()

system.runTimeout(() => {

AreaManager.addAdmin({ player: "Duskaraa" })


AreaManager.setArea({
  name: AreaLobby.name,
  start: AreaLobby.from,
  end: AreaLobby.to,
  flight: AreaLobby.fly,
  damage: AreaLobby.dealsdamage
});

/*
AreaManager.setArea({ name: AreaShop.name, from: AreaShop.from, to: AreaShop.to, fly: AreaShop.fly, dealsdamage: AreaShop.dealsdamage})

AreaManager.setArea({ name: AreaSurvivalLobby.name, from: AreaSurvivalLobby.from, to: AreaSurvivalLobby.to, fly: AreaSurvivalLobby.fly, dealsdamage: AreaSurvivalLobby.dealsdamage})

AreaManager.setArea({
  name: ZoneMinePVE.name,
  from: ZoneMinePVE.from,
  to: ZoneMinePVE.to,
  fly: ZoneMinePVE.fly,
  dealsDamage: ZoneMinePVE.dealsdamage,
  effect: ZoneMinePVE.Effect
});

SubAreaManager.addSubArea({
  parentId: ZoneMinePVE.name,
  subAreaId: ZoneMinePVE.subAreaName,
  from: ZoneMinePVE.subAreaFrom,
  to: ZoneMinePVE.subAreaTo,
  dealsDamage: ZoneMinePVE.subAreaDamage,
  effect: {
    name: ZoneMinePVE.Effect.name,
    duration: ZoneMinePVE.Effect.duration,
    showParticles: ZoneMinePVE.Effect.showParticles
  }
});
AreaManager.setArea({ name: ZoneMinePVP.name, from: ZoneMinePVP.from, to: ZoneMinePVP.to, fly: ZoneMinePVP.fly, dealsdamage: ZoneMinePVP.dealsdamage, night_vision: ZoneMinePVP.night_vision})
/*
SubAreaManager.addSubArea({ parentId: ZoneMinePVP.name, from: ZoneMinePVP.subAreaFrom, to: ZoneMinePVP.subAreaTo, subAreaId: ZoneMinePVP.subAreaName})
*/
}, 20)