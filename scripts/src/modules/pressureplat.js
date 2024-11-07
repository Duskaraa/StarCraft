import { world, system } from "@minecraft/server";
import { Vector3 } from "../libraries/Math/index";

world.afterEvents.pressurePlatePush.subscribe((data) => {
  const player = data.source;

  if (!player || !player.getViewDirection) return;

  const pressurePlateLocations = [
    new Vector3(999, 96, 1014),
    new Vector3(1000, 96, 1014),
    new Vector3(1001, 96, 1014)
  ];

  const isMatchingLocation = pressurePlateLocations.some(loc => 
    Math.floor(data.block.location.x) === loc.x && 
    Math.floor(data.block.location.y) === loc.y && 
    Math.floor(data.block.location.z) === loc.z
  );

  if (isMatchingLocation) {
    const playerViewDirection = player.getViewDirection();

    const magnitude = Math.sqrt(playerViewDirection.x ** 2 + playerViewDirection.y ** 2 + playerViewDirection.z ** 2);

    const normalizedDirection = {
      x: playerViewDirection.x / magnitude,
      y: playerViewDirection.y / magnitude,
      z: playerViewDirection.z / magnitude
    };

    const baseStrengthH = 8.9;
    const baseStrengthV = 1.1;

    const horizontalStrength = baseStrengthH * Math.sqrt(Math.abs(normalizedDirection.x) ** 3 + Math.abs(normalizedDirection.z) ** 3);
    const verticalStrength = baseStrengthV * Math.abs(normalizedDirection.y) * 1.5; 

    player.applyKnockback(normalizedDirection.x, normalizedDirection.z, horizontalStrength, verticalStrength);
    player.playSound("mob.chicken.plop");
  }
});
