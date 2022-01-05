import { ColoredConsoleTargetOptions, LogLevelStrings, LogTargetData, LogVariable } from './../types';
import * as colors from "colors";
import * as util from "util";
import { Inject, Singleton } from '@spinajs/di';
import { LogTarget } from './LogTarget';


@Inject(Array.ofType(LogVariable))
@Singleton()
export class ColoredConsoleTarget extends LogTarget {

    constructor(variables: LogVariable[], options: ColoredConsoleTargetOptions) {
        super(variables, options);

        colors.setTheme(options.theme);
    }

    public async write(data: LogTargetData, layout: string): Promise<void> {

        if (!this.Options.enabled) {
            return;
        }

        // format message, allow to use log variables also in user messages
        (data.Variables as any)["message"] = this.format(data, util.format(data.Message, data.MessageVars));
        (data.Variables as any)["level"] = LogLevelStrings[data.Level].toUpperCase();

        if (this.Options.stderr) {
            console.error((colors as any)[LogLevelStrings[data.Level]](this.format(data, layout)))
        } else {
            console.log((colors as any)[LogLevelStrings[data.Level]](this.format(data, layout)));
        }
    }
}
