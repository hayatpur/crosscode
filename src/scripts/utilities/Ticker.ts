export class Ticker {
    // Singleton
    static instance: Ticker;

    // List of tick callbacks
    private callbacks: ((dt?: number) => void)[] = [];
    private namedCallbacks: { [id: string]: (dt?: number) => void } = {};
    private time = 0;

    constructor() {
        Ticker.instance = this;

        const timer = this;
        function tick(time: number) {
            const dt = time - timer.time;
            timer.callbacks.forEach((callback) => callback(dt));
            Object.values(timer.namedCallbacks).forEach((callback) => callback(dt));
            timer.time = time;
            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    registerTick(callback: (dt?: number) => void) {
        this.callbacks.push(callback);
    }

    registerTickFrom(callback: (dt?: number) => void, from: string) {
        this.namedCallbacks[from] = callback;
    }

    removeTickFrom(from: string) {
        delete this.namedCallbacks[from];
    }
}
