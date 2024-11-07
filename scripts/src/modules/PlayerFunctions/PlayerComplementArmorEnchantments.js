import { EntityComponentTypes, EntityEquippableComponent, EquipmentSlot, Player, system, world } from "@minecraft/server";

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const equipmentCompPlayer = player.getComponent(EntityComponentTypes.Equippable);
    
    if (equipmentCompPlayer) {
      const head = equipmentCompPlayer.getEquipment(EquipmentSlot.Head);
      const chest = equipmentCompPlayer.getEquipment(EquipmentSlot.Chest);
      const legs = equipmentCompPlayer.getEquipment(EquipmentSlot.Legs);
      const feet = equipmentCompPlayer.getEquipment(EquipmentSlot.Feet);

      if (
        head?.typeId === "source:turbo_helmet" &&
        chest?.typeId === "source:turbo_chestplate" &&
        legs?.typeId === "source:turbo_leggings" &&
        feet?.typeId === "source:turbo_boots"
      ) {
        player.addEffect("minecraft:speed", 20, { showParticles: false, amplifier: 4 }); 
        player.addEffect("minecraft:haste", 20, { showParticles: false, amplifier: 1}); 
      }
    }
  }
}, 5); 