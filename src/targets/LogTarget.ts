import { LogVariable, ColoredConsoleTargetOptions, LogTargetData } from "../types";

const DEFAULT_LAYOUT = "{datetime} {level} {message}";

export abstract class LogTarget {

    protected VariablesDictionary: Map<string, LogVariable>;

    protected LayoutRegexp: RegExp;

    constructor(protected Variables: LogVariable[], protected Options: ColoredConsoleTargetOptions) {

        this.Variables.forEach(v => {
            this.VariablesDictionary.set(v.Name, v);
        });

        this.LayoutRegexp = /\{((.*?)(:(.*?))?)\}/gm
    }

    public abstract write(data: LogTargetData, layout: string): Promise<void>;

    protected format(data: LogTargetData, layout: string): string {

        this.LayoutRegexp.lastIndex = 0;

        const varMatch = this.LayoutRegexp.exec(layout);
        const result = layout ?? DEFAULT_LAYOUT;

        varMatch.forEach(v => {

            if ((data.Variables as any)[v[1]]) {
                result.replace(v[0], (data.Variables as any)[v[1]]);
            } else if (this.VariablesDictionary.has(v[1])) {

                // optional parameter eg. {env:PORT}
                if (varMatch.length === 3) {
                    result.replace(v[0], (this.VariablesDictionary.get(v[1]).Value(varMatch[2])));
                } else {
                    result.replace(v[0], (this.VariablesDictionary.get(v[1]).Value()));
                }

            }
        })

        return result;
    }
}