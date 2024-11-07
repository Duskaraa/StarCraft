import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

export class PermissionManager {
  constructor() {
    if (!world.getDynamicProperty("playerPermissions")) {
      world.setDynamicProperty("playerPermissions", JSON.stringify({}));
    }
  }

  getAllPermissions() {
    return JSON.parse(world.getDynamicProperty("playerPermissions"));
  }

  getPlayerPermissions(playerName) {
    const allPermissions = this.getAllPermissions();
    return allPermissions[playerName] || {};
  }

  addOrUpdatePermission({ playerName, permissionKey, permissionValue, grantedBy, reason = 'Not specified' }) {
    const allPermissions = this.getAllPermissions();
    const playerPermissions = allPermissions[playerName] || {};

    playerPermissions[permissionKey] = {
      permissionKey,
      permissionValue,
      grantedById: grantedBy.id,
      grantedByName: grantedBy.name,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      reason,
      modified: {
        date: null,
        time: null,
        modifiedByName: null,
        type: null
      }
    };

    allPermissions[playerName] = playerPermissions;
    this.updateAllPermissions(allPermissions);
  }

  updatePermission({ playerName, permissionKey, newPermissionValue, newReason }) {
    const allPermissions = this.getAllPermissions();
    const playerPermissions = allPermissions[playerName] || {};

    if (playerPermissions[permissionKey]) {
      playerPermissions[permissionKey].permissionValue = newPermissionValue;
      playerPermissions[permissionKey].reason = newReason || playerPermissions[permissionKey].reason;
      playerPermissions[permissionKey].modified.date = new Date().toLocaleDateString();
      playerPermissions[permissionKey].modified.time = new Date().toLocaleTimeString();
      playerPermissions[permissionKey].modified.modifiedByName = playerName;
      playerPermissions[permissionKey].modified.type = "Updated";
      allPermissions[playerName] = playerPermissions;
      this.updateAllPermissions(allPermissions);
    } else {
      console.warn(`Permission ${permissionKey} does not exist for player ${playerName}.`);
    }
  }

  deletePermission({ playerName, permissionKey }) {
    const allPermissions = this.getAllPermissions();
    const playerPermissions = allPermissions[playerName] || {};

    if (playerPermissions[permissionKey]) {
      delete playerPermissions[permissionKey];
      allPermissions[playerName] = playerPermissions;
      this.updateAllPermissions(allPermissions);
    } else {
      console.warn(`Permission ${permissionKey} does not exist for player ${playerName}.`);
    }
  }

  updateAllPermissions(allPermissions) {
    world.setDynamicProperty("playerPermissions", JSON.stringify(allPermissions));
  }
}

