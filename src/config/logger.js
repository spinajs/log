import { join, normalize, resolve } from 'path';

function dir(path) {
    return resolve(normalize(join(__dirname, path)));
}

module.exports = {
    system: {
        dirs: {
            schemas: [dir('./../schemas')],
        }
    },
    logger: {
        variables: [],
        targets: [
            {
                name: "Console", type: "ConsoleTarget", options: {
                    theme: {
                        security: ['red', "bgBrightWhite"],
                        fatal: 'red',
                        error: 'brightRed',
                        warn: 'yellow',
                        success: 'green',
                        info: 'white',
                        debug: 'gray',
                        trace: 'gray',
                    }
                }
            }
        ],
        rules: [
            { name: "*", level: "info", target: "Console" }
        ],

    }
}