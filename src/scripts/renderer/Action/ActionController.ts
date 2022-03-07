import { Action } from './Action'

/* ------------------------------------------------------ */
/*           Defines interactions with an Action          */
/* ------------------------------------------------------ */
export class ActionController {
    action: Action

    constructor(action: Action) {
        this.action = action

        this.bindMouseEvents()
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

    destroy() {}
}
