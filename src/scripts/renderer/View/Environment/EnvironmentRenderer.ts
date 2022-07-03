import { resolvePath } from '../../../environment/environment'
import {
    Accessor,
    EnvironmentState,
    IdentifierState,
    instanceOfEnvironment,
} from '../../../environment/EnvironmentState'
import { ScopeType } from '../../../transpiler/Statements/BlockStatement'
import { createElement } from '../../../utilities/dom'
import { ArrayRenderer } from './data/array/ArrayRenderer'
import { DataRenderer } from './data/DataRenderer'
import { DataState, DataType, instanceOfObjectData, instanceOfPrimitiveData } from './data/DataState'
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
    residualRenderers: { [id: string]: DataRenderer }[] = []

    timestamps: { [id: string]: number } = {}

    private environmentCache: string = null
    private filterCache: string = null

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()
    }

    create() {
        this.element = createElement('div', 'environment')
    }

    /* ----------------------- Render ----------------------- */
    render(environment: EnvironmentState, filter?: string[]) {
        // If already the same
        if (
            this.environmentCache === JSON.stringify(environment) &&
            this.filterCache === JSON.stringify(filter ?? null)
        ) {
            return
        }

        this.timestamps = environment.timestamps

        this.renderMemory(environment, filter)
        this.renderIdentifiers(environment, filter)
        this.renderResiduals(environment, filter)

        // Update caches
        this.environmentCache = JSON.stringify(environment)
        this.filterCache = JSON.stringify(filter ?? null)
    }

    renderMemory(state: EnvironmentState, filter?: string[]) {
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
                if (instanceOfPrimitiveData(data)) {
                    return !data.value.toString().includes('[native code]')
                } else if (data.builtin) {
                    return false
                } else {
                    return true
                }
            })

        // const ws = writes(parent).map((w) => w.id)
        // const rs = reads(parent).map((r) => r.id)

        if (filter != null) {
            memory = memory.filter((data) => filter.includes(data.id))
        }

        // Find latest frame that "hard" scopes
        let hardScope = -1
        for (let i = state.scope.length - 1; i >= 0; i--) {
            const scope = state.scope[i]

            if (scope.type == ScopeType.Hard) {
                hardScope = i
            }
        }

        memory = memory.filter((data) => data.frame >= hardScope || data.frame == 1)

        // Render references
        let references = Object.values(state.memory)
            .filter((m) => m != null)
            .filter((data) => instanceOfPrimitiveData(data) && data.type == DataType.Reference)

        if (filter != null) {
            references = references.filter((data) => filter.includes(data.id))
        }

        // Render references
        for (const reference of references) {
            const data = resolvePath(state, reference.value as Accessor[], null)
            if (instanceOfEnvironment(data)) continue
            // if (instanceOfPrimitiveData(data) && data.type == DataType.Function) continue

            let renderer = this.dataRenderers[data.id]

            // Create renderer if not there
            if (renderer == null) {
                renderer = { column: null, data: null }
                renderer.column = createElement('div', 'environment-column', this.element)

                createElement('div', 'identifier-row', renderer.column)
                createElement('div', 'data-row', renderer.column)
                createElement('div', 'hole', renderer.column.children[1] as HTMLElement)

                renderer.data = createDataRenderer(data)
                renderer.column.children[1].children[0].append(renderer.data.element)

                this.dataRenderers[data.id] = renderer
            }

            hits.add(data.id)
            renderer.data.setState(data)
        }

        // Render data
        for (const data of memory) {
            let renderer = this.dataRenderers[data.id]

            // Create renderer if not there
            if (renderer == null) {
                renderer = { column: null, data: null }
                renderer.column = createElement('div', 'environment-column', this.element)

                createElement('div', 'identifier-row', renderer.column)
                createElement('div', 'data-row', renderer.column)
                createElement('div', 'hole', renderer.column.children[1] as HTMLElement)

                renderer.data = createDataRenderer(data)
                renderer.column.children[1].children[0].append(renderer.data.element)

                this.dataRenderers[data.id] = renderer
            }

            hits.add(data.id)
            renderer.data.setState(data)
        }

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

    renderIdentifiers(state: EnvironmentState, filter?: string[]) {
        // Hit test
        const hits = new Set()
        const dataHits = new Set()

        // const ws = writes(parent).map((w) => w.id)
        // const rs = reads(parent).map((r) => r.id)

        let i = 0
        for (i = state.scope.length - 1; i >= 0; i--) {
            const scope = state.scope[i]

            for (const name of Object.keys(scope.bindings)) {
                const data = resolvePath(state, scope.bindings[name].location, null)
                const dataRenderer = this.dataRenderers[data.id]
                if (dataRenderer == null) continue // Ignore dangling references

                let renderer = this.identifierRenderers[name]
                if (renderer == null) {
                    renderer = new IdentifierRenderer()
                    dataRenderer.column.children[0].appendChild(renderer.element)

                    this.identifierRenderers[name] = renderer
                }

                hits.add(name)
                dataHits.add(data.id)

                renderer.setState(scope.bindings[name])
            }

            if (scope.type == ScopeType.Hard) {
                break
            }
        }

        // Global scope
        if (i > 0) {
            const scope = state.scope[0]

            for (const name of Object.keys(scope.bindings)) {
                const data = resolvePath(state, scope.bindings[name].location, null)
                const dataRenderer = this.dataRenderers[data.id]
                if (dataRenderer == null) continue // Ignore dangling references

                let renderer = this.identifierRenderers[name]
                if (renderer == null) {
                    renderer = new IdentifierRenderer()
                    dataRenderer.column.children[0].appendChild(renderer.element)

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

    renderResiduals(state: EnvironmentState, filter?: string[]) {
        // Hit test
        const hits = new Set()

        // Remove data that is no longer in the view
        // TODO: Use hits to do this smartly
        for (let i = 0; i < this.residualRenderers.length; i++) {
            for (const [id, renderer] of Object.entries(this.residualRenderers[i])) {
                renderer.destroy()
                renderer.element.remove()
                delete this.residualRenderers[id]
            }
        }

        this.residualRenderers = []

        // TODO: Filter
        // if (filter != null) {
        // memory = memory.filter((data) => filter.includes(data.id))
        // }

        for (let time = 0; time < state.residuals.length; time++) {
            const residuals = state.residuals[time]
            this.residualRenderers[time] = {}
            const toRemove: Set<number> = new Set()

            for (let k = 0; k < residuals.length; k++) {
                const residual = residuals[k]
                const locationData = resolvePath(state, residual.location, null)

                if (instanceOfEnvironment(locationData)) {
                    toRemove.add(k)
                    continue
                }

                const locationRenderer = this.getAllChildRenderers()[locationData.id]
                const hole = locationRenderer.element.parentElement

                let residualRenderer = this.residualRenderers[time][`${time}-${residual.data.id}`]

                // Create renderer if not theres
                if (residualRenderer == null) {
                    residualRenderer = createDataRenderer(residual.data)
                    hole.appendChild(residualRenderer.element)
                    residualRenderer.element.classList.add('is-residual')

                    this.residualRenderers[time][`${time}-${residual.data.id}`] = residualRenderer
                }

                hits.add(`${time}-${residual.data.id}`)
                residualRenderer.setState(residual.data)
            }

            for (let k = residuals.length - 1; k >= 0; k--) {
                if (toRemove.has(k)) {
                    const renderer = this.residualRenderers[time][`${time}-${residuals[k].data.id}`]

                    if (renderer != null) {
                        renderer.destroy()
                        renderer.element.remove()
                        delete this.residualRenderers[time][`${time}-${residuals[k].data.id}`]
                    }

                    residuals.splice(k, 1)
                }
            }
        }
    }

    getResidualOf(dataId: string, time: number): DataRenderer | IdentifierRenderer {
        if (time < 0) {
            return null
        }

        /* ------------------ Look in residual ------------------ */
        for (let i = time; i < this.residualRenderers.length; i++) {
            const residuals = this.residualRenderers[i]
            for (const [id, renderer] of Object.entries(residuals)) {
                if (id.split('-')[1] == dataId) {
                    return renderer
                }
            }
        }

        /* ----- Make sure there are no residuals after time ---- */

        /* ------------------ Look in data ------------------ */
        if (this.timestamps[dataId] >= time) {
            return null
        } else {
            return this.getAllChildRenderers()[dataId]
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

        this.dataRenderers = null
        this.identifierRenderers = null
        this.element = null
    }
}

/* ------------------------------------------------------ */
/*                    Helper functions                    */
/* ------------------------------------------------------ */
export function createDataRenderer(data: DataState): DataRenderer {
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

export function getRelevantFlatData(state: EnvironmentState) {
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

    let flattened = []
    let pool = [...data]

    while (pool.length > 0) {
        const data = pool.shift()
        if (instanceOfPrimitiveData(data)) {
            flattened.push(data)
        } else if (instanceOfObjectData(data)) {
            if (Array.isArray(data.value)) {
                pool.push(...(data.value as DataState[]))
            } else if (data.constructor == Object) {
                pool.push(...Object.values(data.value as DataState[]))
            }

            flattened.push(data)
        }
    }

    const identifiers: IdentifierState[] = []

    for (const scope of state.scope) {
        for (const name of Object.keys(scope.bindings)) {
            identifiers.push(scope.bindings[name])
        }
    }

    return [...flattened, ...identifiers]
}
