import {  CommonTargetOptions, LogTargetData, LogVariable } from './../../src/types';
import { Inject, Injectable, Singleton } from '@spinajs/di';
import { LogTarget } from './../../src/targets';

/**
 * Empty writer, usefull for tests or when we dont want to get any messages
 */
@Inject(Array.ofType(LogVariable))
@Singleton()
@Injectable("TestTarget")
export class TestTarget extends LogTarget<CommonTargetOptions>
{
    public async write(data: LogTargetData): Promise<void> {
        this.sink(this.format(data.Variables, this.Options.layout));
    }

    public sink(_msg: string) {
      
    }

}