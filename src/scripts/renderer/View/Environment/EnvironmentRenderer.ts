import { resolvePath } from '../../../environment/environment'
import { EnvironmentState, IdentifierState } from '../../../environment/EnvironmentState'
import { createEl } from '../../../utilities/dom'
import { ArrayRenderer } from './data/array/ArrayRenderer'
import { DataRenderer } from './data/DataRenderer'
import {
    DataState,
    DataType,
    instanceOfObjectData,
    instanceOfPrimitiveData,
} from './data/DataState'
import { LiteralRenderer } from './data/literal/LiteralRenderer'
import { ObjectRenderer } from './data/object/ObjectRenderer'
import { FunctionRenderer } from './data/reference/FunctionRenderer'
import { IdentifierRenderer } from './identifier/IdentifierRenderer'

/* ------------------------------------------------------ */
/*             Renders a single program state             */
/* ------------------------------------------------------ */
export class EnvironmentRenderer {
    element: HTMLElement
    dataRenderers: { [id: string]: DataRenderer } = {}
    identifierRenderers: { [id: string]: IdentifierRenderer } = {}

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()
    }

    create() {
        this.element = createEl('div', 'environment')
    }

    /* ----------------------- Render ----------------------- */
    render(environment: EnvironmentState) {
        this.renderMemory(environment)
        this.renderIdentifiers(environment)
    }

    renderMemory(state: EnvironmentState) {
        // Hit test
        const hits = new Set()

        // Filter out irrelevant memory
        let memory = Object.values(state.memory)
            .filter((m) => m != null)
            .filter(
                (data) =>
                    instanceOfObjectData(data) ||
                    data.type == DataType.Literal ||
                    data.type == DataType.Array ||
                    data.type == DataType.Function
            )
            .filter((data) => {
                if (instanceOfPrimitiveData(data) && data.type == DataType.Function) {
                    return !data.value.toString().includes('[native code]')
                } else if (data.builtin) {
                    return false
                } else {
                    return true
                }
            })

        // memory.reverse()

        // Render data
        for (const data of memory) {
            let renderer = this.dataRenderers[data.id]

            // Create renderer if not there
            if (renderer == null) {
                renderer = createDataRenderer(data)
                this.element.append(renderer.element)

                this.dataRenderers[data.id] = renderer
            }

            hits.add(data.id)
            renderer.setState(data)
        }

        // Remove data that is no longer in the view
        for (const [id, renderer] of Object.entries(this.dataRenderers)) {
            if (!hits.has(id)) {
                renderer.destroy()
                renderer.element.remove()
                delete this.dataRenderers[id]
            }
        }
    }

    renderIdentifiers(state: EnvironmentState) {
        // Hit test
        const hits = new Set()
        const dataHits = new Set()

        for (const scope of state.scope) {
            for (const name of Object.keys(scope.bindings)) {
                const data = resolvePath(state, scope.bindings[name].location, null)
                const dataRenderer = this.dataRenderers[data.id]
                if (dataRenderer == null) continue // Ignore dangling references

                let renderer = this.identifierRenderers[name]
                if (renderer == null) {
                    renderer = new IdentifierRenderer()
                    this.element.appendChild(renderer.element)

                    this.identifierRenderers[name] = renderer
                }

                hits.add(name)
                dataHits.add(data.id)

                renderer.setState(scope.bindings[name], dataRenderer, this.element)
            }
        }

        // Remove hits that aren't used
        for (const [name, renderer] of Object.entries(this.identifierRenderers)) {
            if (!hits.has(name)) {
                renderer.destroy()
                renderer.element.remove()
                delete this.identifierRenderers[name]
            }
        }
    }

    /* ---------------------- Utilities --------------------- */
    getAllChildRenderers() {
        let renderers: { [id: string]: DataRenderer | IdentifierRenderer } = {}

        // Add in data renderers
        for (const [id, renderer] of Object.entries(this.dataRenderers)) {
            renderers[id] = renderer

            renderers = {
                ...renderers,
                ...renderer.getAllChildRenderers(),
            }
        }

        // Add in identifier renderers
        for (const [id, renderer] of Object.entries(this.identifierRenderers)) {
            renderers[id] = renderer
        }

        return renderers
    }

    /* ----------------------- Destroy ---------------------- */
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

        this.dataRenderers = {}
        this.identifierRenderers = {}
        this.element = null
    }
}

/* ------------------------------------------------------ */
/*                    Helper functions                    */
/* ------------------------------------------------------ */
export function createDataRenderer(data: DataState) {
    if (instanceOfPrimitiveData(data)) {
        const mapping = {
            [DataType.Literal]: LiteralRenderer,
            [DataType.Function]: FunctionRenderer,
        }

        if (!(data.type in mapping)) {
            console.error('No primitive renderer for', data.type)
        }

        return new mapping[data.type]()
    } else {
        if (Array.isArray(data.value)) {
            return new ArrayRenderer()
        } else if (data.constructor === Object) {
            return new ObjectRenderer()
        }
    }
}

export function getRelevantData(state: EnvironmentState) {
    // Filter out irrelevant memory
    const data = Object.values(state.memory)
        .filter((m) => m != null)
        .filter(
            (data) =>
                instanceOfObjectData(data) ||
                data.type == DataType.Literal ||
                data.type == DataType.Array ||
                data.type == DataType.Function
        )
        .filter((data) => {
            if (instanceOfPrimitiveData(data) && data.type == DataType.Function) {
                return !data.value.toString().includes('[native code]')
            } else if (data.builtin) {
                return false
            } else {
                return true
            }
        })

    const identifiers: IdentifierState[] = []

    for (const scope of state.scope) {
        for (const name of Object.keys(scope.bindings)) {
            identifiers.push(scope.bindings[name])
        }
    }

    return [...data, ...identifiers]
}
