import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { Pane } from 'tweakpane'
import { ApplicationState } from '../ApplicationState'
import { createEnvironment } from '../environment/environment'
import { EnvironmentState } from '../environment/EnvironmentState'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { destroyAbyssCleanup } from '../renderer/Action/Abyss'
import { createActionState, destroyAction } from '../renderer/Action/Action'
import { ActionMappingState, createActionMapping, destroyActionMapping } from '../renderer/Action/Mapping/ActionMapping'
import { ControlFlowState, updateControlFlowState } from '../renderer/Action/Mapping/ControlFlowState'
import { createViewState, destroyView, setViewFrames, updateView, ViewState } from '../renderer/View/View'
import { Compiler } from '../transpiler/Compiler'
import { createElement } from '../utilities/dom'
import { getAST } from '../utilities/executor'
import { Mouse } from '../utilities/Mouse'
import { createSelection, destroySelection, SelectionState, updateSelectionTime } from './Selection'

/* ------------------------------------------------------ */
/*             Displays execution information             */
/* ------------------------------------------------------ */
export type VisualizationState = {
    execution: ExecutionGraph | undefined
    mapping: ActionMappingState | undefined
    view: ViewState | undefined

    programId: string | undefined

    selections: { [key: string]: SelectionState }

    container: HTMLElement
    allViewsContainer: HTMLElement

    // Tweakpane
    PARAMS: {
        a: number
        b: number
        c: number
        d: number
    }
    fpsGraph: any
}

/**
 * Creates an executor.
 * @param overrides
 * @returns
 */
export function createVisualization(overrides: Partial<VisualizationState> = {}): VisualizationState {
    const container = createVisualContainer()
    const allViewsContainer = createElement('div', 'all-views-container', container)

    const selections = {}

    const base: VisualizationState = {
        execution: undefined,
        mapping: undefined,
        view: undefined,
        programId: undefined,

        selections: selections,

        container,
        allViewsContainer,

        PARAMS: {
            a: 0.5,
            b: 0.5,
            c: 0.5,
            d: 0.5,
        },
        fpsGraph: undefined,
    }

    return { ...base, ...overrides }
}

/**
 * Resets visualization to blank visualization.
 * @param visualization Visualization state
 */
export function resetVisualization(visualization: VisualizationState) {
    if (visualization.mapping != undefined) {
        destroyActionMapping(visualization.mapping)
    }

    if (visualization.view != undefined) {
        destroyView(visualization.view)
    }

    if (visualization.programId != undefined) {
        const program = ApplicationState.actions[visualization.programId]
        destroyAction(program)
    }

    for (const [id, selection] of Object.entries(visualization.selections)) {
        destroySelection(selection)
    }

    for (const [id, action] of Object.entries(ApplicationState.actions)) {
        destroyAction(action)
    }
    ApplicationState.actions = {}

    for (const [id, abyss] of Object.entries(ApplicationState.abysses)) {
        destroyAbyssCleanup(abyss)
    }
    ApplicationState.abysses = {}

    for (const traceIndicator of ApplicationState.traceIndicators) {
        traceIndicator.trace.remove()
        traceIndicator.source.remove()
    }
    ApplicationState.traceIndicators = []

    // visualization.container?.remove()
    // visualization.allViewsContainer?.remove()

    visualization.mapping = undefined
    visualization.programId = undefined
    visualization.execution = undefined
    visualization.view = undefined
}

/**
 * @returns A container element for the visualization.
 */
export function createVisualContainer(): HTMLElement {
    const el = createElement('div', 'visualization-container', document.body)
    const margin = ApplicationState.editor.getMaxWidth() + 70

    el.style.left = `${margin}px`
    return el
}

/**
 * Compiles user code and visualizes the execution.
 * @param visualization Visualization state
 * @param code User code
 */
