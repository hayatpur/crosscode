import { duration, seek } from '../animation/animation'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import {
    beginConcretePath,
    ConcretePath,
    createConcretePath,
    endConcretePath,
    seekConcretePath,
} from '../path/path'
import { getPathFromEnvironmentRepresentation } from '../representation/representation'
import { clone } from '../utilities/objects'
import { EnvironmentRenderer } from './EnvironmentRenderer'
import { PrototypicalEnvironmentState } from './EnvironmentState'

export interface AnimationRendererRepresentation {
    breakpoints: string[] // Animation ids that'll break into different environments
}

export class AnimationRenderer {
    // State
    animation: AnimationGraph | AnimationNode
    representation: AnimationRendererRepresentation = null
    time: number = 0
    paused: boolean = false
    speed: number = 1 / 128
    paths: { [id: string]: ConcretePath } = {}

    // Rendering
    environmentRenderers: EnvironmentRenderer[] = []
    environment: PrototypicalEnvironmentState = null
    element: HTMLDivElement = null

    constructor(animation: AnimationGraph | AnimationNode) {
        this.element = document.createElement('div')
        this.element.classList.add('animation-renderer')

        this.environmentRenderers.push(new EnvironmentRenderer())
        this.environmentRenderers.forEach((r) =>
            this.element.appendChild(r.element)
        )

        this.animation = animation
        this.environment = clone(this.animation.precondition)
    }

    tick(dt: number) {
        if (this.animation == null || this.paused) return

        if (this.time > duration(this.animation)) {
            // Loop
            this.time = 0
            this.environment = clone(this.animation.precondition)
            this.paths = {}
            return
        }

        if (!this.paused) this.time += dt * this.speed

        // Apply animation
        seek(this.animation, this.environment, this.time)

        for (const r of this.environmentRenderers) {
            r.setState(this.environment)
            this.propagateEnvironmentPaths(this.environment, r)
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
        Object.assign(
            path,
            getPathFromEnvironmentRepresentation(
                this.representation,
                path.prototype
            )
        )

        // Sync the timings of prototype path and concrete path
        if (!path.meta.isPlaying && path.prototype.meta.isPlaying) {
            beginConcretePath(path, environment, renderer)
        }

        if (!path.meta.hasPlayed && path.prototype.meta.hasPlayed) {
            endConcretePath(path, environment, renderer)
        }

        if (path.prototype.meta.isPlaying) {
            seekConcretePath(path, environment, renderer, path.prototype.meta.t)
        }
    }
}
