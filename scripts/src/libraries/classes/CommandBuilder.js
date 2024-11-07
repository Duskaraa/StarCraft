import { world, system } from '@minecraft/server';

/**
 * A class for registering commands.
 * @class
 */
export class commandBuilder {
    /**
     * Create a new instance of the commandBuilder class.
     * @constructor
     */
    constructor() {
        /**
         * Array to store all registered commands.
         * @type {Array}
         */
        this.commands = [];
        
        /**
         * Permission levels for different roles.
         * @type {Object}
         */
        this.permissionLevels = {
            allperms: 10,
            owner: 9,
            developer: 8,
            moderator: 7,
            admin: 6,
            staff: 5,
            staffPre: 4,
            builder: 3,
            member: 2,
            noperms: 0
        };
    }

    /**
     * Create a new command with provided information and callbacks.
     *
     * @param {Object} info - Information about the command.
     * @param {string} info.name - The name of the command.
     * @param {string} [info.description] - The description of the command.
     * @param {number} [info.permission_level=1] - The required permission level for the command.
     * @param {Function} callback - The callback function for the command.
     * @param {Function} [callbackWM] - The callback function for delayed code execution until the player moves after using the command.
     */
    create(info, callback, callbackWM) {
        if (typeof info.name !== 'string' || info.name.trim() === '') {
            throw new Error('Command name must be a non-empty string.');
        }

        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function.');
        }

        const command = {
            name: info.name.split(' ')[0],
            description: info.description || '',
            permission_level: info.permission_level || 1,
            callback,
            callbackWM
        };
        
        // Add alias support if needed
        if (info.aliases && Array.isArray(info.aliases)) {
            command.aliases = info.aliases;
        }

        this.commands.push(command);
    }

    /**
     * Get a list of all commands based on the minimum required permission level.
     * @param {number} minLevel - The minimum permission level required to retrieve commands.
     * @returns {Array} - An array of commands that match the permission level requirement.
     */
    getAllCommands(minLevel = 0) {
        return this.commands.filter(cmd => cmd.permission_level >= minLevel);
    }
}

export const commandBuild = new commandBuilder();

/**
 * Waits for the player to move and then executes a callback function.
 * @param {Object} target - The target player to monitor for movement.
 * @param {number} x - The initial X-coordinate of the target player.
 * @param {number} y - The initial Y-coordinate of the target player.
 * @param {number} z - The initial Z-coordinate of the target player.
 * @param {Function} callback - The callback function to execute after the player moves.
 */
function waitMove(target, x, y, z, callback) {
    const t = new Map();
    t.set(target, [x, y, z]);

    system.runInterval(() => {
        for (const [target, [xOld, yOld, zOld]] of t) {
            const { x: xc, y: yc, z: zc } = target.location;
            if (xOld !== xc || yOld !== yc || zOld !== zc) {
                system.run(() => {
                    t.delete(target);
                    callback();
                });
            }
        }
    });
}
