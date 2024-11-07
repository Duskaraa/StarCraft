import { EnchantmentSlot, EnchantmentType, EnchantmentTypes, ItemStack, Player, system, world } from "@minecraft/server";
import { Vector3 } from "../../../libraries/Math/index";

// Array con las coordenadas de los kits
const kits = [
  { name: "kit1", coordinates: new Vector3(-14994, 109, -14994) },
  { name: "kit2", coordinates: new Vector3(-14994, 109, -15006) },
  { name: "kit3", coordinates: new Vector3(-15004, 109,-14994) },
  { name: "kit4", coordinates: new Vector3(-15004, 109, -15006) },
  { name: "kit5", coordinates: new Vector3(-15014, 109, -14994) },
  { name: "kit6", coordinates: new Vector3(-15014, 109, -15006) },
  { name: "kit7", coordinates: new Vector3(-15024, 109, -14994) },
  { name: "kit8", coordinates: new Vector3(-15024, 109, -15006) },
  { name: "kit9", coordinates: new Vector3(-15034, 109, -14994) },
  { name: "kit10", coordinates: new Vector3(-15034, 109, -15006) },
  { name: "kit11", coordinates: new Vector3(-15044, 109, -14994) },
  { name: "kit12", coordinates: new Vector3(-15044, 109, -15006) },
  { name: "kit13", coordinates: new Vector3(-15054, 109, -14994) },
  { name: "kit14", coordinates: new Vector3(-15054, 109, -15006) },
  { name: "kit15", coordinates: new Vector3(-15064, 109, -14994) },
  { name: "kit16", coordinates: new Vector3(-15064, 109, -15006) },
  { name: "kit17", coordinates: new Vector3(-15074, 109, -14994) },
  { name: "kit18", coordinates: new Vector3(-15074, 109, -15006) },
];

function swapBetweenInventories(actual, itemSlot, player, kitCoordinates) {
  system.run(() => {
    const fromInventory = player.getComponent("inventory").container;
    const block = world.getDimension("overworld").getBlock(kitCoordinates);
    const toInventory = block.getComponent("inventory")?.container;

    if (fromInventory && toInventory) {
      fromInventory.swapItems(actual, itemSlot, toInventory);
    }
  });
}

function checkPlayerInventories(player) {
  const inventoryComponent = player.getComponent("inventory");
  if (inventoryComponent) {
    const container = inventoryComponent.container;
    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (item && item.getLore().some(lore => lore.startsWith("ShopItemLore"))) {
        const kitNameLore = item.getLore().find(lore => lore.startsWith("ShopItemLore"));
        const slotLore = item.getLore().find(lore => lore.startsWith("Slot: "));
        if (kitNameLore && slotLore) {
          const actualSlotNumber = i;
          const kitName = kitNameLore.replace("ShopItemLore", "");
          const loreSlotNumber = parseInt(slotLore.split(": ")[1]);
          if (!isNaN(loreSlotNumber) && loreSlotNumber >= 0 && loreSlotNumber < container.size) {
            const kit = kits.find(kit => kit.name === kitName);
            if (kit) {
              swapBetweenInventories(actualSlotNumber, loreSlotNumber, player, kit.coordinates);
            }
          }
        }
      }
    }
  }
}

system.runInterval(() => {
  const players = world.getDimension("overworld").getPlayers({ location: new Vector3(-15013, 108, -15000), maxDistance: 200 });

  for (const player of players) {
    checkPlayerInventories(player);
  }
}, 8);


function setLoreToAllItemsInChest(kitCoordinates, kitName) {
  system.run(() => {
    const dimension = world.getDimension("overworld");
    const block = dimension.getBlock(kitCoordinates);
    const inventoryComponent = block.getComponent("inventory");

    if (inventoryComponent) {
      const container = inventoryComponent.container;

      for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);

        if (item) {
          item.lockMode = "slot";
          item.setLore([`ShopItemLore${kitName}`, `Slot: ${i}`]);
          container.setItem(i, item);
        }
      }
      world.sendMessage(`Lore 'ShopItemLore${kitName}' set to all items in the chest.`);
    } else {
      world.sendMessage("No inventory component found on the specified block.");
    }
  });
}

world.beforeEvents.itemUse.subscribe((data) => {
  const player = data.source;

  if (data.itemStack.typeId === "minecraft:stick" && player.hasTag('@#%&*!?^$+=/\\<>~|;:°£©✓±¤§')) {
    for (const kit of kits) {
      setLoreToAllItemsInChest(kit.coordinates, kit.name);
    }
  }
});

