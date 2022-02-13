import { reads, writes } from '../animation/animation'
import {
    beginConcretePath,
    ConcretePath,
    createConcretePath,
    endConcretePath,
    seekConcretePath,
} from '../path/path'
import { getPathFromEnvironmentRepresentation } from '../representation/representation'
import { clone } from '../utilities/objects'
import { View } from '../view/View'
import { EnvironmentRenderer } from './EnvironmentRenderer'
import { PrototypicalEnvironmentState } from './EnvironmentState'

export interface AnimationRendererRepresentation {
    exclude: string[] | null // List of data ids to exclude from the representation, or null to include all
    include: string[] | null // List of data ids to include in the representation, or null to include all, prioritized over exclude
}

let ANIMATION_RENDERER_ID = 0

export class AnimationRenderer {
    id: string

    // State
    view: View
    representation: AnimationRendererRepresentation = null

    paths: { [id: string]: ConcretePath } = {}

    // Rendering
    preEnvironmentRenderer: EnvironmentRenderer
    environmentRenderer: EnvironmentRenderer
    postEnvironmentRenderer: EnvironmentRenderer

    environment: PrototypicalEnvironmentState = null
    element: HTMLDivElement = null

    preRendererElement: HTMLDivElement = null
    postRendererElement: HTMLDivElement = null

    showingPostRenderer: boolean = true
    showingPreRenderer: boolean = false

    constructor(view: View) {
        this.id = `AR(${ANIMATION_RENDERER_ID++})`

        this.element = document.createElement('div')
        this.element.classList.add('animation-renderer')

        this.preRendererElement = document.createElement('div')
        this.preRendererElement.classList.add('animation-renderers-pre')
        this.element.appendChild(this.preRendererElement)

        this.postRendererElement = document.createElement('div')
        this.postRendererElement.classList.add('animation-renderers-post')
        this.element.appendChild(this.postRendererElement)

        this.environmentRenderer = new EnvironmentRenderer()
        this.element.appendChild(this.environmentRenderer.element)

        this.postEnvironmentRenderer = new EnvironmentRenderer()
        this.postRendererElement.appendChild(
            this.postEnvironmentRenderer.element
        )

        this.preEnvironmentRenderer = new EnvironmentRenderer()
        this.preRendererElement.appendChild(this.preEnvironmentRenderer.element)

        this.view = view
        this.environment = clone(this.view.transitionAnimation.precondition)

        // Create representations
        this.updateRepresentation()
    }

    select(selection: Set<string>) {
        this.environmentRenderer.select(selection)
    }

    deselect(deselection: Set<string>) {
        this.environmentRenderer.deselect(deselection)
    }

    updateRepresentation() {
        this.representation = {
            exclude: null,
            include: [
                ...reads(this.view.originalAnimation).map((r) => r.id),
                ...writes(this.view.originalAnimation).map((w) => w.id),
            ],
        }
    }

    destroy() {
        this.environmentRenderer.destroy()
        this.postEnvironmentRenderer.destroy()
        this.element.remove()
    }

    update() {
        // console.trace(
        //     'Updating animation renderer',
        //     clone(this.view.renderer.animationRenderer.environment)
        // )

        // Update the environment
        this.environmentRenderer.setState(this.environment, this.representation)
        this.propagateEnvironmentPaths(
            this.environment,
            this.environmentRenderer
        )
        this.environmentRenderer.setState(this.environment, this.representation)

        // Update the post environment
        if (this.showingPostRenderer) {
            this.postEnvironmentRenderer.setState(
                this.view.transitionAnimation.postcondition,
                this.representation
            )

            const bbox = this.postRendererElement.getBoundingClientRect()
            this.element.style.minWidth = `${bbox.width}px`
            this.element.style.minHeight = `${bbox.height - 10}px`
        }

        if (this.showingPreRenderer) {
            this.preEnvironmentRenderer.setState(
                this.view.transitionAnimation.precondition,
                this.representation
            )
        }
    }

    propagateEnvironmentPaths(
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer
    ) {
        // Hit test
        const hits = new Set()

        for (const id of Object.keys(environment.paths)) {
            const prototype = environment.paths[id]
            let concrete = this.paths[id]

            if (concrete == null) {
                // Need to create a path in the concrete environment
                concrete = createConcretePath(prototype)
                this.paths[id] = concrete
            }

            hits.add(id)
            this.propagatePath(concrete, environment, renderer)
        }

        // Remove paths that are no longer in the view
        for (const id of Object.keys(this.paths)) {
            if (!hits.has(id)) {
                console.log(this.paths[id])
                endConcretePath(this.paths[id], environment, renderer)
                delete this.paths[id]
            }
        }
    }

    showTrace() {
        this.preRendererElement.classList.add('visible')
        this.showingPreRenderer = true

        this.update()
    }

    hideTrace() {
        this.preRendererElement.classList.remove('visible')
        this.showingPreRenderer = false

        this.update()
    }

    tick(dt: number) {}

    propagatePath(
        path: ConcretePath,
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer
    ) {
        const representation = getPathFromEnvironmentRepresentation(
            this.representation,
            path.prototype
        )

        path.onBegin = representation.onBegin
        path.onEnd = representation.onEnd
        path.onSeek = representation.onSeek

        console.log(clone(path.meta), clone(path.prototype.meta))

        // Sync the timings of prototype path and concrete path
        if (!path.meta.isPlaying && path.prototype.meta.isPlaying) {
            beginConcretePath(path, environment, renderer)
            path.meta.isPlaying = true
        } else if (path.prototype.meta.isPlaying) {
            seekConcretePath(path, environment, renderer, path.prototype.meta.t)
        }

        if (!path.meta.hasPlayed && path.prototype.meta.hasPlayed) {
            endConcretePath(path, environment, renderer)
            path.meta.hasPlayed = true
        }
    }
}
