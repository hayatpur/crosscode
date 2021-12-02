import * as ESTree from 'estree'
import { DataType } from '../../environment/data/DataState'
import { flattenedEnvironmentMemory, getMemoryLocation } from '../../environment/environment'
import { clone } from '../../utilities/objects'
import { addEdge, currentAbstraction, reads, writes } from '../animation'
import { AnimationNode, instanceOfAnimationNode, NodeData } from '../primitive/AnimationNode'
import { AnimationChunk } from './abstraction/Abstractor'
import { AnimationData, AnimationGraph, instanceOfAnimationGraph } from './AnimationGraph'
import { createEdge, Edge, EdgeType } from './edges/Edge'

export interface VertexOptions {
    nodeData?: NodeData
    shouldDissolve?: boolean
    abstractionIndex?: number
}

/**
 * Adds a vertex to the end of an animation graph. If shouldDissolve is true (and the vertex is an animation graph),
 * then the children of the vertex are directly added, rather than the vertex itself.
 *
 * @param graph - Animation graph to add vertex to
 * @param vertex - Vertex to add
 * @param nodeData - Data of AST node for vertex
 * @param shouldDissolve - If vertex should dissolve or not
 */
export function addVertex(graph: AnimationGraph, vertex: AnimationGraph | AnimationNode, options: VertexOptions = {}) {
    // Defaults
    options.shouldDissolve = options.shouldDissolve ?? false
    options.abstractionIndex = options.abstractionIndex ?? graph.currentAbstractionIndex

    const { vertices: graphVertices, edges: graphEdges } = graph.abstractions[options.abstractionIndex]

    if (instanceOfAnimationNode(vertex) || (instanceOfAnimationGraph(vertex) && !options.shouldDissolve)) {
        if (instanceOfAnimationGraph(vertex) && vertex.isGroup) {
            updateGroupNodeData(vertex)
            graphVertices.push(vertex)
        } else {
            vertex.nodeData = options.nodeData
            graphVertices.push(vertex)
        }
    } else {
        const { vertices: vertexVertices, edges: vertexEdges } = vertex.abstractions[options.abstractionIndex]

        // Offset all the edges
        const offset = graphVertices.length + 1

        // Add all the vertices
        const vertices = [...vertexVertices]
        vertices.forEach((vertex) =>
            addVertex(graph, vertex, {
                nodeData: options.nodeData,
            })
        )

        // Add all the edges
        for (let j = 0; j < vertexEdges.length; j++) {
            vertexEdges[j].from += offset
            vertexEdges[j].to += offset

            graphEdges.push(vertexEdges[j])
        }
    }

    if (graph.isGroup) {
        updateGroupNodeData(graph)
    }
}

export function addVertexAt(
    graph: AnimationGraph,
    i: number,
    vertex: AnimationGraph | AnimationNode,
    options: VertexOptions = {}
) {
    const { vertices: graphVertices, edges: graphEdges } = graph.abstractions[graph.currentAbstractionIndex]

    vertex.nodeData = options.nodeData

    // Add vertex
    graphVertices.splice(i, 0, vertex)

    // Shift over all edges
    for (let j = graphEdges.length - 1; j >= 0; j--) {
        if (graphEdges[j].from > i) graphEdges[j].from += 1
        if (graphEdges[j].to > i) graphEdges[j].to += 1
    }
}

export function getEmptyNodeData(pivot: NodeData): NodeData {
    return {
        location: {
            start: {
                line: pivot.location.start.line,
                column: 0,
            },
            end: {
                line: pivot.location.start.line,
                column: 0,
            },
        },
        type: 'AnimationGroup',
    }
}

