// import { AnimationGraph } from '../animation/graph/AnimationGraph.js';
// import AntiEdge from '../animation/graph/edges/AntiEdge.js';
// import { Edge } from '../animation/graph/edges/Edge.js';
// import FlowEdge from '../animation/graph/edges/FlowEdge.js';
// import { AnimationNode } from '../animation/primitive/AnimationNode.js';
// import { solveLP } from './math.js';

import { AnimationData, AnimationGraph } from '../animation/graph/AnimationGraph';
import AntiEdge from '../animation/graph/edges/AntiEdge';
import { Edge } from '../animation/graph/edges/Edge';
import FlowEdge from '../animation/graph/edges/FlowEdge';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import CopyDataAnimation from '../animation/primitive/Data/CopyDataAnimation';
import MoveAndPlaceAnimation from '../animation/primitive/Data/MoveAndPlaceAnimation';

// /**
//  * @param {number} index
//  * @param {Edge[]} edges
//  * @returns {number[]} vertices that 'index' is flow dependent on
//  */
// export function getFlowDependencies(index: number, edges: Edge[]): number[] {
//     return [];
// }

// /**
//  * @param {number} index
//  * @param {Edge[]} edges
//  * @returns {{ neighbour: number; road: Edge; }[]}
//  */
// export function getNeighbours(index: number, edges: Edge[]): { neighbour: number; road: Edge }[] {
//     const neighbours = [];
//     for (const edge of edges) {
//         if (edge.from == index) {
//             neighbours.push({ neighbour: edge.to, road: edge });
//         }
//     }

//     return neighbours;
// }

// /**
//  * @param {number} index
//  * @param {Edge[]} edges
//  * @returns {{ neighbour: number; road: Edge; }[]}
//  */
// export function getOutgoingNeighbours(index: number, edges: Edge[]): { neighbour: number; road: Edge }[] {
//     const neighbours = [];
//     for (const edge of edges) {
//         if (edge.to == index) {
//             neighbours.push({ neighbour: edge.from, road: edge });
//         }
//     }

//     return neighbours;
// }

// /**
//  * @param {number} index
//  * @param {Edge[]} edges
//  * @returns {number[]}
//  */
// export function getOutgoingFlow(index: number, edges: Edge[], mask = new Set()): number[] {
//     const outgoing = [];

//     const visited = new Set([index]);
//     const queue = [index];

//     while (queue.length != 0) {
//         // Vertex that'll be visited now
//         const vertex = queue.shift();

//         const neighbours = getNeighbours(vertex, edges);

//         for (const { neighbour, road } of neighbours) {
//             if (mask.has(neighbour)) continue;

//             if (road instanceof FlowEdge) {
//                 outgoing.push(neighbour);
//             }

//             if (!visited.has(neighbour)) {
//                 queue.push(neighbour);
//                 visited.add(neighbour);
//             }
//         }
//     }

//     return outgoing;
// }

// /**
//  * @param {number} index
//  * @param {Edge[]} edges
//  * @returns {number[]}
//  */
// export function getIncomingFlow(index: number, edges: Edge[], mask = new Set()): number[] {
//     const incoming = [];

//     const visited = new Set([index]);
//     const queue = [index];

//     while (queue.length != 0) {
//         // Vertex that'll be visited now
//         const vertex = queue.shift();

//         const neighbours = getOutgoingNeighbours(vertex, edges);

//         for (const { neighbour, road } of neighbours) {
//             if (mask.has(neighbour)) continue;

//             if (road instanceof FlowEdge) {
//                 incoming.push(neighbour);
//             }

//             if (!visited.has(neighbour)) {
//                 queue.push(neighbour);
//                 visited.add(neighbour);
//             }
//         }
//     }
//     return incoming;
// }

// export function computeStartAndEnd() {
//     if (
//         !this.isSection &&
//         !(this.node.constructor.name == 'BlockStatement') &&
//         !(this.node.constructor.name == 'Program')
//     )
//         return;

//     const start = this.vertices[0];
//     const end = this.vertices[this.vertices.length - 1];

