import { getCurvedArrow } from '../../utilities/dom'
import { Trail } from './Trail'
import { TrailType } from './TrailState'

export class TrailRenderer {
    movementTrace: SVGPathElement

    // Movement
    // movementPath: SVGPathElement
    // movementOffset: { x: number; y: number } = { x: 0, y: 0 }

    /* ----------------------- Create ----------------------- */

    constructor() {
        this.create()
    }

    create() {
        // this.element = createGlobalPath('trail-path', 'top')
    }

    /* ----------------------- Animate ---------------------- */

    animate(trail: Trail) {}

    /* ----------------------- Render ----------------------- */

    render(trail: Trail) {
        if (trail.state.type == TrailType.Create) {
        } else if (trail.state.type == TrailType.Move) {
            this.movementTrace = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            this.movementTrace.classList.add('action-mapping-connection')
            trail.endEnvironment.svg.appendChild(this.movementTrace)
            this.movementTrace.classList.add('trail-move')
        }
    }

    updateTime(trail: Trail) {
        if (trail.state.type == TrailType.Create) {
            // console.log(trail.state.toDataId, trail.endEnvironment)
            const data = trail.endEnvironment.getAllChildRenderers()[trail.state.toDataId].element
            // console.log(data, `scale(${trail.time})`)
            data.style.transform = `scale(${trail.time})`
        } else if (trail.state.type == TrailType.Move) {
            // Update path
            if (trail.time == 0) {
                this.movementTrace.classList.add('hidden')
            } else {
                this.movementTrace.classList.remove('hidden')
            }

            const start =
                trail.startEnvironment.getAllChildRenderers()[trail.state.fromDataId].element
            const end = trail.endEnvironment.getAllChildRenderers()[trail.state.toDataId].element

            const environmentBbox = trail.endEnvironment.element.getBoundingClientRect()
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
                trail.time * this.movementTrace.getTotalLength()
            }`
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.movementTrace?.remove()
    }
}
