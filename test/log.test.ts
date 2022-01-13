import { BlackHoleTarget } from './../src/targets/BlackHoleTarget';
import 'mocha';
import { DI, IContainer } from '@spinajs/di';
import { Configuration, FrameworkConfiguration } from "@spinajs/configuration";
import sinon from 'sinon';
import { Log, LogLevel } from '../src';
import { expect } from 'chai';
import _ from 'lodash';

class TestConfiguration extends FrameworkConfiguration {

    public async resolveAsync(container: IContainer): Promise<void> {
        super.resolveAsync(container);

        _.merge(this.Config, {
            logger: {

                targets: {
                    name: "Empty",
                    type: "BlackHoleTarget"
                },

                rules: [
                    { name: "*", level: "trace", target: "Empty" },
                ],
            }
        })
    }
}

function logger(){
    return DI.resolve(Log, ["TestLogger"]);
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

        const log = logger();

        expect(log).to.be.not.null;
        expect(log.Name).to.eq("TestLogger");
    })

    it("Should log trace", async () => {
        const log = logger();
        const spy = sinon.spy(BlackHoleTarget.prototype, "write");

        log.trace("Hello world");

        expect(spy.args[0]).to.include({
            Level: LogLevel.Trace
        });
    })

    it("Should log with specified file layout", async () => {

    })

    it("Check default layout variables are avaible", async () => {

    })

    it("Should write log only with specified level", async () => {

    })

    it("Should resolve logger with name", async () => {

    })

    it("Should write to specific target", async () => {

    });

    it("Should use custom variables", async () => {

    })

    it("should support creating logger programatically", async () => {

    })

    it("Should write exception message along with user message", async () => {

    })

    it("Should write to custom target", async () => {

    })
});