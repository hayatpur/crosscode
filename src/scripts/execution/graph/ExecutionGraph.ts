import { Accessor, EnvironmentState } from '../../environment/EnvironmentState'
import { getEmptyNodeData } from '../execution'
import { ExecutionNode, NodeData } from '../primitive/ExecutionNode'

export interface ExecutionRuntimeOptions {
    indent?: number
}

export interface DataInfo {
    location: Accessor[]
    id: string
}

export interface GlobalDataInfo {
    location: { viewId: string; localLocation: Accessor[] }
    id: string
}

export interface ExecutionGraph {
    // Meta info
    _type: 'ExecutionGraph'
    id: string
    nodeData: NodeData

    // General info
    precondition: EnvironmentState
    postcondition: EnvironmentState
    isGroup: boolean

    // Animation info
    vertices: (ExecutionGraph | ExecutionNode)[]
    isParallel: boolean
    parallelStarts: number[]
}

export function instanceOfExecutionGraph(animation: any): animation is ExecutionGraph {
    return animation._type == 'ExecutionGraph'
}

let __EXECUTION_GRAPH_ID = 0
export function createExecutionGraph(
    nodeData: NodeData,
    options: { isGroup?: boolean } = {}
): ExecutionGraph {
    return {
        // Meta info
        _type: 'ExecutionGraph',
        id: `AG(${++__EXECUTION_GRAPH_ID})`,
        nodeData: options.isGroup ? getEmptyNodeData(nodeData) : nodeData,

        // Invariant to abstraction info
        precondition: null,
        postcondition: null,
        isGroup: options.isGroup || false,

        vertices: [],
        isParallel: false,
        parallelStarts: [],
    }
}
