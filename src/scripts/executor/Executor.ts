import acorn = require('acorn')
import * as ESTree from 'estree'
import { bake, reset } from '../animation/animation'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'
import { createPrototypicalEnvironment } from '../environment/environment'
import { Compiler } from '../transpiler/Compiler'
import { Ticker } from '../utilities/Ticker'
import { RootView } from '../view/RootView'
import { View } from '../view/View'
import { AbstractionCreator } from './AbstractionCreator'

export class Executor {
    static instance: Executor = null

    // Editor, the code editor
    editor: Editor = null

    // Animation, the dynamic analysis graph of code execution
    animation: AnimationGraph

    // View, the visual output
    view: RootView

    // Controller
    abstractionCreator: AbstractionCreator

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
        this.abstractionCreator = new AbstractionCreator()
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

        this.view = new RootView()
    }

    tick(dt: number = 10) {
        if (this.animation == null) return

        this.view.tick(dt)
    }

    createAbstraction(animation: AnimationGraph | AnimationNode) {
        // 1. Create a time-agnostic abstraction over code

        // 2. Create a default abstraction that corresponds to t=0
        this.view.addView(new View(animation))
    }
}
