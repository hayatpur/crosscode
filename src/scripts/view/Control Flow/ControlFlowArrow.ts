import { catmullRomSolve, getViewElement } from '../../utilities/math'
import { View } from '../View'

export class ControlFlowArrow {
    connection: SVGPathElement

    from: View
    to: View

    constructor(from: View, to: View) {
        this.from = from
        this.to = to

        this.connection = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.connection.classList.add('control-flow-connection')
        document.getElementById('svg-canvas').append(this.connection)
    }

    tick(dt: number) {
        if (this.from == this.to) {
            const bbox = getViewElement(this.to).getBoundingClientRect()
            const start = [bbox.x, bbox.y + 10]
            const end = [bbox.x, bbox.y + 25]
            const mid = [bbox.x - 20, bbox.y + 10]
            const d = catmullRomSolve([...start, ...mid, ...end], 1.5)
            this.connection.setAttribute('d', d)
            return
        }

        const startBbox = getViewElement(this.from).getBoundingClientRect()
        const endBbox = getViewElement(this.to).getBoundingClientRect()

        const start = [startBbox.x + 10, startBbox.y + startBbox.height]
        const end = [endBbox.x + 10, endBbox.y]

        const mid = [(startBbox.x + endBbox.x) / 2 - 10, (start[1] + end[1]) / 2]
        const d = catmullRomSolve([...start, ...mid, ...end], 3)
        this.connection.setAttribute('d', d)

        // const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getArrow(start.x, start.y, end.x, end.y, {
        //     padEnd: 0,
        //     padStart: 0,
        // })
        // this.connection.setAttribute(
        //     'd',
        //     `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
        // )
    }

    destroy() {
        this.connection.remove()
    }
}
