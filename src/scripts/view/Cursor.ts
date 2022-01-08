import * as ESTree from 'estree'
import { GlobalAnimationCallbacks } from '../animation/GlobalAnimationCallbacks'
import { Editor } from '../editor/Editor'

export interface CursorState {
    location: ESTree.SourceLocation
}

export class Cursor {
    // State
    state: CursorState

    // Renderer
    element: HTMLDivElement

    lastActive: number = -500

    highlightedTokens: Set<HTMLDivElement> = new Set()

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

        // Setup bindings
        GlobalAnimationCallbacks.instance.registerBeginCallback((animation) => {
            this.state.location = animation.nodeData.location
        })

        GlobalAnimationCallbacks.instance.registerSeekCallback((animation) => {
            this.lastActive = performance.now()
        })
    }

    tick() {
        const bbox = Editor.instance.computeBoundingBoxForLoc(
            this.state.location
        )
        bbox.x -= 5
        bbox.width += 10

        const delta = performance.now() - this.lastActive

        if (delta > 200) {
            this.element.style.opacity = '0'

            // this.highlightedTokens.forEach((token) => {
            //     token.classList.remove('highlighted')
            //     this.highlightedTokens.delete(token)
            // })
        } else {
            this.element.style.opacity = '1'

            // const containedTokens = Editor.instance.getContainedTokenElements({
            //     ...bbox,
            //     y: bbox.y - 5,
            //     height: bbox.height + 10,
            //     x: bbox.x - 10,
            //     width: bbox.width + 20,
            // }) as HTMLDivElement[]

            // const hits = new Set()

            // containedTokens.forEach((token) => {
            //     if (!this.highlightedTokens.has(token)) {
            //         this.highlightedTokens.add(token)
            //         token.classList.add('highlighted')
            //     }

            //     hits.add(token)
            // })

            // this.highlightedTokens.forEach((token) => {
            //     if (!hits.has(token)) {
            //         token.classList.remove('highlighted')
            //         this.highlightedTokens.delete(token)
            //     }
            // })
        }

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
