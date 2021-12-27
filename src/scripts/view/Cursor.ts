import * as ESTree from 'estree'
import { Editor } from '../editor/Editor'

export interface CursorState {
    location: ESTree.SourceLocation
}

export class Cursor {
    // State
    state: CursorState

    // Renderer
    element: HTMLDivElement

    constructor() {
        // State
        this.state = {
            location: {
                start: {
                    line: 0,
                    column: 0,
                },
                end: {
                    line: 0,
                    column: 0,
                },
            },
        }

        // Renderer
        this.element = document.createElement('div')
        this.element.className = 'view-cursor'

        document.body.appendChild(this.element)
    }

    tick() {
        const bbox = Editor.instance.computeBoundingBoxForLoc(
            this.state.location
        )

        if (bbox.x == 0 && bbox.y == 0) {
            this.element.classList.add('start')
        } else {
            this.element.classList.remove('start')
            this.element.style.top = `${bbox.y}px`
            this.element.style.left = `${bbox.x}px`
            this.element.style.width = `${bbox.width}px`
            this.element.style.height = `${bbox.height}px`
        }
    }

    destroy() {
        this.element.remove()
        this.element = null
    }
}
