import { Accessor, PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalInstantMovementPath extends PrototypicalPath {
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
export function createPrototypicalInstantMovementPath(
    from: Accessor[],
    to: Accessor[],
    id: string
): PrototypicalInstantMovementPath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalInstantMovementPath',
        from,
        to,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
