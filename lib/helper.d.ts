import { ILogInfo, ILogLevelStreams } from './';
declare const helper: {
    type(o: any): string;
    isset(o: any): boolean;
    isWritableObject(o: any): boolean;
    allLevelsWritable(o: ILogLevelStreams): boolean;
    identityFormat(info: ILogInfo): string;
    safeStringify(o: any, pretty?: boolean): string;
    str(arr: any[], pretty?: boolean): string;
    restack(stack: string, cleanStack: boolean | string[]): any;
};
export { helper };
