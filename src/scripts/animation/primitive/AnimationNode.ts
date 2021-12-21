import { Easing } from 'eaz'
import * as ESTree from 'estree'
import { Accessor } from '../../environment/EnvironmentState'
import { RootViewState } from '../../view/ViewState'
import { AbstractionSelectionChunk } from '../graph/abstraction/Abstractor'
import { AnimationData, AnimationRuntimeOptions } from '../graph/AnimationGraph'

export interface NodeData {
    location: ESTree.SourceLocation
    type: string
}

export interface ChunkNodeData extends NodeData {
    selection: AbstractionSelectionChunk
}

export enum AnimationPlayback {
    Normal = 'Normal',
    WithPrevious = 'WithPrevious',
}

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

export interface AnimationContext {
    locationHint?: Accessor[] // Hint of where to place data (for aesthetic reasons)
    outputRegister?: Accessor[] // Register to place data at
    feed?: boolean // Puts the location of data instead of data itself - used for feeding (assignment / declaration)'
    args?: Accessor[][] // Arguments to pass to the function
    controlOutput?: ControlOutputData
    returnData?: ReturnData // Register to place the return value at
    doNotFloat?: boolean
}

export interface AnimationOptions {
    playback?: AnimationPlayback
    delay?: number

    // Length of animation
    duration?: number
    speedMultiplier?: number
}

export interface PlayableAnimation {
    // Playback state
    isPlaying: boolean
    hasPlayed: boolean

    // Playback options
    speed: number
    delay: number

    nodeData: NodeData
    ease: (t: number) => number
}

export interface AnimationNode extends PlayableAnimation {
    _type: 'AnimationNode'

    _name: string // Name of the node
    name: string // Name of operation

    isChunk: boolean

    id: string

    precondition: RootViewState
    postcondition: RootViewState

    _reads: AnimationData[]
    _writes: AnimationData[]

    baseDuration: number

    onBegin: (
        animation: AnimationNode,
        view: RootViewState,
        options: AnimationRuntimeOptions
    ) => void
    onSeek: (
        animation: AnimationNode,
        view: RootViewState,
        time: number,
        options: AnimationRuntimeOptions
    ) => void
    onEnd: (
        animation: AnimationNode,
        view: RootViewState,
        options: AnimationRuntimeOptions
    ) => void
}

export function instanceOfAnimationNode(
    animation: any
): animation is AnimationNode {
    return animation._type == 'AnimationNode'
}

export function createAnimationNode(
    nodeData: NodeData = {
        location: null,
        type: null,
    },
    options: AnimationOptions = {}
): AnimationNode {
    Easing.cubic
    if (this.id == undefined) this.id = 0
    return {
        _type: 'AnimationNode',

        _name: 'AnimationNode',
        name: 'Animation Node',

        id: `AN(${++this.id})`,
        precondition: null,
        postcondition: null,

        _reads: null,
        _writes: null,

        nodeData,

        baseDuration: options.duration ?? 20,
        delay: options.delay ?? 10,

        isPlaying: false,
        hasPlayed: false,
        speed: 1,
        ease: (t) => ParametricBlend(t),

        isChunk: false,

        onBegin: () =>
            console.warn('[AnimationNode] Non-implemented on begin callback'),
        onSeek: () =>
            console.warn('[AnimationNode] Non-implemented on seek callback'),
        onEnd: () =>
            console.warn('[AnimationNode] Non-implemented on end callback'),
    }
}

function ParametricBlend(t: number) {
    const sqt = t * t
    return sqt / (2.0 * (sqt - t) + 1.0)
}