world.beforeEvents.itemUse.subscribe((data) => {
  const player = data.source;

  if (data.itemStack.typeId === "minecraft:clock" && player.hasTag('@#%&*!?^$+=/\\<>~|;:°£©✓±¤§')) {
    system.run(() => {
      const manager = new PermissionManager();
      let allPermissions = manager.getAllPermissions();
      let allPlayerNames = Object.keys(allPermissions);

      const form = new ActionFormData()
        .title("Permission Manager")
        .button("Add Permission", "textures/ui/confirm");

      allPlayerNames.forEach(playerName => {
        const playerPermissions = allPermissions[playerName];
        Object.keys(playerPermissions).forEach(permissionKey => {
          const perm = playerPermissions[permissionKey];
          form.button(`§6${playerName} - ${perm.permissionKey}§r\n§aLevel§7: §b${perm.permissionValue}`, "textures/ui/arrow_right");
        });
      });

      form.show(player).then((response) => {
        if (response.selection === 0) {
          const playerNames = getOnlinePlayerNames();
          const permissionList = getPermissionList();

          const addPermissionForm = new ModalFormData()
            .title("Add Permission")
            .dropdown("Select a player", ["TextField Down"].concat(playerNames), 0)
            .textField("Player ID or Name:", "e.g., player123")
            .textField("Reason for permission increase:", "Reason here")
            .dropdown("Select Permission", ["Slider"].concat(permissionList.map(permission => permission.permissionKey)), 0)
            .slider("Permission Level:", 1, 10, 1, 1)
            .toggle("Confirm Add Permission", false);

          addPermissionForm.show(player).then((addResponse) => {
            const [playerSelection, playerIdOrName, reason, permissionSelection, level, confirm] = addResponse.formValues;

            if (!confirm) {
              player.sendMessage("§cPermission not confirmed. Action canceled.");
              return;
            }

            let targetPlayerName;
            if (playerSelection === 0) {
              targetPlayerName = playerIdOrName;
              if (!playerNames.includes(targetPlayerName)) {
                playerNames.push(targetPlayerName);
              }
            } else {
              targetPlayerName = playerNames[playerSelection - 1];
            }

            let targetPermission = permissionSelection === 0 ? { permissionKey: "Custom", permissionValue: level } : getPermissionList()[permissionSelection - 1];
            let permissionKey = targetPermission.permissionKey || "Custom";

            if (!targetPlayerName || !reason) {
              player.sendMessage("§cError: Make sure to fill in all required fields.");
              return;
            }

            const grantedBy = { id: player.id, name: player.name };
            const manager = new PermissionManager();
            manager.addOrUpdatePermission({ playerName: targetPlayerName, permissionKey, permissionValue: level, grantedBy, reason });

            player.sendMessage(`§aPermission granted or updated for ${targetPlayerName} successfully.`);
          });
        } else {
          const selectedIndex = response.selection - 1;
          const selectedPlayerName = Object.keys(allPermissions)[selectedIndex];
          const currentPermissions = allPermissions[selectedPlayerName];

          if (currentPermissions) {
            const detailsForm = new ActionFormData()
              .title(`Details of ${selectedPlayerName}`)
              .body(Object.keys(currentPermissions).map(permissionKey => {
                const perm = currentPermissions[permissionKey];
                return `§bPlayer: §6"§a${selectedPlayerName}§6"\n` +
                  `§7Permission Key: §6${permissionKey}§r\n§aLevel§7: §b${perm.permissionValue}\n` +
                  `§7Granted by: §e${perm.grantedByName}\n` +
                  `§7Date: §b${perm.date} §7Time: §b${perm.time}\n` +
                  `§7Reason: §6"§e${perm.reason}§6"\n\n` +
                  `§7Recently Modified:\n` +
                  `§7Date: §b${perm.modified.date || "N/A"}\n` +
                  `§7Time: §b${perm.modified.time || "N/A"}\n` +
                  `§7Modified by: §e${perm.modified.modifiedByName || "N/A"}\n` +
                  `§7Type: §6${perm.modified.type || "N/A"}\n`;
              }).join("\n\n"))
              .button("Tracking", "textures/items/compass_item")
              .button("Modify", "textures/ui/pencil_edit_icon")
              .button("Delete Custom Permission", "textures/items/bucket_empty") // Botón para eliminar permisos personalizados
              .button("Back", "font/icons/cross");

            detailsForm.show(player).then((detailsResponse) => {
              if (detailsResponse.selection === 0) {
                showTrackingDetails(player, selectedPlayerName);
              } else if (detailsResponse.selection === 1) {
                showModifyPermissionForm(player, selectedPlayerName);
              } else if (detailsResponse.selection === 2) { // Manejo de eliminación
                showDeletePermissionForm(player, selectedPlayerName);
              }
            });
          } else {
            player.sendMessage("§cNo permissions found for this player.");
          }
        }
      });
    });
  }
});

world.beforeEvents.itemUse.subscribe((data) => {
  const player = data.source;

  if (data.itemStack.typeId === "minecraft:mace") {
    system.run(() => {
      showPlayersMenu(player);
    });
  }
});

function getOnlinePlayerNames() {
  return world.getPlayers().map(player => player.name);
}

function getPermissionList() {
  return [
    { permissionKey: "AllPermissions" },
    { permissionKey: "Owner" },
    { permissionKey: "Developer" },
    { permissionKey: "Moderador" },
    { permissionKey: "Administrador" },
    { permissionKey: "Staff" },
    { permissionKey: "StaffPrePermissions" },
    { permissionKey: "Builder" },
    { permissionKey: "Member" },
    { permissionKey: "NoPerms" }
  ];
}

