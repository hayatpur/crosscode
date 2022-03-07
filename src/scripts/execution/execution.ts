import { DataType, PrimitiveDataState } from '../environment/data/DataState'
import { flattenedEnvironmentMemory, getMemoryLocation } from '../environment/environment'
import { EnvironmentState } from '../environment/EnvironmentState'
import { clone } from '../utilities/objects'
import {
    DataInfo,
    ExecutionGraph,
    GlobalDataInfo,
    instanceOfExecutionGraph,
} from './graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode, NodeData } from './primitive/ExecutionNode'

export interface VertexOptions {
    nodeData?: NodeData
    shouldDissolve?: boolean
}

export function applyExecutionNode(execution: ExecutionNode, environment: EnvironmentState) {
    execution.precondition = clone(environment)
    execution.apply(execution, environment)
    execution.postcondition = clone(environment)
}

export function reads(animation: ExecutionGraph | ExecutionNode): DataInfo[] {
    if (instanceOfExecutionNode(animation)) {
        if (animation._reads == null) {
            console.error('Animation reads not set for', animation)
        }
        return animation._reads
    }

    let result = []
    const { vertices } = animation

    for (const vertex of vertices) {
        result.push(...reads(vertex))
    }

    return result
}

export function writes(animation: ExecutionGraph | ExecutionNode): DataInfo[] {
    if (instanceOfExecutionNode(animation)) {
        return animation._writes
    }

    let result = []
    const { vertices } = animation

    for (const vertex of vertices) {
        result.push(...writes(vertex))
    }

    return result
}

export function getExecutionChildren(
    execution: ExecutionGraph | ExecutionNode
): (ExecutionGraph | ExecutionNode)[] {
    if (instanceOfExecutionNode(execution)) {
        return []
    }
    const children = []
    const blacklist: Set<string> = new Set([
        'ConsumeDataAnimation',
        'PopScopeAnimation',
        'CreateScopeAnimation',
        'MoveAndPlaceAnimation',
    ])

    for (const child of execution.vertices) {
        if (instanceOfExecutionNode(child) && blacklist.has(child._name)) {
            continue
        } else if (blacklist.has(child.nodeData.type)) {
            continue
        }

        children.push(child)
    }

    return children
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

    const { vertices: graphVertices } = graph

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
        const { vertices: vertexVertices } = vertex

        // Add all the vertices
        const vertices = [...vertexVertices]
        vertices.forEach((vertex) =>
            addVertex(graph, vertex, {
                nodeData: options.nodeData,
            })
        )
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
    const { vertices: graphVertices } = graph

    vertex.nodeData = options.nodeData

    // Add vertex
    graphVertices.splice(i, 0, vertex)
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
    const { vertices: graphVertices } = graph

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
    const { vertices: graphVertices } = graph

    // Remove vertex
    graphVertices.splice(i, 1)
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
    const { vertices: graphVertices } = graph

    const index = graphVertices.indexOf(vertex)
    if (index == -1) {
        console.warn('Attempting to remove non-existent vertex', vertex)
        return
    }

    removeVertexAt(graph, index)
}

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

    const { vertices: animationVertices } = animation

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

export function queryExecutionGraphPath(
    animation: ExecutionGraph | ExecutionNode,
    query: (animation: ExecutionGraph | ExecutionNode) => boolean
): ExecutionGraph[] {
    if (query(animation)) {
        return []
    }

    if (instanceOfExecutionGraph(animation)) {
        for (const vertex of animation.vertices) {
            const ret = queryExecutionGraphPath(vertex, query)
            if (ret != null) {
                return [animation, ...ret]
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

export function getDepthOfExecution(
    target: ExecutionGraph | ExecutionNode,
    root: ExecutionGraph
): number {
    let depth = 0
    let parent = root

    while (true) {
        let next = null
        depth += 1
        for (const vertex of parent.vertices) {
            if (vertex.id == target.id) {
                return depth
            }

            if (
                instanceOfExecutionGraph(vertex) &&
                queryExecutionGraph(vertex, (a) => a.id == target.id)
            ) {
                next = vertex
                break
            }
        }

        if (next == null) {
            return -1
        } else {
            parent = next
        }
    }
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
            .filter((data) => (data as PrimitiveDataState).type != DataType.ID)

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
            .filter((data) => (data as PrimitiveDataState).type != DataType.ID)

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
        case 'ArrayPushAnimation':
            // For each argument into push
            for (let i = 0; i < rs.length; i++) {
                traces.push({
                    value: ws[i + 1],
                    children: [
                        [
                            {
                                type: AnimationTraceOperatorType.MoveAndPlace,
                                executionId: animation.id,
                            },
                            { value: rs[i] },
                        ],
                    ],
                })
            }
            break
        case 'ArrayConcatAnimation':
            // For each argument into concat
            for (let i = 1; i < rs.length; i++) {
                traces.push({
                    value: ws[i],
                    children: [
                        [
                            {
                                type: AnimationTraceOperatorType.MoveAndPlace,
                                executionId: animation.id,
                            },
                            { value: rs[i] },
                        ],
                    ],
                })
            }
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
