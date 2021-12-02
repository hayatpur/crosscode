import { Accessor, PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalGlobalMovementPath extends PrototypicalPath {
    from: Accessor[]
    to: Accessor[]
    fromLeafId: string
    toLeafId: string
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
export function createPrototypicalGlobalMovementPath(
    from: Accessor[],
    to: Accessor[],
    fromLeafId: string,
    toLeafId: string,
    id: string
): PrototypicalGlobalMovementPath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalGlobalMovementPath',
        from,
        to,
        fromLeafId,
        toLeafId,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
