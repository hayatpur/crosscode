import { queryAllAnimationGraph } from '../animation/graph/graph'
import { instanceOfAnimationNode } from '../animation/primitive/AnimationNode'
import { DataRenderer } from '../environment/data/DataRenderer'
import { AbstractionIndicator } from './abstraction/AbstractionIndicator'
import { GroupViewRenderer } from './GroupViewRenderer'
import { ViewCursorRenderer } from './ViewCursorRenderer'
import { RootViewState } from './ViewState'

export class RootViewRenderer extends GroupViewRenderer {
    indicators: { [id: string]: AbstractionIndicator } = {}
    cursor: ViewCursorRenderer

    constructor() {
        super()

        DataRenderer.getStage().append(this.element)
        this.element.classList.add('is-root', 'root')
        this.labelElement.classList.add('is-root')

        this.cursor = new ViewCursorRenderer()
    }

    setState(state: RootViewState) {
        // super.setState(state)

        const chunks = queryAllAnimationGraph(
            state.animation,
            (node) => state.chunkIds.indexOf(node.id) != -1
        )

        const nodes = queryAllAnimationGraph(
            state.animation,
            (animation) =>
                instanceOfAnimationNode(animation) && !animation.isChunk
        )

        // Hit test
        const hits = new Set()

        // Render chunks
        for (const chunk of [...chunks, ...nodes]) {
            if (!(chunk.id in this.indicators)) {
                const renderer = new AbstractionIndicator(
                    chunks.indexOf(chunk) != -1
                )
                this.indicators[chunk.id] = renderer
            }

            hits.add(chunk.id)
            this.indicators[chunk.id].setState(chunk)
        }

        // Remove indicators that are no longer in the view
        for (const id of Object.keys(this.indicators)) {
            if (!hits.has(id)) {
                const renderer = this.indicators[id]
                renderer.destroy()
                renderer.element.remove()
                delete this.indicators[id]
            }
        }

        // Render cursor
        this.cursor.setState(state.cursor)
    }

    destroy() {
        super.destroy()

        for (const id of Object.keys(this.indicators)) {
            const renderer = this.indicators[id]
            renderer.destroy()
            renderer.element.remove()
        }

        this.cursor.destroy()
    }
}
