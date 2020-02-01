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

export class Utils {
    public static any<T>(array: T[], predicate: (x: T) => boolean): boolean {
        for (const item of array) {
            if (predicate(item)) {
                return true;
            }
        }
        return false;
    }
}
