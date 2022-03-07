import { createEl } from '../../utilities/dom'
import { Timeline } from './Timeline'

/* ------------------------------------------------------ */
/*                    Timeline renderer                   */
/* ------------------------------------------------------ */
export class TimelineRenderer {
    element: HTMLElement
    anchors: HTMLElement[] = []
    connections: SVGElement[] = []

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()
    }

    create() {
        this.element = createEl('div', 'timeline')
    }

    /* ----------------------- Render ----------------------- */
    render(timeline: Timeline) {}

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.element.remove()
    }
}
