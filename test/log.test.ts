import { BlackHoleTarget } from './../src/targets/BlackHoleTarget';
import 'mocha';
import { DI, IContainer } from '@spinajs/di';
import { Configuration, FrameworkConfiguration } from "@spinajs/configuration";
import sinon from 'sinon';
import { Log, LogLevel } from '../src';
import { expect } from 'chai';
import _ from 'lodash';
import { TestTarget } from "./targets/TestTarget";
import { DateTime } from "luxon";

import { join, normalize, resolve } from 'path';
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
                    name: "Empty",
                    type: "BlackHoleTarget"
                },
                {
                    name: "Format",
                    type: "TestTarget",
                },
                ],

                rules: [
                    { name: "*", level: "trace", target: "Empty" },
                    { name: "test-format", level: "trace", target: "Format" }
                ],
            }
        })
    }
}

function logger(name?: string) {
    return DI.resolve(Log, [name ?? "TestLogger"]);
}

describe("logger tests", function () {

    this.timeout(15000);

    before(async () => {

        DI.clearCache();
        DI.register(TestConfiguration).as(Configuration);
        DI.resolve(Configuration);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("Should create logger", async () => {

        const log = logger();

        expect(log).to.be.not.null;
        expect(log.Name).to.eq("TestLogger");
    })

    it("Should log proper levels", async () => {
        const log = await logger();
        const spy = sinon.spy(BlackHoleTarget.prototype, "write");

        log.trace("Hello world");
        log.debug("Hello world");
        log.info("Hello world");
        log.success("Hello world");
        log.warn("Hello world");
        log.error("Hello world");
        log.fatal("Hello world");
        log.security("Hello world");

        expect(spy.args[0][0]).to.have.property("Level", LogLevel.Trace);
        expect(spy.args[1][0]).to.have.property("Level", LogLevel.Debug);
        expect(spy.args[2][0]).to.have.property("Level", LogLevel.Info);
        expect(spy.args[3][0]).to.have.property("Level", LogLevel.Success);
        expect(spy.args[4][0]).to.have.property("Level", LogLevel.Warn);
        expect(spy.args[5][0]).to.have.property("Level", LogLevel.Error);
        expect(spy.args[6][0]).to.have.property("Level", LogLevel.Fatal);
        expect(spy.args[7][0]).to.have.property("Level", LogLevel.Security);
    })

    it("Should log with default layout", async () => {

        const log = await logger("test-format");
        const spy = sinon.spy(TestTarget.prototype, "sink");

        log.trace("Hello world");
        log.debug("Hello world");
        log.info("Hello world");
        log.success("Hello world");
        log.warn("Hello world");
        log.error("Hello world");
        log.fatal("Hello world");
        log.security("Hello world");

        const now =  DateTime.now();

        expect(spy.args[0][0]).to.be.a('string').and.satisfy((msg: string) => msg.startsWith(now.toFormat("dd/MM/yyyy")) && msg.endsWith("TRACE Hello world (test-format)"));
        expect(spy.args[1][0]).to.be.a('string').and.satisfy((msg: string) => msg.startsWith(now.toFormat("dd/MM/yyyy")) && msg.endsWith("DEBUG Hello world (test-format)"));
        expect(spy.args[2][0]).to.be.a('string').and.satisfy((msg: string) => msg.startsWith(now.toFormat("dd/MM/yyyy")) && msg.endsWith("INFO Hello world (test-format)"));
        expect(spy.args[3][0]).to.be.a('string').and.satisfy((msg: string) => msg.startsWith(now.toFormat("dd/MM/yyyy")) && msg.endsWith("SUCCESS Hello world (test-format)"));
        expect(spy.args[4][0]).to.be.a('string').and.satisfy((msg: string) => msg.startsWith(now.toFormat("dd/MM/yyyy")) && msg.endsWith("WARN Hello world (test-format)"));
        expect(spy.args[5][0]).to.be.a('string').and.satisfy((msg: string) => msg.startsWith(now.toFormat("dd/MM/yyyy")) && msg.endsWith("ERROR Hello world (test-format)"));
        expect(spy.args[6][0]).to.be.a('string').and.satisfy((msg: string) => msg.startsWith(now.toFormat("dd/MM/yyyy")) && msg.endsWith("FATAL Hello world (test-format)"));
        expect(spy.args[7][0]).to.be.a('string').and.satisfy((msg: string) => msg.startsWith(now.toFormat("dd/MM/yyyy")) && msg.endsWith("SECURITY Hello world (test-format)"));
    })

    it("Should not create new logger with same name", async () => {

    })

    it("Should log to multiple targets", async () => {

    })

    it("Check default layout variables are avaible", async () => {

    })

    it("Custom variables should be avaible", async () => {

    })

    it("Should write log only with specified level", async () => {

    })

    it("should support creating logger programatically", async () => {

    })

    it("Should write exception message along with user message", async () => {

    })
});