import { CommonTargetOptions } from './../types';
import { Inject } from "@spinajs/di";
import _ from "lodash";
import { LogVariable, ColoredConsoleTargetOptions, LogTargetData } from "../types";

@Inject(Array.ofType(LogVariable))
export abstract class LogTarget<T extends CommonTargetOptions> {

    protected VariablesDictionary: Map<string, LogVariable> = new Map();

    protected LayoutRegexp: RegExp;

    protected Options: T;

    constructor(protected Variables: LogVariable[], options: ColoredConsoleTargetOptions) {

        this.Variables.forEach(v => {
            this.VariablesDictionary.set(v.Name, v);
        });

        this.LayoutRegexp = /\{((.*?)(:(.*?))?)\}/gm

        if (options) {
            this.Options = _.merge(_.merge(this.Options, {
                enabled: true,
                layout: "{datetime} {level} {message} ({logger})"
            }), options);
        }
    }

    public abstract write(data: LogTargetData): Promise<void>;

    protected format(data: LogTargetData, layout: string): string {

        this.LayoutRegexp.lastIndex = 0;

        const varMatch = [...layout.matchAll(this.LayoutRegexp)];
        if (!varMatch) {
            return;
        }

        let result = layout;

        varMatch.forEach(v => {

            if ((data.Variables as any)[v[1]]) {
                result = result.replace(v[0], (data.Variables as any)[v[1]]);
            } else if (this.VariablesDictionary.has(v[1])) {

                // optional parameter eg. {env:PORT}
                if (v[3]) {
                    result = result.replace(v[0], (this.VariablesDictionary.get(v[1]).Value(v[2])));
                } else {
                    result = result.replace(v[0], (this.VariablesDictionary.get(v[1]).Value()));
                }

            }
        })

        return result;
    }
}