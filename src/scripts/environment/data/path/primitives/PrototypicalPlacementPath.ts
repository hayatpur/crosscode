import { Accessor, PrototypicalEnvironmentState } from '../../../EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalPlacementPath extends PrototypicalPath {
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
export function createPrototypicalPlacementPath(
    from: Accessor[],
    to: Accessor[],
    id: string
): PrototypicalPlacementPath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalPlacementPath',
        from,
        to,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
