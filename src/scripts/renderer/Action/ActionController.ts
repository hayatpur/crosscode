import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Ticker } from '../../utilities/Ticker'
import { Action } from './Action'

/* ------------------------------------------------------ */
/*           Defines interactions with an Action          */
/* ------------------------------------------------------ */
export class ActionController {
    action: Action
    _tickerId: string

    connections: SVGPathElement[] = []

    constructor(action: Action) {
        this.action = action

        this.bindMouseEvents()

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    /* ----------------------- Update ----------------------- */
    tick(dt: number) {
        // Update position if root
        if (this.action.timeline.state.isRoot) {
            const { x, y } = this.action.state.transform.position
            this.action.renderer.element.style.left = `${x}px`
            this.action.renderer.element.style.top = `${y}px`
        }
    }

    /* ---------------------- Minimize ---------------------- */
    minimize() {
        this.action.renderer.element.classList.add('minimized')
        this.action.timeline.renderer.element.classList.add('minimized')
    }

    maximize() {
        this.action.renderer.element.classList.remove('minimized')
        this.action.timeline.renderer.element.classList.remove('minimized')
    }

    /* ------------------------ Focus ----------------------- */
    focus(node?: ExecutionGraph | ExecutionNode) {
        this.action.renderer.element.classList.remove('unfocused')
        this.action.timeline.renderer.element.classList.remove('unfocused')

        this.action.renderer.element.classList.add('is-focused')

        if (node != null) {
            const loc = node.nodeData.location
            const bbox = Editor.instance.computeBoundingBoxForLoc(loc)
            const parentBbox = Editor.instance.computeBoundingBoxForLoc(
                this.action.execution.nodeData.location
            )
            bbox.x -= parentBbox.x
            bbox.y -= parentBbox.y

            let padding = 20
            bbox.x -= padding
            bbox.y -= padding
            bbox.width += 2 * padding
            bbox.height += 2 * padding

            const headerBbox = this.action.renderer.header.getBoundingClientRect()

            const tokens = [
                ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
            ]
            const contained = tokens.filter((token) => {
                const tokenBbox = token.getBoundingClientRect()
                tokenBbox.x -= headerBbox.x
                tokenBbox.y -= headerBbox.y
                return (
                    tokenBbox.x >= bbox.x &&
                    tokenBbox.y >= bbox.y &&
                    tokenBbox.x + tokenBbox.width <= bbox.x + bbox.width &&
                    tokenBbox.y + tokenBbox.height <= bbox.y + bbox.height
                )
            })
            for (const el of contained) {
                el.classList.remove('unfocused')
            }
        } else {
            const tokens = [
                ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
            ]
            for (const el of tokens) {
                el.classList.remove('unfocused')
            }
        }
    }

    unfocus() {
        this.action.renderer.element.classList.add('unfocused')
        this.action.timeline.renderer.element.classList.add('unfocused')

        this.action.renderer.element.classList.add('is-focused')

        const tokens = [
            ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
        ]

        for (const el of tokens) {
            el.classList.add('unfocused')
        }
    }

    clearFocus() {
        this.action.renderer.element.classList.remove('unfocused')
        this.action.timeline.renderer.element.classList.remove('unfocused')
        this.action.renderer.element.classList.remove('is-focused')

        const tokens = [
            ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
        ]
        for (const el of tokens) {
            el.classList.remove('unfocused')
        }
    }

    /* -------------------- Mouse events -------------------- */

    bindMouseEvents() {
        // Bind mouse events to label
        const node = this.action.renderer.label

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    mousedown(event: MouseEvent) {}

    mouseover(event: MouseEvent) {}

    mouseout(event: MouseEvent) {}

    mouseup(event: MouseEvent) {}

    mousemove(event: MouseEvent) {}

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)

        this.connections.forEach((connection) => {
            connection.remove()
        })
    }
}
