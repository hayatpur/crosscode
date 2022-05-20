import { Ticker } from '../../utilities/Ticker'
import { Trail } from './Trail'

export class TrailController {
    trail: Trail

    _tickerId: string

    constructor(trail: Trail) {
        this.trail = trail

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    /* ----------------------- Update ----------------------- */

    tick(dt: number) {}

    updateTime(time: number) {
        this.trail.time = time
        this.trail.renderer.update()
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)
    }
}