export function updateGroupNodeData(graph: AnimationGraph, options: VertexOptions = {}) {
    options.abstractionIndex = options.abstractionIndex ?? graph.currentAbstractionIndex

    const { vertices: graphVertices, edges: graphEdges } = graph.abstractions[options.abstractionIndex]

    if (graphVertices.length === 0) {
        graph.nodeData = getEmptyNodeData(graph.nodeData)
    }

    const vertices = graphVertices

    let startLine = 0
    let endLine = 0

    // Start and end lines
    const firstVertex = vertices[0]
    const lastVertex = vertices[vertices.length - 1]
    startLine = firstVertex.nodeData.location.start.line
    endLine = lastVertex.nodeData.location.end.line

    // Start and end columns
    let startColumn = 0
    let endColumn = 0

    for (const vertex of vertices) {
        endColumn = Math.max(endColumn, vertex.nodeData.location.end.column)
    }

    // Update node data
    graph.nodeData = {
        location: {
            start: {
                line: startLine,
                column: startColumn,
            },
            end: {
                line: endLine,
                column: endColumn,
            },
        },
        type: 'AnimationGroup',
    }
}

/**
 * Removes a vertex from an animation graph at the given index.
 * @param graph - Animation graph to remove from
 * @param i - Vertex to remove at
 */
export function removeVertexAt(graph: AnimationGraph, i: number, options: VertexOptions = {}) {
    options.abstractionIndex = options.abstractionIndex ?? graph.currentAbstractionIndex

    const { vertices: graphVertices, edges: graphEdges } = graph.abstractions[options.abstractionIndex]

    // Remove vertex
    graphVertices.splice(i, 1)

    // Shift over all edges
    for (let j = graphEdges.length - 1; j >= 0; j--) {
        if (graphEdges[j].from == i || graphEdges[j].to == i) {
            graphEdges.splice(j, 1)
            continue
        }

        if (graphEdges[j].from > i) graphEdges[j].from -= 1
        if (graphEdges[j].to > i) graphEdges[j].to -= 1
    }
}

/**
 * Removes a vertex from an animation graph. Warns if vertex was not found in the animation graph.
 * @param graph - Animation graph to remove vertex from
 * @param vertex - Vertex to remove
 */
export function removeVertex(
    graph: AnimationGraph,
    vertex: AnimationGraph | AnimationNode,
    options: VertexOptions = {}
) {
    options.abstractionIndex = options.abstractionIndex ?? graph.currentAbstractionIndex
    const { vertices: graphVertices, edges: graphEdges } = graph.abstractions[options.abstractionIndex]

    const index = graphVertices.indexOf(vertex)
    if (index == -1) {
        console.warn('Attempting to remove non-existent vertex', vertex)
        return
    }

    removeVertexAt(graph, index)
}

/**
 *
 * @param index
 * @param edges
 * @returns
 */
export function getNeighbours(index: number, edges: Edge[]): { neighbour: number; road: Edge }[] {
    const neighbours = []

    for (const edge of edges) {
        if (edge.from == index) {
            neighbours.push({ neighbour: edge.to, road: edge })
        }
    }

    return neighbours
}

export function getOutgoingNeighbours(index: number, edges: Edge[]): { neighbour: number; road: Edge }[] {
    const neighbours = []

    for (const edge of edges) {
        if (edge.to == index) {
            neighbours.push({ neighbour: edge.from, road: edge })
        }
    }

    return neighbours
}

export function getOutgoingFlow(index: number, edges: Edge[], mask: Set<number> = new Set()): number[] {
    const outgoing: number[] = []

    const visited = new Set([index])
    const queue = [index]

    while (queue.length != 0) {
        // Vertex that'll be visited now
        const vertex = queue.shift()

        const neighbours = getNeighbours(vertex, edges)

        for (const { neighbour, road } of neighbours) {
            if (mask.has(neighbour)) continue

            if (road.type == EdgeType.FlowEdge) {
                outgoing.push(neighbour)
            }

            if (!visited.has(neighbour)) {
                queue.push(neighbour)
                visited.add(neighbour)
            }
        }
    }

    return outgoing
}

