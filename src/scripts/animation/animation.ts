import { EnvironmentState } from '../environment/EnvironmentState'
import { TransitionAnimationNode } from '../execution/graph/abstraction/Transition'

export enum AnimationPlayback {
    Normal = 'Normal',
    WithPrevious = 'WithPrevious',
}

export interface AnimationOptions {
    playback?: AnimationPlayback
    delay?: number

    // Length of animation
    duration?: number
    speedMultiplier?: number
}

export interface PlayableAnimation {
    // Playback state
    isPlaying: boolean
    hasPlayed: boolean

    // Playback options
    speed: number
    delay: number

    ease: (t: number) => number
}

export interface AnimationNode extends PlayableAnimation {
    _type: 'AnimationNode'

    name: string // Name of animation
    id: string

    baseDuration: number

    onBegin: (animation: AnimationNode, view: EnvironmentState) => void
    onSeek: (animation: AnimationNode, view: EnvironmentState, time: number) => void
    onEnd: (animation: AnimationNode, view: EnvironmentState) => void
}

export interface AnimationGraph extends PlayableAnimation {
    // Meta info
    _type: 'AnimationGraph'
    id: string

    // Animation info
    vertices: (AnimationGraph | AnimationNode)[]
    isParallel: boolean
    parallelStarts: number[]
}

export function instanceOfAnimationNode(animation: any): animation is AnimationNode {
    return animation._type == 'AnimationNode'
}

export function createAnimationNode(options: AnimationOptions = {}): AnimationNode {
    if (this.id == undefined) this.id = 0

    return {
        _type: 'AnimationNode',
        name: 'Animation Node',

        id: `AN(${++this.id})`,
        delay: options.delay ?? 10,
        isPlaying: false,
        hasPlayed: false,
        speed: 1,
        baseDuration: options.duration ?? 20,

        ease: (t) => ParametricBlend(t),

        onBegin: () => console.warn('[AnimationNode] Non-implemented on begin callback'),
        onSeek: () => console.warn('[AnimationNode] Non-implemented on seek callback'),
        onEnd: () => console.warn('[AnimationNode] Non-implemented on end callback'),
    }
}

export function createAnimationGraph(): AnimationGraph {
    if (this.id == undefined) this.id = 0

    return {
        // Meta info
        _type: 'AnimationGraph',
        id: `AG(${++this.id})`,

        // Invariant to abstraction info
        isPlaying: false,
        hasPlayed: false,
        speed: 1,
        delay: 0,

        ease: (t) => ParametricBlend(t),

        vertices: [],
        isParallel: false,
        parallelStarts: [],
    }
}

function ParametricBlend(t: number) {
    const sqt = t * t
    return sqt / (2.0 * (sqt - t) + 1.0)
}

/**
 * Computes and returns the duration of an animation.
 *
 * @TODO Speed multiplier for parallel animations
 *
 * @param animation - Animation graph or node to compute duration for
 * @returns Duration of animation
 */
export function duration(animation: AnimationGraph | AnimationNode): number {
    // Return the base duration of the animation adjust by speed if it is a node
    if (instanceOfAnimationNode(animation)) {
        return animation.baseDuration * (1 / animation.speed)
    }

    const abstraction = animation

    // If a parallel animation, return the end point of the longest animation vertex
    if (abstraction.isParallel && abstraction.parallelStarts[0] != undefined) {
        const ends = abstraction.parallelStarts.map(
            (start, i) => start + duration(abstraction.vertices[i]) + abstraction.vertices[i].delay
        )
        return Math.max(...ends)
    }
    // Else return the sum of all durations
    else {
        let baseDuration = 0
        for (const vertex of abstraction.vertices) {
            if (vertex == null) continue
            baseDuration += duration(vertex) + vertex.delay
        }
        return baseDuration * (1 / animation.speed)
    }
}

/**
 * Begin an animation, or animation node. If animation node, invoke it's onBegin callback.
 * @param animation - Animation to start
 * @param view - View to apply the animation on
 */
export function begin(animation: AnimationGraph | AnimationNode, environment: EnvironmentState) {
    if (instanceOfAnimationNode(animation)) {
        animation.onBegin(animation, environment)
    }
}

