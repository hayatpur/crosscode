import chalk = require('chalk');
import { Environment } from '../../environment/Environment';
import { Node } from '../../transpiler/Node';
import { AnimationNode } from '../primitive/AnimationNode';
import { Edge } from './edges/Edge';

export interface AnimationGraphOptions {
    shouldDissolve?: boolean;
    isSequence?: boolean;
    isSection?: boolean;
    isCollapsed?: boolean;
}

export class AnimationGraph {
    static id = 0;
    node: Node = null;
    statement: Node = null;

    vertices: (AnimationNode | AnimationGraph)[] = [];

    edges: Edge[] = [];

    delay: number = 0;
    offset: number = 0;
    playing: boolean = false;
    hasPlayed: boolean = false;
    playback = '';
    options: AnimationGraphOptions;
    id: number;
    collapsedStarts: any;
    precondition: Environment = null;

    constructor(node: Node, options: AnimationGraphOptions = {}) {
        this.node = node;
        this.options = options;

        // ID
        this.id = AnimationGraph.id;
        AnimationGraph.id += 1;
    }

    addVertex(vertex: AnimationGraph | AnimationNode, statement: Node = null) {
        if (
            vertex instanceof AnimationNode ||
            (vertex instanceof AnimationGraph && (vertex.options.isSequence || !vertex.options.shouldDissolve))
        ) {
            vertex.statement = statement;
            this.vertices.push(vertex);
        } else {
            // Offset all the edges
            const offset = this.vertices.length + 1;

            // Add all the vertices
            const vertices = [...vertex.vertices];
            vertices.forEach((vertex) => this.addVertex(vertex, statement));

            // Add all the edges
            for (let j = 0; j < vertex.edges.length; j++) {
                vertex.edges[j].from += offset;
                vertex.edges[j].to += offset;

                this.edges.push(vertex.edges[j]);
            }
        }
    }

    get duration() {
        if (this.collapsedStarts != null && this.collapsedStarts[0] != undefined) {
            const n = this.collapsedStarts.length;
            const last_offset = this.collapsedStarts[n - 1];
            const last = this.vertices[n - 1];
            if (last == null) return 0;

            return last_offset + last.duration;
        } else {
            let duration = 0;
            for (const vertex of this.vertices) {
                if (vertex == null) continue;
                duration += vertex.duration + vertex.delay;
            }
            return duration;
        }
    }

    removeVertexAt(i: number) {
        // Remove vertex if null
        this.vertices.splice(i, 1);

        // Shift over all edges
        for (let j = this.edges.length - 1; j >= 0; j--) {
            if (this.edges[j].from == i || this.edges[j].to == i) {
                this.edges.slice(j, 1);
            }

            if (this.edges[j].from > i) this.edges[j].from -= 1;
            if (this.edges[j].to > i) this.edges[j].to -= 1;
        }
    }

    addVertexAt(vertex: any, i: number) {
        this.vertices.splice(i, 0, vertex);

        // Shift over all edges
        for (let j = this.edges.length - 1; j >= 0; j--) {
            if (this.edges[j].from >= i) this.edges[j].from += 1;
            if (this.edges[j].to >= i) this.edges[j].to += 1;
        }
    }

    addEdge(edge: Edge) {
        for (const other of this.edges) {
            if (other.from == edge.from && other.to == edge.to && other.constructor.name == edge.constructor.name) {
                return;
            }
        }

        this.edges.push(edge);
    }

    begin(environment: Environment, options = { indent: 0, baking: false }) {
        // this.playing = true;
        if (options.baking) {
            this.precondition = environment.copy();
        }
    }

    end(environment: Environment, options = { indent: 0, baking: false }) {
        // this.hasPlayed = true;
        // this.playing = false;
    }

    /**
     * Seek into a specific time in the animation graph
     */
    seek(environments: Environment[], time: number, options = { indent: 0, baking: false }) {
        let start = 0;

        for (let i = 0; i < this.vertices.length; i++) {
            if (this.vertices[i] == null) continue;

            const animation = this.vertices[i];

            if (this.collapsedStarts != null) {
                start = this.collapsedStarts[i];
            } else {
                start += animation.delay;
            }

            const should_be_playing = time >= start && time < start + animation.duration;

            // End animation
            if (animation.playing && !should_be_playing) {
                if (animation instanceof AnimationGraph) {
                    animation.seek(environments, animation.duration, { ...options, indent: options.indent + 1 });
                }

                environments.forEach((environment) => {
                    if (!environment.isValid(animation)) return;
                    if (animation instanceof AnimationNode) {
                        animation.seek(environment, animation.duration);
                    }

                    animation.end(environment, options);

                    console.log(`${'\t'.repeat(options.indent)}...... ${animation.constructor.name}`);

                    // console.groupCollapsed('Current State');
                    // console.table(environment.memory);
                    // console.table(environment.bindingFrames);
                    // console.groupEnd();
                });
                animation.hasPlayed = true;
                animation.playing = false;
            }

            // Begin animation
            if (!animation.playing && should_be_playing) {
                environments.forEach((environment) => {
                    if (!environment.isValid(animation)) return;
                    console.log(`${'\t'.repeat(options.indent)}[${time.toFixed(0)}ms] ${animation.constructor.name}`);

                    animation.begin(environment, options);
                });

                animation.playing = true;
            }

            // Skip over this animation
            if (time >= start + animation.duration && !animation.playing && !animation.hasPlayed) {
                environments.forEach((environment) => {
                    if (!environment.isValid(animation)) return;
                    animation.begin(environment, options);
                });

                if (animation instanceof AnimationGraph) {
                    animation.seek(environments, animation.duration);
                } else {
                    environments.forEach((environment) => {
                        if (!environment.isValid(animation)) return;
                        animation.seek(environment, animation.duration);
                    });
                }

                environments.forEach((environment) => {
                    if (!environment.isValid(animation)) return;
                    animation.end(environment, options);
                });

                animation.hasPlayed = true;
            }

            // // Completely reverse this animation
            // if (t < animation.start && (animation.hasPlayed || animation.playing)) {
            //     animation.undoEnd();
            //     animation.seek(0);
            //     animation.undoBegin();

            //     animation.hasPlayed = false;
            // }

            // // Partially reverse this animation
            // if (t < animation.start + animation.duration && animation.hasPlayed) {
            //     animation.undoEnd();
            //     animation.seek(t - animation.start);

            //     animation.hasPlayed = false;
            // }

            // Seek animation
            if (should_be_playing && animation.playing) {
                // console.log(`Seeking ... ${animation.constructor.name}`, animation.statement);
                if (animation instanceof AnimationGraph) {
                    animation.seek(environments, time - start, { ...options, indent: options.indent + 1 });
                } else {
                    environments.forEach((environment) => {
                        if (!environment.isValid(animation)) return;
                        animation.seek(environment, time - start);
                    });
                }
            }

            start += animation.duration;
        }
    }

    // Note: can make it an iterative algorithm for optimization
    flattenedVertices() {
        const vertices = [];

        for (const vertex of this.vertices) {
            if (vertex instanceof AnimationGraph) {
                vertices.push(...vertex.flattenedVertices());
            } else {
                vertices.push(vertex);
            }
        }

        return vertices;
    }
}
