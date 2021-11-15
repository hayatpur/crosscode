import { ConcreteEnvironmentState } from '../EnvironmentState'

export enum PrototypicalPathType {
    Opacity = 'Opacity',
    Position = 'Position',
    Elevation = 'Elevation',
    PositionType = 'PositionType',
    Composition = 'Composition',
}

// A path is a change in a visual
export interface PrototypicalPath {
    type: PrototypicalPathType
    parameters: any[]
    _cache: {}

    onBegin: (path: PrototypicalPath, environment: ConcreteEnvironmentState) => void
    onSeek: (path: PrototypicalPath, environment: ConcreteEnvironmentState, t: number) => void
    onEnd: (path: PrototypicalPath, environment: ConcreteEnvironmentState) => void
} 

export interface ConcretePath {
    type: PrototypicalPathType
    parameters: any[]
    _cache: {}

    onBegin: (path: PrototypicalPath, environment: ConcreteEnvironmentState) => void
    onSeek: (path: PrototypicalPath, environment: ConcreteEnvironmentState, t: number) => void
    onEnd: (path: PrototypicalPath, environment: ConcreteEnvironmentState) => void
}
