import * as ESTree from 'estree'
import { sha1 } from 'object-hash'
import { DataType } from '../../environment/data/DataState'
import { flattenedEnvironmentMemory, getMemoryLocation } from '../../environment/environment'
import { clone } from '../../utilities/objects'
import { View } from '../../view/View'
import { addEdge, reads, writes } from '../execution'
import { ExecutionNode, instanceOfExecutionNode, NodeData } from '../primitive/ExecutionNode'
import { getAllBranches } from './abstraction/Transition'
import { createEdge, Edge, EdgeType } from './edges/Edge'
import {
    DataInfo,
    ExecutionGraph,
    GlobalDataInfo,
    instanceOfExecutionGraph,
} from './ExecutionGraph'

export interface VertexOptions {
    nodeData?: NodeData
    shouldDissolve?: boolean
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
export function addVertex(
    graph: ExecutionGraph,
    vertex: ExecutionGraph | ExecutionNode,
    options: VertexOptions = {}
) {
    // Defaults
    options.shouldDissolve = options.shouldDissolve ?? false

    const { vertices: graphVertices, edges: graphEdges } = graph

    if (
        instanceOfExecutionNode(vertex) ||
        (instanceOfExecutionGraph(vertex) && !options.shouldDissolve)
    ) {
        if (instanceOfExecutionGraph(vertex) && vertex.isGroup) {
            updateGroupNodeData(vertex)
            graphVertices.push(vertex)
        } else {
            vertex.nodeData = options.nodeData
            graphVertices.push(vertex)
        }
    } else {
        const { vertices: vertexVertices, edges: vertexEdges } = vertex

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
    graph: ExecutionGraph,
    i: number,
    vertex: ExecutionGraph | ExecutionNode,
    options: VertexOptions = {}
) {
    const { vertices: graphVertices, edges: graphEdges } = graph

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
        preLabel: null,
    }
}

export function updateGroupNodeData(graph: ExecutionGraph, options: VertexOptions = {}) {
    const { vertices: graphVertices, edges: graphEdges } = graph

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
        preLabel: null,
    }
}

/**
 * Removes a vertex from an animation graph at the given index.
 * @param graph - Animation graph to remove from
 * @param i - Vertex to remove at
 */
