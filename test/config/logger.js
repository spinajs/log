module.exports = {
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
            { name: "*", level: "trace", target: "Console" }
        ],

    }
}