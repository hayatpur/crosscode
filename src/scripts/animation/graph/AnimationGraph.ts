import { Accessor, EnvironmentState } from '../../environment/EnvironmentState';
import { AnimationNode, NodeData, PlayableAnimation } from '../primitive/AnimationNode';
import { Edge } from './edges/Edge';

export interface AnimationGraphOptions {
    shouldDissolve?: boolean;
    isSequence?: boolean;
    isSection?: boolean;
    isCollapsed?: boolean;
}

export interface AnimationRuntimeOptions {
    indent?: number;
    baking?: boolean;
    globalTime?: number;
}

export interface AnimationData {
    location: Accessor[];
    id: string;
}

export interface AnimationGraphPath {
    node: AnimationGraph | AnimationNode;
    edge?: Edge;
}

export interface AnimationGraph extends PlayableAnimation {
    _type: 'AnimationGraph';

    id: string;
    nodeData: NodeData;
    vertices: (AnimationGraph | AnimationNode)[];
    edges: Edge[];

    precondition: EnvironmentState;
    postcondition: EnvironmentState;

    // Parallel
    isParallel: boolean;
    parallelStarts: number[];
}

export function instanceOfAnimationGraph(animation: any): animation is AnimationGraph {
    return animation._type == 'AnimationGraph';
}

export function createAnimationGraph(nodeData: NodeData): AnimationGraph {
    if (this.id == undefined) this.id = 0;

    return {
        _type: 'AnimationGraph',
        id: `AG(${++this.id})`,
        nodeData,
        vertices: [],
        edges: [],
        delay: 0,
        precondition: null,
        postcondition: null,

        isPlaying: false,
        hasPlayed: false,
        speed: 1,
        ease: (t) => t,

        isParallel: false,
        parallelStarts: [],
    };
}
