import { CommonTargetOptions } from './../types';
import { Inject } from "@spinajs/di";
import _ from "lodash";
import { LogVariable, LogTargetData } from "../types";

@Inject(Array.ofType(LogVariable))
export abstract class LogTarget<T extends CommonTargetOptions> {

    protected VariablesDictionary: Map<string, LogVariable> = new Map();

    protected LayoutRegexp: RegExp;

    protected Options: T;

    public HasError: boolean = false;
    public Error: Error = undefined;

    constructor(protected Variables: LogVariable[], options: T) {

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

    protected format(customVars: {}, layout: string): string {

        this.LayoutRegexp.lastIndex = 0;

        const varMatch = [...layout.matchAll(this.LayoutRegexp)];
        if (!varMatch) {
            return;
        }

        let result = layout;

        varMatch.forEach(v => {

            if ((customVars as any)[v[2]]) {
                result = result.replace(v[0], (customVars as any)[v[2]]);
            } else if (this.VariablesDictionary.has(v[2])) {

                // optional parameter eg. {env:PORT}
                if (v[3]) {
                    result = result.replace(v[0], (this.VariablesDictionary.get(v[2]).Value(v[4])));
                } else {
                    result = result.replace(v[0], (this.VariablesDictionary.get(v[2]).Value()));
                }

            }
        })

        return result;
    }
}