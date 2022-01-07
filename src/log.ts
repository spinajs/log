import { Config } from "@spinajs/configuration";
import { DI, NewInstance } from "@spinajs/di";
import { LogTarget } from "./targets/LogTarget";
import { CommonTargetOptions, LogLevel, LogOptions, LogRule, TargetsOption } from "./types";


/**
 * Creates child logger
 *
 * @param options  - additional logger options
 */
export function Logger(name: string, variables?: {}) {
  return (target?: any, key?: string): any => {
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

interface LogTargetDesc {
  instance: LogTarget<CommonTargetOptions>;
  options: TargetsOption;
}

/**
 * Default log implementation interface. Taken from bunyan. Feel free to implement own.
 */
@NewInstance()
export class Log {

  @Config("logger")
  protected Options: LogOptions;

  protected Rules: LogRule[];

  protected Targets: LogTargetDesc[];

  constructor(public Name: string, public Variables?: any, protected Parent?: Log) {

    this.Rules = this.Options.rules.filter(r => {

      const pos = r.name.indexOf("*");
      if (pos !== -1) {

        // all
        if (pos === 0) {
          return true;
        }

        return this.Name.startsWith(r.name.substring(0, r.name.lastIndexOf("*") - 1));
      }

      return this.Name === r.name;
    });

    this.Targets = this.Rules.map(r => {
      const found = this.Options.targets.find(t => t.name === r.target);
      return {
        instance: DI.resolve<LogTarget<CommonTargetOptions>>(found.type, [found.options]),
        options: found
      };
    });

  }

  protected write(err: Error | string, message: string | any[], level: LogLevel, ...args: any[]) {
    this.Targets.forEach(t => t.instance.write({
      Level: level,
      Variables: {
        error: (err instanceof Error) ? err : undefined,
        logger: this.Name,
        ...this.Variables,
        ...this.Options.variables
      },
      Message: (err instanceof Error) ? message as string : err,
      MessageVars: args,
    }));
  }

  public trace(message: string, ...args: any[]): void;
  public trace(err: Error, message: string, ...args: any[]): void;
  public trace(err: Error | string, message: string | any[], ...args: any[]): void {
    this.write(err, message, LogLevel.Trace, ...args);
  }


  public debug(message: string, ...args: any[]): void;
  public debug(err: Error, message: string, ...args: any[]): void;
  public debug(err: Error | string, message: string | any[], ...args: any[]): void {
    this.write(err, message, LogLevel.Debug, ...args);
  }

  public info(message: string, ...args: any[]): void;
  public info(err: Error, message: string, ...args: any[]): void;
  public info(err: Error | string, message: string | any[], ...args: any[]): void {
    this.write(err, message, LogLevel.Info, ...args);
  }

  public warn(message: string, ...args: any[]): void;
  public warn(err: Error, message: string, ...args: any[]): void;
  public warn(err: Error | string, message: string | any[], ...args: any[]): void {
    this.write(err, message, LogLevel.Warn, ...args);
  }

  public error(message: string, ...args: any[]): void;
  public error(err: Error, message: string, ...args: any[]): void;
  public error(err: Error | string, message: string | any[], ...args: any[]): void {
    this.write(err, message, LogLevel.Error, ...args);
  }

  public fatal(message: string, ...args: any[]): void;
  public fatal(err: Error, message: string, ...args: any[]): void;
  public fatal(err: Error | string, message: string | any[], ...args: any[]): void {
    this.write(err, message, LogLevel.Fatal, ...args);
  }

  public security(message: string, ...args: any[]): void;
  public security(err: Error, message: string, ...args: any[]): void;
  public security(err: Error | string, message: string | any[], ...args: any[]): void {
    this.write(err, message, LogLevel.Security, ...args);
  }

  public success(message: string, ...args: any[]): void {
    this.write(message, null, LogLevel.Success, ...args);
  }

  public child(name: string, variables?: {}): Log {
    return DI.resolve(Log, [`${this.Name}.${name}`, {
      ...this.Variables,
      ...variables
    }, this]);
  }
}
