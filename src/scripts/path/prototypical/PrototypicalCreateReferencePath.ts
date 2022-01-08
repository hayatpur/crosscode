import {
    Accessor,
    PrototypicalEnvironmentState,
} from '../../environment/EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalCreateReferencePath extends PrototypicalPath {
    reference: Accessor[]
    id: string
}

function onBegin(
    path: PrototypicalPath,
    environment: PrototypicalEnvironmentState
) {}

function onSeek(
    path: PrototypicalPath,
    environment: PrototypicalEnvironmentState,
    t: number
) {
    path.meta.t = t
}

function onEnd(
    path: PrototypicalPath,
    environment: PrototypicalEnvironmentState
) {}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createPrototypicalCreateReferencePath(
    reference: Accessor[],
    id: string
): PrototypicalCreateReferencePath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalCreateReferencePath',
        reference,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
