import { getCurvedArrow, reflow } from '../../../utilities/dom'
import { remap } from '../../../utilities/math'
import { DataState } from '../../View/Environment/data/DataState'
import { LiteralRenderer } from '../../View/Environment/data/literal/LiteralRenderer'
import { Trail } from '../Trail'
import { TrailRenderer } from './TrailRenderer'

export class MoveTrailRenderer extends TrailRenderer {
    movementTrace: SVGPathElement

    // Copy of previous state
    private prevCopy: LiteralRenderer | null

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)

        // Create movement trace
        this.movementTrace = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.movementTrace.classList.add('action-mapping-connection', 'trail-move')
        trail.endEnvironment.svg.appendChild(this.movementTrace)

        const prev = this.trail.startEnvironment.getAllChildRenderers()[this.trail.state.toDataId]

        if (prev != null) {
            this.prevCopy = new LiteralRenderer()

            const cache = prev._cachedState as DataState
            this.prevCopy.setState(cache)

            this.prevCopy.element.classList.add('is-free')
            document.body.appendChild(this.prevCopy.element)
        }
    }

    /* ---------------------- Animation --------------------- */
    update() {
        if (this.prevCopy != null) {
            const prev =
                this.trail.startEnvironment.getAllChildRenderers()[this.trail.state.toDataId]
            const bbox = prev.element.getBoundingClientRect()
            this.prevCopy.element.style.top = `${bbox.top}px`
            this.prevCopy.element.style.left = `${bbox.left}px`

            const t = remap(this.trail.time, 0, 1, 0, 5)
            this.prevCopy.element.style.transform = `translate(${-t}px, ${t}px)`
            this.prevCopy.element.style.opacity = `${Math.max(0, 1 - this.trail.time)}`
            this.prevCopy.element.style.filter = `saturate(${Math.max(0, 1 - 2 * this.trail.time)})`

            if (t == 0 || t == 1) {
                this.prevCopy.element.style.opacity = '0'
            }
        }

        // Update path
        if (this.trail.time == 0) {
            this.movementTrace.classList.add('hidden')
        } else {
            this.movementTrace.classList.remove('hidden')
        }

        const start =
            this.trail.startEnvironment.getAllChildRenderers()[this.trail.state.fromDataIds[0]]
                .element
        const end =
            this.trail.endEnvironment.getAllChildRenderers()[this.trail.state.toDataId].element

        // Reset transformation
        end.style.transform = ''
        reflow(end)

        const environmentBbox = this.trail.endEnvironment.element.getBoundingClientRect()
        const startBbox = start.getBoundingClientRect()
        const endBbox = end.getBoundingClientRect()

        this.movementTrace.setAttribute(
            'd',
            getCurvedArrow(
                startBbox.x + startBbox.width / 2 - environmentBbox.x,
                startBbox.y + startBbox.height / 2 - environmentBbox.y,
                endBbox.x + endBbox.width / 2 - environmentBbox.x,
                endBbox.y + endBbox.height / 2 - environmentBbox.y
            )
        )

        this.movementTrace.style.strokeDasharray = `${this.movementTrace.getTotalLength()}`
        this.movementTrace.style.strokeDashoffset = `${
            this.movementTrace.getTotalLength() -
            this.trail.time * this.movementTrace.getTotalLength()
        }`

        let { x, y } = this.movementTrace.getPointAtLength(
            this.trail.time * this.movementTrace.getTotalLength()
        )

        // Update transform
        x -= endBbox.x + endBbox.width / 2 - environmentBbox.x
        y -= endBbox.y + endBbox.height / 2 - environmentBbox.y
        end.style.transform = `translate(${x}px, ${y}px)`

        // if (this.trail.time > 0 && this.trail.time < 1) {
        //     console.log('Moving...', this.trail.state)
        //     console.log(end)
        // }
    }

    /* ---------------------- Destroy --------------------- */
    destroy() {
        super.destroy()
        this.movementTrace.remove()
        this.prevCopy?.destroy()

        this.movementTrace = null
        this.prevCopy = null
    }
}