/**
 * End an animation, or animation node. If animation node, invoke it's onBegin callback.
 * @param animation - Animation to end
 * @param view - View to apply the animation on
 * @param options - Mostly used for setting flags to bake animation
 */
export function end(animation: AnimationGraph | AnimationNode, environment: EnvironmentState) {
    if (instanceOfAnimationNode(animation)) {
        animation.onEnd(animation, environment)
    } else {
        for (const vertex of animation.vertices) {
            if (vertex.isPlaying) {
                end(vertex, environment)
                vertex.isPlaying = false
                vertex.hasPlayed = true
            }
        }
    }
}

/**
 * Seek into a specific time in an animation. If animation node, invoke it's onSeek callback.
 * @param animation - Animation to into
 * @param view - View to apply the animation on
 * @param time - Time at which to seek
 * @param options - Mostly used for setting flags to bake animation
 */
export function seek(
    animation: AnimationGraph | AnimationNode,
    environment: EnvironmentState,
    time: number
) {
    if (instanceOfAnimationNode(animation)) {
        animation.onSeek(animation, environment, time)
        return
    }

    const abstraction = animation

    // Keep track of the start time (for sequential animations)
    let start = 0

    // Loop through each child vertex and seek into it
    for (let i = 0; i < abstraction.vertices.length; i++) {
        if (abstraction.vertices[i] == null) continue

        const vertex = abstraction.vertices[i]

        start += vertex.delay

        // If parallel animation, override with parallel start time
        if (abstraction.isParallel) {
            start = abstraction.parallelStarts[i] + vertex.delay
        }

        // If the animation should be playing
        const shouldBePlaying = time >= start && time < start + duration(vertex)

        // Reverse this animation
        // if (time < start + duration(vertex) && vertex.hasPlayed) {
        //     restoreInitialState(vertex, view)
        //
        //

        //     vertex.hasPlayed = false

        //     if (time >= start) {
        //         begin(vertex, view, options)
        //         seek(vertex, view, time - start, options)
        //         vertex.isPlaying = true
        //     } else if (time < start) {
        //         vertex.isPlaying = false
        //     }
        // }

        // End animation
        if (vertex.isPlaying && !shouldBePlaying) {
            // Before ending, seek into the animation at it's end time
            seek(vertex, environment, duration(vertex))
            end(vertex, environment)

            if (instanceOfAnimationNode(vertex)) {
                console.log(`[${~~time}ms] ${vertex.name}`)
            }

            vertex.hasPlayed = true
            vertex.isPlaying = false
        }

        let begunThisFrame = false

        // Begin animation
        if (!vertex.isPlaying && shouldBePlaying) {
            begin(vertex, environment)
            vertex.isPlaying = true
            begunThisFrame = true
        }

        // Skip over this animation
        if (time >= start + duration(vertex) && !vertex.isPlaying && !vertex.hasPlayed) {
            begin(vertex, environment)
            vertex.isPlaying = true
            vertex.hasPlayed = false

            seek(vertex, environment, duration(vertex))

            end(vertex, environment)
            vertex.isPlaying = false
            vertex.hasPlayed = true
        }

        // Seek into animation
        if (vertex.isPlaying && shouldBePlaying && !begunThisFrame) {
            seek(vertex, environment, time - start)
        }

        // Apply invariant if any
        if (!vertex.hasPlayed && 'applyInvariant' in vertex) {
            const transition = vertex as TransitionAnimationNode
            transition.applyInvariant(transition, environment)
        }

        start += duration(vertex)
    }
}

export function reset(animation: AnimationGraph | AnimationNode) {
    animation.isPlaying = false
    animation.hasPlayed = false

    if (!instanceOfAnimationNode(animation)) {
        animation.vertices.forEach((vertex) => reset(vertex))
    }
}

export function apply(animation: AnimationGraph | AnimationNode, environment: EnvironmentState) {
    begin(animation, environment)
    animation.isPlaying = true

    seek(animation, environment, duration(animation))

    end(animation, environment)
    animation.isPlaying = false
    animation.hasPlayed = true
}
