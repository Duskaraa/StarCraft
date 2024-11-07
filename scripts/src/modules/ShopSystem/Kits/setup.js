import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { world, system, Player, ScoreboardObjective, ScoreboardIdentity } from "@minecraft/server";
import { Scoreboard } from "../../../libraries/classes/ObjectivesClass";
import { kits } from "./list";
import "./lock_system"
import { Vector3 } from "../../../libraries/Math/index";
import { MoneyFormatter } from "../../../libraries/classes/StaticClasses";

function handleButtonClick(player, kitTag, kitslist)  {
    const MoneyObj = Scoreboard.getObjective("Money") || Scoreboard.addObjective("Money")
    const playerMoney = MoneyObj.getScore(player);
    const kit = kitslist[kitTag];

    const form = new ActionFormData()
        if (playerMoney >= kit.price) { 
            form.body(`§fEstas listo para comprar el \n§r§6- §bKit §r${kit.name}§r§6 -§r §feste maravilloso kit se encuentra en §r§8[§b${MoneyFormatter.formatMoney(kit.price)}§a$§8]§r§f Haslo tuyo en este momento!! \n\n§bDinero Actual§7: §a${MoneyFormatter.formatMoney(Scoreboard.getObjective("Money").getScore(player))}\n§o§6Dinero Suficiente!`) } else if (playerMoney < kit.price ) { form.body(`§fEstas listo para comprar el \n§r§6- §bKit §r${kit.name}§r§6 -§r §feste maravilloso kit se encuentra en §r§8[§b${MoneyFormatter.formatMoney(kit.price)}§a$§8]§r§f Haslo tuyo en este momento!! \n\n§bDinero Actual§7: §a${MoneyFormatter.formatMoney(Scoreboard.getObjective("Money").getScore(player))}\n§c§oDinero Insuficiente`) 
        }
        form.title(`§o§b§a`)
        //form.button("§7--> §aComprar §7<--", "font/icons/success_unlocked")
        form.button("§7--> §cCancelar §7<--", "font/icons/cancel")

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage(`§cMenu Cerrado §8( §7Cancelacion forzada§8 )`);
            player.playSound("mob.chicken.plop");
        } else if (response.selection === 0) {
            if (playerMoney >= kit.price) {
                world.structureManager.place("mystructure:" + kit.structureNamed, world.getDimension("overworld"), new Vector3(player.location.x, player.location.y + 1, player.location.z), { includeBlocks: false, includeEntities: true });
                MoneyObj.addScore(player, -kit.price);
                const MoneyLZ = playerMoney - kit.price;
                player.sendMessage(`§a¡Enhorabuena! Has adquirido el §f${kit.name}§a de forma exitosa.`);
                player.sendMessage(`§6Ahora dispones de §e${MoneyFormatter.formatMoney(MoneyLZ)} §6en tu cartera. ¡Disfruta de tu nueva adquisición!`);
                player.playSound("random.levelup");
            } else {
                const MoneyLA = kit.price - playerMoney;
                player.sendMessage("§cLo siento, no tienes suficiente dinero para comprar este kit.");
                player.sendMessage(`§6El §gdinero §ffaltante para comprar este kit es de§7: §a${MoneyFormatter.formatMoney(MoneyLA)}`);
                player.playSound("note.bass");
            }
        } else if (response.selection === 1) {
            player.sendMessage(`§cMenu Cerrado §8( §7Cancelacion por selección §8)`);
            player.playSound("mob.chicken.plop");
        }
    });
}

world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    const buttons = 20; 
    
    for (let i = 1; i <= buttons; i++) {
        const buttoId = `LZ${i}`;
        system.run(() => { handleButtonInteraction(event.player, event.target, buttoId); })
    }
});

function handleButtonInteraction(player, target, kitTag) {
    if (target && target.typeId === "source:button" && target.hasTag(kitTag)) {
        target.playAnimation(`animation.wave.button`, { players: [player.name], blendOutTime: 20 });
        handleButtonClick(player, kitTag, kits);
    }
}
