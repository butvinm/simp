export class ReactiveVariable {
    name;
    value;
    callbacks = [];
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    get() {
        console.debug(`Getting value of ${this.name}: ${this.value}`);
        return this.value;
    }
    set(value) {
        console.debug(`Setting value of ${this.name} to ${value}`);
        this.value = value;
        this.invoke();
    }
    subscribe(callback) {
        console.debug(`Subscribing to ${this.name}`);
        this.callbacks.push(callback);
    }
    unsubscribe(callback) {
        console.debug(`Unsubscribing from ${this.name}`);
        this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    }
    invoke() {
        console.debug(`Invoking callbacks for ${this.name}`);
        this.callbacks.forEach((callback) => callback(this.value));
    }
}
