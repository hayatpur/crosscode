import { Accessor, PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalElevationPath extends PrototypicalPath {
    data: Accessor[]
    targetElevation: number
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
export function createPrototypicalElevationPath(
    data: Accessor[],
    targetElevation: number,
    id: string
): PrototypicalElevationPath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalElevationPath',
        data,
        targetElevation,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
