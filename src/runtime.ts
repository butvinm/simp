export class ReactiveVariable<T> {
    private value: T;
    private callbacks: ((newValue: T) => void)[] = [];

    constructor(value: T) {
        this.value = value;
    }

    get() {
        return this.value;
    }

    set(value: T) {
        this.value = value;
        this.invoke();
    }

    subscribe(callback: (newValue: T) => void) {
        this.callbacks.push(callback);
    }

    unsubscribe(callback: (newValue: T) => void) {
        this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    }

    invoke() {
        this.callbacks.forEach((callback) => callback(this.value));
    }
}

export function reactive<T>(value: T) {
    return new ReactiveVariable(value);
}
