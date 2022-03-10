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

    tick(dt: number) {
        const startEnv = this.trail.startEnvironment
        const endEnv = this.trail.endEnvironment

        this.trail.renderer.render(this.trail)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {}
}
