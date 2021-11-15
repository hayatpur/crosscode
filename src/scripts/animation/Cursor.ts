import * as ESTree from 'estree'
import { Editor } from '../editor/Editor'

export interface CursorState {
    location: ESTree.SourceLocation
}

export function createCursorState(): CursorState {
    return {
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
}

export class CursorRenderer {
    element: HTMLDivElement

    constructor() {}

    updateState(state: CursorState) {
        if (this.element == null) {
            this.element = document.createElement('div')
            this.element.classList.add('highlight-cursor')
            document.body.append(this.element)
        }

        const start = Editor.instance.computeBoundingBox(state.location.start.line)
        if (start == null) return

        let charWidth = Editor.instance.computeCharWidth(state.location.start.line)

        start.y -= 5
        start.height += 10
        start.x += charWidth * state.location.start.column
        start.width = charWidth * (state.location.end.column - state.location.start.column)

        this.element.style.width = `${start.width}px`
        this.element.style.height = `${start.height}px`
        this.element.style.left = `${start.left}px`
        this.element.style.top = `${start.top}px`
    }

    destroy() {
        this.element.remove()
        this.element = null
    }
}
