import acorn = require('acorn')
import * as ESTree from 'estree'
import { Pane } from 'tweakpane'
import { Editor } from '../editor/Editor'
import { createEnvironment } from '../environment/environment'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { Visualization } from '../renderer/Visualization/Visualization'
import { Compiler } from '../transpiler/Compiler'
import { Ticker } from '../utilities/Ticker'

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

    constructor(editor: Editor) {
        // Singleton
        Executor.instance = this

        // General
        this.editor = editor

        // Live programming: update after 0.5s of no keyboard activity
        let typingTimer: number
        this.editor.onChangeContent.add(() => {
            clearTimeout(typingTimer)
            typingTimer = setTimeout(this.compile.bind(this), 500)
        })

        // Bind update (delay to make sure the editor has finished loading)
        setTimeout(() => Ticker.instance.registerTick(this.tick.bind(this)), 1000)

        // Setup parameters
        this.setupParams()
    }

    /* --------------------- Compilation -------------------- */

    reset() {
        this.execution = null

        this.visualization?.destroy()
        this.visualization = undefined
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
            console.error(e)
            return
        }

        // TODO: Check for runtime errors before visualizing code

        // Construct dynamic AST
        const env = createEnvironment()
        this.execution = Compiler.compile(ast, env, {
            outputRegister: [],
            locationHint: [],
        })

        console.log('[Executor] Finished compiling ...')
        console.log('\tAnimation', this.execution)
        console.log('\tEnvironment', env)

        // const [output, url] = animationToString(this.execution, 0, { first: false }, true)
        // console.log(url)
        this.visualization = new Visualization(this.execution)

        // TODO: Maintain layout from last time
    }

    /* ------------------------ Tick ------------------------ */

    tick(dt: number = 10) {
        if (this.execution == null) return
    }

    /* --------------------- Parameters --------------------- */

    PARAMS: { a: number; b: number; c: number; d: number } = {
        a: 0.5,
        b: 0.5,
        c: 0.5,
        d: 0.5,
    }

    setupParams() {
        const pane = new Pane({
            title: 'Parameters',
            expanded: false,
        })

        for (const key of Object.keys(this.PARAMS)) {
            pane.addInput(this.PARAMS, key as any, {
                min: 0,
                max: 1,
            })
        }
    }
}
