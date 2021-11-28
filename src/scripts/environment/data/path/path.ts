import { ConcreteEnvironmentState, PrototypicalEnvironmentState } from '../../EnvironmentState'

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
        t?: number
    }

    onBegin: (path: PrototypicalPath, environment: PrototypicalEnvironmentState) => void
    onSeek: (path: PrototypicalPath, environment: PrototypicalEnvironmentState, t: number) => void
    onEnd: (path: PrototypicalPath, environment: PrototypicalEnvironmentState) => void
}

export interface ConcretePath {
    prototype: PrototypicalPath

    onBegin: (path: ConcretePath, environment: ConcreteEnvironmentState) => void
    onSeek: (path: ConcretePath, environment: ConcreteEnvironmentState, t: number) => void
    onEnd: (path: ConcretePath, environment: ConcreteEnvironmentState) => void
}

export function createPrototypicalPath(id: string): PrototypicalPath {
    return {
        id,
        type: 'None',
        meta: { t: 0 },

        onBegin: () => {},
        onSeek: () => {},
        onEnd: () => {},
    }
}

export function createConcretePath(prototype: PrototypicalPath): ConcretePath {
    return {
        prototype,

        onBegin: null,
        onSeek: null,
        onEnd: null,
    }
}

export function beginPrototypicalPath(path: PrototypicalPath, environment: PrototypicalEnvironmentState) {
    path.onBegin(path, environment)
}

export function seekPrototypicalPath(path: PrototypicalPath, environment: PrototypicalEnvironmentState, t: number) {
    path.onSeek(path, environment, t)
}

export function endPrototypicalPath(path: PrototypicalPath, environment: PrototypicalEnvironmentState) {
    path.onEnd(path, environment)
}

export function addPrototypicalPath(environment: PrototypicalEnvironmentState, path: PrototypicalPath) {
    environment.paths[path.id] = path
}

export function removePrototypicalPath(environment: PrototypicalEnvironmentState, id: string) {
    delete environment.paths[id]
}

export function lookupPrototypicalPathById(environment: PrototypicalEnvironmentState, id: string) {
    return environment.paths[id]
}
