import acorn = require('acorn')
import * as ESTree from 'estree'
import { Pane } from 'tweakpane'
import { bake, reset } from '../animation/animation'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { Editor } from '../editor/Editor'
import { createPrototypicalEnvironment } from '../environment/environment'
import { Compiler } from '../transpiler/Compiler'
import { Ticker } from '../utilities/Ticker'
import { CodeQueryCreator } from '../view/Query/CodeQuery/CodeQueryCreator'
import { RootView } from '../view/Root/RootView'

export class Executor {
    static instance: Executor = null

    // Editor, the code editor
    editor: Editor = null

    // Animation, the dynamic analysis graph of code execution
    animation: AnimationGraph

    // View, the visual output
    rootView: RootView

    // Controller
    codeQueryCreator: CodeQueryCreator

    PARAMS: { a: number; b: number; c: number; d: number } = {
        a: 0.5,
        b: 0.5,
        c: 0.5,
        d: 0.5,
    }

    constructor(editor: Editor) {
        // Singleton
        Executor.instance = this

        // General
        this.editor = editor

        // Update after 0.5s of no keyboard activity
        let typingTimer: number
        this.editor.onChangeContent.add(() => {
            clearTimeout(typingTimer)
            typingTimer = setTimeout(this.compile.bind(this), 500)
        })

        // Bind update
        setTimeout(
            () => Ticker.instance.registerTick(this.tick.bind(this)),
            1000
        )

        // Global binding
        window['_executor'] = this

        // Create abstraction creator
        this.codeQueryCreator = new CodeQueryCreator()

        const pane = new Pane({
            title: 'Parameters',
            expanded: true,
        })

        for (const key of Object.keys(this.PARAMS)) {
            pane.addInput(this.PARAMS, key as any, {
                min: 0,
                max: 1,
            })
        }
    }

    reset() {
        this.animation = undefined
    }

    compile() {
        // Reset visualization
        this.reset()

        // Construct AST
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

        // Create animation from user code
        this.animation = Compiler.compile(
            ast,
            createPrototypicalEnvironment(),
            {
                outputRegister: [],
                locationHint: [],
            }
        )
        reset(this.animation)

        // Bake the animation
        bake(this.animation)

        // Compute the edges
        // computeAllGraphEdges(this.animation)

        console.log('[Executor] Finished compiling...')
        console.log('\tAnimation', this.animation)

        // const [output, url] = animationToString(
        //     this.animation,
        //     0,
        //     { first: false },
        //     true
        // )
        // console.log(url)
        this.rootView = new RootView()

        this.rootView.createView(this.animation, {
            expand: true,
            goToEnd: true,
            isRoot: true,
        })
    }

    tick(dt: number = 10) {
        if (this.animation == null) return
        this.rootView.tick(dt)
    }
}
