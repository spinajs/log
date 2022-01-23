import { NewInstance } from '@spinajs/di';
import {  CommonTargetOptions, LogTargetData } from '../../src/types';
import { Injectable } from '@spinajs/di';
import { LogTarget } from '../../src/targets';

/**
 * Empty writer, usefull for tests or when we dont want to get any messages
 */
@NewInstance()
@Injectable("TestWildcard")
export class TestWildcard extends LogTarget<CommonTargetOptions>
{
    public async write(data: LogTargetData): Promise<void> {
        this.sink(this.format(data.Variables, this.Options.layout));
    }

    public sink(_msg: string) {
      
    }

}