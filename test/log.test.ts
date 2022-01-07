import 'mocha';
import { DI } from '@spinajs/di';
import { Configuration, FrameworkConfiguration } from "@spinajs/configuration";
import sinon from 'sinon';
import { Log } from '../src';
import { expect } from 'chai';

class TestConfiguration extends FrameworkConfiguration {

    constructor() {
        super();

        this.CustomConfigPaths = [
            // project path
            "/test/config",
        ];
    }
}




describe("logger tests", function () {

    this.timeout(15000);

    before(async () => {
        DI.register(TestConfiguration).as(Configuration);

        await DI.resolve(Configuration);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("Should create simple console logger", async () => {

        const log = DI.resolve(Log, ["TestLogger"]);

        expect(log).to.be.not.null;
        expect(log.Name).to.eq("TestLogger");
    })

    it("Should log with layout", async () =>{ 
        const log = DI.resolve(Log, ["TestLogger"]);
        log.trace("Hello world");
        log.debug("Hello world");
        log.info("Hello world");
        log.success("Hello world");
        log.warn("Hello world");
        log.error("Hello world");
        log.fatal("Hello world");
        log.security("Hello world");



    })
});