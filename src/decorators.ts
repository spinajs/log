import { DI } from "@spinajs/di";
import { Log } from "./log";


/**
 * Creates ( if not exists ) new logger instance with given name and optional variables
 * @param name name of logger
 * @param variables optional log variables
 */
export function Logger(name: string, variables?: {}) {
    return (target: any, key: string): any => {
        let logger: Log;

        // property getter
        const getter = () => {
            if (!logger) {

                const allLoggers = DI.get(Array.ofType(Log));
                const found = allLoggers.find(l => l.Name);

                if (found) {
                    logger = found;
                } else {
                    logger = DI.resolve(Log, [name, variables]);
                }
            }
            return logger;
        };

        // Create new property with getter and setter
        Object.defineProperty(target, key, {
            get: getter,
            enumerable: false,
            configurable: false
        });
    };
}