export function getIncomingFlow(index: number, edges: Edge[], mask: Set<number> = new Set()): number[] {
    const incoming: number[] = []

    const visited = new Set([index])
    const queue = [index]

    while (queue.length != 0) {
        // Vertex that'll be visited now
        const vertex = queue.shift()

        const neighbours = getOutgoingNeighbours(vertex, edges)

        for (const { neighbour, road } of neighbours) {
            if (mask.has(neighbour)) continue

            if (road.type == EdgeType.FlowEdge) {
                incoming.push(neighbour)
            }

            if (!visited.has(neighbour)) {
                queue.push(neighbour)
                visited.add(neighbour)
            }
        }
    }
    return incoming
}

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
 * TODO: either direct comparison, or item in an object (i.e. a write to the entire object)
 * Also only applies to the curr level of abstraction (specified by graph.currentAbstractionIndex)
 */
export function computeEdges(index: number, graph: AnimationGraph, masks: Set<string>[] = []): Edge[] {
    let edges: Edge[] = []

    const { vertices: graphVertices } = graph.abstractions[graph.currentAbstractionIndex]

    let rs = reads(graphVertices[index]) // Reads
    let ws = writes(graphVertices[index]) // Writes

    const flow_added: AnimationData[] = []
    const anti_added: AnimationData[] = []
    const output_added: AnimationData[] = []
    // const conditional_added = new Set();

    // let candidates = [];

    // candidates = graph.vertices.slice(0, index - 1);
    // candidates.reverse();

    // Look at all vertices 'before' this one, starting from the closest one

    for (let i = index - 1; i >= 0; i--) {
        let other = graphVertices[i]

        let other_rs = reads(other)
        let other_ws = writes(other)

        // If this statement read something that the other statement writes to
        const flow: AnimationData[] = intersection(rs, other_ws)

        // If this statement writes something that the other statement reads from
        const anti = intersection(ws, other_rs)

        // If this statement writes something that the other statement writes to
        const output = intersection(ws, other_ws)

        const fromId = graphVertices[i].id
        const toId = graphVertices[index].id

        if (masks.some((group) => group.has(fromId) && group.has(toId))) {
            continue
        }

        // Add flow edges
        for (const data of flow) {
            if (flow_added.some((existing) => existing.id == data.id)) continue
            edges.push(createEdge(EdgeType.FlowEdge, i, index, data))
            flow_added.push(data)
        }

        // Add anti edges
        for (const data of anti) {
            if (anti_added.some((existing) => existing.id == data.id)) continue
            edges.push(createEdge(EdgeType.AntiEdge, i, index, data))
            anti_added.push(data)
        }

        // Add output edges
        for (const data of output) {
            if (output_added.some((existing) => existing.id == data.id) || i == index) continue
            edges.push(createEdge(EdgeType.OutputEdge, i, index, data))
            output_added.push(data)
        }
    }

    return edges
}

export function computeAllEdges(graph: AnimationGraph, masks: Set<string>[] = []) {
    let edges: Set<Edge> = new Set()

    const { vertices } = graph.abstractions[graph.currentAbstractionIndex]

    for (let i = 0; i < vertices.length; i++) {
        edges = new Set([...edges, ...computeEdges(i, graph, masks)])
    }

    edges.forEach((edge) => {
        addEdge(graph, edge)
    })
}

export function computeAllGraphEdges(animation: AnimationGraph) {
    if (instanceOfAnimationGraph(animation)) {
        const { vertices } = currentAbstraction(animation)

        for (const node of vertices) {
            if (instanceOfAnimationGraph(node)) {
                computeAllGraphEdges(node)
            }
        }
    }

    computeAllEdges(animation)
}

/**
 * Returns the intersection between two animation data sets A, B
 * @param A
 * @param B
 * @returns
 */
export function intersection(A: AnimationData[], B: AnimationData[]) {
    let intersection = []

    const satisfier = (a: AnimationData, b: AnimationData) => {
        const b_location = b.location.map((item) => item.value)
        const a_location = a.location.map((item) => item.value)

        if (
            JSON.stringify(b_location.slice(0, -1)) == JSON.stringify(a_location) ||
            JSON.stringify(b_location) == JSON.stringify(a_location.slice(0, -1))
        ) {
            return true
        }

        return b.id == a.id || JSON.stringify(b_location) == JSON.stringify(a_location)
    }

    for (const a of A) {
        if (B.some((b) => satisfier(a, b))) {
            intersection.push(a)
        }
    }

    return intersection
}

