import { Effect, system, world } from "@minecraft/server";
import { Vector3 } from "../../libraries/Math/index";

export const ZoneMinePVE = {
  name: "Zone Mine PvE",
  from: new Vector3(17174, 131, 14914),
  to: new Vector3(17351, 0, 15091),
  dealsDamage: false,  
  fly: false,
  Effect: { 
    name: "regeneration", 
    duration: 100, 
    showParticles: false
  },
  subAreaName: "ZoneMinePvESubArea1",
  subAreaFrom: new Vector3(17235, 27, 14977),
  subAreaTo: new Vector3(17279, 48, 15021),
  subAreaDamage: false  
}

export const ZoneMinePVP = {
  name: "Zone Mine PvP",
  from: new Vector3(16907, 0, 15112),
  to: new Vector3(17120, 400, 14888),
  dealsdamage: true,
  fly: false,
  night_vision: true,
  subAreaName: "ZoneMinePvPSubArea1",
  subAreaFrom: new Vector3(17023, 48, 15027),
  subAreaTo: new Vector3(16979, 28, 14983)
}

export const AreaLobby = {
  name: "AreaLobby",
  from: new Vector3(231, -41, -288),
  to: new Vector3(-131, 235, 115),
  Effect: { 
    name: "resistance", 
    duration: 100, 
    showParticles: false,
    amplifier: 1
  },
  dealsdamage: false,
  fly: false
}

export const AreaSurvivalLobby = {
  name: "Survival",
  from: new Vector3(4007, 400, 3993),
  to: new Vector3(3993, -200, 4007),
  dealsdamage: false,
  fly: false
}

export const AreaShop = {
  name: "AreaShop",
  from: new Vector3(-14918.84, 105.88, -14962.38),
  to: new Vector3(-15035, 109, -150091),
  dealsdamage: true,
  fly: false
}
