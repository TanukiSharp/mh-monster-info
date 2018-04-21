export type EventHandler<TArgs> = (sender: any, args: TArgs) => void;

export class Event<TArgs> {
    private handers: EventHandler<TArgs>[] = [];

    public register(handler: EventHandler<TArgs>) {
        if (handler) {
            this.handers.push(handler);
        }
    }

    public unregister(handler: EventHandler<TArgs>) {
        const index = this.handers.indexOf(handler);
        if (index >= 0) {
            this.handers.splice(index, 1);
        }
    }

    public raise(sender: any, args: TArgs, thisArg?: any) {
        for (let i = 0; i < this.handers.length; i += 1) {
            this.handers[i].call(thisArg, sender, args);
        }
    }
}

export class Utils {
    public static any<T>(array: T[], predicate: (x: T) => boolean): boolean {
        for (let i = 0; i < array.length; i += 1) {
            if (predicate(array[i])) {
                return true;
            }
        }
        return false;
    }
}
