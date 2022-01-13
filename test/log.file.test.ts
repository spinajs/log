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


describe("file target tests", function () {

    this.timeout(15000);

    before(async () => {
        DI.register(TestConfiguration).as(Configuration);

        await DI.resolve(Configuration);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("Should write to file", async () => { 
        const log = DI.resolve(Log, ["FileLogger"]);
        log.info("Hello world");
    })

    it("Should resolve file name with variables", async() =>{ 

    })

    it("Should rotate log files when size is exceeded", async () =>{ 

    })

    it("Should clean log files when criteria are met", async () => {
        
    })

    it("should create file logger per creation", async () =>{ 

    })


});