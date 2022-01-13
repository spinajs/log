import { Inject, Injectable, NewInstance } from "@spinajs/di";
import { LogTarget } from "./LogTarget";
import { FileTargetOptions, LogTargetData, LogVariable } from "../types";
import fs from "fs";
import path from "path";
import { Job, scheduleJob } from "node-schedule";
import { InvalidOption } from "@spinajs/exceptions";
import { EOL } from "os";
import * as glob from "glob";
import * as zlib from "zlib";

@Injectable("FileTarget")
@NewInstance()
@Inject(Array.ofType(LogVariable))
export class FileTarget extends LogTarget<FileTargetOptions>
{

    protected LogDirPath: string;
    protected LogFileName: string;
    protected LogPath: string;
    protected LogFileExt: string;
    protected LogBaseName: string;

    protected ArchiveDirPath: string;

    protected RotateJob: Job
    protected ArchiveJob: Job;

    protected LogFileDescriptor: number;

    protected CurrentFileSize: number;
    protected BufferSize: number = 0;

    protected Buffer: any[] = [];

    constructor(variables: LogVariable[], options: FileTargetOptions) {
        super(variables, options);

        this.initialize();
        this.rotate();

        process.on("exit", () => {
            this.flush();

            if (this.LogFileDescriptor) {
                fs.closeSync(this.LogFileDescriptor);
            }
        });
    }

    public async write(data: LogTargetData): Promise<void> {

        if (!this.Options.enabled) {
            return;
        }

        const result = this.format(data.Variables, this.Options.layout) + EOL;
        const bytes = Buffer.byteLength(result);

        this.BufferSize += bytes;

        this.Buffer.push(result);

        if (this.BufferSize > this.Options.bufferSize) {
            this.flush();
        }

        if (this.CurrentFileSize > this.Options.maxSize) {
            this.archive();
        }

    }

    protected archive() {

        const files = glob.sync(path.join(this.ArchiveDirPath, `archived_${this.LogBaseName}*{${this.LogFileExt},.gzip}`)).map(f => {
            return {
                name: f,
                stat: fs.statSync(f)
            }
        }).sort(x => x.stat.mtime.getTime());

        const newestFile = files.length !== 0 ? files[files.length - 1].name : undefined;
        const fIndex = newestFile ? parseInt(newestFile.substring(newestFile.lastIndexOf("_") + 1, newestFile.lastIndexOf("_") + 2)) + 1 : 1;
        const archPath = path.join(this.ArchiveDirPath, `archived_${this.LogBaseName}_${fIndex}${this.LogFileExt}`);

        try {

            this.flush();

            if (!fs.existsSync(this.LogPath)) {
                return;
            }

            fs.closeSync(this.LogFileDescriptor);
            fs.copyFileSync(this.LogPath, archPath);
            fs.unlinkSync(this.LogPath);

            this.initialize();

            if (this.Options.compress) {
                const zippedPath = path.join(this.ArchiveDirPath, `archived_${this.LogBaseName}_${fIndex}${this.LogFileExt}.gzip`)
                const zip = zlib.createGzip();
                const read = fs.createReadStream(archPath);
                const write = fs.createWriteStream(zippedPath);

                read.pipe(zip as any).pipe(write);

                write.on("finish", () => {
                    read.close();
                    zip.close();
                    write.close();
                    fs.unlink(archPath, () => { });
                });
            }

            if (files.length >= this.Options.maxArchiveFiles) {
                fs.unlink(files[0].name, () => { });
            }

        } catch (err) {
            this.Error = err;
            this.HasError = true;
        }

    }

    protected flush() {

        if (!this.LogFileDescriptor || this.HasError || this.BufferSize === 0) {
            return;
        }

        try {

            fs.writeFileSync(this.LogFileDescriptor, this.Buffer.join());

            this.CurrentFileSize += this.BufferSize;
            this.Buffer = [];
            this.BufferSize = 0;

        } catch (err) {
            this.HasError = true;
            this.Error = err;
        }

    }

    private rotate() {
        if (this.Options.rotate) {
            this.RotateJob = scheduleJob(`LogScheduleJob`, this.Options.rotate, () => {
                this.archive();
            });
        }
    }

    private initialize() {
        try {

            this.flush();

            if (this.LogFileDescriptor >= 0) {
                fs.closeSync(this.LogFileDescriptor);
                this.LogFileDescriptor = 0;
            }

            this.CurrentFileSize = 0;
            this.LogDirPath = this.format({}, path.dirname(path.resolve(this.Options.path)));
            this.ArchiveDirPath = this.Options.archivePath ? this.format({}, path.resolve(this.Options.archivePath)) : this.LogDirPath
            this.LogFileName = this.format({}, path.basename(this.Options.path));
            this.LogPath = path.join(this.LogDirPath, this.LogFileName);

            const { name, ext } = path.parse(this.LogFileName);
            this.LogFileExt = ext;
            this.LogBaseName = name;

            if (!this.LogDirPath) {
                throw new InvalidOption("Missing LogDirPath log option");
            }

            if (!fs.existsSync(this.LogDirPath)) {
                fs.mkdirSync(this.LogDirPath)
            }

            if (this.ArchiveDirPath) {
                if (!fs.existsSync(this.ArchiveDirPath)) {
                    fs.mkdirSync(this.ArchiveDirPath)
                }
            }

            if (fs.existsSync(this.LogPath)) {
                const { size } = fs.statSync(this.LogPath);
                this.CurrentFileSize = size;
            }

            this.LogFileDescriptor = fs.openSync(this.LogPath, "a");

            this.HasError = false;
            this.Error = null;
        } catch (err) {
            this.HasError = true;
            this.Error = err;
        }

    }

}