//     // If this is a section, then mark the vertices where it can start, and the vertices where it ends
//     for (let j = 1; j < this.vertices.length - 1; j++) {
//         const outgoing_flow = getOutgoingFlow(j, this.edges, new Set([0, this.vertices.length - 1]));
//         const incoming_flow = getIncomingFlow(j, this.edges, new Set([0, this.vertices.length - 1]));

//         if (outgoing_flow.length == 0) {
//             this.addEdge(
//                 new FlowEdge(
//                     j,
//                     this.vertices.length - 1,
//                     // @ts-ignore
//                     end.getData.bind(end)
//                 )
//             );
//         }

//         if (incoming_flow.length == 0) {
//             // @ts-ignore
//             this.addEdge(new FlowEdge(0, j, start.getData.bind(start)));
//         }
//     }
// }

// export function collapseTimes() {
//     // Construct the graph into a LP problem
//     const variables = this.vertices.map((vertex, i) => `V${i}`);

//     // Limits
//     let limits = [];
//     for (let i = 0; i < this.edges.length; i++) {
//         const limit = `E${i}: ${this.edges[i].getConstraint(this.vertices)}`;
//         limits.push(limit);
//     }

//     // Bounds
//     let bounds = [];
//     for (let i = 0; i < this.vertices.length; i++) {
//         const bound = `V${i} >= 0`;
//         bounds.push(bound);
//     }

//     const data = `
// Minimize
// obj: ${variables.join('+')}

// Subject To
// ${limits.join('\n')}

// Bounds
// ${bounds.join('\n')}

// General
// ${variables.join(' ')}

// End`;

//     const solution = solveLP(data);

//     this.collapsedStarts = [];
//     for (let i = 0; i < this.vertices.length; i++) {
//         const start = solution.result[`V${i}`];
//         this.collapsedStarts.push(start);
//     }

//     console.log(this.collapsedStarts);
// }

/**
 * Returns set of dependency edges from vertices[index] to all other vertices.
 */
export function computeEdges(index: number, vertices: (AnimationGraph | AnimationNode)[]): Edge[] {
    let edges: Edge[] = [];

    let reads = vertices[index].reads();
    let writes = vertices[index].writes();

    // if (reads == null || writes == null || vertices[index].constructor.name == 'CursorLineAnimation') return new Set();

    const flow_added: AnimationData[] = [];
    const anti_added: AnimationData[] = [];
    // const out_added = new Set();
    // const conditional_added = new Set();

    for (let i = index - 1; i >= 0; i--) {
        let other = vertices[i];

        let other_reads = other.reads();
        let other_writes = other.writes();

        // If this statement read something that the other statement writes to
        const flow: AnimationData[] = intersection(reads, other_writes);

        // If this statement writes something that the other statement reads from
        const anti = intersection(writes, other_reads);

        // If this statement writes something that the other statement writes to
        // const out = intersection(writes, other_writes);

        // Add flow edges
        for (const data of flow) {
            if (flow_added.some((existing) => existing.id == data.id)) continue;
            edges.push(new FlowEdge(i, index, data));
            flow_added.push(data);
        }

        // Add anti edges
        for (const data of anti) {
            if (anti_added.some((existing) => existing.id == data.id)) continue;
            edges.push(new AntiEdge(i, index, data));
            anti_added.push(data);
        }
    }

    return edges;
}

export function computeAllEdges(graph: AnimationGraph) {
    let edges: Set<Edge> = new Set();

    for (let i = 0; i < graph.vertices.length; i++) {
        edges = new Set([...edges, ...computeEdges(i, graph.vertices)]);
    }

    edges.forEach((edge) => graph.addEdge(edge));
}

export function computeAllGraphEdges(animation: AnimationGraph) {
    if (animation instanceof AnimationGraph) {
        for (const node of animation.vertices) {
            if (node instanceof AnimationGraph) {
                computeAllGraphEdges(node);
            }
        }
    }

    computeAllEdges(animation);
}
function intersection(A: AnimationData[], B: AnimationData[]) {
    // Intersection between two sets A, B
    // let intersection = (A, B) => new Set([...A].filter(value => B.has(value)));

    let intersection = [];

    for (const a of A) {
        if (B.some((b) => b.id == a.id)) {
            intersection.push(a);
        }
    }

    return intersection;
}

