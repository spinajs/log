import 'mocha';
// import { DI } from '@spinajs/di';
// import { Configuration, FrameworkConfiguration } from "@spinajs/configuration";
import sinon from 'sinon';
// import { Log } from '../src';
 
// const container = DI.child();

// class TestConfiguration extends FrameworkConfiguration {

//     constructor() {
//         super();
 
//     }
// }


describe("file target tests", function () {

    this.timeout(15000);

    before(async () => {
        // container.register(TestConfiguration).as(Configuration);

        // await container.resolve(Configuration);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("Should write to file", async () => { 
        // const log = container.resolve(Log, ["FileLogger"]);
        // log.info("Hello world");
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