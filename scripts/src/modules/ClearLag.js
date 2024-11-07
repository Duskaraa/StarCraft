import { world, Player, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const CONFIG_KEY = "clearlag_config";

let antiLagEnabled = false;
let cleanupItemsEnabled = false;
let cleanupEntitiesEnabled = false;
let cleanupInterval = 600; // Intervalo en segundos
let excludedEntities = ""; // IDs de entidades excluidas
let itemsCleanupMessage = "§eItems eliminados con éxito";
let entitiesCleanupMessage = "§eEntidades eliminadas con éxito";
let warningSeconds = 10; // Segundos antes de la limpieza para mostrar advertencia
let warningMessage = "§cLos ítems se eliminarán en {seconds} segundos"; // Mensaje de advertencia

let checkTime = Date.now();
let currentTicks = 0;
let TPS = 0;
system.runInterval(() => {
    currentTicks++;
    const currentTime = Date.now();
    if (currentTime - checkTime > 970) {
        TPS = currentTicks;
        checkTime = currentTime;
        currentTicks = 0;
    }
}, 1);

// Verifica el estado del servidor según el TPS
function checkServerHealth(player) {
    const serverStatus = [
        { min: 20, message: '§aEl servidor está bien' },
        { min: 10, message: '§eEl servidor está estable' },
        { min: 0, message: '§cEl servidor está mal' }
    ];
    const status = serverStatus.find(({ min }) => TPS >= min);
    player.sendMessage(`TPS: ${TPS} - ${status.message}`);
}

// Ejecuta comandos de limpieza según el tipo (items o entidades)
function runCommands(type) {
    let args = ',type=!player';

    if (type === 'items') {
        args += ',type=item';
    } else if (type === 'entities' && excludedEntities.trim()) {
        const excludedArgs = excludedEntities.split(',').map(ent => `type=!${ent.trim()}`).join(',');
        args += `,type=!item,${excludedArgs}`;
    }

    world.getDimension('overworld').runCommandAsync(`kill @e[${args}]`);
}

function cleanEntities() {
    if (antiLagEnabled) {
        cleanupItemsEnabled && world.sendMessage(itemsCleanupMessage) & runCommands('items');
        cleanupEntitiesEnabled && world.sendMessage(entitiesCleanupMessage) & runCommands('entities');
    }
}

let interval;

function intervalFunction() {
    let lastCleanupTime = Date.now() + cleanupInterval * 1000;
    let lastWarningTime = 0;

    interval = system.runInterval(() => {
        if (antiLagEnabled) {
            const currentTime = Date.now();
            const timeUntilCleanup = (lastCleanupTime - currentTime) / 1000;

            if (timeUntilCleanup <= warningSeconds && currentTime - lastWarningTime >= 1000) {
                const message = warningMessage.replace("{seconds}", `${Math.ceil(timeUntilCleanup)}`);
                world.sendMessage(message);
                lastWarningTime = currentTime;
            }

            if (timeUntilCleanup <= 0) {
                cleanEntities();
                lastCleanupTime = currentTime + cleanupInterval * 1000;
            }
        }
    });
}

// Carga la configuración almacenada
function loadConfig() {
    const data = world.getDynamicProperty(CONFIG_KEY);
    if (data) {
        const config = JSON.parse(data);
        ({ 
            antiLagEnabled, 
            cleanupItemsEnabled, 
            cleanupEntitiesEnabled, 
            cleanupInterval, 
            excludedEntities, 
            itemsCleanupMessage, 
            entitiesCleanupMessage, 
            warningSeconds, 
            warningMessage 
        } = config);
    }
}

// Guarda la configuración actual
function saveConfig() {
    const config = {
        antiLagEnabled,
        cleanupItemsEnabled,
        cleanupEntitiesEnabled,
        cleanupInterval,
        excludedEntities,
        itemsCleanupMessage,
        entitiesCleanupMessage,
        warningSeconds,
        warningMessage
    };
    world.setDynamicProperty(CONFIG_KEY, JSON.stringify(config));
}

// Muestra el menú de configuración para el administrador
function showAdminMenu(player) {
    const form = new ModalFormData()
        .title("§eConfiguración")
        .slider("Tiempo de espera (seg)", 10, 1000, 1, cleanupInterval)
        .toggle("Habilitar Anti Lag", antiLagEnabled)
        .toggle("Eliminar ítems", cleanupItemsEnabled)
        .toggle("Eliminar Entidades", cleanupEntitiesEnabled)
        .textField("IDs de entidades excluidas (separadas por comas)", excludedEntities)
        .textField("Mensaje al eliminar ítems", itemsCleanupMessage)
        .textField("Mensaje al eliminar entidades", entitiesCleanupMessage)
        .slider("Segundos antes del clearlag", 2, 600, 1, warningSeconds)
        .textField("Mensaje de advertencia", warningMessage);

    form.show(player).then((response) => {
        if (!response.canceled) {
            [cleanupInterval, antiLagEnabled, cleanupItemsEnabled, cleanupEntitiesEnabled, excludedEntities, itemsCleanupMessage, entitiesCleanupMessage, warningSeconds, warningMessage] = response.formValues;

            system.clearRun(interval);
            intervalFunction();
            saveConfig();

            player.sendMessage(`Configuración guardada:\nTiempo de espera: ${cleanupInterval} segundos\nAnti Lag: ${antiLagEnabled ? "Habilitado" : "Deshabilitado"}\nEliminar Ítems: ${cleanupItemsEnabled ? "Sí" : "No"}\nEliminar Entidades: ${cleanupEntitiesEnabled ? "Sí" : "No"}\nIDs de Entidades Excluidas: ${excludedEntities}\nMensaje al eliminar ítems: ${itemsCleanupMessage}\nMensaje al eliminar entidades: ${entitiesCleanupMessage}\nSegundos antes del clearlag: ${warningSeconds}\nMensaje de advertencia: ${warningMessage}`);
        }
    });
}

// Abre el menú de configuración cuando un administrador usa un palo
world.afterEvents.itemUse.subscribe(event => {
    const { source, itemStack } = event;
    if (source.hasTag("admin") && itemStack.typeId === "minecraft:stick") {
        showAdminMenu(source);
        event.cancel = true;
    }
});

// Comando para verificar el TPS del servidor
world.beforeEvents.chatSend.subscribe(async event => {
    const { sender: player, message } = event;
    if (message.startsWith("!tps") && player.hasTag("admin")) {
        event.cancel = true;
        checkServerHealth(player);
    }
});

// Carga la configuración al inicio y establece el intervalo
loadConfig();
intervalFunction();
