import { Config } from "@spinajs/configuration";
import { Autoinject, DI, IContainer, NewInstance, SyncModule } from "@spinajs/di";
import { LogTarget } from "./targets/LogTarget";
import { CommonTargetOptions, LogLevel, LogLevelStrings, LogOptions, LogRule, TargetsOption } from "./types";
import * as util from "util";
import globToRegexp from "glob-to-regexp";
import { DataValidator } from "@spinajs/validation";
import { InvalidOption } from "@spinajs/exceptions";




interface LogTargetDesc {
  instance: LogTarget<CommonTargetOptions>;
  options: TargetsOption;
}

/**
 * Default log implementation interface. Taken from bunyan. Feel free to implement own.
 */
@NewInstance()
export class Log extends SyncModule {


  @Config("logger")
  protected Options: LogOptions;

  protected Rules: LogRule[];

  protected Targets: LogTargetDesc[];

  @Autoinject()
  protected Validator: DataValidator;

  constructor(public Name: string, public Variables?: any, protected Parent?: Log) {
    super();
  }

  public resolve(_: IContainer): void {

    /**
     * Check if options are valid, if not break, break, break
     */
    this.Validator.validate("spinajs/log.configuration.schema.json", this.Options);

    this.matchRulesToLogger();
    this.resolveLogTargets();

    process.on("uncaughtException", (err) => {
      this.fatal(err, "Unhandled exception occured");
    });

    process.on("unhandledRejection", (reason, p) => {
      this.fatal(reason as any, "Unhandled rejection at Promise %s", p);
    });
  }

  protected resolveLogTargets() {
    this.Targets = this.Rules.map(r => {
      const found = this.Options.targets.find(t => t.name === r.target);

      if (!!found) {
        throw new InvalidOption(`No target matching rule ${r.target}`);
      }

      return {
        instance: DI.resolve<LogTarget<CommonTargetOptions>>(found.type, [found.options]),
        options: found
      };
    });
  }

  protected matchRulesToLogger() {
    this.Rules = this.Options.rules.filter(r => {
      return globToRegexp(r.name).test(this.Name);
    });
  }

  protected write(err: Error | string, message: string | any[], level: LogLevel, ...args: any[]) {

    const sMsg = (err instanceof Error) ? message as string : err;
    const tMsg = args.length !== 0 ? util.format(sMsg, args) : sMsg;

    this.Targets.forEach(t => t.instance.write({
      Level: level,
      Variables: {
        error: (err instanceof Error) ? err : undefined,
        level: LogLevelStrings[level].toUpperCase(),
        logger: this.Name,
        message: tMsg,
        ...this.Variables
      }
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
