import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { Pane } from 'tweakpane'
import { Editor } from '../editor/Editor'
import { createEnvironment } from '../environment/environment'
import { EnvironmentState } from '../environment/EnvironmentState'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import {
    ActionState,
    createActionState,
    destroyAction,
} from '../renderer/Action/Action'
import {
    ActionMappingState,
    createActionMapping,
    destroyActionMapping,
} from '../renderer/Action/Mapping/ActionMapping'
import { createViewState, destroyView, ViewState } from '../renderer/View/View'
import { Compiler } from '../transpiler/Compiler'
import { createElement } from '../utilities/dom'
import { getAST } from '../utilities/executor'

/* ------------------------------------------------------ */
/*             Displays execution information             */
/* ------------------------------------------------------ */
export interface VisualizationState {
    execution: ExecutionGraph | undefined
    mapping: ActionMappingState | undefined
    view: ViewState | undefined
    program: ActionState | undefined

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
export function createVisualization(
    overrides: Partial<VisualizationState> = {}
): VisualizationState {
    const base: VisualizationState = {
        execution: undefined,
        mapping: undefined,
        view: undefined,
        program: undefined,

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

    if (visualization.program != undefined) {
        destroyAction(visualization.program as ActionState)
    }

    visualization.mapping = undefined
    visualization.view = undefined
    visualization.program = undefined
    visualization.execution = undefined
}

/**
 * @returns A container element for the visualization.
 */
export function createVisualContainer(): HTMLElement {
    const el = createElement('div', 'visualization-container', document.body)
    const margin = Editor.instance.getMaxWidth() + 70

    el.style.left = `${margin}px`
    return el
}

/**
 * Compiles user code and visualizes the execution.
 * @param visualization Visualization state
 * @param code User code
 */
export function compileVisualization(
    visualization: VisualizationState,
    code: string
) {
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

    visualization.program = createActionState({
        execution: visualization.execution,
    })

    document.body.appendChild(visualization.program.element)

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
export function tickVisualization(
    visualization: VisualizationState,
    dt: number
) {
    const margin = Editor.instance.getMaxWidth() + 70
    if (prevMargin != margin) {
        visualization.container.style.left = `${margin}px`
    }

    prevMargin = margin
}