import { clone } from '../utilities/objects'
import { createRootView, replaceRootViewWith } from '../view/view'
import { RootViewState } from '../view/ViewState'
import {
    AnimationData,
    AnimationGraph,
    AnimationRuntimeOptions,
    instanceOfAnimationGraph,
} from './graph/AnimationGraph'
import { Edge } from './graph/edges/Edge'
import { AnimationNode, instanceOfAnimationNode } from './primitive/AnimationNode'

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

    const abstraction = currentAbstraction(animation)

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
 * Removes an edge from an animation graph. Warns if edge was not found in the animation graph.
 * @param graph - Animation graph to remove edge from
 * @param edge - Edge to remove
 */
export function removeEdge(graph: AnimationGraph, edge: Edge) {
    const currentAbstraction = graph.abstractions[graph.currentAbstractionIndex]
    const index = currentAbstraction.edges.findIndex((e) => e.id == edge.id)
    if (index == -1) {
        console.warn('Attempting to remove non-existent edge', edge)
        return
    }

    currentAbstraction.edges.splice(index, 1)
}

/**
 * Add an edge to animation graph if it does not already exist.
 * @param graph - Animation graph to add edge to
 * @param edge - Edge to add
 */
export function addEdge(graph: AnimationGraph, edge: Edge) {
    const currentAbstraction = graph.abstractions[graph.currentAbstractionIndex]

    for (const other of currentAbstraction.edges) {
        if (other.from == edge.from && other.to == edge.to && other.constructor.name == edge.constructor.name) {
            return
        }
    }

    currentAbstraction.edges.push(edge)
}

/**
 * Begin an animation, or animation node. If animation node, invoke it's onBegin callback.
 * @param animation - Animation to start
 * @param view - View to apply the animation on
 * @param options - Mostly used for setting flags to bake animation
 */
export function begin(
    animation: AnimationGraph | AnimationNode,
    view: RootViewState,
    options: AnimationRuntimeOptions = {}
) {
    view.cursor.location = animation.nodeData.location

    if (options.baking) {
        animation.precondition = clone(view)
    }

    if (instanceOfAnimationNode(animation)) {
        animation.onBegin(animation, view, options)
    }
}

/**
 * End an animation, or animation node. If animation node, invoke it's onBegin callback.
 * @param animation - Animation to end
 * @param view - View to apply the animation on
 * @param options - Mostly used for setting flags to bake animation
 */
export function end(
    animation: AnimationGraph | AnimationNode,
    view: RootViewState,
    options: AnimationRuntimeOptions = {}
) {
    if (options.baking) {
        animation.postcondition = clone(view)
    }

    if (instanceOfAnimationNode(animation)) {
        animation.onEnd(animation, view, options)
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
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions = {}
) {
    if (instanceOfAnimationNode(animation)) {
        animation.onSeek(animation, view, time, options)
        return
    }

    const abstraction = currentAbstraction(animation)

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
        //     updateRootViewLayout(view)
        //     updateRootViewLayout(view)

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
            seek(vertex, view, duration(vertex), options)
            end(vertex, view, options)

            if (instanceOfAnimationNode(vertex)) {
                console.log(`[${~~time}ms] ${vertex.name}`)
            }

            vertex.hasPlayed = true
            vertex.isPlaying = false
        }

        // Begin animation
        if (!vertex.isPlaying && shouldBePlaying) {
            begin(vertex, view, options)
            vertex.isPlaying = true
        }

        // Skip over this animation
        if (time >= start + duration(vertex) && !vertex.isPlaying && !vertex.hasPlayed) {
            begin(vertex, view, options)
            seek(vertex, view, duration(vertex), options)
            end(vertex, view, options)

            vertex.hasPlayed = true
        }

        // Seek into animation
        if (vertex.isPlaying && shouldBePlaying) {
            seek(vertex, view, time - start, options)
        }

        start += duration(vertex)
    }
}

export function restoreInitialState(vertex: AnimationGraph | AnimationNode, view: RootViewState) {
    // console.log('Restoring initial layout for', vertex)

    if (vertex.precondition != null) {
        replaceRootViewWith(view, vertex.precondition)
    }
}

export function reset(animation: AnimationGraph | AnimationNode) {
    animation.isPlaying = false
    animation.hasPlayed = false

    if (instanceOfAnimationGraph(animation)) {
        currentAbstraction(animation).vertices.forEach((vertex) => reset(vertex))
    }
}

export function bake(animation: AnimationGraph | AnimationNode, view: RootViewState = null) {
    if (view == null) {
        view = createRootView()
    }

    begin(animation, view, { baking: true })
    seek(animation, view, duration(animation), {
        baking: true,
        indent: 0,
        globalTime: 0,
    })
    end(animation, view, { baking: true })
    reset(animation)
}

export function apply(animation: AnimationGraph | AnimationNode, view: RootViewState) {
    begin(animation, view)
    seek(animation, view, duration(animation))
    end(animation, view)
}

/**
 *
 * TODO: Specify abstraction level
 * @param animation
 * @returns
 */
export function reads(animation: AnimationGraph | AnimationNode): AnimationData[] {
    if (instanceOfAnimationNode(animation)) {
        if (animation._reads == null) {
            console.error('Animation reads not set for', animation)
        }
        return animation._reads
    }

    let result = []
    const { vertices } = currentAbstraction(animation)

    for (const vertex of vertices) {
        result.push(...reads(vertex))
    }

    return result
}

/**
 *
 * TODO: Specify abstraction level
 * @param animation
 * @returns
 */
export function writes(animation: AnimationGraph | AnimationNode): AnimationData[] {
    if (instanceOfAnimationNode(animation)) {
        return animation._writes
    }

    let result = []
    const { vertices } = currentAbstraction(animation)

    for (const vertex of vertices) {
        result.push(...writes(vertex))
    }

    return result
}

export function currentAbstraction(animation: AnimationGraph) {
    return animation.abstractions[animation.currentAbstractionIndex]
}
