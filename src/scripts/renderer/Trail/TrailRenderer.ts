import { getBoxToBoxArrow } from 'curved-arrows'
import { createGlobalPath } from '../../utilities/dom'
import { Trail } from './Trail'
import { TrailType } from './TrailState'

export class TrailRenderer {
    element: SVGPathElement

    private affectedData: HTMLElement = null

    /* ----------------------- Create ----------------------- */

    constructor() {
        this.create()
    }

    create() {
        this.element = createGlobalPath('trail-path', 'top')
    }

    /* ----------------------- Animate ---------------------- */

    animate(trail: Trail) {}

    /* ----------------------- Render ----------------------- */

    render(trail: Trail) {
        if (trail.state.type == TrailType.Create) {
            const anchor = trail.action.timeline.renderer.anchors[0]
            const anchorBbox = anchor.getBoundingClientRect()

            const data = trail.endEnvironment.getAllChildRenderers()[trail.state.toDataId].element
            const dataBbox = data.getBoundingClientRect()

            const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
                anchorBbox.x,
                anchorBbox.y,
                anchorBbox.width,
                anchorBbox.height,
                dataBbox.x,
                dataBbox.y,
                dataBbox.width,
                dataBbox.height,
                {
                    padEnd: 0,
                    padStart: 0,
                }
            )
            this.element.setAttribute(
                'd',
                `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
            )
            this.element.classList.add('trail-create')

            data.classList.add('trail-create')
            this.affectedData = data
        } else if (trail.state.type == TrailType.Move) {
            const start =
                trail.startEnvironment.getAllChildRenderers()[trail.state.fromDataId].element
            const end = trail.endEnvironment.getAllChildRenderers()[trail.state.toDataId].element

            const startBbox = start.getBoundingClientRect()
            const endBbox = end.getBoundingClientRect()

            const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
                startBbox.x,
                startBbox.y,
                startBbox.width,
                startBbox.height,
                endBbox.x,
                endBbox.y,
                endBbox.width,
                endBbox.height,
                {
                    padEnd: 0,
                    padStart: 0,
                }
            )
            this.element.setAttribute(
                'd',
                `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
            )
            this.element.classList.add('trail-move')

            end.classList.add('trail-move')
            this.affectedData = end
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.element.remove()

        this.affectedData?.classList.remove('trail-create')
        this.affectedData?.classList.remove('trail-move')
    }
}
