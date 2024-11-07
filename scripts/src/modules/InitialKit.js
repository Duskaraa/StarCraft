import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

world.afterEvents.playerJoin.subscribe((data) => {
  const player = data.playerName

  if(player && player.hasTag("InCourse")) {
    player.removeTag("InCourse")
  }

  if(!player.hasTag("Initialized")) {
    const form = new ActionFormData()
    form.title("§gStar§fCraft")
    form.body("§bTe damos la bienvenida a la version preliminar de §gStar§fCraft, Desarrollado por 'Duskaraa' ( RECORDATORIO: Podria tener fallos al no ser probado con anterioridad en un realm, si encuentras un bug reportalo en el Discord )")
    form.button("§cRecibir §gKit Inicial")

    form.show(player).then((result) => {
      if(result.button === 0) {
        world.structureManager.place("mystructure:kit_incial", world.getDimension("overworld"), new Vector3(player.location.x, player.location.y + 1, player.location.z), { includeBlocks: false, includeEntities: true });
        player.addTag("Initialized")
      }
    })
  }
})