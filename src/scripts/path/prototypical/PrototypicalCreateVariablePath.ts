import {
    Accessor,
    PrototypicalEnvironmentState,
} from '../../environment/EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalCreateVariablePath extends PrototypicalPath {
    name: string
    location: Accessor[]
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
export function createPrototypicalCreateVariablePath(
    name: string,
    location: Accessor[],
    id: string
): PrototypicalCreateVariablePath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalCreateVariablePath',
        name,
        location,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
