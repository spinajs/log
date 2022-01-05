export enum LogLevel {
    Security = 999,

    Fatal = 6,

    Error = 5,

    Warn = 4,

    Success = 3,

    Info = 2,

    Debug = 1,

    Trace = 0,
}

export const LogLevelStrings = {
    [LogLevel.Debug]: "debug",
    [LogLevel.Error]: "error",
    [LogLevel.Fatal]: "fatal",
    [LogLevel.Info]: "info",
    [LogLevel.Security]: "security",
    [LogLevel.Success]: "success",
    [LogLevel.Trace]: "trace",
    [LogLevel.Warn]: "warn",
};

export abstract class LogVariable {
    public abstract get Name(): string;
    public abstract Value(option?: string): string;
}

export interface LogRule {
    name: string;
    level: "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "security" | "success";
    target: string;
}

export interface TargetsOption
{
    name: string,
    type: string,
    options: CommonTargetOptions;
}

export interface LogOptions {
    targets: TargetsOption[];
    rules: LogRule[];
    variables: {}
}

export interface CommonTargetOptions {
    layout: string;
    enabled: boolean;
}

export interface ColoredConsoleTargetOptions extends CommonTargetOptions {
    stderr: boolean;
    theme: {
        security: string | string[],
        fatal: string | string[],
        error: string | string[],
        warn: string | string[],
        success: string | string[],
        info: string | string[],
        debug: string | string[],
        trace: string | string[],
    }
}

export interface LogTargetData {
    Level: LogLevel;
    Variables: {};
    Message: string;
    MessageVars: any;
}
