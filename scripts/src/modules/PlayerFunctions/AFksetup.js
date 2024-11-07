import { world, system } from "@minecraft/server"

let scoreMap = new Map()
system.runInterval(() => {
    for (const source of world.getPlayers()) {
      if(!source.hasTag("Admin")) {
        const { x, y, z } = source.location
        const velocity = source.getVelocity()
        let score = scoreMap.get(source) || 0
        const blockBelow = source.dimension.getBlock({ x, y, z })
        if (velocity.x === 0 && velocity.z === 0 || blockBelow.typeId === "minecraft:water") {
            score++
        } else {
            score = 0
        }
        scoreMap.set(source, score)
        if (score > 600) {
            source.runCommandAsync(`kick ${source.name}`)
            source.sendMessage(`${source.name} was kicked for being afk`)
        }
    }
  }
}, 20)