export function animationDataToString(data: AnimationData) {
    return `${data.location.map((acc) => `D(${acc.value.toString()})`).join('_')}`;
}

export function logAnimation(animation: AnimationGraph | AnimationNode, indent = 0, options = { first: false }) {
    // computeAllEdges(graph);
    // console.log(animation);

    if (animation instanceof AnimationNode) {
        const space = `${'\t'.repeat(options.first ? 0 : indent)}`;

        if (animation instanceof CopyDataAnimation) {
            const from = animation
                .reads()
                .map((read) => animationDataToString(read))
                .join(', ');
            const to = animation
                .writes()
                .map((read) => animationDataToString(read))
                .join(', ');

            return space + `[${from} 🠕 ${to}]`;
        } else if (animation instanceof MoveAndPlaceAnimation) {
            const from = animation
                .reads()
                .map((read) => animationDataToString(read))
                .join(', ');
            const to = animation
                .writes()
                .map((read) => animationDataToString(read))
                .join(', ');

            return space + `[${from} ➝ ${to}]`;
        }
        return space + `[${animation.id}_${animation.constructor.name}]`;
    }

    let output = '';

    let visited_vertices = new Set();
    let visited_edges = new Set();

    // Flow edges
    for (const edge of animation.edges.filter((edge) => edge instanceof FlowEdge)) {
        if (visited_edges.has(`${edge.to}_${edge.from}`)) continue;

        visited_vertices.add(edge.to);
        visited_vertices.add(edge.from);
        visited_edges.add(`${edge.to}_${edge.from}`);

        let v1 = logAnimation(animation.vertices[edge.from], indent + 1, { first: false });
        let v2 = logAnimation(animation.vertices[edge.to], indent + 1, { first: true });
        if (v2 == null) v2 = '[NULL]';

        output += `${v1}${animationDataToString(edge.data)} ->${v2}\n`;
    }

    // Anti-edges
    for (const edge of animation.edges.filter((edge) => edge instanceof AntiEdge)) {
        if (visited_edges.has(`${edge.to}_${edge.from}`)) continue;

        visited_vertices.add(edge.to);
        visited_vertices.add(edge.from);
        visited_edges.add(`${edge.to}_${edge.from}`);

        let v1 = logAnimation(animation.vertices[edge.from], indent + 1, { first: false });
        let v2 = logAnimation(animation.vertices[edge.to], indent + 1, { first: true });
        output += `${v1}${animationDataToString(edge.data)} -:>${v2}\n`;
    }

    // Sequential edges
    for (let i = animation.vertices.length - 1; i >= 1; i--) {
        const from = i - 1;
        const to = i;

        if (visited_edges.has(`${to}_${from}`)) continue;

        visited_vertices.add(to);
        visited_vertices.add(from);
        visited_edges.add(`${to}_${from}`);

        let v1 = animation.vertices[from]
            ? logAnimation(animation.vertices[from], indent + 1, { first: false })
            : `[${from}_Null]`;
        let v2 = animation.vertices[to]
            ? logAnimation(animation.vertices[to], indent + 1, { first: true })
            : `[${to}_Null]`;

        output = `${v1}--${v2}\n${output}`;
    }

    // Left out vertices
    for (let i = 0; i < animation.vertices.length; i++) {
        if (animation.vertices[i] == null) continue;

        if (!visited_vertices.has(i)) {
            output += `${logAnimation(animation.vertices[i], indent + 1, { first: false })}\n`;
        }
    }

    output = `${'\t'.repeat(options.first ? 0 : indent)}[<reference>${animation.id}_${
        animation.node?.constructor.name
    }\n${output}`;

    output += `${'\t'.repeat(indent)}]`;
    return output;
}

export function computeParentIds(animation: AnimationGraph | AnimationNode, parentIds: Set<string> = new Set()) {
    animation.parentIds = parentIds;

    if (animation instanceof AnimationGraph) {
        for (const node of animation.vertices) {
            computeParentIds(node, new Set([animation.id, ...parentIds]));
        }
    }
}

export function dissolveAnimation(animation: AnimationGraph) {
    // Dissolve all children
}
