module.exports = {
    logger: {
        variables: [],
        targets: [
            {
                name: "Console", type: "SimpleConsoleTarget", options: {
                    theme: {
                        security: ['red', "bgBrightWhite"],
                        fatal: 'red',
                        error: 'magenta',
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