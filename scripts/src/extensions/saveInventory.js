import { Player, ItemStack, EnchantmentType } from "@minecraft/server";


/**@param {Player} player  */
export function saveInventory(player, invName = player.nameTag, storage = player) {
    let { container, inventorySize } = player.getComponent("inventory");
    const items = [];
    while (inventorySize--) {
        const item = container.getItem(inventorySize);
        if (!item) {
            items.push(null);
            continue;
        };
        const data = {
            typeId: item.typeId,
            props: {
                amount: item.amount,
                keepOnDeath: item.keepOnDeath,
                lockMode: item.lockMode
            },
            lore: item.getLore(),
            canDestroy: item.getCanDestroy(),
            canPlaceOn: item.getCanPlaceOn(),
            // properties: item.getDynamicPropertyIds().reduce((o, p) => (o[p] = item, o), {}),
            components: {}
        };
        if (item.nameTag) data.props.nameTag = item.nameTag;
        if (item.hasComponent("enchantable")) {
            data.components.enchantable = item.getComponent("enchantable").getEnchantments().map(e => ({ type: e.type.id, level: e.level }));
        }
        if (item.hasComponent("durability")) {
            data.components.durability = item.getComponent("durability").damage;
        }
        items.push(data);
    }
    storage.setDynamicProperty(`inventory:${invName}`, JSON.stringify(items));
    return items;
}


/** @param {Player} player */
export function loadInventory(player, invName = player.nameTag, storage = player) {
    let { container, inventorySize } = player.getComponent("inventory");
    const items = JSON.parse(storage.getDynamicProperty(`inventory:${invName}`) ?? "[]");

    while (inventorySize--) {
        const data = items[inventorySize];
        if (!data) {
            container.setItem(inventorySize, null);
            continue;
        }

        try {
            const item = new ItemStack(data.typeId, data.props.amount);
            for (const key in data.props) {
                item[key] = data.props[key];
            }

            item.setLore(data.lore);
            item.setCanDestroy(data.canDestroy);
            item.setCanPlaceOn(data.canPlaceOn);

            if (data.components.enchantable && item.hasComponent("enchantable")) {
                const enchantmentComponent = item.getComponent("enchantable");
                data.components.enchantable.forEach(e => {
                    const enchantment = new EnchantmentType(e.type);
                    enchantment.level = e.level;
                    enchantmentComponent.addEnchantment(enchantment);
                });
            }

            if (data.components.durability && item.hasComponent("durability")) {
                item.getComponent("durability").damage = data.components.durability;
            }

            container.setItem(inventorySize, item);

        } catch (error) {
            console.error(`Failed to load item at slot ${inventorySize}:`, error);
            container.setItem(inventorySize, null); // Ensure the slot is empty on failure
        }
    }
}
