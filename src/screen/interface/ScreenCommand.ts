export declare interface ScreenCommand {
    name: string;
    run(args: Array<string>): Promise<void>;
}