function showPlayersMenu(player) {
  const playerNames = getOnlinePlayerNames();

  if (playerNames.length === 0) {
    player.sendMessage("§cNo players online.");
    return;
  }

  const form = new ActionFormData()
    .title("Select a Player")
    .button("Cancel", "textures/ui/close")
    .body(playerNames.map(name => `§b${name}`).join("\n"));

  form.show(player).then(response => {
    if (response.selection >= 0 && response.selection < playerNames.length) {
      const selectedPlayerName = playerNames[response.selection];
      const manager = new PermissionManager();
      const playerPermissions = manager.getPlayerPermissions(selectedPlayerName);

      if (Object.keys(playerPermissions).length > 0) {
        const permissionsList = Object.keys(playerPermissions).map(permissionKey => {
          const perm = playerPermissions[permissionKey];
          return `§6${permissionKey} - §b${perm.permissionValue}\n§7Granted by: §e${perm.grantedByName}`;
        }).join("\n\n");

        player.sendMessage(`§6Permissions for ${selectedPlayerName}:\n\n${permissionsList}`);
      } else {
        player.sendMessage(`§cNo permissions found for ${selectedPlayerName}.`);
      }
    } else {
      player.sendMessage("§cSelection canceled.");
    }
  });
}

function showTrackingDetails(player, playerName) {
  const manager = new PermissionManager();
  const playerPermissions = manager.getPlayerPermissions(playerName);

  const trackingDetails = Object.keys(playerPermissions).map(permissionKey => {
    const perm = playerPermissions[permissionKey];
    return `§bPermission Key: §6${permissionKey}\n` +
      `§7Granted by: §e${perm.grantedByName}\n` +
      `§7Date: §b${perm.date}\n` +
      `§7Time: §b${perm.time}\n` +
      `§7Reason: §6${perm.reason}\n` +
      `§7Modified:\n` +
      `§7Date: §b${perm.modified.date || "N/A"}\n` +
      `§7Time: §b${perm.modified.time || "N/A"}\n` +
      `§7Modified by: §e${perm.modified.modifiedByName || "N/A"}\n` +
      `§7Type: §6${perm.modified.type || "N/A"}\n\n`;
  }).join("\n");

  player.sendMessage(`§6Tracking Details for ${playerName}:\n\n${trackingDetails}`);
}

function showModifyPermissionForm(player, playerName) {
  const manager = new PermissionManager();
  const playerPermissions = manager.getPlayerPermissions(playerName);
  const permissionKeys = Object.keys(playerPermissions);

  if (permissionKeys.length === 0) {
    player.sendMessage("§cNo permissions to modify.");
    return;
  }

  const modifyForm = new ModalFormData()
    .title("Modify Permission")
    .dropdown("Select Permission to Modify", ["Select"].concat(permissionKeys), 0)
    .textField("New Permission Level:", "e.g., 5")
    .textField("New Reason:", "e.g., reason for modification");

  modifyForm.show(player).then((response) => {
    const [selectedPermissionIndex, newLevel, newReason] = response.formValues;

    if (selectedPermissionIndex === 0 || !newLevel) {
      player.sendMessage("§cError: Please make sure to select a permission and provide a new level.");
      return;
    }

    const permissionKey = permissionKeys[selectedPermissionIndex - 1];
    manager.updatePermission({
      playerName,
      permissionKey,
      newPermissionValue: newLevel,
      newReason: newReason
    });

    player.sendMessage(`§aPermission ${permissionKey} updated successfully for ${playerName}.`);
  });
}

function showDeletePermissionForm(player, playerName) {
  const manager = new PermissionManager();
  const playerPermissions = manager.getPlayerPermissions(playerName);
  const permissionKeys = Object.keys(playerPermissions);

  if (permissionKeys.length === 0) {
    player.sendMessage("§cNo permissions to delete.");
    return;
  }

  const deleteForm = new ModalFormData()
    .title("Delete Permission")
    .dropdown("Select Permission to Delete", ["Select"].concat(permissionKeys), 0)
    .toggle("Confirm Deletion", false);

  deleteForm.show(player).then((response) => {
    const [selectedPermissionIndex, confirmDeletion] = response.formValues;

    if (selectedPermissionIndex === 0 || !confirmDeletion) {
      player.sendMessage("§cError: Please make sure to select a permission and confirm deletion.");
      return;
    }

    const permissionKey = permissionKeys[selectedPermissionIndex - 1];
    manager.deletePermission({
      playerName,
      permissionKey
    });

    player.sendMessage(`§aPermission ${permissionKey} deleted successfully for ${playerName}.`);
  });
}
