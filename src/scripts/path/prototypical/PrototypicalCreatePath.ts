import { Accessor, PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { createPrototypicalPath, PrototypicalPath } from '../path'

export interface PrototypicalCreatePath extends PrototypicalPath {
    data: Accessor[]
    at: Accessor[]
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
export function createPrototypicalCreatePath(data: Accessor[], at: Accessor[], id: string): PrototypicalCreatePath {
    return {
        ...createPrototypicalPath(id),
        type: 'PrototypicalCreatePath',
        data,
        at,
        id,

        onBegin,
        onSeek,
        onEnd,
    }
}
