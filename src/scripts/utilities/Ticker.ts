export class Ticker {
    // Singleton
    static instance: Ticker;

    // List of tick callbacks
    private callbacks: ((dt?: number) => void)[] = [];
    private time = 0;

    constructor() {
        Ticker.instance = this;

        const timer = this;
        function tick(time: number) {
            const dt = time - timer.time;
            timer.callbacks.forEach((callback: (dt?: number) => any) => callback(dt));
            timer.time = time;
            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    registerTick(callback: (dt?: number) => void) {
        this.callbacks.push(callback);
    }
}
