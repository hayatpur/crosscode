import { ApplicationState } from '../../../ApplicationState'
import { reads, writes } from '../../../execution/execution'
import { instanceOfExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { resolvePath } from '../../../transpiler/environment'
import {
    Accessor,
    EnvironmentState,
    FrameInfo,
    IdentifierState,
    instanceOfEnvironment,
    Scope,
} from '../../../transpiler/EnvironmentState'
import { ScopeType } from '../../../transpiler/Statements/BlockStatement'
import { createElement } from '../../../utilities/dom'
import { getSpatialActionsPathFromRoot } from '../../../visualization/TimeMarker'
import { ArrayRenderer } from './data/array/ArrayRenderer'
import { DataRenderer } from './data/DataRenderer'
import { DataState, DataType, instanceOfObjectData, instanceOfPrimitiveData } from './data/DataState'
import { LiteralRenderer } from './data/literal/LiteralRenderer'
import { ObjectRenderer } from './data/object/ObjectRenderer'
import { FunctionRenderer } from './data/reference/FunctionRenderer'
import { ReferenceRenderer } from './data/reference/ReferenceRenderer'
import { IdentifierRenderer } from './identifier/IdentifierRenderer'

export interface EnvironmentFilters {
    type: 'scope' | 'data' | 'identifier'
    value: string
}

/* ------------------------------------------------------ */
/*             Renders a single program state             */
/* ------------------------------------------------------ */
export class EnvironmentRenderer {
    element: HTMLElement

    hardScopeRenderers: HTMLElement[] = []

    dataRenderers: {
        [id: string]: { data: DataRenderer; column: HTMLElement }
    } = {}
    identifierRenderers: { [id: string]: IdentifierRenderer } = {}
    residualRenderers: { [id: string]: DataRenderer }[] = []

    timestamps: { [id: string]: number } = {}

    private environmentCache: string = ''
    private filterCache: string = ''

    filters: EnvironmentFilters[] = []

    scopeFiltered: boolean = false

    /* ----------------------- Create ----------------------- */
    constructor(filters: EnvironmentFilters[] = []) {
        this.element = createElement('div', 'environment')

        this.scopeFiltered = filters.some((filter) => filter.type == 'scope')

        // Create hard scope renderers
        if (!this.scopeFiltered) {
            this.hardScopeRenderers[0] = createElement('div', ['environment-hard-scope', 'environment-global-scope'])
        }

        this.filters = filters
    }

    /* ----------------------- Render ----------------------- */
    render(frame: FrameInfo) {
        // If already the same
        if (this.environmentCache === JSON.stringify(frame) && this.filterCache === JSON.stringify(null)) {
            return
        }

        this.timestamps = frame.environment.timestamps

        this.renderMemory(frame)
        this.renderIdentifiers(frame)
        this.renderResiduals(frame)

        // Update caches
        this.environmentCache = JSON.stringify(frame)
        this.filterCache = JSON.stringify(null)
    }

    renderMemory(frame: FrameInfo) {
        const { environment: state, stepId, overrideExecution } = frame

        // Hit test
        const hits = new Set()
        const scopeIndexHits: Set<number> = new Set()

        const appendedMemory: [DataState, HTMLElement, number][] = []

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
                    return !(data.value ?? '').toString().includes('[native code]')
                } else if (data.builtin) {
                    return false
                } else {
                    return true
                }
            })

        const step = Steps.get(stepId)
        const ws = writes(overrideExecution ?? step.execution).map((w) => w.id)
        const rs = reads(overrideExecution ?? step.execution).map((r) => r.id)

        // if (filter != null) {
        //     memory = memory.filter((data) => filter.includes(data.id))
        // }

        // Render references
        let references = Object.values(state.memory)
            .filter((m) => m != null)
            .filter((data) => instanceOfPrimitiveData(data) && data.type == DataType.Reference)

        // if (filter != null) {
        //     references = references.filter((data) => filter.includes(data.id))
        // }

        // Update hard scope renderers
        if (!this.scopeFiltered) {
            // Find max scope index
            let maxScopeIndex = 0

            for (const data of memory) {
                if (instanceOfPrimitiveData(data) && data.type == DataType.Function) continue

                const scopeIndex = getHardScopeIndex(getHardScopeGlobalIndex(data, state), state)
                if (scopeIndex > maxScopeIndex) {
                    maxScopeIndex = scopeIndex
                }
            }

            for (const reference of references) {
                const data = resolvePath(state, reference.value as Accessor[], null)
                if (instanceOfEnvironment(data)) continue
                if (instanceOfPrimitiveData(data) && data.type == DataType.Function) continue

                const scopeIndex = getHardScopeIndex(getHardScopeGlobalIndex(data, state), state)
                if (scopeIndex > maxScopeIndex) {
                    maxScopeIndex = scopeIndex
                }
            }

            // Pointers
            const existingPointers = new Set<string>()

            // Render data for pointers
            for (const reference of references) {
                const data = resolvePath(state, reference.value as Accessor[], null)
                if (instanceOfEnvironment(data)) continue
                if (instanceOfPrimitiveData(data) && data.type == DataType.Function) continue

                if (!existingPointers.has(data.id)) {
                    existingPointers.add(data.id)
                    continue
                }

                const scopeIndex = getHardScopeIndex(getHardScopeGlobalIndex(reference, state, true), state)
                if (scopeIndex > maxScopeIndex) {
                    maxScopeIndex = scopeIndex
                }
            }

            // Create new hard scope renderers
            if (maxScopeIndex >= this.hardScopeRenderers.length) {
                for (let i = this.hardScopeRenderers.length; i <= maxScopeIndex; i++) {
                    this.hardScopeRenderers[i] = createElement('div', 'environment-hard-scope')
                }
            }

            // Update parents of hard scope renderers
            const stepIds = getSpatialActionsPathFromRoot()
            let failed = false
            for (let i = 0; i < this.hardScopeRenderers.length; i++) {
                const renderer = this.hardScopeRenderers[i]
                const container = ApplicationState.visualization.view?.scopeContainers[stepIds[i]]
                if (container == null) {
                    failed = true
                    continue
                }

                container.innerHTML = ''
                container.appendChild(renderer)
            }

            if (failed) {
                setTimeout(() => {
                    for (let i = 0; i < this.hardScopeRenderers.length; i++) {
                        const renderer = this.hardScopeRenderers[i]

                        ApplicationState.visualization.view!.scopeContainers[stepIds[i]].innerHTML = ''
                        ApplicationState.visualization.view!.scopeContainers[stepIds[i]].appendChild(renderer)
                    }
                })
            }
        }

        const mostRecentHardScope = getHardScopeIndex(state.scope.length - 1, state)

        // Render data for references
        let ccount = -1
        const existingPointers = new Set<string>()
        for (const reference of references) {
            const data = resolvePath(state, reference.value as Accessor[], null)
            ccount++
            if (instanceOfEnvironment(data)) continue
            if (instanceOfPrimitiveData(data) && data.type == DataType.Function) continue

            // Data
            {
                let renderer = this.dataRenderers[data.id]

                const scopeIndex = getHardScopeIndex(getHardScopeGlobalIndex(data, state), state)
                scopeIndexHits.add(scopeIndex)
                if (this.scopeFiltered && scopeIndex != mostRecentHardScope) continue

                // Create renderer if not there
                if (renderer == null) {
                    renderer = { column: null!, data: null! }

                    renderer.column = createElement('div', 'environment-column')

                    createElement('div', 'identifier-row', renderer.column)
                    createElement('div', 'data-row', renderer.column)
                    createElement('div', 'hole', renderer.column.children[1] as HTMLElement)

                    renderer.data = createDataRenderer(data)
                    renderer.column.children[1].children[0].append(renderer.data.element)

                    this.dataRenderers[data.id] = renderer
                }

                if (this.scopeFiltered) {
                    this.element.appendChild(renderer.column)
                    appendedMemory.push([data, renderer.column, ccount])
                } else {
                    this.hardScopeRenderers[scopeIndex].append(renderer.column)
                    appendedMemory.push([data, renderer.column, ccount])
                }

                // Update read and writes
                if (ws.includes(data.id) || ws.includes(reference.id)) {
                    renderer.data.element.classList.add('environment-write')
                    renderer.data.element.classList.remove('environment-read')
                } else if (rs.includes(data.id) || rs.includes(reference.id)) {
                    renderer.data.element.classList.add('environment-read')
                    renderer.data.element.classList.remove('environment-write')
                } else {
                    renderer.data.element.classList.remove('environment-write')
                    renderer.data.element.classList.remove('environment-read')
                }

                hits.add(data.id)
                renderer.data.setState(data, frame)
            }

            // Pointer
            // {
            //     let shouldRender = shouldRenderReference(state, data, reference)
            //     if (!shouldRender) continue

            //     const scopeIndex = getHardScopeIndex(getHardScopeGlobalIndex(reference, state, true), state)
            //     scopeIndexHits.add(scopeIndex)
            //     if (this.scopeFiltered && scopeIndex != mostRecentHardScope) continue

            //     let renderer = this.dataRenderers[reference.id]

            //     // Create renderer if not there
            //     if (renderer == null) {
            //         renderer = { column: null!, data: null! }

            //         renderer.column = createElement('div', 'environment-column')

            //         createElement('div', 'identifier-row', renderer.column)
            //         createElement('div', 'data-row', renderer.column)
            //         createElement('div', 'hole', renderer.column.children[1] as HTMLElement)

            //         renderer.data = createDataRenderer(reference)
            //         renderer.column.children[1].children[0].append(renderer.data.element)

            //         this.dataRenderers[reference.id] = renderer
            //     }

            //     if (this.scopeFiltered) {
            //         this.element.appendChild(renderer.column)
            //         appendedMemory.push([data, renderer.column, ccount])
            //     } else {
            //         this.hardScopeRenderers[scopeIndex].append(renderer.column)
            //         appendedMemory.push([data, renderer.column, ccount])
            //     }

            //     hits.add(reference.id)
            //     renderer.data.setState(reference, stepId)
            // }
        }

        // Render data
        ccount = -1
        for (const data of memory) {
            let renderer = this.dataRenderers[data.id]
            ccount++
            if (instanceOfPrimitiveData(data) && data.type == DataType.Function) continue

            if (typeof data.value == 'boolean') {
                const targetId = data.id.split('_')[0]
                const programExecution =
                    ApplicationState.actions[ControlFlowViewInstance.instance.rootStepId!].execution
                const execution = Step.queryExecutionGraph(programExecution, (d) => d.id == targetId)
                const parentExecution = Step.queryExecutionGraph(
                    programExecution,
                    (d) => instanceOfExecutionGraph(d) && d.vertices.includes(execution)
                )

                if (parentExecution.nodeData.preLabel == 'Test') {
                    continue
                }
            }

            const scopeIndex = getHardScopeIndex(getHardScopeGlobalIndex(data, state), state)
            scopeIndexHits.add(scopeIndex)
            if (this.scopeFiltered && scopeIndex != mostRecentHardScope) continue

            // Create renderer if not there
            if (renderer == null) {
                renderer = { column: null!, data: null! }
                renderer.column = createElement('div', 'environment-column')

                createElement('div', 'identifier-row', renderer.column)
                createElement('div', 'data-row', renderer.column)
                createElement('div', 'hole', renderer.column.children[1] as HTMLElement)

                renderer.data = createDataRenderer(data)
                renderer.column.children[1].children[0].append(renderer.data.element)

                this.dataRenderers[data.id] = renderer
            }

            if (this.scopeFiltered) {
                this.element.appendChild(renderer.column)
                appendedMemory.push([data, renderer.column, ccount])
            } else {
                this.hardScopeRenderers[scopeIndex].append(renderer.column)
                appendedMemory.push([data, renderer.column, ccount])
            }

            // Update read and writes
            if (ws.includes(data.id)) {
                renderer.data.element.classList.add('environment-write')
                renderer.data.element.classList.remove('environment-read')
            } else if (rs.includes(data.id)) {
                renderer.data.element.classList.add('environment-read')
                renderer.data.element.classList.remove('environment-write')
            } else {
                renderer.data.element.classList.remove('environment-write')
                renderer.data.element.classList.remove('environment-read')
            }

            hits.add(data.id)
            renderer.data.setState(data, frame)
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

        // Remove hard scope renderers that are no longer in the view
        if (!this.scopeFiltered) {
            const maxIndex = Math.max(...scopeIndexHits)
            for (let i = this.hardScopeRenderers.length - 1; i > 0; i--) {
                if (i > maxIndex) {
                    this.hardScopeRenderers[i].remove()
                    this.hardScopeRenderers.splice(i, 1)
                }
            }
        }
    }

    findRendererById(id: string): {
        data: DataRenderer
        column: HTMLElement
    } | null {
        let renderer = this.dataRenderers[id]

        if (renderer != null) {
            return renderer
        }

        for (const [containerId, containerRenderer] of Object.entries(this.dataRenderers)) {
            if (containerRenderer.data instanceof ArrayRenderer) {
                const item = containerRenderer.data.findRendererById(id)
                if (item != null) {
                    return item
                }
            }
        }

        return null
    }

    renderIdentifiers(frame: FrameInfo) {
        const { environment: state, stepId, overrideExecution } = frame

        // Hit test
        const hits = new Set()
        const dataHits = new Set()

        const step = Steps.get(stepId)
        const ws = writes(step.execution).map((w) => w.id)
        const rs = reads(step.execution).map((r) => r.id)

        let i = 0
        for (i = state.scope.length - 1; i >= 0; i--) {
            const scope = state.scope[i]

            for (const name of Object.keys(scope.bindings)) {
                const data = resolvePath(state, scope.bindings[name].location, null)
                const ref = resolvePath(state, scope.bindings[name].location, null, null, {
                    noResolvingReference: true,
                })
                let id = data.id

                if (ref.id != data.id && this.dataRenderers[ref.id] != null) {
                    id = ref.id
                }

                // console.log('Found', clone(state), name, data)
                const dataRenderer = this.dataRenderers[id]
                if (dataRenderer == null) continue // Ignore dangling references

                let renderer = this.identifierRenderers[`${name}@${i}`]
                if (renderer == null) {
                    renderer = new IdentifierRenderer()

                    dataRenderer.column.children[0].appendChild(renderer.element)

                    this.identifierRenderers[`${name}@${i}`] = renderer
                }

                // Update read and writes
                if (ws.includes(ref.id)) {
                    renderer.element.classList.add('identifier-write')
                    renderer.element.classList.remove('identifier-read')
                } else if (rs.includes(ref.id)) {
                    renderer.element.classList.add('identifier-read')
                    renderer.element.classList.remove('identifier-write')
                } else {
                    renderer.element.classList.remove('identifier-write')
                    renderer.element.classList.remove('identifier-read')
                }

                hits.add(`${name}@${i}`)
                dataHits.add(id)

                renderer.setState(scope.bindings[name])
            }

            // if (scope.type == ScopeType.Hard) {
            //     break
            // }
        }

        // Global scope
        // if (i > 0) {
        //     const scope = state.scope[0]

        //     for (const name of Object.keys(scope.bindings)) {
        //         const data = resolvePath(state, scope.bindings[name].location, null)
        //         const dataRenderer = this.dataRenderers[data.id]
        //         if (dataRenderer == null) continue // Ignore dangling references

        //         let renderer = this.identifierRenderers[`${name}@${i}`]
        //         if (renderer == null) {
        //             renderer = new IdentifierRenderer()
        //             dataRenderer.column.children[0].appendChild(renderer.element)

        //             this.identifierRenderers[`${name}@${i}`] = renderer
        //         }

        //         hits.add(`${name}@${i}`)
        //         dataHits.add(data.id)

        //         renderer.setState(scope.bindings[name])
        //     }
        // }

        // Remove hits that aren't used
        for (const [name, renderer] of Object.entries(this.identifierRenderers)) {
            if (!hits.has(name)) {
                renderer.destroy()
                renderer.element.remove()
                delete this.identifierRenderers[name]
            }
        }
    }

    renderResiduals(frame: FrameInfo) {
        const { environment: state, stepId, overrideExecution } = frame

        // Hit test
        const hits = new Set()

        // Remove data that is no longer in the view
        // TODO: Use hits to do this smartly
        for (let i = 0; i < this.residualRenderers.length; i++) {
            for (const [id, renderer] of Object.entries(this.residualRenderers[i])) {
                renderer.destroy()
                renderer.element.remove()
                delete this.residualRenderers[i][id]
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
                const hole = locationRenderer.element.parentElement!

                let residualRenderer = this.residualRenderers[time][`${time}-${residual.data.id}`]

                // Create renderer if not there
                if (residualRenderer == null) {
                    residualRenderer = createDataRenderer(residual.data)
                    hole.appendChild(residualRenderer.element)
                    residualRenderer.element.classList.add('is-residual')

                    this.residualRenderers[time][`${time}-${residual.data.id}`] = residualRenderer
                }

                hits.add(`${time}-${residual.data.id}`)
                residualRenderer.setState(residual.data, frame)
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

    getResidualOf(dataID: string, time: number): DataRenderer | IdentifierRenderer | null {
        if (time < 0) {
            return null
        }

        /* ------------------ Look in residual ------------------ */
        for (let i = time; i < this.residualRenderers.length; i++) {
            const residuals = this.residualRenderers[i]
            for (const [id, renderer] of Object.entries(residuals)) {
                if (id.split('-')[1] == dataID) {
                    return renderer
                }
            }
        }

        /* ----- Make sure there are no residuals after time ---- */

        /* ------------------ Look in data ------------------ */
        if (this.timestamps[dataID] >= time) {
            return null
        } else {
            return this.getAllChildRenderers()[dataID]
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
    secondaryFocus(dataIDs: Set<string>) {
        for (const [id, renderer] of Object.entries(this.getAllChildRenderers())) {
            if (dataIDs.has(id)) {
                renderer.secondaryFocus()
            }
        }
    }

    focus(dataIDs: Set<string>) {
        for (const [id, renderer] of Object.entries(this.getAllChildRenderers())) {
            if (dataIDs.has(id)) {
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

        this.dataRenderers = {}
        this.identifierRenderers = {}
        this.element = null!
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
            [DataType.Reference]: ReferenceRenderer,
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
                return !data.value!.toString().includes('[native code]')
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
                return !data.value!.toString().includes('[native code]')
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

export function getHardScopeGlobalIndex(target: DataState, state: EnvironmentState, isReference: boolean = false) {
    let foundScope: Scope | null = null
    let foundHardScopeIndex: number = -1

    for (let i = state.scope.length - 1; i > 0; i--) {
        const scope = state.scope[i]

        for (const name of Object.keys(scope.bindings)) {
            let data = resolvePath(state, scope.bindings[name].location, null)
            if (isReference) {
                data = resolvePath(state, scope.bindings[name].location, null, null, {
                    noResolvingReference: true,
                })
            }

            if (data.id == target.id) {
                foundScope = scope
                break
            }
        }

        if (foundScope != null && scope.type == ScopeType.Hard) {
            foundHardScopeIndex = i
            break
        }
    }

    if (foundHardScopeIndex != -1) {
        // Make sure it doesn't have a global binding
        for (let i = 0; i < foundHardScopeIndex; i++) {
            for (const name of Object.keys(state.scope[i].bindings)) {
                const data = resolvePath(state, state.scope[i].bindings[name].location, null)

                if (data.id == target.id) {
                    return i
                }
            }
        }
        return foundHardScopeIndex
    } else {
        return target.frame - 1
    }

    // Then it is not a bound value, use the frame
    if (foundHardScopeIndex == -1) {
        return target.frame - 1
    } else {
        // Return global scope by default
        return 0
    }
}

export function getHardScopeIndex(globalIndex: number, state: EnvironmentState) {
    let index = 0

    for (let i = 0; i < state.scope.length; i++) {
        if (state.scope[i].type == ScopeType.Hard) {
            index++
        }

        if (i == globalIndex) {
            return index
        }
    }

    return -1
}

function shouldRenderReference(state: EnvironmentState, data: DataState, reference: DataState) {
    // Only show ref in case of multiple references
    let refCounts: { [id: string]: number } = {}
    for (let k = state.scope.length - 1; k >= 0; k--) {
        const scope = state.scope[k]

        for (const name of Object.keys(scope.bindings)) {
            const d = resolvePath(state, scope.bindings[name].location, null, null)
            if (refCounts[d.id] == null) refCounts[d.id] = 0
            refCounts[d.id]++
        }
    }

    if (refCounts[data.id] == null) refCounts[data.id] = 0
    if (refCounts[data.id] <= 1) return false

    // Only show ref in case of some pointer to it
    let found = false
    for (let k = state.scope.length - 1; k >= 0; k--) {
        const scope = state.scope[k]
        for (const name of Object.keys(scope.bindings)) {
            const ref = resolvePath(state, scope.bindings[name].location, null, null, {
                noResolvingReference: true,
            })
            if (ref.id == reference.id) {
                found = true
                break
            }
        }
        if (found) break
    }
    if (!found) return false

    return true
}
