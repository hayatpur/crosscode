import acorn = require('acorn')
import {
    bake,
    currentAbstraction,
    duration,
    reset,
    seek,
} from '../animation/animation'
import {
    AbstractionSelection,
    generateCurrentSelection,
} from '../animation/graph/abstraction/Abstractor'
import { applyTransition } from '../animation/graph/abstraction/Transition'
import {
    AnimationGraph,
    instanceOfAnimationGraph,
} from '../animation/graph/AnimationGraph'
import {
    animationToString,
    computeAllGraphEdges,
    queryAnimationGraph,
} from '../animation/graph/graph'
import { ChunkNodeData } from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'
import { propagateRoot } from '../environment/layout'
import { Compiler } from '../transpiler/Compiler'
import { Keyboard } from '../utilities/Keyboard'
import { getNumericalValueOfStyle } from '../utilities/math'
import { clone } from '../utilities/objects'
import { Ticker } from '../utilities/Ticker'
import { RootViewRenderer } from '../view/RootViewRenderer'
import {
    createRootView,
    replaceRootViewWith,
    generateViews,
} from '../view/view'
import { RootViewState } from '../view/ViewState'
import { AbstractionCreator } from './AbstractionCreator'
import Timeline from './timeline/Timeline'

export class Executor {
    static instance: Executor = null

    // Editor component this operates on
    editor: Editor = null

    // Timeline controls
    time = 0
    paused = true

    // Global speed of the animation (higher is faster)
    speed = 1 / 128

    // Animation
    animation: AnimationGraph

    // View
    rootView: RootViewState
    rootViewRenderer: RootViewRenderer

    // Timeline
    timeline: Timeline

    abstractionCreator: AbstractionCreator

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
        setTimeout(
            () => Ticker.instance.registerTick(this.tick.bind(this)),
            1000
        )

        // Play
        document.addEventListener('keypress', (e) => {
            if (e.key == '`') {
                this.paused = false
                this.time = 0
            }
        })

        window['_executor'] = this

        // Create abstraction creator
        this.abstractionCreator = new AbstractionCreator()
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
            ast = acorn.parse(this.editor.getValue(), {
                locations: true,
                ecmaVersion: 2017,
            })
        } catch (e) {
            console.error(e)
            return
        }

        // Create animation from user code
        this.animation = Compiler.compile(ast, createRootView(), {
            outputRegister: [],
            locationHint: [],
        })
        reset(this.animation)

        // Bake the animation
        bake(this.animation)

        // Compute the edges
        computeAllGraphEdges(this.animation)

        // Switch to transition level of abstraction
        // applyTransition(this.animation, [
        //     ...this.animation.abstractions[0].vertices.map((v) => [v.id]),
        // ])

        // Initialize a view of animation
        this.rootView = createRootView()
        this.rootView.animation = this.animation
        generateViews(this.rootView)

        // Initialize a renderer
        this.rootViewRenderer = new RootViewRenderer()

        this.paused = false

        this.timeline.updateSections()

        console.log('[Executor] Finished compiling...')
        console.log('\tAnimation', this.animation)

        document.getElementById('nomnoml-button').onclick = () => {
            const [animationString, animationUrl] = animationToString(
                this.animation,
                0,
                { first: false },
                true
            )
            console.log(animationString)
            window.open(animationUrl, '_blank')
        }
    }

    tick(dt: number = 10) {
        if (this.animation == null) return

        this.render()
    }

    render() {
        // Apply animation
        // seek(this.animation, this.rootView, this.time)

        // Render
        this.rootView.animation = this.animation
        this.rootViewRenderer.setState(this.rootView)
    }

    increaseAbstraction(chunkId: string) {
        if (this.animation == null) return
    }

    decreaseAbstraction(chunkId: string) {
        if (this.animation == null) return

        console.log(chunkId)

        const chunk = queryAnimationGraph(
            this.animation,
            (v) => v.id == chunkId
        ) // Get chunk
        const parent = queryAnimationGraph(
            this.animation,
            (v) =>
                instanceOfAnimationGraph(v) &&
                currentAbstraction(v).vertices.some((c) => c.id == chunkId)
        ) // Get chunk parent

        const parentSelection = generateCurrentSelection(parent)
        const chunkSelection = (chunk.nodeData as ChunkNodeData).selection

        const newSelection: AbstractionSelection = []

        // console.log(newSelection, chunkSelection, parentSelection)

        for (const part of parentSelection) {
            if (JSON.stringify(part) == JSON.stringify(chunkSelection)) {
                // Break up chunk
                if (chunkSelection.length == 1) {
                    const nodeId = chunkSelection[0]
                    const node = (
                        parent as AnimationGraph
                    ).abstractions[0].vertices.find((v) => v.id == nodeId)

                    // No longer chunk the node
                    if (instanceOfAnimationGraph(node)) {
                        console.log([
                            node.abstractions[0].vertices.map((v) => v.id),
                        ])

                        newSelection.push({
                            id: nodeId,
                            selection: node.abstractions[0].vertices.map(
                                (v) => [v.id]
                            ),
                        })
                    } else {
                        newSelection.push({
                            id: nodeId,
                            selection: null,
                        })
                    }
                } else {
                    chunkSelection.forEach((c) => newSelection.push([c]))
                }
            } else {
                newSelection.push(part)
            }
        }

        console.log(newSelection)

        // Reset
        this.time = 0
        this.rootViewRenderer.destroy()
        replaceRootViewWith(this.rootView, createRootView())
        this.rootViewRenderer = new RootViewRenderer()
        this.timeline.destroySections()

        applyTransition(parent, newSelection)

        generateViews(this.rootView)

        this.timeline.updateSections()

        this.render()
    }

    createAbstraction(chunkId: string) {
        this.rootView.chunkIds.push(chunkId)
    }
}

const is_key_down = (() => {
    const state = {}

    window.addEventListener('keyup', (e) => (state[e.key] = false))
    window.addEventListener('keydown', (e) => (state[e.key] = true))

    return (key) => (state.hasOwnProperty(key) && state[key]) || false
})()
