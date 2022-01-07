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
    /**
     * Message layout. You can use variables
     * 
     * Default message layout is: {datetime} {level} {message} ({logger})
     */
    layout: string;
    
    /**
     * Is logger enabled
     */
    enabled: boolean;
}

export interface ColoredConsoleTargetOptions extends CommonTargetOptions {

    /**
     * Color theme for console message. Best leave it for default.
     */
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

export interface FileTargetOptions extends CommonTargetOptions
{
    /**
     * path whre log is stored. It is allowed to use variables to create path eg. date / time etc.
     */
    path: string;

    /**
     * Archive path for logs eg. when size is exceeded. Is is allowed to use variables eg. date / time etc.
     * 
     * Default is none. When not set archive files are stored in same folder as logs.
     */
    archivePath : string;

    /**
     * Maximum log file size, if exceeded it is moved to archive, and new log file is created
     * 
     * Default is 1mb
     */
    maxSize: number;

    /**
     * Should compress log file when moved to archive
     * 
     * Default is false
     */
    compress : boolean;

    /**
     * Should rotate log file eg. new  file every new day. 
     * You should use cron like definition eg. at 1am every day: 0 1 * * * 
     * When rotate event occurs, old file is moved to archive, and new one is created
     * 
     * Default is not set
     */
    rotate: string;

    /**
     * How mutch archive files should be preserved before deletion. Default is 0
     * Eg. to store max 5 archive files, set it to 5. Oldest by modification time are deleted.
     */
    maxArchiveFiles : number;

    /**
     * Buffer size for incoming log messages. Messages are stored in buffer before write to file.
     * 
     * Default is 8kb
     */
    bufferSize: number;
}

export interface LogTargetData {
    Level: LogLevel;
    Variables: {};
}
