import { Easing } from 'eaz'
import * as ESTree from 'estree'
import { Accessor, EnvironmentState } from '../../environment/EnvironmentState'
import { DataInfo } from '../graph/ExecutionGraph'

export interface NodeData {
    location: ESTree.SourceLocation
    type: string
    preLabel: string
}

export interface ChunkNodeData extends NodeData {}

export enum ControlOutput {
    None = 'None',
    Break = 'Break',
    Continue = 'Continue',
    Return = 'Return',
}

export interface ControlOutputData {
    output: ControlOutput
}

export interface ReturnData {
    frame: number
    register: Accessor[]
    environmentId: string
}

export interface ExecutionContext {
    locationHint?: Accessor[] // Hint of where to place data (for aesthetic reasons)
    outputRegister?: Accessor[] // Register to place data at
    feed?: boolean // Puts the location of data instead of data itself - used for feeding (assignment / declaration)'
    args?: Accessor[][] // Arguments to pass to the function
    object?: Accessor[] // Object to pass to the function
    controlOutput?: ControlOutputData
    returnData?: ReturnData // Register to place the return value at
}

export interface ExecutionNode {
    _type: 'ExecutionNode'
    _name: string // Name of the node

    name: string // Name of operation
    id: string

    precondition: EnvironmentState
    postcondition: EnvironmentState

    _reads: DataInfo[]
    _writes: DataInfo[]
    nodeData: NodeData

    apply: (animation: ExecutionNode, environment: EnvironmentState) => void
}

export function instanceOfExecutionNode(animation: any): animation is ExecutionNode {
    return animation._type == 'ExecutionNode'
}

export function createExecutionNode(
    nodeData: NodeData = {
        location: null,
        type: null,
        preLabel: null,
    }
): ExecutionNode {
    Easing.cubic
    if (this.id == undefined) this.id = 0
    return {
        _type: 'ExecutionNode',

        _name: 'ExecutionNode',
        name: 'Animation Node',

        id: `AN(${++this.id})`,
        precondition: null,
        postcondition: null,

        _reads: null,
        _writes: null,

        nodeData,

        apply: () => console.warn('[ExecutionNode] Non-implemented apply callback'),
    }
}

function ParametricBlend(t: number) {
    const sqt = t * t
    return sqt / (2.0 * (sqt - t) + 1.0)
}