// export function animationDataToString(data: AnimationData) {
//     // return `D(${data.id})`;
//     return `D(${data.location.map((acc) => `${acc.value.toString()}`).join('#')})`;
// }

/*
#fontSize: 8
#spacing: 16
#padding: 0
#ranker: longest-path
#lineWidth: 1

#.box: fill=#454442 stroke=#FDF6E3
*/

export function animationToString(
    animation: AnimationGraph | AnimationNode,
    indent = 0,
    options = { first: false },
    logUrl = false
) {
    if (animation == null) return

    if (instanceOfAnimationNode(animation)) {
        const space = `${'\t'.repeat(options.first ? 0 : indent)}`
        return space + `[<box> ${animation.name} --- ${animation.id} ]`
    }

    let output = ''

    let visited_vertices = new Set()
    let visited_edges = new Set()

    const lookup = {}

    const { vertices: animationVertices, edges: animationEdges } = currentAbstraction(animation)

    const sortedEdges = clone(animationEdges)

    const sortingScore = (edge: Edge) => {
        if (edge.type == EdgeType.FlowEdge) {
            return 0
        } else if (edge.type == EdgeType.OutputEdge) {
            return 1
        } else if (edge.type == EdgeType.AntiEdge) {
            return 2
        } else {
            return 3
        }
    }

    sortedEdges.sort((a, b) => sortingScore(a) - sortingScore(b))

    // console.log(sortedEdges);

    // Flow edges
    for (const edge of sortedEdges) {
        visited_vertices.add(edge.to)
        visited_vertices.add(edge.from)
        visited_edges.add(`${edge.to}_${edge.from}`)

        if (!(edge.from in lookup)) {
            let v1 = animationVertices[edge.from]
                ? animationToString(animationVertices[edge.from], indent + 1, { first: true })
                : `[${edge.from}_Null]`
            lookup[edge.from] = v1
        }

        if (!(edge.to in lookup)) {
            let v2 = animationVertices[edge.to]
                ? animationToString(animationVertices[edge.to], indent + 1, { first: true })
                : `[${edge.to}_Null]`
            lookup[edge.to] = v2
        }

        output += `${'\t'.repeat(indent + 1)}${lookup[edge.from]}->${lookup[edge.to]}\n${output}`
    }

    // Sequential edges
    for (let i = animationVertices.length - 1; i >= 1; i--) {
        const from = i - 1
        const to = i

        if (visited_edges.has(`${to}_${from}`)) continue

        visited_vertices.add(to)
        visited_vertices.add(from)
        visited_edges.add(`${to}_${from}`)

        // console.log(animation.id, from, to);
        // if (animation.vertices[from] == animation) console.log('CIRCULAR');

        if (!(from in lookup)) {
            let v1 = animationVertices[from]
                ? animationToString(animationVertices[from], indent + 1, { first: true })
                : `[${from}_Null]`
            lookup[from] = v1
        }

        if (!(to in lookup)) {
            let v2 = animationVertices[to]
                ? animationToString(animationVertices[to], indent + 1, { first: true })
                : `[${to}_Null]`
            lookup[to] = v2
        }

        output = `${'\t'.repeat(indent + 1)}${lookup[from]}--${lookup[to]}\n${output}`
    }

    // Left out vertices
    for (let i = 0; i < animationVertices.length; i++) {
        if (animationVertices[i] == null) continue
        if (i in lookup) continue

        if (!visited_vertices.has(i)) {
            output += `${animationToString(animationVertices[i], indent + 1, {
                first: false,
            })}\n`
        }
    }

    output = `${'\t'.repeat(options.first ? 0 : indent)}[<package> ${animation.nodeData?.type} ${
        animation.id
    } |\n${output}`

    output += `${'\t'.repeat(indent)}]`

    if (logUrl) {
        const config = `#fontSize: 8
#spacing: 16
#.box: fill=#454442 stroke=#FDF6E3
#padding: 0
#ranker: longest-path
#lineWidth: 1`

        const url = `https://nomnoml.com/image.svg?source=${encodeURIComponent(`${config}\n${output}`)}`
        return [output, url]
    }

    return output
}

