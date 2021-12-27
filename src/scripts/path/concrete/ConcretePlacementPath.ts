import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalMovementPath } from '../prototypical/PrototypicalMovementPath'

export interface ConcretePlacementPath extends ConcretePath {
    startElevation: number
}

function onBegin(
    path: ConcretePlacementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    // const pathPrototype = path.prototype as PrototypicalPlacementPath
    // const dataPrototype = resolvePath(environment.prototype, pathPrototype.data, null)
    // const data = lookupDataByIdInConcreteEnvironment(environment, dataPrototype.id)
    // // Opacity should be 0
    // // Elevation should be high
    // path.startElevation = data.transform.styles.elevation
}

function onSeek(
    path: ConcretePlacementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    // const pathPrototype = path.prototype as PrototypicalCreatePath
    // const dataPrototype = resolvePath(environment.prototype, pathPrototype.data, null)
    // const data = lookupDataByIdInConcreteEnvironment(environment, dataPrototype.id)
    // data.transform.styles.elevation = lerp(path.startElevation, 0, t)
}

function onEnd(
    path: ConcretePlacementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    // const pathPrototype = path.prototype as PrototypicalCreatePath
    // const dataPrototype = resolvePath(environment.prototype, pathPrototype.data, null)
    // const data = lookupDataByIdInConcreteEnvironment(environment, dataPrototype.id)
    // data.transform.styles.elevation = 0
}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcretePlacementPath(
    prototype: PrototypicalMovementPath
): ConcretePlacementPath {
    return {
        ...createConcretePath(prototype),

        startElevation: null,
        onBegin,
        onSeek,
        onEnd,
    }
}
