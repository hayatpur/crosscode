import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { Pane } from 'tweakpane'
import { ApplicationState } from '../ApplicationState'
import { createEnvironment } from '../environment/environment'
import { EnvironmentState } from '../environment/EnvironmentState'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { createActionState, destroyAction } from '../renderer/Action/Action'
import { ActionMappingState, createActionMapping, destroyActionMapping } from '../renderer/Action/Mapping/ActionMapping'
import { createViewState, destroyView, ViewState } from '../renderer/View/View'
import { Compiler } from '../transpiler/Compiler'
import { createElement } from '../utilities/dom'
import { getAST } from '../utilities/executor'
import { createFocus, FocusState } from './Focus'

/* ------------------------------------------------------ */
/*             Displays execution information             */
/* ------------------------------------------------------ */
export type VisualizationState = {
    execution: ExecutionGraph | undefined
    mapping: ActionMappingState | undefined
    view: ViewState | undefined

    programId: string | undefined

    focus: FocusState | undefined

    container: HTMLElement

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
    const base: VisualizationState = {
        execution: undefined,
        mapping: undefined,
        view: undefined,
        programId: undefined,

        focus: createFocus(),

        container: createVisualContainer(),

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
        destroyView(visualization.view as ViewState)
    }

    if (visualization.programId != undefined) {
        const program = ApplicationState.actions[visualization.programId]
        destroyAction(program)
    }

    visualization.mapping = undefined
    visualization.view = undefined
    visualization.programId = undefined
    visualization.execution = undefined
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

    visualization.mapping = createActionMapping()
    visualization.container.appendChild(visualization.mapping.element)

    visualization.view = createViewState()

    const program = createActionState({
        execution: visualization.execution,
    })
    visualization.programId = program.id

    program.representation.postCreate()

    document.body.appendChild(program.element)

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

    // Update positions
    if (visualization.programId != undefined) {
        const program = ApplicationState.actions[visualization.programId]

        program.representation.updateSpatialActionProxyPosition({
            x: 35,
            y: 115,
        })
    }
}
