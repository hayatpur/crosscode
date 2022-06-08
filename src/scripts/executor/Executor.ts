import acorn = require('acorn')
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import * as ESTree from 'estree'
import { Pane } from 'tweakpane'
import { Editor } from '../editor/Editor'
import { createEnvironment } from '../environment/environment'
import { EnvironmentState } from '../environment/EnvironmentState'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { Visualization } from '../renderer/Visualization/Visualization'
import { Compiler } from '../transpiler/Compiler'

/* ------------------------------------------------------ */
/*            Executes and visualizes the code            */
/* ------------------------------------------------------ */
export class Executor {
    static instance: Executor = null

    editor: Editor = null

    // Dynamic execution of user code
    execution: ExecutionGraph

    // Visualization of execution
    visualization: Visualization
    fpsGraph: any

    firstCompilation = true

    constructor(editor: Editor) {
        // Singleton
        Executor.instance = this

        // General
        this.editor = editor

        // Live programming: update after 0.5s of no keyboard activity
        let typingTimer: number
        this.editor.onChangeContent.add(() => {
            clearTimeout(typingTimer)
            const delay = this.firstCompilation ? 500 : 5
            typingTimer = setTimeout(() => {
                this.compile()
            }, delay)

            this.firstCompilation = false
        })

        // Setup parameters
        this.setupParams()
    }

    /* --------------------- Compilation -------------------- */

    reset() {
        this.visualization?.destroy()
        this.visualization = undefined

        this.execution = null
    }

    compile() {
        // Reset visualization
        this.reset()

        // Construct static AST
        let ast: ESTree.Node = null
        try {
            ast = acorn.parse(this.editor.getValue(), {
                locations: true,
                ecmaVersion: 2017,
            }) as ESTree.Node
        } catch (e) {
            console.warn(e)
            return
        }

        // TODO: Check for runtime errors before visualizing code

        // Construct dynamic AST
        let env: EnvironmentState
        try {
            const env = createEnvironment()
            this.execution = Compiler.compile(ast, env, {
                outputRegister: [],
                locationHint: [],
            })
        } catch (e) {
            console.warn(e)
            return
        }

        console.log('[Executor] Finished compiling ...')
        console.log('\tAnimation', this.execution)
        console.log('\tEnvironment', env)

        this.visualization = new Visualization()
        this.visualization.createProgram(this.execution)

        // TODO: Maintain layout from last time
    }

    /* --------------------- Parameters --------------------- */

    PARAMS: {
        a: number
        b: number
        c: number
        d: number
        focus: boolean
        ms: number
        mx: number
        my: number
    } = {
        a: 0.5,
        b: 0.5,
        c: 0.5,
        d: 0.5,
        ms: 0.5,
        mx: 0.5,
        my: 0.5,
        focus: false,
    }

    setupParams() {
        const pane = new Pane({
            title: 'Info',
            expanded: true,
        })
        pane.registerPlugin(EssentialsPlugin)

        this.fpsGraph = pane.addBlade({
            view: 'fpsgraph',
            label: 'FPS',
            lineCount: 2,
        })

        const folder = pane.addFolder({
            title: 'Parameters',
            expanded: false,
        })
        for (const key of Object.keys(this.PARAMS)) {
            folder.addInput(this.PARAMS, key as any, {
                min: 0,
                max: 1,
            })
        }
    }
}