export function removeVertexAt(graph: ExecutionGraph, i: number, options: VertexOptions = {}) {
    const { vertices: graphVertices, edges: graphEdges } = graph

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
    graph: ExecutionGraph,
    vertex: ExecutionGraph | ExecutionNode,
    options: VertexOptions = {}
) {
    const { vertices: graphVertices, edges: graphEdges } = graph

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

export function getOutgoingNeighbours(
    index: number,
    edges: Edge[]
): { neighbour: number; road: Edge }[] {
    const neighbours = []

    for (const edge of edges) {
        if (edge.to == index) {
            neighbours.push({ neighbour: edge.from, road: edge })
        }
    }

    return neighbours
}

export function getOutgoingFlow(
    index: number,
    edges: Edge[],
    mask: Set<number> = new Set()
): number[] {
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

export function getIncomingFlow(
    index: number,
    edges: Edge[],
    mask: Set<number> = new Set()
): number[] {
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
export function computeEdges(
    index: number,
    graph: ExecutionGraph,
    masks: Set<string>[] = []
): Edge[] {
    let edges: Edge[] = []

    const { vertices: graphVertices } = graph

    let rs = reads(graphVertices[index]) // Reads
    let ws = writes(graphVertices[index]) // Writes

    const flow_added: DataInfo[] = []
    const anti_added: DataInfo[] = []
    const output_added: DataInfo[] = []
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
        const flow: DataInfo[] = intersection(rs, other_ws)

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

export function computeAllEdges(graph: ExecutionGraph, masks: Set<string>[] = []) {
    let edges: Set<Edge> = new Set()

    const { vertices } = graph

    for (let i = 0; i < vertices.length; i++) {
        edges = new Set([...edges, ...computeEdges(i, graph, masks)])
    }

    edges.forEach((edge) => {
        addEdge(graph, edge)
    })
}

export function computeAllGraphEdges(animation: ExecutionGraph) {
    if (instanceOfExecutionGraph(animation)) {
        const { vertices } = animation

        for (const node of vertices) {
            if (instanceOfExecutionGraph(node)) {
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
export function intersection(A: DataInfo[], B: DataInfo[]) {
    let intersection = []

    const satisfier = (a: DataInfo, b: DataInfo) => {
        const b_location = b.location.map((item) => item.value)

        // console.log(a)
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

// export function DataInfoToString(data: DataInfo) {
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
    animation: ExecutionGraph | ExecutionNode,
    indent = 0,
    options = { first: false },
    logUrl = false
) {
    if (animation == null) return

    if (instanceOfExecutionNode(animation)) {
        const space = `${'\t'.repeat(options.first ? 0 : indent)}`
        return space + `[<box> ${animation.name} --- ${animation.id} ]`
    }

    let output = ''

    let visited_vertices = new Set()
    let visited_edges = new Set()

    const lookup = {}

    const { vertices: animationVertices, edges: animationEdges } = animation

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
                ? animationToString(animationVertices[edge.from], indent + 1, {
                      first: true,
                  })
                : `[${edge.from}_Null]`
            lookup[edge.from] = v1
        }

        if (!(edge.to in lookup)) {
            let v2 = animationVertices[edge.to]
                ? animationToString(animationVertices[edge.to], indent + 1, {
                      first: true,
                  })
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
                ? animationToString(animationVertices[from], indent + 1, {
                      first: true,
                  })
                : `[${from}_Null]`
            lookup[from] = v1
        }

        if (!(to in lookup)) {
            let v2 = animationVertices[to]
                ? animationToString(animationVertices[to], indent + 1, {
                      first: true,
                  })
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

        const url = `https://nomnoml.com/image.svg?source=${encodeURIComponent(
            `${config}\n${output}`
        )}`
        return [output, url]
    }

    return output
}

export enum AnimationTraceOperatorType {
    CreateLiteral = 'Create',
    CreateReference = 'CreateReference',
    CreateVariable = 'CreateVariable',
    CreateArray = 'CreateArray',
    MoveAndPlace = 'MoveAndPlace',
    Place = 'Place',
    CopyLiteral = 'CopyLiteral',
    BinaryOperation = 'BinaryOperation',
    UpdateOperation = 'UpdateOperation',
    Unknown = 'Unknown',
}

export interface AnimationTraceOperator {
    type: AnimationTraceOperatorType
    executionId: string
}

export interface AugmentedDataInfo extends DataInfo {
    executionId: string
}

export interface AnimationTraceChain {
    value: AugmentedDataInfo
    children?: [operator: AnimationTraceOperator, child: AnimationTraceChain][]
}

export interface GlobalAnimationTraceChain {
    value: GlobalDataInfo
    children?: [operator: AnimationTraceOperator, child: GlobalAnimationTraceChain][]
}

export function getGlobalTrace(parent: View, leaves: View[], index: number) {
    const parentTrace = getTrace(parent.originalExecution)
    traceChainsToString(parentTrace, true)
    let globalTraces: GlobalAnimationTraceChain[] = []

    const contains = (view: View, traceChain: AnimationTraceChain, log = false) => {
        const representation = Object.keys(
            view.renderer.animationRenderer.environmentRenderer.getAllChildRenderers()
        )
        if (traceChain.value == null) return false

        const operation = traceChain.children?.[0]?.[0]
        // const executionId = operation?.executionId ?? traceChain.value.executionId

        const a =
            operation != null
                ? queryExecutionGraph(
                      view.originalExecution,
                      (e) => e.id == operation?.executionId
                  ) != null
                : true
        const b = representation.includes(traceChain.value.id)

        if (log) {
            console.log(
                a,
                operation?.executionId,
                traceChain.value.executionId,
                view.originalExecution.id
            )
            console.log(b, traceChain.value.id, representation)
            console.log('\n')
        }

        return a && b
    }

    for (const trace of parentTrace) {
        let branches = getAllBranches(trace)

        for (const branch of branches) {
            let branchPointer = branch
            let currIndex = index

            // Find representation that includes data
            while (currIndex >= 0 && !contains(leaves[currIndex], branchPointer, null)) {
                currIndex--
            }
            if (currIndex < 0) continue

            let globalTrace: GlobalAnimationTraceChain = {
                value: {
                    location: {
                        viewId: leaves[currIndex].id,
                        localLocation: branch.value.location,
                    },
                    id: branch.value.id,
                },
                children: [],
            }

            if (branchPointer.children == null || branch.children.length == 0) {
                continue
            }

            // Next child in branch
            let operation = branchPointer.children?.[0]?.[0]
            branchPointer = branchPointer.children[0][1]

            // Look for next child in previous view
            currIndex -= 1

            // While there are more children
            while (branchPointer != null && branchPointer.value != null) {
                let assignedNode = false

                // Try to find a view which contains that node;
                for (let i = currIndex; i >= 0; i--) {
                    const view = leaves[i]

                    if (contains(view, branchPointer, false)) {
                        // Decrement current view
                        currIndex = i - 1

                        // Add to end of chain
                        let end = globalTrace
                        while (end.children.length > 0) {
                            end = end.children[0][1]
                        }

                        const node = {
                            value: {
                                location: {
                                    viewId: view.id,
                                    localLocation: branchPointer.value.location,
                                },
                                id: branchPointer.value.id,
                            },
                            children: [],
                        }

                        const operator = operation ?? {
                            type: AnimationTraceOperatorType.Unknown,
                            executionId: null,
                        }

                        end.children.push([operator, node])
                        assignedNode = true
                        break
                    }
                }

                if (!assignedNode) {
                    // It becomes an operation, add to end of chain
                    let end = globalTrace
                    while (end.children.length > 0) {
                        end = end.children[0][1]
                    }

                    const node = {
                        value: {
                            location: {
                                viewId: null,
                                localLocation: branchPointer.value.location,
                            },
                            id: branchPointer.value.id,
                        },
                        children: [],
                    }

                    const operator = operation ?? {
                        type: AnimationTraceOperatorType.Unknown,
                        executionId: null,
                    }

                    end.children.push([operator, node])
                }

                if (branchPointer.children == null || branch.children.length == 0) {
                    operation = null
                    branchPointer = null
                } else {
                    operation = branchPointer.children?.[0]?.[0]
                    branchPointer = branchPointer.children[0][1]
                }
            }

            globalTraces.push(globalTrace)
        }
    }

    return globalTraces
}

export function getGlobalTraces(parent: View): GlobalAnimationTraceChain[] {
    if (!parent.state.isShowingSteps) {
        return null
    }

    const leaves = getLeavesOfView(parent)
    let globalTraces: GlobalAnimationTraceChain[] = []

    const cache: Set<string> = new Set<string>()

    // Create trace from target to other leaves
    for (let i = leaves.length - 1; i >= 1; i--) {
        for (const trace of getGlobalTrace(parent, leaves, i)) {
            const hash = sha1(trace)
            if (cache.has(hash)) continue

            globalTraces.push(trace)

            cache.add(hash)
        }
    }

    return globalTraces
}

export function getLeavesOfView(parent: View): View[] {
    let leaves: View[] = []
    let candidates: View[] = [parent]
    let filter: Set<string> = new Set()

    while (candidates.length > 0) {
        const candidate = candidates.pop()
        if (!candidate.state.isShowingSteps) {
            leaves.push(candidate)
            const renderers =
                candidate.renderer.animationRenderer?.environmentRenderer.getAllChildRenderers()
            const showing = Object.keys(renderers ?? {})
            filter = new Set([...filter, ...showing])
            continue
        }

        for (const view of candidate.stepsTimeline.views) {
            candidates.push(view)
        }
    }
    leaves.reverse()

    return leaves
}

export function queryExecutionGraph(
    animation: ExecutionGraph | ExecutionNode,
    query: (animation: ExecutionGraph | ExecutionNode) => boolean
): ExecutionGraph | ExecutionNode {
    if (query(animation)) {
        return animation
    }

    if (instanceOfExecutionGraph(animation)) {
        for (const vertex of animation.vertices) {
            const ret = queryExecutionGraph(vertex, query)
            if (ret != null) {
                return ret
            }
        }
    }

    return null
}

export function queryAllExecutionGraph(
    animation: ExecutionGraph | ExecutionNode,
    query: (animation: ExecutionGraph | ExecutionNode) => boolean
): (ExecutionGraph | ExecutionNode)[] {
    const acc = []

    if (query(animation)) {
        acc.push(animation)
    }

    if (instanceOfExecutionGraph(animation)) {
        for (const vertex of animation.vertices) {
            acc.push(...queryAllExecutionGraph(vertex, query))
        }
    }

    return acc
}

export function getTrace(
    animation: ExecutionGraph | ExecutionNode,
    flow: AnimationTraceChain[] = null
): AnimationTraceChain[] {
    // Set default flow to ids of literals and arrays in environment
    if (flow == null) {
        const environment = clone(animation.postcondition)

        flow = []

        // Only render literals and arrays
        const endMemory = flattenedEnvironmentMemory(environment)
            .filter((m) => m != null)
            .filter((data) => data.type != DataType.ID)

        // Add each memory ID as start to flow
        for (const data of endMemory) {
            flow.push({
                value: {
                    id: data.id,
                    location: getMemoryLocation(environment, data).foundLocation,
                    executionId: animation.id,
                },
            })
        }

        // Add variable bindings
        for (const frame of environment.scope) {
            for (const [key, identifier] of Object.entries(frame.bindings)) {
                flow.push({
                    value: {
                        id: identifier.name,
                        location: identifier.location,
                        executionId: animation.id,
                    },
                })
            }
        }
    }

    // Update the flow based on operation of animation node
    if (instanceOfExecutionNode(animation)) {
        const traces = getTracesFromExecutionNode(animation)

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
        const { vertices } = animation

        for (let i = vertices.length - 1; i >= 0; i--) {
            flow = getTrace(vertices[i], clone(flow))
        }
    }

    return flow
}

export function getChunkTrace(
    nodes: (ExecutionGraph | ExecutionNode)[],
    flow: AnimationTraceChain[] = null
): AnimationTraceChain[] {
    // Chunk
    const postcondition = nodes[nodes.length - 1].postcondition

    // Set default flow to ids of literals and arrays in environment
    if (flow == null) {
        const environment = clone(postcondition)

        flow = []

        // Don't render registers
        const endMemory = flattenedEnvironmentMemory(environment)
            .filter((m) => m != null)
            .filter((data) => data.type != DataType.ID)

        // Add each memory ID as start to flow
        for (const data of endMemory) {
            flow.push({
                value: {
                    id: data.id,
                    location: getMemoryLocation(environment, data).foundLocation,
                    executionId: nodes[nodes.length - 1].id,
                },
            })
        }

        // Add variable bindings
        for (const frame of environment.scope) {
            for (const [key, identifier] of Object.entries(frame.bindings)) {
                flow.push({
                    value: {
                        id: identifier.name,
                        location: identifier.location,
                        executionId: nodes[nodes.length - 1].id,
                    },
                })
            }
        }
    }

    // Update the flow based on operation of animation node
    for (let i = nodes.length - 1; i >= 0; i--) {
        flow = getTrace(nodes[i], clone(flow))
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

export function getTracesFromExecutionNode(animation: ExecutionNode): AnimationTraceChain[] {
    // Direct movements (to <-- from)
    let traces: AnimationTraceChain[] = []

    const rs = reads(animation).map((r) => ({ ...r, executionId: animation.id }))
    const ws = writes(animation).map((w) => ({ ...w, executionId: animation.id }))

    switch (animation._name) {
        case 'MoveAndPlaceAnimation':
            if (ws.length == 2) {
                // Move and place
                // First trace is the move (i.e. writes[0] <- reads[0])
                traces.push({
                    value: ws[0],
                    children: [
                        [
                            {
                                type: AnimationTraceOperatorType.MoveAndPlace,
                                executionId: animation.id,
                            },
                            { value: rs[0] },
                        ],
                    ],
                })
            } else {
                // Place
                traces.push({
                    value: ws[0],
                    children: [
                        [
                            { type: AnimationTraceOperatorType.Place, executionId: animation.id },
                            { value: rs[0] },
                        ],
                    ],
                })
            }

            break
        case 'CopyDataAnimation':
            // Copy <-- Original
            traces.push({
                value: ws[0],
                children: [
                    [
                        { type: AnimationTraceOperatorType.CopyLiteral, executionId: animation.id },
                        { value: rs[0] },
                    ],
                ],
            })
            break
        case 'CreateLiteralAnimation':
            // Literal <-- Create
            traces.push({
                value: ws[0],
                children: [
                    [
                        {
                            type: AnimationTraceOperatorType.CreateLiteral,
                            executionId: animation.id,
                        },
                        { value: null },
                    ],
                ],
            })
            break
        case 'BindAnimation':
            // If created 'undefined' to reference location
            if (ws.length == 3) {
                traces.push({
                    value: ws[2],
                    children: [
                        [
                            {
                                type: AnimationTraceOperatorType.CreateLiteral,
                                executionId: animation.id,
                            },
                            { value: null },
                        ],
                    ],
                })
            }

            // Creating reference
            traces.push({
                value: ws[1],
                children: [
                    [
                        {
                            type: AnimationTraceOperatorType.CreateReference,
                            executionId: animation.id,
                        },
                        { value: null },
                    ],
                ],
            })

            // Creating variable
            traces.push({
                value: ws[0],
                children: [
                    [
                        {
                            type: AnimationTraceOperatorType.CreateVariable,
                            executionId: animation.id,
                        },
                        { value: null },
                    ],
                ],
            })
            break
        case 'ArrayStartAnimation':
            // Creating array
            traces.push({
                value: ws[0],
                children: [
                    [
                        { type: AnimationTraceOperatorType.CreateArray, executionId: animation.id },
                        { value: null },
                    ],
                ],
            })
            break
        case 'GetMember':
            // TODO, reference get members

            if (rs.length == 2) {
                // Static property like 'length'
                traces.push({
                    value: ws[0],
                    children: [
                        [
                            {
                                type: AnimationTraceOperatorType.CreateLiteral,
                                executionId: animation.id,
                            },
                            { value: null },
                        ],
                    ],
                })
            } else {
                traces.push({
                    value: ws[0],
                    children: [
                        [
                            {
                                type: AnimationTraceOperatorType.CopyLiteral,
                                executionId: animation.id,
                            },
                            { value: rs[0] },
                        ],
                    ],
                })
            }
            break
        case 'BinaryExpressionEvaluate':
            traces.push({
                value: ws[0],
                children: [
                    [
                        {
                            type: AnimationTraceOperatorType.BinaryOperation,
                            executionId: animation.id,
                        },
                        { value: rs[0] },
                    ],
                    [
                        {
                            type: AnimationTraceOperatorType.BinaryOperation,
                            executionId: animation.id,
                        },
                        { value: rs[1] },
                    ],
                ],
            })
            break
        case 'UpdateAnimation':
            traces.push({
                value: ws[0],
                children: [
                    [
                        {
                            type: AnimationTraceOperatorType.UpdateOperation,
                            executionId: animation.id,
                        },
                        { value: rs[0] },
                    ],
                ],
            })
            break
        default:
        // console.warn('Trace not found for', animation._name, animation)
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

        const url = `https://nomnoml.com/image.svg?source=${encodeURIComponent(
            `${config}\n${output}`
        )}`
        console.log(url)
        console.log(chains)
    }
    return output
}

export function traceChainToString(chain: AnimationTraceChain) {
    if (chain == null) return

    let box =
        chain.value == null
            ? `[NULL \\[${++CHAIN_COUNTER}\\]]`
            : `[${chain.value.id} \\[${++CHAIN_COUNTER}\\]]`
    let rest = ''

    for (const child of chain.children ?? []) {
        const operator = child[0]
        const childChain = child[1]

        const { box: childBox, output: childString } = traceChainToString(childChain)

        rest += `\n${childString}`
        rest += `\n${box}-->${operator.type.toString()}${childBox}`
    }

    const output = `${box}\n${rest}`

    return { box, output }
}

// export function computeParentIds(animation: ExecutionGraph | ExecutionNode, parentIds: Set<string> = new Set()) {
//     animation.parentIds = parentIds;

//     if (animation instanceof ExecutionGraph) {
//         for (const node of animation.vertices) {
//             computeParentIds(node, new Set([animation.id, ...parentIds]));
//         }
//     }
// }

// export function dissolve(animation: ExecutionGraph) {
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

// export function dissolveAt(parent: ExecutionGraph, i: number) {
//     let vertex = parent.vertices[i];
//     if (vertex instanceof ExecutionNode) {
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
