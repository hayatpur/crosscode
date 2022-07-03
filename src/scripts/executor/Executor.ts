import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { Pane } from 'tweakpane'
import { createEnvironment } from '../environment/environment'
import { EnvironmentState } from '../environment/EnvironmentState'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { Visualization } from '../renderer/Visualization/Visualization'
import { Compiler } from '../transpiler/Compiler'
import { getAST } from '../utilities/executor'

/* ------------------------------------------------------ */
/*            Executes and visualizes the code            */
/* ------------------------------------------------------ */
export class Executor {
    // Singleton
    static instance: Executor

    // Execution trace of user code
    execution!: ExecutionGraph

    // Visualization of execution
    visualization!: Visualization

    constructor() {
        // Singleton
        Executor.instance = this

        // Setup tweakpane
        setupTweakpane(this)
    }

    /* --------------------- Parameters --------------------- */
    PARAMS: {
        a: number
        b: number
        c: number
        d: number
    } = {
        a: 0.5,
        b: 0.5,
        c: 0.5,
        d: 0.5,
    }
    fpsGraph: any
}

/**
 * Resets executor to blank visualization.
 * @param executor Executor
 */
export function resetExecutor(executor: Executor) {
    executor.visualization?.destroy()
    executor.visualization = null
}

/**
 * Compiles user code and visualizes the execution.
 * @param executor Executor
 * @param code User code
 */
export function compileExecutor(executor: Executor, code: string) {
    /* ----------------- Reset visualization ---------------- */
    resetExecutor(executor)

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
        executor.execution = Compiler.compile(ast, env, {
            outputRegister: [],
            locationHint: [],
        })
    } catch (e) {
        console.warn(e)
        return
    }

    console.log('[Executor] Finished compiling ...')
    console.log('\tAnimation', executor.execution)
    console.log('\tEnvironment', env)

    executor.visualization = new Visualization(executor.execution)

    // TODO: Maintain layout from last time
}

/**
 * Sets up parameter tweaking and FPS indicator through tweakpane.
 * @param executor
 */
export function setupTweakpane(executor: Executor) {
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
