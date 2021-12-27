import { ArrayRenderer } from './data/array/ArrayRenderer'
import { DataRenderer } from './data/DataRenderer'
import { DataType, PrototypicalDataState } from './data/DataState'
import { LiteralRenderer } from './data/literal/LiteralRenderer'
import { FunctionRenderer } from './data/reference/FunctionRenderer'
import { resolvePath } from './environment'
import { PrototypicalEnvironmentState } from './EnvironmentState'
import { IdentifierRenderer } from './identifier/IdentifierRenderer'

export function createDataRenderer(data: PrototypicalDataState) {
    const mapping = {
        [DataType.Literal]: LiteralRenderer,
        [DataType.Array]: ArrayRenderer,
        [DataType.Function]: FunctionRenderer,
    }

    if (!(data.type in mapping)) {
        console.error('No renderer for', data.type)
    }

    return new mapping[data.type]()
}

export class EnvironmentRenderer {
    element: HTMLDivElement

    dataRenderers: { [id: string]: DataRenderer } = {}
    identifierRenderers: { [id: string]: IdentifierRenderer } = {}

    private memoryCache: string = ''

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('environment')
    }

    setState(state: PrototypicalEnvironmentState) {
        // Memory
        this.renderMemory(state)

        // Render identifiers
        this.renderIdentifiers(state)
    }

    renderMemory(state: PrototypicalEnvironmentState) {
        if (JSON.stringify(state) === this.memoryCache) {
            return
        }

        this.memoryCache = JSON.stringify(state)

        // Hit test
        const hits = new Set()

        // Only render literals and arrays
        const memory = state.memory
            .filter((m) => m != null)
            .filter(
                (data) =>
                    data.type == DataType.Literal ||
                    data.type == DataType.Array ||
                    data.type == DataType.Function
            )

        // Render data
        for (const data of memory) {
            // Create renderer if not there
            if (!(data.id in this.dataRenderers)) {
                const renderer = createDataRenderer(data)
                this.dataRenderers[data.id] = renderer
                this.element.append(renderer.element)
            }

            hits.add(data.id)
            this.dataRenderers[data.id].setState(data)
        }

        // Remove data that are no longer in the view
        for (const id of Object.keys(this.dataRenderers)) {
            if (!hits.has(id)) {
                const renderer = this.dataRenderers[id]
                renderer.destroy()
                renderer.element.remove()
                delete this.dataRenderers[id]
            }
        }
    }

    renderIdentifiers(state: PrototypicalEnvironmentState) {
        // Hit test
        const hits = new Set()

        for (const scope of state.scope) {
            for (const name of Object.keys(scope.bindings)) {
                if (!(name in this.identifierRenderers)) {
                    const renderer = new IdentifierRenderer()
                    this.identifierRenderers[name] = renderer
                    this.element.appendChild(renderer.element)
                }

                hits.add(name)
                const location = scope.bindings[name].location
                const data = resolvePath(state, location, null)
                this.identifierRenderers[name].setState(
                    scope.bindings[name],
                    this.dataRenderers[data.id],
                    this.element
                )
            }
        }

        // Remove hits that aren't used
        for (const name of Object.keys(this.identifierRenderers)) {
            if (!hits.has(name)) {
                const renderer = this.identifierRenderers[name]
                renderer.destroy()
                renderer.element.remove()
                delete this.identifierRenderers[name]
            }
        }
    }

    destroy() {
        for (const id of Object.keys(this.dataRenderers)) {
            const renderer = this.dataRenderers[id]
            renderer.destroy()
        }

        for (const name of Object.keys(this.identifierRenderers)) {
            const renderer = this.identifierRenderers[name]
            renderer.destroy()
        }

        this.element.remove()
    }
}
