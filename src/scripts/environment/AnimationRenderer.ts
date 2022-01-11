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

export class AnimationRenderer {
    // State
    view: View
    representation: AnimationRendererRepresentation = null

    paths: { [id: string]: ConcretePath } = {}

    // Rendering
    environmentRenderers: EnvironmentRenderer[] = []
    finalEnvironmentRenderers: EnvironmentRenderer[] = []

    environment: PrototypicalEnvironmentState = null
    element: HTMLDivElement = null

    finalRenderersElement: HTMLDivElement = null

    showingFinalRenderers: boolean = false

    constructor(view: View) {
        this.element = document.createElement('div')
        this.element.classList.add('animation-renderer')

        this.finalRenderersElement = document.createElement('div')
        this.finalRenderersElement.classList.add('animation-renderers-final')
        this.element.appendChild(this.finalRenderersElement)

        this.environmentRenderers.push(new EnvironmentRenderer())
        this.environmentRenderers.forEach((r) =>
            this.element.appendChild(r.element)
        )

        this.finalEnvironmentRenderers.push(new EnvironmentRenderer())
        this.finalEnvironmentRenderers.forEach((r) =>
            this.finalRenderersElement.appendChild(r.element)
        )

        this.view = view
        this.environment = clone(this.view.transitionAnimation.precondition)

        // Create representations
        this.updateRepresentation()
    }

    updateRepresentation() {
        this.representation = {
            exclude: null,
            include: [
                ...reads(this.view.transitionAnimation).map((r) => r.id),
                ...writes(this.view.transitionAnimation).map((w) => w.id),
            ],
        }
    }

    destroy() {
        this.environmentRenderers.forEach((r) => r.destroy())
        this.finalEnvironmentRenderers.forEach((r) => r.destroy())
        this.element.remove()
    }

    update() {
        for (const r of this.environmentRenderers) {
            r.setState(this.environment, this.representation)
            this.propagateEnvironmentPaths(this.environment, r)
        }

        if (this.showingFinalRenderers) {
            for (const r of this.finalEnvironmentRenderers) {
                r.setState(
                    this.view.transitionAnimation.postcondition,
                    this.representation
                )
            }

            const bbox = this.finalRenderersElement.getBoundingClientRect()
            this.element.style.minWidth = `${bbox.width}px`
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
        for (const id in Object.keys(environment.paths)) {
            if (!hits.has(id)) {
                delete environment.paths[id]
            }
        }
    }

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
