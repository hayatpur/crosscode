import { Easing } from 'eaz';
import * as ESTree from 'estree';
import { Accessor, EnvironmentState } from '../../environment/EnvironmentState';
import { ViewState } from '../../view/ViewState';
import { AnimationRuntimeOptions } from '../graph/AnimationGraph';

export interface NodeData {
    location: ESTree.SourceLocation;
    type: string;
}

export enum AnimationPlayback {
    Normal = 'Normal',
    WithPrevious = 'WithPrevious',
}

export interface AnimationContext {
    locationHint?: Accessor[]; // Hint of where to place data (for aesthetic reasons)
    outputRegister?: Accessor[]; // Register to place data at
    feed?: boolean; // Puts the location of data instead of data itself - used for feeding (assignment / declaration)'
    args?: Accessor[][]; // Arguments to pass to the function
}

export interface AnimationOptions {
    playback?: AnimationPlayback;
    delay?: number;
    duration?: number;
    speedMultiplier?: number;
}

export interface PlayableAnimation {
    // Playback state
    isPlaying: boolean;
    hasPlayed: boolean;

    // Playback options
    speed: number;
    delay: number;

    nodeData: NodeData;
    ease: (t: number) => number;
}

export interface AnimationNode extends PlayableAnimation {
    _type: 'AnimationNode';

    name: string;

    id: string;
    precondition: EnvironmentState;
    postcondition: EnvironmentState;

    baseDuration: number;

    onBegin: (animation: AnimationNode, view: ViewState, options: AnimationRuntimeOptions) => void;
    onSeek: (animation: AnimationNode, view: ViewState, time: number, options: AnimationRuntimeOptions) => void;
    onEnd: (animation: AnimationNode, view: ViewState, options: AnimationRuntimeOptions) => void;
}

export function instanceOfAnimationNode(animation: any): animation is AnimationNode {
    return animation._type == 'AnimationNode';
}

export function createAnimationNode(
    nodeData: NodeData = {
        location: null,
        type: null,
    },
    options: AnimationOptions = {}
): AnimationNode {
    Easing.cubic;
    if (this.id == undefined) this.id = 0;
    return {
        _type: 'AnimationNode',
        name: 'Animation Node',

        id: `AN(${++this.id})`,
        precondition: null,
        postcondition: null,

        nodeData,

        baseDuration: 20,
        delay: 10,

        isPlaying: false,
        hasPlayed: false,
        speed: 1,
        ease: (t) => t,

        onBegin: () => console.warn('[AnimationNode] Non-implemented on begin callback'),
        onSeek: () => console.warn('[AnimationNode] Non-implemented on seek callback'),
        onEnd: () => console.warn('[AnimationNode] Non-implemented on end callback'),
    };
}
