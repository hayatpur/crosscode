import {
    Accessor,
    PrototypicalEnvironmentState,
} from '../../environment/EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalCreateArrayPath extends PrototypicalPath {
    data: Accessor[]
    at: Accessor[]
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
export function createPrototypicalCreateArrayPath(
    data: Accessor[],
    at: Accessor[],
    id: string
): PrototypicalCreateArrayPath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalCreateArrayPath',
        data,
        at,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
