import { EnvironmentRenderer } from '../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../environment/EnvironmentState'

// export enum PrototypicalPathType {
//     None = 'None',

//     // Primitive paths
//     Opacity = 'Opacity',
//     Color = 'Color',
//     Rotate = 'Rotate',
//     Scale = 'Scale',
//     Move = 'Move',
//     Elevation = 'Elevation',

//     // Higher-order functions
//     Compose = 'Compose',
//     Interpolate = 'Interpolate',
//     Extend = 'Extend',
//     Concatenate = 'Concatenate',
// }

// A path is a change in a visual
export interface PrototypicalPath {
    type: string
    id: string
    meta: {
        // Playback state
        isPlaying: boolean
        hasPlayed: boolean
        t?: number
    }

    onBegin: (
        path: PrototypicalPath,
        environment: PrototypicalEnvironmentState
    ) => void
    onSeek: (
        path: PrototypicalPath,
        environment: PrototypicalEnvironmentState,
        t: number
    ) => void
    onEnd: (
        path: PrototypicalPath,
        environment: PrototypicalEnvironmentState
    ) => void
}

export interface ConcretePath {
    prototype: PrototypicalPath
    meta: {
        // Playback state
        isPlaying: boolean
        hasPlayed: boolean
        t?: number
    }

    onBegin: (
        path: ConcretePath,
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer
    ) => void
    onSeek: (
        path: ConcretePath,
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer,
        t: number
    ) => void
    onEnd: (
        path: ConcretePath,
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer
    ) => void
}

export function createPrototypicalPath(id: string): PrototypicalPath {
    return {
        id,
        type: 'None',
        meta: { t: 0, isPlaying: false, hasPlayed: false },

        onBegin: () => {},
        onSeek: () => {},
        onEnd: () => {},
    }
}

export function createConcretePath(prototype: PrototypicalPath): ConcretePath {
    return {
        prototype,
        meta: { t: 0, isPlaying: false, hasPlayed: false },

        onBegin: null,
        onSeek: null,
        onEnd: null,
    }
}

export function beginPrototypicalPath(
    path: PrototypicalPath,
    environment: PrototypicalEnvironmentState
) {
    path.onBegin(path, environment)
    path.meta.isPlaying = true
    path.meta.hasPlayed = false
}

export function seekPrototypicalPath(
    path: PrototypicalPath,
    environment: PrototypicalEnvironmentState,
    t: number
) {
    path.onSeek(path, environment, t)
    path.meta.isPlaying = true
}

export function endPrototypicalPath(
    path: PrototypicalPath,
    environment: PrototypicalEnvironmentState
) {
    path.onEnd(path, environment)
    path.meta.isPlaying = false
    path.meta.hasPlayed = true
}

export function addPrototypicalPath(
    environment: PrototypicalEnvironmentState,
    path: PrototypicalPath
) {
    environment.paths[path.id] = path
}

export function removePrototypicalPath(
    environment: PrototypicalEnvironmentState,
    id: string
) {
    delete environment.paths[id]
}

export function lookupPrototypicalPathById(
    environment: PrototypicalEnvironmentState,
    id: string
) {
    return environment.paths[id]
}

export function beginConcretePath(
    path: ConcretePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    path.onBegin(path, environment, renderer)
    path.meta.isPlaying = true
}

export function seekConcretePath(
    path: ConcretePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    path.onSeek(path, environment, renderer, t)
}

export function endConcretePath(
    path: ConcretePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    path.onEnd(path, environment, renderer)
    path.meta.isPlaying = false
    path.meta.hasPlayed = false
}
