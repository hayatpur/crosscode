import { resolvePath } from '../../../environment/environment'
import { EnvironmentState, IdentifierState } from '../../../environment/EnvironmentState'
import { reads, writes } from '../../../execution/execution'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
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

    dataRenderers: { [id: string]: { data: DataRenderer; column: HTMLElement } } = {}
    identifierRenderers: { [id: string]: IdentifierRenderer } = {}

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()
    }

    create() {
        this.element = createEl('div', 'environment')
    }

    /* ----------------------- Render ----------------------- */
    render(environment: EnvironmentState, parent: ExecutionNode | ExecutionGraph) {
        this.renderMemory(environment, parent)
        this.renderIdentifiers(environment, parent)
    }

    renderMemory(state: EnvironmentState, parent: ExecutionNode | ExecutionGraph) {
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

        const ws = writes(parent).map((w) => w.id)
        const rs = reads(parent).map((r) => r.id)

        memory = memory.filter((data) => {
            return ws.includes(data.id) || rs.includes(data.id)
        })

        // memory.reverse()

        // Render data
        for (const data of memory) {
            let renderer = this.dataRenderers[data.id]

            // Create renderer if not there
            if (renderer == null) {
                renderer = { column: null, data: null }
                renderer.column = createEl('div', 'environment-column', this.element)
                renderer.data = createDataRenderer(data)

                renderer.column.append(renderer.data.element)

                this.dataRenderers[data.id] = renderer
            }

            hits.add(data.id)
            renderer.data.setState(data)
        }

        // Render references
        const references = Object.values(state.memory)
            .filter((m) => m != null)
            .filter((data) => instanceOfPrimitiveData(data) && data.type == DataType.Function)

        // for (const reference of references) {
        //     const data = resolvePath(state, reference.value as Accessor[], null)
        //     let renderer = this.dataRenderers[data.id]

        //     // Create renderer if not there
        //     if (renderer == null) {
        //         renderer = { column: null, data: null }
        //         renderer.column = createEl('div', 'environment-column', this.element)
        //         renderer.data = createDataRenderer(data)

        //         renderer.column.append(renderer.data.element)

        //         this.dataRenderers[data.id] = renderer
        //     }

        //     hits.add(data.id)
        //     renderer.data.setState(data)
        // }

        // Remove data that is no longer in the view
        for (const [id, renderer] of Object.entries(this.dataRenderers)) {
            if (!hits.has(id)) {
                renderer.data.destroy()
                renderer.column.remove()
                renderer.data.element.remove()
                delete this.dataRenderers[id]
            }
        }
    }

    renderIdentifiers(state: EnvironmentState, parent: ExecutionNode | ExecutionGraph) {
        // Hit test
        const hits = new Set()
        const dataHits = new Set()

        const ws = writes(parent).map((w) => w.id)
        const rs = reads(parent).map((r) => r.id)

        for (const scope of state.scope) {
            for (const name of Object.keys(scope.bindings)) {
                const data = resolvePath(state, scope.bindings[name].location, null)
                const dataRenderer = this.dataRenderers[data.id]
                if (dataRenderer == null) continue // Ignore dangling references

                if (!ws.includes(data.id) && !rs.includes(data.id)) {
                    continue
                }

                let renderer = this.identifierRenderers[name]
                if (renderer == null) {
                    renderer = new IdentifierRenderer()
                    dataRenderer.column.appendChild(renderer.element)

                    this.identifierRenderers[name] = renderer
                }

                hits.add(name)
                dataHits.add(data.id)

                renderer.setState(scope.bindings[name])
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
            renderers[id] = renderer.data

            renderers = {
                ...renderers,
                ...renderer.data.getAllChildRenderers(),
            }
        }

        // Add in identifier renderers
        for (const [id, renderer] of Object.entries(this.identifierRenderers)) {
            renderers[id] = renderer
        }

        return renderers
    }

    /* ------------------------ Focus ----------------------- */
    secondaryFocus(dataIds: Set<string>) {
        console.log(dataIds)
        for (const [id, renderer] of Object.entries(this.getAllChildRenderers())) {
            if (dataIds.has(id)) {
                renderer.secondaryFocus()
            }
        }
    }

    focus(dataIds: Set<string>) {
        for (const [id, renderer] of Object.entries(this.getAllChildRenderers())) {
            if (dataIds.has(id)) {
                renderer.focus()
            }
        }
    }

    unfocus() {
        for (const renderer of Object.values(this.getAllChildRenderers())) {
            renderer.unfocus()
        }
    }

    clearFocus() {
        for (const renderer of Object.values(this.getAllChildRenderers())) {
            renderer.clearFocus()
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        for (const id of Object.keys(this.dataRenderers)) {
            const renderer = this.dataRenderers[id]
            renderer.data.destroy()
            renderer.column.remove()
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