export function compileVisualization(visualization: VisualizationState, code: string) {
    /* ----------------- Reset visualization ---------------- */
    resetVisualization(visualization)

    // Construct static AST
    let { ast, errors } = getAST(code)
    if (ast == null || errors.length > 0) {
        console.warn(errors)
        return
    }

    // Construct dynamic AST
    let env: EnvironmentState
    try {
        env = createEnvironment()
        visualization.execution = Compiler.compile(ast, env, {
            outputRegister: [],
            locationHint: [],
        })
    } catch (e) {
        console.warn(e)
        return
    }

    console.log('[Executor] Finished compiling ...')
    console.log('\tAnimation', visualization.execution)
    console.log('\tEnvironment', env)

    const mainSelection = createSelection({}, true)
    visualization.selections[mainSelection.id] = mainSelection

    visualization.mapping = createActionMapping()
    visualization.container.appendChild(visualization.mapping.element)

    visualization.container.appendChild(visualization.allViewsContainer)

    const program = createActionState({
        execution: visualization.execution,
    })
    visualization.programId = program.id

    program.representation.postCreate()
    document.body.appendChild(program.element)

    visualization.view = createViewState()
    visualization.allViewsContainer.appendChild(visualization.view.container)

    // TODO: Maintain layout from last time
}

/**
 * Sets up parameter tweaking and FPS indicator through tweakpane.
 * @param executor
 */
export function setupTweakpane(executor: VisualizationState) {
    const pane = new Pane({
        title: 'Info',
        expanded: true,
    })
    pane.registerPlugin(EssentialsPlugin)

    executor.fpsGraph = pane.addBlade({
        view: 'fpsgraph',
        label: 'FPS',
        lineCount: 2,
    })

    const folder = pane.addFolder({
        title: 'Parameters',
        expanded: false,
    })

    for (const key of Object.keys(executor.PARAMS)) {
        folder.addInput(executor.PARAMS, key as any, {
            min: 0,
            max: 1,
        })
    }
}

let prevMargin = 0
export function tickVisualization(visualization: VisualizationState, dt: number) {
    // Update margin
    const margin = ApplicationState.editor.getMaxWidth() + 70
    if (prevMargin != margin) {
        visualization.container.style.left = `${margin}px`
    }

    prevMargin = margin

    // Update action mapping width
    if (visualization.mapping != null) {
        const childrenRight = Array.from(visualization.mapping.element.childNodes)
            .filter((el) => (el as HTMLElement).classList.contains('action-proxy-container'))
            .map((el) => (el as HTMLElement).getBoundingClientRect().right)
        const maxRight = Math.max(...childrenRight) + 50
        const minWidth = maxRight - visualization.mapping.element.getBoundingClientRect().left

        if (visualization.mapping.element.style.minWidth != `${minWidth}px`) {
            visualization.mapping.element.style.minWidth = `${minWidth}px`
        }
    }

    if (visualization.programId == null) return

    // Update positions
    const program = ApplicationState.actions[visualization.programId]

    program.representation.updateSpatialActionProxyPosition({
        x: 35,
        y: 115,
    })

    // Update selections
    for (const selectionId of Object.keys(visualization.selections)) {
        updateSelectionTime(selectionId)
    }

    // Update spatial control flow
    let forceUpdate = false
    for (const actionId of Object.keys(ApplicationState.actions)) {
        const action = ApplicationState.actions[actionId]
        if (action.isSpatial) {
            forceUpdate = updateControlFlowState(action.controlFlow as ControlFlowState, forceUpdate)
        }
    }

    // Update dirty frames
    for (const [id, action] of Object.entries(ApplicationState.actions)) {
        if (action.isSpatial && action.representation.dirtyFrames) {
            const program = ApplicationState.actions[visualization.programId!]
            setViewFrames(
                visualization.view!,
                program.representation.getFrames(),
                program.execution.precondition as EnvironmentState
            )
            updateView(visualization.view!)

            action.representation.dirtyFrames = false
        }
    }

    // Update view
    updateView(visualization.view!)

    // Update indicators
    for (const indicator of ApplicationState.traceIndicators) {
        const mouse = { ...Mouse.instance.position }
        const rect = indicator.trace.getBoundingClientRect()

        const distance = (mouse.x - rect.x - rect.width / 2) ** 2 + (mouse.y - rect.y - rect.height / 2) ** 2
        if (distance < 500) {
            indicator.trace.classList.add('is-enabled')
            indicator.source.classList.add('is-enabled')
        } else {
            indicator.trace.classList.remove('is-enabled')
            indicator.source.classList.remove('is-enabled')
        }
    }

    // for (const [id, action] of Object.entries(ApplicationState.actions)) {
    //     if (action.isSpatial) {
    //     }
    // }

    // Update view

    // Sync all cursors
    // for (const actionId of Object.keys(ApplicationState.actions)) {
    //     const action = ApplicationState.actions[actionId]
    //     if (action.isSpatial) {
    //         syncCursor(action)
    //     }
    // }
}
