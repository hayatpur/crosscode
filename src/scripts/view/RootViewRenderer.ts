import { queryAnimationGraph } from '../animation/graph/graph'
import { DataRenderer } from '../environment/data/DataRenderer'
import { AbstractionIndicator } from './abstraction/AbstractionIndicator'
import { GroupViewRenderer } from './GroupViewRenderer'
import { RootViewState } from './ViewState'

export class RootViewRenderer extends GroupViewRenderer {
    abstractionIndicators: { [id: string]: AbstractionIndicator } = {}

    constructor() {
        super()

        DataRenderer.getStage().append(this.element)
        this.element.classList.add('is-root', 'root')
        this.labelElement.classList.add('is-root')
    }

    setState(state: RootViewState) {
        super.setState(state)

        const chunks = queryAnimationGraph(state.animation, (animation) => animation.nodeData.type == 'Chunk')

        // Hit test
        const hits = new Set()

        // Render chunks
        for (const chunk of chunks) {
            if (!(chunk.id in this.abstractionIndicators)) {
                const renderer = new AbstractionIndicator()
                this.abstractionIndicators[chunk.id] = renderer
            }

            hits.add(chunk.id)
            this.abstractionIndicators[chunk.id].setState(chunk)
        }

        // Remove chunks that are no longer in the view
        for (const id of Object.keys(this.abstractionIndicators)) {
            if (!hits.has(id)) {
                const renderer = this.abstractionIndicators[id]
                renderer.destroy()
                renderer.element.remove()
                delete this.abstractionIndicators[id]
            }
        }
    }
}
