import 'mocha';
import { DI, IContainer } from '@spinajs/di';
import { Configuration, FrameworkConfiguration } from "@spinajs/configuration";
import sinon from 'sinon';
import fs from "fs";
import { EOL } from "os";
import { Log } from '../src';
import _ from 'lodash';

import { join, normalize, resolve } from 'path';
import { expect } from 'chai';
function dir(path: string) {
    return resolve(normalize(join(__dirname, path)));
}

class TestConfiguration extends FrameworkConfiguration {

    public async resolveAsync(container: IContainer): Promise<void> {
        super.resolveAsync(container);

        _.merge(this.Config, {
            system: {
                dirs: {
                    schemas: [dir('./../src/schemas')],
                }
            },
            logger: {
                targets: [{
                    name: "File",
                    type: "FileTarget",
                    options: {
                        path: dir("./logs/log_{date:dd_MM_yyyy}.txt"),
                        archivePath: dir("./logs/archive"),
                        compress: true,
                        maxArchiveFiles: 2,
                        bufferSize: 1
                    }
                },
                ],

                rules: [
                    { name: "*", level: "trace", target: "File" },
                ],
            }
        })
    }
}

function logger(name?: string) {
    return DI.resolve(Log, [name ?? "TestLogger"]);
}

describe("file target tests", function () {

    this.timeout(15000);

    before(async () => {

        DI.clearCache();
        DI.register(TestConfiguration).as(Configuration);
        DI.resolve(Configuration);
    });

    beforeEach(() => {
        Log.Loggers.clear();
    });

    afterEach(() => {
        sinon.restore();
    });

    it("Should write to file", async () => {

        const mk = sinon.mock(fs);
        const log = logger();
        const s2 = mk.expects("writeFileSync");

        log.info("Hello world");

        expect(s2.calledOnce).to.be.true;
        expect(s2.args[0][0]).to.be.a('string').and.satisfy((msg: string) => msg.includes("INFO Hello world"));

    })

    it("Should resolve file name with variables", async () => {

    })

    it("Should rotate log files when size is exceeded", async () => {

    })

    it("Should clean log files when criteria are met", async () => {

    })

    it("should create file logger per creation", async () => {

    })


});