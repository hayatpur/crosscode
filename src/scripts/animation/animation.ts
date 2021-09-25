import { logEnvironment } from '../environment/environment';
import { createView, getCurrentEnvironment } from '../view/view';
import { ViewState } from '../view/ViewState';
import { Cursor } from './Cursor';
import {
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

    // If a parallel animation, return the end point of the longest animation vertex
    if (animation.isParallel && animation.parallelStarts[0] != undefined) {
        const ends = animation.parallelStarts.map(
            (start, i) => start + duration(animation.vertices[i + 1])
        );
        return Math.max(...ends);
    }
    // Else return the sum of all durations
    else {
        let baseDuration = 0;
        for (const vertex of animation.vertices) {
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
    const index = graph.edges.findIndex((e) => e.id == edge.id);
    if (index == -1) {
        console.warn('Attempting to remove non-existent edge', edge);
        return;
    }

    graph.edges.splice(index, 1);
}

/**
 * Add an edge to animation graph if it does not already exist.
 * @param graph - Animation graph to add edge to
 * @param edge - Edge to add
 */
export function addEdge(graph: AnimationGraph, edge: Edge) {
    for (const other of graph.edges) {
        if (
            other.from == edge.from &&
            other.to == edge.to &&
            other.constructor.name == edge.constructor.name
        ) {
            return;
        }
    }

    graph.edges.push(edge);
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
    console.log(animation);
    Cursor.instance?.setCodeLocation(animation.nodeData.location);

    if (options.baking) {
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
        // animation.postcondition = cloneEnvironment(view.environments[view.environments.length - 1]);
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

    // Keep track of the start time (for sequential animations)
    let start = 0;

    // Loop through each child vertex and seek into it
    for (let i = 0; i < animation.vertices.length; i++) {
        if (animation.vertices[i] == null) continue;

        const vertex = animation.vertices[i];

        start += vertex.delay;

        // If parallel animation, override with parallel start time
        if (animation.isParallel) {
            start = animation.parallelStarts[i];
        }

        // If the animation should be playing
        const shouldBePlaying = time >= start && time < start + duration(vertex);

        // End animation
        if (vertex.isPlaying && !shouldBePlaying) {
            // Before ending, seek into the animation at it's end time
            seek(vertex, view, duration(vertex));
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
            seek(vertex, view, duration(vertex));
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
        animation.vertices.forEach((vertex) => reset(vertex));
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
