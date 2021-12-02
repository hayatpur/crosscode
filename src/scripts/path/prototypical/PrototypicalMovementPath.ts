import { Accessor, PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalMovementPath extends PrototypicalPath {
    from: Accessor[]
    to: Accessor[]
    id: string
}

function onBegin(path: PrototypicalPath, environment: PrototypicalEnvironmentState) {}

function onSeek(path: PrototypicalPath, environment: PrototypicalEnvironmentState, t: number) {
    path.meta.t = t
}

function onEnd(path: PrototypicalPath, environment: PrototypicalEnvironmentState) {}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createPrototypicalMovementPath(from: Accessor[], to: Accessor[], id: string): PrototypicalMovementPath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalMovementPath',
        from,
        to,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
