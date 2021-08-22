import chalk = require('chalk');
import { Accessor } from '../../environment/Data';
import { Environment } from '../../environment/Environment';
import { AssignmentExpression } from '../../transpiler/Expressions/BinaryOperations/AssigmentExpression';
import { Node } from '../../transpiler/Node';
import { VariableDeclarator } from '../../transpiler/Statements/VariableDeclarator';
import { Cursor } from '../Cursor';
import { AnimationNode } from '../primitive/AnimationNode';
import { Edge } from './edges/Edge';

export interface AnimationGraphOptions {
    shouldDissolve?: boolean;
    isSequence?: boolean;
    isSection?: boolean;
    isCollapsed?: boolean;
}

export interface AnimationGraphRuntimeOptions {
    indent: number;
    baking: boolean;
}

export interface AnimationData {
    location: Accessor[];
    id: string;
}

export interface AnimationGraphPath {
    node: AnimationGraph | AnimationNode;
    edge?: Edge;
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
    id: string;
    collapsedStarts: number[] = null;
    precondition: Environment = null;

    showing = false;
    parentIds: Set<string> = new Set();

    // Original bake information
    originalVertices: (AnimationNode | AnimationGraph)[] = [];
    originalEdges: Edge[] = [];
    originalPrecondition: Environment = null;

    constructor(node: Node, options: AnimationGraphOptions = {}) {
        this.node = node;
        this.options = options;

        // ID
        this.id = `AG${AnimationGraph.id}`;
        AnimationGraph.id += 1;

        this.showing = node instanceof VariableDeclarator || node instanceof AssignmentExpression;
    }

    resetToOriginal() {
        // TODO
        this.vertices = [...this.originalVertices];
        this.edges = [...this.originalEdges];
        this.precondition = this.originalPrecondition.copy();
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

    removeVertex(vertex: AnimationGraph | AnimationNode) {
        const index = this.vertices.indexOf(vertex);
        if (index == -1) return;

        // console.log('Removing at index', index);
        // console.log('Pre Vertices', JSON.parse(JSON.stringify(this.vertices)));
        // console.log('Pre Edges', JSON.parse(JSON.stringify(this.edges)));
        this.removeVertexAt(index);
        // console.log('Post Vertices', JSON.parse(JSON.stringify(this.vertices)));
        // console.log('Post Edges', JSON.parse(JSON.stringify(this.edges)));
    }

    removeEdge(edge: Edge) {
        const index = this.edges.findIndex((e) => e.id == edge.id);
        if (index == -1) return;

        this.edges.splice(index, 1);
    }

    removeVertexAt(i: number) {
        // console.log('Removing at...', i);
        // Remove vertex if null
        this.vertices.splice(i, 1);

        // Shift over all edges
        for (let j = this.edges.length - 1; j >= 0; j--) {
            if (this.edges[j].from == i || this.edges[j].to == i) {
                this.edges.splice(j, 1);
                continue;
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

    begin(environment: Environment, options: AnimationGraphRuntimeOptions) {
        // this.playing = true;
        if (options.baking) {
            this.precondition = environment.copy();
        }
    }

    end(environment: Environment, options: AnimationGraphRuntimeOptions) {
        // this.hasPlayed = true;
        // this.playing = false;
    }

    /**
     * Seek into a specific time in the animation graph
     */
    seek(
        environments: Environment[],
        time: number,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false }
    ) {
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
                    if (!environment.isValid(animation) && !options.baking) return;
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
                    if (!environment.isValid(animation) && !options.baking) return;
                    console.log(`${'\t'.repeat(options.indent)}[${time.toFixed(0)}ms] ${animation.constructor.name}`);

                    animation.begin(environment, options);
                });

                animation.playing = true;
                Cursor.instance?.highlight(animation);
            }

            // Skip over this animation
            if (time >= start + animation.duration && !animation.playing && !animation.hasPlayed) {
                environments.forEach((environment) => {
                    if (!environment.isValid(animation) && !options.baking) return;
                    animation.begin(environment, options);
                });

                if (animation instanceof AnimationGraph) {
                    animation.seek(environments, animation.duration, options);
                } else {
                    environments.forEach((environment) => {
                        if (!environment.isValid(animation) && !options.baking) return;
                        animation.seek(environment, animation.duration);
                    });
                }

                environments.forEach((environment) => {
                    if (!environment.isValid(animation) && !options.baking) return;
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
                        if (!environment.isValid(animation) && !options.baking) return;
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

    reset(options = { baking: false }) {
        this.playing = false;
        this.hasPlayed = false;

        this.vertices.forEach((vertex) => vertex.reset(options));
    }

    getName() {
        return `${this.node.constructor.name}`;
    }

    reads(): AnimationData[] {
        let result = [];

        for (const vertex of this.vertices) {
            result.push(...vertex.reads());
        }

        return result;
    }

    writes(): AnimationData[] {
        let result = [];

        for (const vertex of this.vertices) {
            result.push(...vertex.writes());
        }

        return result;
    }
}

export class AnimationGroup extends AnimationGraph {
    constructor(node: Node) {
        super(node);
        this.showing = true;
    }

    getName() {
        return 'Animation Group';
    }

    getLocation() {
        const lines = document.body.getElementsByClassName('view-lines')[0];

        let bbox = null;

        let startRow = Math.min(
            ...this.vertices.map((v) => {
                const loc = v instanceof AnimationGraph ? v.node.loc : v.statement.loc;
                return loc.start.line;
            })
        );

        let endRow = Math.max(
            ...this.vertices.map((v) => {
                const loc = v instanceof AnimationGraph ? v.node.loc : v.statement.loc;
                return loc.end.line;
            })
        );

        for (let row = startRow; row <= endRow; row++) {
            const line_bbox = lines.children[row - 1]?.children[0].getBoundingClientRect();
            if (line_bbox == null) continue;

            if (bbox == null) {
                bbox = line_bbox;
                continue;
            }

            // Expand it
            bbox.width = Math.max(bbox.width, line_bbox.width);
            bbox.height = Math.max(bbox.height, line_bbox.y + line_bbox.height - bbox.y);
        }

        if (bbox == null) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        // Column
        // const char = Editor.instance.computeCharWidth();
        // bbox.x += char * this.location.startCol;
        // bbox.width -= char * this.location.startCol;
        // bbox.width = Math.max((this.location.endCol - this.location.startCol) * char, bbox.width);

        return { bbox, startRow, endRow };
    }
}
