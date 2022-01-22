import { Config } from "@spinajs/configuration";
import { Autoinject, DI, IContainer, NewInstance, ResolveException, SyncModule } from "@spinajs/di";
import { LogTarget } from "./targets/LogTarget";
import { CommonTargetOptions, LogLevel, LogLevelStrings, LogOptions, LogRule, LogTargetData, StrToLogLevel, TargetsOption } from "./types";
import * as util from "util";
import globToRegexp from "glob-to-regexp";
import { DataValidator } from "@spinajs/validation";
import { InvalidOption } from "@spinajs/exceptions";


function createLogMessageObject(err: Error | string, message: string | any[], level: LogLevel, logger: string, variables: any, ...args: any[]): LogTargetData {

  const sMsg = (err instanceof Error) ? message as string : err;
  const tMsg = args.length !== 0 ? util.format(sMsg, args) : sMsg;

  return {
    Level: level,
    Variables: {
      error: (err instanceof Error) ? err : undefined,
      level: LogLevelStrings[level].toUpperCase(),
      logger: logger,
      message: tMsg,
      ...variables
    }
  }
}



interface LogTargetDesc {
  instance: LogTarget<CommonTargetOptions>;
  options?: TargetsOption;
  rule: LogRule;
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

    this.writeBufferedMessages();

    super.resolve(_);

    Log.Loggers.set(this.Name, this);
  }

  protected writeBufferedMessages() {
    if (Log.LogBuffer.has(this.Name)) {
      Log.LogBuffer.get(this.Name).filter((msg: LogTargetData) => msg.Variables.logger === this.Name).forEach((msg: LogTargetData) => {
        this.Targets.forEach(t => t.instance.write(msg));
      });
    }
  }

  protected resolveLogTargets() {
    this.Targets = this.Rules.map(r => {
      const found = this.Options.targets.find(t => t.name === r.target);

      if (!found) {
        throw new InvalidOption(`No target matching rule ${r.target}`);
      }

      return {
        instance: DI.resolve<LogTarget<CommonTargetOptions>>(found.type, [found]),
        options: found,
        rule: r
      };
    });
  }

  protected matchRulesToLogger() {
    this.Rules = this.Options.rules.filter(r => {
      return globToRegexp(r.name).test(this.Name);
    });
  }

  protected write(err: Error | string, message: string | any[], level: LogLevel, ...args: any[]) {
    const lMsg = createLogMessageObject(err, message, level, this.Name, this.Variables, ...args);
    this.Targets.forEach(t => {
      if (level >= StrToLogLevel[t.rule.level]) {
        t.instance.write(lMsg);
      }
    });
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

  public success(message: string, ...args: any[]): void;
  public success(err: Error, message: string, ...args: any[]): void;
  public success(err: Error | string, message: string | any[], ...args: any[]): void {
    this.write(err, message, LogLevel.Success, ...args);
  }

  /**
   *  STATIC METHODS FOR LOGGER, ALLOWS TO LOG TO ANY TARGET
   *  EVEN BEFORE LOG MODULE INITIALIZATION. 
   * 
   *  Prevents from losing log message when initializing modules
   */


  static LogBuffer: Map<string, LogTargetData[]> = new Map();
  static Loggers: Map<string, Log> = new Map();

  static write(err: Error | string, message: string | any[], level: LogLevel, name: string, ...args: any[]) {

    const msg = createLogMessageObject(err, message, level, name, {}, ...args);
    const logName = arguments.length >= 4 ? name : message as string;

    // if we have already created logger write to it
    if (Log.Loggers.has(logName)) {
      Log.Loggers.get(logName).Targets.forEach(t => t.instance.write(msg));
      return;
    }

    // otherwise store in buffer
    if (Log.LogBuffer.has(logName)) {
      Log.LogBuffer.get(logName).push(msg)
    } else {
      Log.LogBuffer.set(logName, [msg])
    }
  }

  public static trace(message: string, name: string, ...args: any[]): void;
  public static trace(err: Error, message: string, name: string, ...args: any[]): void;
  public static trace(err: Error | string, message: string | any[], name: string, ...args: any[]): void {
    Log.write(err, message, LogLevel.Trace, name, ...args);
  }


  public static debug(message: string, name: string, ...args: any[]): void;
  public static debug(err: Error, message: string, name: string, ...args: any[]): void;
  public static debug(err: Error | string, message: string | any[], name: string, ...args: any[]): void {
    Log.write(err, message, LogLevel.Debug, name, ...args);
  }

  public static info(message: string, name: string, ...args: any[]): void;
  public static info(err: Error, message: string, name: string, ...args: any[]): void;
  public static info(err: Error | string, message: string | any[], name: string, ...args: any[]): void {
    Log.write(err, message, LogLevel.Info, name, ...args);
  }

  public static warn(message: string, name: string, ...args: any[]): void;
  public static warn(err: Error, message: string, name: string, ...args: any[]): void;
  public static warn(err: Error | string, message: string | any[], name: string, ...args: any[]): void {
    Log.write(err, message, LogLevel.Warn, name, ...args);
  }

  public static error(message: string, name: string, ...args: any[]): void;
  public static error(err: Error, message: string, name: string, ...args: any[]): void;
  public static error(err: Error | string, message: string | any[], name: string, ...args: any[]): void {
    Log.write(err, message, LogLevel.Error, name, ...args);
  }

  public static fatal(message: string, name: string, ...args: any[]): void;
  public static fatal(err: Error, message: string, name: string, ...args: any[]): void;
  public static fatal(err: Error | string, message: string | any[], name: string, ...args: any[]): void {
    Log.write(err, message, LogLevel.Fatal, name, ...args);
  }

  public static security(message: string, name: string, ...args: any[]): void;
  public static security(err: Error, message: string, name: string, ...args: any[]): void;
  public static security(err: Error | string, message: string | any[], name: string, ...args: any[]): void {
    Log.write(err, message, LogLevel.Security, name, ...args);
  }

  public static success(message: string, name: string, ...args: any[]): void;
  public static success(err: Error, message: string, name: string, ...args: any[]): void;
  public static success(err: Error | string, message: string | any[], name: string, ...args: any[]): void {
    Log.write(err, message, LogLevel.Success, name, ...args);
  }

  public child(name: string, variables?: {}): Log {
    return DI.resolve(Log, [`${this.Name}.${name}`, {
      ...this.Variables,
      ...variables
    }, this]);
  }
}

DI.register(Log).as("__logImplementation__");
DI.register((container: IContainer, ...args: any[]) => {

  if (!args || args.length === 0 || typeof args[0] !== "string") {
    throw new ResolveException(`invalid arguments for Log constructor (logger name)`)
  }

  const logName = args[0];

  if (Log.Loggers.has(logName)) {
    return Log.Loggers.get(logName);
  }

  return container.resolve("__logImplementation__", [...args]);
}).as(Log);