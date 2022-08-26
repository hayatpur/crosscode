import * as ESTree from 'estree'
import { Accessor, EnvironmentState } from '../../environment/EnvironmentState'
import { DataInfo } from '../graph/ExecutionGraph'

export type NodeData = {
    location?: ESTree.SourceLocation
    type?: string
    preLabel?: string
}

export type ChunkNodeData = NodeData & {}

export enum ControlOutput {
    None = 'None',
    Break = 'Break',
    Continue = 'Continue',
    Return = 'Return',
}

export type ControlOutputData = {
    output: ControlOutput
}

export type ReturnData = {
    frame: number
    register: Accessor[]
    environmentID: string
}

export type ExecutionContext = {
    locationHint?: Accessor[] // Hint of where to place data (for aesthetic reasons)
    outputRegister?: Accessor[] // Register to place data at
    feed?: boolean // Puts the location of data instead of data itself - used for feeding (assignment / declaration)'
    args?: Accessor[][] // Arguments to pass to the function
    object?: Accessor[] // Object to pass to the function
    controlOutput?: ControlOutputData
    returnData?: ReturnData // Register to place the return value at
}

export type ExecutionNode = {
    _type: 'ExecutionNode'
    _name: string // Name of the node

    name: string // Name of operation
    id: string

    precondition: EnvironmentState | null
    postcondition: EnvironmentState | null

    _reads: DataInfo[] | null
    _writes: DataInfo[] | null
    nodeData: NodeData

    apply: (animation: ExecutionNode, environment: EnvironmentState) => void
}

export function instanceOfExecutionNode(
    animation: any
): animation is ExecutionNode {
    return animation._type == 'ExecutionNode'
}

let __EXECUTION_NODE_ID = 0
export function createExecutionNode(nodeData: NodeData = {}): ExecutionNode {
    return {
        _type: 'ExecutionNode',

        _name: 'ExecutionNode',
        name: 'Animation Node',

        id: `AN(${++__EXECUTION_NODE_ID})`,
        precondition: null,
        postcondition: null,

        _reads: null,
        _writes: null,

        nodeData,

        apply: () =>
            console.warn('[ExecutionNode] Non-implemented apply callback'),
    }
}
