import { Injectable } from "@spinajs/di";
import { LogVariable } from "../types";


@Injectable()
export class EnvVariable extends LogVariable {
    public get Name(): string {
        return "env";
    }
    public Value(option: string): string {
        return `ENV:${option}=${process.env[option]}`;
    }

}
