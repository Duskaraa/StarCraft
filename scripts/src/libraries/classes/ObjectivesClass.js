import { system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

export class Scoreboard {
  static objectives = world.getDynamicProperty('scoreboard') 
      ? JSON.parse(world.getDynamicProperty('scoreboard')) 
      : {};

  static addObjective(name, displayName) {
      if (!this.objectives[name]) {
          this.objectives[name] = {};
          this.saveObjectives();
      }
      return new this.Objective(name);
  }

  static getObjective(name) {
      if (this.objectives[name]) {
          return new this.Objective(name);
      }
      return null;
  }

  static removeObjective(name) {
      if (this.objectives[name]) {
          delete this.objectives[name];
          this.saveObjectives();
      }
  }

  static saveObjectives() {
      world.setDynamicProperty('scoreboard', JSON.stringify(this.objectives));
  }

  static Objective = class {
      constructor(name) {
          this.name = name;
      }

      getScore(player) {
          return Scoreboard.objectives[this.name][player.id]?.score || 0;
      }

      setScore(player, score) {
          Scoreboard.objectives[this.name][player.id] = { name: player.name, score: score };
          Scoreboard.saveObjectives();
          return this;
      }

      addScore(player, score) {
          const currentScore = this.getScore(player);
          this.setScore(player, currentScore + score);
          return this;
      }

      removeScore(player, score) {
          const currentScore = this.getScore(player);
          this.setScore(player, currentScore - score);
          return this;
      }

      resetScore(player) {
          this.setScore(player, 0);
          return this;
      }
  }
}

system.runInterval(() => {
    const objective = Scoreboard.getObjective("Money") || Scoreboard.addObjective("Money", "Money")

    for(const player of world.getAllPlayers()) {
        const PlayerMoney = objective.getScore(player)

        if(PlayerMoney < 0) {
            objective.setScore(player, 0)
        }
    }
}, 20)

world.beforeEvents.itemUse.subscribe((data) => {
  const player = data.source;
  const objective = Scoreboard.addObjective("Money", "Money");

  if (data.itemStack.typeId === "minecraft:compass" && player.hasTag('@#%&*!?^$+=/\\<>~|;:°£©✓±¤§')) {
    system.run(() => {
      const form = new ModalFormData();
      form.title("Adjust Money");
      form.slider("Money Amount", 1, 1000000000, 1, 1);
      form.toggle("Add or Remove");
      form.show(player).then((result) => {
        if (result.formValues[1]) { // true para Añadir
          objective.addScore(player, result.formValues[0]);
        } else { // false para Remover
          objective.removeScore(player, result.formValues[0]);
        }
      });
    });
  }
});

