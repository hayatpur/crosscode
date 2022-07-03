import { Executor } from '../executor/Executor'

export class Ticker {
    // Singleton
    static instance: Ticker

    // List of tick callbacks
    private callbacks: { [id: string]: (dt: number) => void } = {}
    private time = 0
    private currId = 0

    static _initialize() {
        if (Ticker.instance) return
        Ticker.instance = new Ticker()
    }

    constructor() {
        const timer = this

        function tick(time: number) {
            Executor.instance.fpsGraph.begin()
            const dt = time - timer.time
            Object.values(timer.callbacks).forEach((callback) => callback(dt))
            timer.time = time
            Executor.instance.fpsGraph.end()
            requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
    }

    registerTick(callback: (dt: number) => void) {
        this.currId++
        return this.registerTickFrom(callback, `Ticker_${this.currId}`)
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
