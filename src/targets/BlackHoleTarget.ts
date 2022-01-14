import { BlackHoleTargetOptions, LogTargetData, LogVariable } from './../types';
import { Inject, Injectable, Singleton } from '@spinajs/di';
import { LogTarget } from './LogTarget';

/**
 * Empty writer, usefull for tests or when we dont want to get any messages
 */
@Inject(Array.ofType(LogVariable))
@Singleton()
@Injectable("BlackHoleTarget")
export class BlackHoleTarget extends LogTarget<BlackHoleTargetOptions>
{
    public async write(_data: LogTargetData): Promise<void> {
     
    }
    
}