export enum AnimationTraceOperator {
    CreateLiteral = 'Create',
    CreateReference = 'CreateReference',
    CreateArray = 'CreateArray',

    MoveAndPlace = 'MoveAndPlace',

    CopyLiteral = 'CopyLiteral',
}

export interface AnimationTraceChain {
    value: AnimationData
    children?: [operator: AnimationTraceOperator, child: AnimationTraceChain][]
}

export function queryAnimationGraph(
    animation: AnimationGraph | AnimationNode,
    query: (animation: AnimationGraph | AnimationNode) => boolean
): (AnimationGraph | AnimationNode)[] {
    if (instanceOfAnimationNode(animation) && query(animation)) {
        return [animation]
    }

    if (instanceOfAnimationGraph(animation)) {
        const acc = []
        for (const vertex of currentAbstraction(animation).vertices) {
            acc.push(...queryAnimationGraph(vertex, query))
        }
        return acc
    }

    return []
}

export function getTrace(
    animation: AnimationGraph | AnimationNode,
    flow: AnimationTraceChain[] = null
): AnimationTraceChain[] {
    // Set default flow to ids of literals and arrays in environment
    if (flow == null) {
        const environment = clone(animation.postcondition.environment)

        flow = []

        // Only render literals and arrays
        const endMemory = flattenedEnvironmentMemory(environment)
            .filter((m) => m != null)
            .filter((data) => data.type == DataType.Literal || data.type == DataType.Array)

        // Add each memory ID as start to flow
        for (const data of endMemory) {
            flow.push({
                value: { id: data.id, location: getMemoryLocation(environment, data).foundLocation },
            })
        }
    }

    // Update the flow based on operation of animation node
    if (instanceOfAnimationNode(animation)) {
        const traces = getTracesFromAnimationNode(animation)

        for (let i = flow.length - 1; i >= 0; i--) {
            const chain = flow[i]
            const leaves = getAnimationTraceChainLeaves(chain)

            for (let j = traces.length - 1; j >= 0; j--) {
                const trace = traces[j]
                for (const leaf of leaves) {
                    if (leaf.value?.id == trace.value.id) {
                        leaf.children = clone(trace.children)
                    }
                }
            }
        }
    } else {
        const { vertices } = currentAbstraction(animation)

        for (let i = vertices.length - 1; i >= 0; i--) {
            flow = getTrace(vertices[i], clone(flow))
        }
    }

    return flow
}

export function getChunkTrace(chunk: AnimationChunk, flow: AnimationTraceChain[] = null): AnimationTraceChain[] {
    const postcondition = chunk.nodes[chunk.nodes.length - 1].postcondition

    // Set default flow to ids of literals and arrays in environment
    if (flow == null) {
        const environment = clone(postcondition.environment)

        flow = []

        // Only render literals and arrays
        const endMemory = flattenedEnvironmentMemory(environment)
            .filter((m) => m != null)
            .filter((data) => data.type == DataType.Literal || data.type == DataType.Array)

        // Add each memory ID as start to flow
        for (const data of endMemory) {
            flow.push({
                value: { id: data.id, location: getMemoryLocation(environment, data).foundLocation },
            })
        }
    }

    // Update the flow based on operation of animation node
    for (let i = chunk.nodes.length - 1; i >= 0; i--) {
        flow = getTrace(chunk.nodes[i], clone(flow))
    }

    return flow
}

export function getUnionOfLocations(locs: ESTree.SourceLocation[]): ESTree.SourceLocation {
    let start = locs[0].start
    let end = locs[0].end

    for (const loc of locs) {
        if (loc.start.line < start.line) {
            start = loc.start
        }

        if (loc.end.line > end.line) {
            end = loc.end
        }
    }

    return {
        start,
        end,
    }
}

