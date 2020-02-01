export type EventHandler<TArgs> = (sender: any, args: TArgs) => void;

export class Event<TArgs> {
    private handlers: EventHandler<TArgs>[] = [];

    public register(handler: EventHandler<TArgs>) {
        if (handler) {
            this.handlers.push(handler);
        }
    }

    public unregister(handler: EventHandler<TArgs>) {
        const index = this.handlers.indexOf(handler);
        if (index >= 0) {
            this.handlers.splice(index, 1);
        }
    }

    public raise(sender: any, args: TArgs, thisArg?: any) {
        for (const handler of this.handlers) {
            handler.call(thisArg, sender, args);
        }
    }
}

type ResolveFunc<T> = (value?: T | PromiseLike<T>) => void;
type RejectFunc = (reason?: any) => void;

export class PromiseCompletionSource<T> {
    private resolveFunc: ResolveFunc<T>;
    private rejectFunc: RejectFunc;
    private readonly promise: Promise<T>;

    constructor() {
        this.promise = new Promise<T>((resolve: ResolveFunc<T>, reject: RejectFunc) => {
            this.resolveFunc = resolve;
            this.rejectFunc = reject;
        });
    }

    public trySetResult(value?: T | PromiseLike<T>): void {
        this.resolveFunc(value);
    }

    public trySetError(reason?: any): void {
        this.rejectFunc(reason);
    }

    public getPromise(): Promise<T> {
        return this.promise;
    }
}

export class Utils {
    public static any<T>(array: T[], predicate: (x: T) => boolean): boolean {
        for (const item of array) {
            if (predicate(item)) {
                return true;
            }
        }
        return false;
    }

    public static distinct<T, U>(array: T[], selector: (x: T) => U): U[] {
        return [...new Set(array.map(selector))];
    }
}
