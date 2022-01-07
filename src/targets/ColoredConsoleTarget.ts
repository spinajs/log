import { ColoredConsoleTargetOptions, LogLevelStrings, LogTargetData, LogVariable } from './../types';
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

        this.StdConsoleCallbackMap[data.Level]((colors as any)[LogLevelStrings[data.Level]](this.format(data.Variables, this.Options.layout)));
    }
}
