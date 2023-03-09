export class Ticker {
    // Singleton
    static instance: Ticker

    // List of tick callbacks
    private callbacks: { [id: string]: (dt: number) => void } = {}
    private time = 0
    private currID = 0

    static _initialize() {
        if (Ticker.instance) return
        Ticker.instance = new Ticker()
    }

    constructor() {
        const timer = this

        function tick(time: number) {
            const dt = time - timer.time
            Object.values(timer.callbacks).forEach((callback) => callback(dt))
            timer.time = time
            requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
    }

    registerTick(callback: (dt: number) => void) {
        this.currID++
        return this.registerTickFrom(callback, `Ticker_${this.currID}`)
    }

    registerTickFrom(callback: (dt: number) => void, from: string) {
        this.callbacks[from] = callback
        return from
    }

    removeTickFrom(from: string) {
        delete this.callbacks[from]
    }
}

Ticker._initialize()
