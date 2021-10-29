import { clone } from '../utilities/objects';
import { createView } from '../view/view';
import { ViewState } from '../view/ViewState';
import { Cursor } from './Cursor';
import {
    AnimationData,
    AnimationGraph,
    AnimationRuntimeOptions,
    instanceOfAnimationGraph,
} from './graph/AnimationGraph';
import { Edge } from './graph/edges/Edge';
import { AnimationNode, instanceOfAnimationNode } from './primitive/AnimationNode';

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
        return animation.baseDuration * (1 / animation.speed);
    }

    const currentAbstraction = animation.abstractions[animation.currentAbstractionIndex];

    // If a parallel animation, return the end point of the longest animation vertex
    if (currentAbstraction.isParallel && currentAbstraction.parallelStarts[0] != undefined) {
        const ends = currentAbstraction.parallelStarts.map(
            (start, i) => start + duration(currentAbstraction.vertices[i + 1])
        );
        return Math.max(...ends);
    }
    // Else return the sum of all durations
    else {
        let baseDuration = 0;
        for (const vertex of currentAbstraction.vertices) {
            if (vertex == null) continue;
            baseDuration += duration(vertex) + vertex.delay;
        }
        return baseDuration * (1 / animation.speed);
    }
}

/**
 * Removes an edge from an animation graph. Warns if edge was not found in the animation graph.
 * @param graph - Animation graph to remove edge from
 * @param edge - Edge to remove
 */
export function removeEdge(graph: AnimationGraph, edge: Edge) {
    const currentAbstraction = graph.abstractions[graph.currentAbstractionIndex];
    const index = currentAbstraction.edges.findIndex((e) => e.id == edge.id);
    if (index == -1) {
        console.warn('Attempting to remove non-existent edge', edge);
        return;
    }

    currentAbstraction.edges.splice(index, 1);
}

/**
 * Add an edge to animation graph if it does not already exist.
 * @param graph - Animation graph to add edge to
 * @param edge - Edge to add
 */
export function addEdge(graph: AnimationGraph, edge: Edge) {
    const currentAbstraction = graph.abstractions[graph.currentAbstractionIndex];

    for (const other of currentAbstraction.edges) {
        if (
            other.from == edge.from &&
            other.to == edge.to &&
            other.constructor.name == edge.constructor.name
        ) {
            return;
        }
    }

    currentAbstraction.edges.push(edge);
}

/**
 * Begin an animation, or animation node. If animation node, invoke it's onBegin callback.
 * @param animation - Animation to start
 * @param view - View to apply the animation on
 * @param options - Mostly used for setting flags to bake animation
 */
export function begin(
    animation: AnimationGraph | AnimationNode,
    view: ViewState,
    options: AnimationRuntimeOptions = {}
) {
    Cursor.instance?.setCodeLocation(animation.nodeData.location);

    if (options.baking) {
        animation.precondition = clone(view) as ViewState;
    }

    if (instanceOfAnimationNode(animation)) {
        animation.onBegin(animation, view, options);
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
    view: ViewState,
    options: AnimationRuntimeOptions = {}
) {
    if (options.baking) {
        animation.postcondition = clone(view);
    }

    if (instanceOfAnimationNode(animation)) {
        animation.onEnd(animation, view, options);
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
    view: ViewState,
    time: number,
    options: AnimationRuntimeOptions = {}
) {
    if (instanceOfAnimationNode(animation)) {
        animation.onSeek(animation, view, time, options);
        return;
    }

    const currentAbstraction = animation.abstractions[animation.currentAbstractionIndex];

    // Keep track of the start time (for sequential animations)
    let start = 0;

    // Loop through each child vertex and seek into it
    for (let i = 0; i < currentAbstraction.vertices.length; i++) {
        if (currentAbstraction.vertices[i] == null) continue;

        const vertex = currentAbstraction.vertices[i];

        start += vertex.delay;

        // If parallel animation, override with parallel start time
        if (currentAbstraction.isParallel) {
            start = currentAbstraction.parallelStarts[i];
        }

        // If the animation should be playing
        const shouldBePlaying = time >= start && time < start + duration(vertex);

        // End animation
        if (vertex.isPlaying && !shouldBePlaying) {
            // Before ending, seek into the animation at it's end time
            seek(vertex, view, duration(vertex), options);
            end(vertex, view, options);

            if (instanceOfAnimationNode(vertex)) {
                // console.clear();
                console.log(`[${~~time}ms] ${vertex.name}`);
                // logEnvironment(getCurrentEnvironment(view));
            }

            vertex.hasPlayed = true;
            vertex.isPlaying = false;
        }

        // Begin animation
        if (!vertex.isPlaying && shouldBePlaying) {
            begin(vertex, view, options);
            vertex.isPlaying = true;
        }

        // Skip over this animation
        if (time >= start + duration(vertex) && !vertex.isPlaying && !vertex.hasPlayed) {
            begin(vertex, view, options);
            seek(vertex, view, duration(vertex), options);
            end(vertex, view, options);

            vertex.hasPlayed = true;
        }

        // Seek into animation
        if (vertex.isPlaying && shouldBePlaying) {
            seek(vertex, view, time - start, options);
        }

        start += duration(vertex);

        // // Completely reverse this animation
        // if (t < vertex.start && (vertex.hasPlayed || vertex.playing)) {
        //     vertex.undoEnd();
        //     vertex.seek(0);
        //     vertex.undoBegin();

        //     vertex.hasPlayed = false;
        // }

        // // Partially reverse this animation
        // if (t < vertex.start + vertex.duration && vertex.hasPlayed) {
        //     vertex.undoEnd();
        //     vertex.seek(t - vertex.start);

        //     vertex.hasPlayed = false;
        // }
    }
}

export function reset(animation: AnimationGraph | AnimationNode) {
    animation.isPlaying = false;
    animation.hasPlayed = false;

    if (instanceOfAnimationGraph(animation)) {
        const currentAbstraction = animation.abstractions[animation.currentAbstractionIndex];

        currentAbstraction.vertices.forEach((vertex) => reset(vertex));
    }
}

export function bake(animation: AnimationGraph | AnimationNode) {
    seek(animation, createView(), duration(animation), {
        baking: true,
        indent: 0,
        globalTime: 0,
    });
    reset(animation);
    // computeAllGraphEdges(this.animation);
}

export function apply(animation: AnimationGraph | AnimationNode, view: ViewState) {
    begin(animation, view);
    seek(animation, view, duration(animation));
    end(animation, view);
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
            console.error('Animation reads not set for', animation);
        }
        return animation._reads;
    }

    let result = [];
    const { vertices } = animation.abstractions[animation.currentAbstractionIndex];

    for (const vertex of vertices) {
        result.push(...reads(vertex));
    }

    return result;
}

/**
 *
 * TODO: Specify abstraction level
 * @param animation
 * @returns
 */
export function writes(animation: AnimationGraph | AnimationNode): AnimationData[] {
    if (instanceOfAnimationNode(animation)) {
        return animation._writes;
    }

    let result = [];
    const { vertices } = animation.abstractions[animation.currentAbstractionIndex];

    for (const vertex of vertices) {
        result.push(...writes(vertex));
    }

    return result;
}
