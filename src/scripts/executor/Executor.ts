import acorn = require('acorn')
import { bake, duration, reset, seek } from '../animation/animation'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { animationToString, computeAllGraphEdges } from '../animation/graph/graph'
import { Editor } from '../editor/Editor'
import { Compiler } from '../transpiler/Compiler'
import { clone } from '../utilities/objects'
import { Ticker } from '../utilities/Ticker'
import { RootViewRenderer } from '../view/RootViewRenderer'
import { createRootView, replaceRootViewWith } from '../view/view'
import { RootViewState } from '../view/ViewState'
import Timeline from './timeline/Timeline'

export class Executor {
    static instance: Executor = null

    // Editor component this operates on
    editor: Editor = null

    // Timeline controls
    time = 0
    paused = true

    // Global speed of the animation (higher is faster)
    speed = 1 / 64

    // Animation
    animation: AnimationGraph

    // View
    rootView: RootViewState
    rootViewRenderer: RootViewRenderer

    // Timeline
    timeline: Timeline

    constructor(editor: Editor) {
        // Singleton
        Executor.instance = this

        // General
        this.editor = editor

        this.timeline = new Timeline(this)

        // Update after 0.5s of no keyboard activity
        let typingTimer: number
        this.editor.onChangeContent.add(() => {
            clearTimeout(typingTimer)
            typingTimer = setTimeout(this.compile.bind(this), 500)
        })

        // Bind update
        setTimeout(() => Ticker.instance.registerTick(this.tick.bind(this)), 1000)

        // Play
        document.addEventListener('keypress', (e) => {
            if (e.key == '`') {
                this.paused = false
                this.time = 0
            }
        })
    }

    reset() {
        this.time = 0
        this.rootView = undefined
        this.animation = undefined

        this.rootViewRenderer?.destroy()
        this.rootViewRenderer = undefined
    }

    compile() {
        // console.clear();

        // Reset visualization
        this.reset()

        // Construct AST
        let ast = null

        try {
            ast = acorn.parse(this.editor.getValue(), { locations: true, ecmaVersion: 2017 })
        } catch (e) {
            console.error(e)
            return
        }

        // Create animation from user code
        this.animation = Compiler.compile(ast, createRootView(), { outputRegister: [], locationHint: [] })
        reset(this.animation)

        // Bake the animation
        bake(this.animation)

        // Compute the edges
        computeAllGraphEdges(this.animation)

        // Switch to transition level of abstraction
        // abstract(this.animation)

        // Initialize a view of animation
        this.rootView = createRootView()

        // Initialize a renderer
        this.rootViewRenderer = new RootViewRenderer()

        this.paused = false

        this.timeline.updateSections()

        console.log('[Executor] Finished compiling...')
        console.log('\tAnimation', this.animation)

        const [animationString, animationUrl] = animationToString(this.animation, 0, { first: false }, true)
        document.getElementById('nomnoml-button').onclick = () => {
            window.open(animationUrl, '_blank')
        }
    }

    tick(dt: number = 10) {
        if (this.animation == null || (dt > 0 && this.paused)) return

        if (this.time > duration(this.animation)) {
            // Loop
            this.time = 0
            this.rootViewRenderer.destroy()
            replaceRootViewWith(this.rootView, createRootView())
            this.rootViewRenderer = new RootViewRenderer()

            console.log('Re-running animation')
            console.log(clone(this.rootView).children.length)
            return
        }

        this.time += dt * this.speed
        this.timeline.seek(this.time)

        this.render()

        // Update renderer
        // this.viewRenderer.setState(this.view);
    }

    render() {
        // Apply animation
        console.log(clone(this.rootView).children.length)
        seek(this.animation, this.rootView, this.time)

        // Render
        this.rootViewRenderer.setState(this.rootView)
    }
}