export function getTracesFromAnimationNode(animation: AnimationNode): AnimationTraceChain[] {
    // Direct movements (to <-- from)
    let traces: AnimationTraceChain[] = []

    const rs = reads(animation)
    const ws = writes(animation)

    switch (animation._name) {
        case 'MoveAndPlaceAnimation':
            // First trace is the move (i.e. writes[0] <- reads[0])
            traces.push({
                value: ws[0],
                children: [[AnimationTraceOperator.MoveAndPlace, { value: rs[0] }]],
            })

            break
        case 'CopyDataAnimation':
            // Copy <-- Original
            traces.push({
                value: ws[0],
                children: [[AnimationTraceOperator.CopyLiteral, { value: rs[0] }]],
            })
            break
        case 'CreateLiteralAnimation':
            // Literal <-- Create
            traces.push({
                value: ws[0],
                children: [[AnimationTraceOperator.CreateLiteral, { value: null }]],
            })
            break
        case 'BindAnimation':
            // If created 'undefined' to reference location
            if (ws.length == 2) {
                traces.push({
                    value: ws[1],
                    children: [[AnimationTraceOperator.CreateLiteral, { value: null }]],
                })
            }

            // Creating reference
            traces.push({
                value: ws[0],
                children: [[AnimationTraceOperator.CreateReference, { value: null }]],
            })
            break
        case 'FindVariableAnimation':
            break
        case 'GroupStartAnimation':
            break
        case 'ArrayStartAnimation':
            // Creating array
            traces.push({
                value: ws[0],
                children: [[AnimationTraceOperator.CreateArray, { value: null }]],
            })
            break
        case 'GetMember':
            // TODO, reference get members
            traces.push({
                value: ws[0],
                children: [[AnimationTraceOperator.CopyLiteral, { value: rs[0] }]],
            })
            break
        default:
            console.warn('Trace not found for', animation._name, animation)
    }

    return traces
}

export function getAnimationTraceChainLeaves(chain: AnimationTraceChain): AnimationTraceChain[] {
    if (chain.children == null) return [chain]

    let leaves: AnimationTraceChain[] = []

    for (const child of chain.children) {
        leaves = [...leaves, ...getAnimationTraceChainLeaves(child[1])]
    }

    return leaves
}

let CHAIN_COUNTER = 0

export function traceChainsToString(chains: AnimationTraceChain[], logUrl: boolean = true) {
    let output = ''

    for (const chain of chains) {
        output += `\n${traceChainToString(chain).output}`
    }

    if (logUrl) {
        const config = `#fontSize: 8
#spacing: 16
#.box: fill=#454442 stroke=#FDF6E3
#padding: 0
#ranker: longest-path
#lineWidth: 1
#ranker: tight-tree`

        const url = `https://nomnoml.com/image.svg?source=${encodeURIComponent(`${config}\n${output}`)}`
        console.log(url)
        console.log(chains)
    }
    return output
}

export function traceChainToString(chain: AnimationTraceChain) {
    if (chain == null) return

    let box = chain.value == null ? `[NULL \\[${++CHAIN_COUNTER}\\]]` : `[${chain.value.id} \\[${++CHAIN_COUNTER}\\]]`
    let rest = ''

    for (const child of chain.children ?? []) {
        const operator = child[0]
        const childChain = child[1]

        const { box: childBox, output: childString } = traceChainToString(childChain)

        rest += `\n${childString}`
        rest += `\n${box}-->${operator.toString()}${childBox}`
    }

    const output = `${box}\n${rest}`

    return { box, output }
}

// export function computeParentIds(animation: AnimationGraph | AnimationNode, parentIds: Set<string> = new Set()) {
//     animation.parentIds = parentIds;

//     if (animation instanceof AnimationGraph) {
//         for (const node of animation.vertices) {
//             computeParentIds(node, new Set([animation.id, ...parentIds]));
//         }
//     }
// }

// export function dissolve(animation: AnimationGraph) {
//     let masks: Set<string>[] = [];

