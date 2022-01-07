import { ColoredConsoleTargetOptions, LogLevelStrings, LogTargetData, LogVariable } from './../types';
import * as util from "util";
import { Inject, Injectable, Singleton } from '@spinajs/di';
import { LogTarget } from './LogTarget';
import { LogLevel } from '..';

const colors = require('colors/safe');

@Inject(Array.ofType(LogVariable))
@Singleton()
@Injectable("ConsoleTarget")
export class ColoredConsoleTarget extends LogTarget<ColoredConsoleTargetOptions> {

    protected StdConsoleCallbackMap = {
        [LogLevel.Error]: console.error,
        [LogLevel.Fatal]: console.error,
        [LogLevel.Security]: console.error,

        [LogLevel.Info]: console.log,
        [LogLevel.Success]: console.log,

        [LogLevel.Trace]: console.debug,
        [LogLevel.Debug]: console.debug,

        [LogLevel.Warn]: console.warn,
    }

    constructor(variables: LogVariable[], options: ColoredConsoleTargetOptions) {
        super(variables, options);

        colors.setTheme(this.Options.theme);
    }

    public async write(data: LogTargetData): Promise<void> {

        if (!this.Options.enabled) {
            return;
        }

        const message = data.MessageVars.length !== 0 ? util.format(data.Message, data.MessageVars) : data.Message;

        // format message, allow to use log variables also in user messages
        (data.Variables as any)["message"] = this.format(data, message);
        (data.Variables as any)["level"] = LogLevelStrings[data.Level].toUpperCase();

        this.StdConsoleCallbackMap[data.Level]((colors as any)[LogLevelStrings[data.Level]](this.format(data, this.Options.layout)));
    }
}
