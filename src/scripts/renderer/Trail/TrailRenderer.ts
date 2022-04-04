import { getCurvedArrow } from '../../utilities/dom'
import { Trail } from './Trail'
import { TrailType } from './TrailState'

export class TrailRenderer {
    movementTrace: SVGPathElement

    // Movement
    // movementPath: SVGPathElement
    // offset: { x: number; y: number } = { x: 0, y: 0 }

    private affectedData: HTMLElement = null

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
            // const anchor = trail.action.timeline.renderer.anchors[0]
            // const anchorBbox = anchor.getBoundingClientRect()
            // const data = trail.endEnvironment.getAllChildRenderers()[trail.state.toDataId].element
            // const dataBbox = data.getBoundingClientRect()
            // const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
            //     anchorBbox.x,
            //     anchorBbox.y,
            //     anchorBbox.width,
            //     anchorBbox.height,
            //     dataBbox.x,
            //     dataBbox.y,
            //     dataBbox.width,
            //     dataBbox.height,
            //     {
            //         padEnd: 0,
            //         padStart: 0,
            //     }
            // )
            // this.element.setAttribute(
            //     'd',
            //     `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
            // )
            // this.element.classList.add('trail-create')
            // data.classList.add('trail-create')
            // this.affectedData = data
        } else if (trail.state.type == TrailType.Move) {
            const start =
                trail.startEnvironment.getAllChildRenderers()[trail.state.fromDataId].element
            const end = trail.endEnvironment.getAllChildRenderers()[trail.state.toDataId].element

            const environmentBbox = trail.endEnvironment.element.getBoundingClientRect()
            const startBbox = start.getBoundingClientRect()
            const endBbox = end.getBoundingClientRect()

            this.movementTrace = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            this.movementTrace.classList.add('action-mapping-connection')
            trail.endEnvironment.svg.appendChild(this.movementTrace)

            this.movementTrace.setAttribute(
                'd',
                getCurvedArrow(
                    startBbox.x + startBbox.width / 2 - environmentBbox.x,
                    startBbox.y + startBbox.height / 2 - environmentBbox.y,
                    endBbox.x + endBbox.width / 2 - environmentBbox.x,
                    endBbox.y + endBbox.height / 2 - environmentBbox.y
                )
            )

            // const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
            //     startBbox.x,
            //     startBbox.y,
            //     startBbox.width,
            //     startBbox.height,
            //     endBbox.x,
            //     endBbox.y,
            //     endBbox.width,
            //     endBbox.height,
            //     {
            //         padEnd: 0,
            //         padStart: 0,
            //     }
            // )
            // this.movementTrace.setAttribute(
            //     'd',
            //     `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
            // )
            this.movementTrace.classList.add('trail-move')

            // end.classList.add('trail-move')
            this.affectedData = end
        }

        console.warn('Rendering again...')
    }

    updateTime(trail: Trail) {
        if (trail.state.type == TrailType.Create) {
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
            this.movementTrace.style.strokeDasharray = `${this.movementTrace.getTotalLength()}`
            this.movementTrace.style.strokeDashoffset = `${
                this.movementTrace.getTotalLength() -
                trail.time * this.movementTrace.getTotalLength()
            }`

            // Update data
            // if (this.movementTrace != null) {
            // console.log('Moving data...')
            // const start =
            //     trail.startEnvironment.getAllChildRenderers()[trail.state.fromDataId].element
            // const end =
            //     trail.endEnvironment.getAllChildRenderers()[trail.state.toDataId].element
            // const startBbox = start.getBoundingClientRect()
            // const endBbox = end.getBoundingClientRect()
            // const position = this.movementPath.getPointAtLength(
            //     trail.time * this.movementPath.getTotalLength()
            // )
            // const dx = startBbox.x + startBbox.width / 2 - position.x
            // const dy = startBbox.y + startBbox.height / 2 - position.y
            // this.offset.x += dx
            // this.offset.y += dy
            // end.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px)`
            // }
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.movementTrace?.remove()

        this.affectedData?.classList.remove('trail-create')
        this.affectedData?.classList.remove('trail-move')
    }
}
