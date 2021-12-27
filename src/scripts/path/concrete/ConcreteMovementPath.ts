import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalMovementPath } from '../prototypical/PrototypicalMovementPath'
import { ConcretePlacementPath } from './ConcretePlacementPath'

export interface ConcreteMovementPath extends ConcretePath {
    start: { x: number; y: number }
    end: { x: number; y: number }
}

function onBegin(
    path: ConcretePlacementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    // const pathPrototype = path.prototype as PrototypicalMovementPath
    // const fromPrototype = resolvePath(environment.prototype, pathPrototype.from, null)
    // const from = lookupDataByIdInConcreteEnvironment(environment, fromPrototype.id)
    // const toPrototype = resolvePath(environment.prototype, pathPrototype.to, null)
    // const to = lookupDataByIdInConcreteEnvironment(environment, toPrototype.id)
    // path.start = { x: 0, y: 0 }
    // path.end =
    //     to == null
    //         ? { x: 0, y: 0 }
    //         : {
    //               x: to.transform.rendered.x - from.transform.rendered.x,
    //               y: to.transform.rendered.y - from.transform.rendered.y,
    //           }
}

function onSeek(
    path: ConcreteMovementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    // const pathPrototype = path.prototype as PrototypicalMovementPath
    // const fromPrototype = resolvePath(environment.prototype, pathPrototype.from, null)
    // const from = lookupDataByIdInConcreteEnvironment(environment, fromPrototype.id)
    // from.transform.styles.xoffset = lerp(path.start.x, path.end.x, t)
    // from.transform.styles.yoffset = lerp(path.start.y, path.end.y, t)
}

function onEnd(
    path: ConcreteMovementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcreteMovementPath(
    prototype: PrototypicalMovementPath
): ConcreteMovementPath {
    return {
        ...createConcretePath(prototype),

        start: null,
        end: null,

        onBegin,
        onSeek,
        onEnd,
    }
}