//     // Dissolve all children
//     for (let i = animation.vertices.length - 1; i >= 0; i--) {
//         const group = dissolveAt(animation, i);
//         masks.push(new Set(group));
//     }

//     if (
//         animation.vertices[0] instanceof CreateScopeAnimation &&
//         animation.vertices[animation.vertices.length - 1] instanceof PopScopeAnimation
//     ) {
//         // Remove create and pop scope animations
//         animation.removeVertexAt(animation.vertices.length - 1);
//         animation.removeVertexAt(0);
//     }

//     computeAllEdges(animation);
// }

// export function dissolveAt(parent: AnimationGraph, i: number) {
//     let vertex = parent.vertices[i];
//     if (vertex instanceof AnimationNode) {
//         return;
//     }

//     dissolve(vertex);

//     // Dissolve all children
//     // for (let i = vertex.vertices.length - 1; i >= 0; i--) {
//     //   const group = dissolveAt(vertex, i);
//     //   // masks.push(new Set(group));
//     // }

//     let ids = vertex.vertices.map((v) => v.id);

//     if (
//         vertex.vertices[0] instanceof CreateScopeAnimation &&
//         vertex.vertices[vertex.vertices.length - 1] instanceof PopScopeAnimation
//     ) {
//         // Remove create and pop scope animations
//         vertex.removeVertexAt(vertex.vertices.length - 1);
//         vertex.removeVertexAt(0);
//     }

//     // Gut out the animations and edges from vertex and place them in front of this vertex

//     // Mark the start and end vertices of the graph
//     // const startIds: Set<string> = new Set();
//     // const endIds: Set<string> = new Set();
//     // for (let j = 0; j < vertex.vertices.length; j++) {
//     //     const outgoing_flow = getOutgoingFlow(j, vertex.edges);
//     //     const incoming_flow = getIncomingFlow(j, vertex.edges);

//     //     if (incoming_flow.length == 0) {
//     //         startIds.add(vertex.vertices[j].id);
//     //     }

//     //     if (outgoing_flow.length == 0) {
//     //         endIds.add(vertex.vertices[j].id);
//     //     }
//     // }

//     // const incoming_edges: Edge[] = [];
//     // const outgoing_edges: Edge[] = [];

//     // for (const edge of parent.edges) {
//     //     if (edge.to == i) {
//     //         incoming_edges.push(edge);
//     //     }

//     //     if (edge.from == i) {
//     //         outgoing_edges.push(edge);
//     //     }
//     // }

//     // Remove all old edges
//     for (let k = parent.edges.length - 1; k >= 0; k--) {
//         if (parent.edges[k].from == i || parent.edges[k].to == i) {
//             parent.edges.splice(k, 1);
//         }
//     }

//     for (let j = vertex.vertices.length - 1; j >= 0; j--) {
//         parent.addVertexAt(vertex.vertices[j], i + 1);
//     }

//     for (let j = 0; j < vertex.edges.length; j++) {
//         vertex.edges[j].from += i + 1;
//         vertex.edges[j].to += i + 1;

//         parent.edges.push(vertex.edges[j]);
//     }

//     // Redirect edges that were coming into 'i' to all of its start nodes
//     // for (const edge of incoming_edges) {
//     //     for (let k = parent.vertices.length - 1; k >= 0; k--) {
//     //         if (startIds.has(parent.vertices[k].id)) {
//     //             const copy: Edge = new (<any>edge.constructor)(edge.from, k, edge.data);
//     //             parent.addEdge(copy);
//     //         }
//     //     }
//     // }

//     // // Redirect edges that were outgoing from 'i' to all of its end nodes
//     // for (const edge of outgoing_edges) {
//     //     for (let k = parent.vertices.length - 1; k >= 0; k--) {
//     //         if (endIds.has(parent.vertices[k].id)) {
//     //             const copy: Edge = new (<any>edge.constructor)(k, edge.to, edge.data);
//     //             parent.addEdge(copy);
//     //         }
//     //     }
//     // }

//     // Remove vertex
//     parent.removeVertexAt(i);

//     return ids;
// }
