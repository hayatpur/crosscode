import { CursorState } from '../animation/Cursor'
import { Editor } from '../editor/Editor'

export class ViewCursorRenderer {
    element: HTMLDivElement
    label: HTMLDivElement

    constructor() {
        this.element = document.createElement('div')
        this.element.className = 'view-cursor'

        this.label = document.createElement('div')
        this.label.className = 'view-cursor-label'

        this.element.appendChild(this.label)

        document.body.appendChild(this.element)
    }

    setState(state: CursorState) {
        const bbox = Editor.instance.computeBoundingBoxForLoc(state.location)

        if (bbox.x == 0 && bbox.y == 0) {
            this.element.classList.add('start')
        } else {
            this.element.classList.remove('start')
            this.element.style.top = `${bbox.y}px`
            this.element.style.left = `${bbox.x}px`
            this.element.style.width = `${bbox.width}px`
            this.element.style.height = `${bbox.height}px`
        }

        this.label.innerText = state.label
    }

    destroy() {
        this.element.remove()
        this.element = null
    }
}
