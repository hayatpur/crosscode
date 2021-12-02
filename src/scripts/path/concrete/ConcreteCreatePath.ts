import { ConcreteEnvironmentState } from '../../environment/EnvironmentState'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalMovementPath } from '../prototypical/PrototypicalMovementPath'

export interface ConcreteCreatePath extends ConcretePath {}

function onBegin(path: ConcreteCreatePath, environment: ConcreteEnvironmentState) {
    // const pathPrototype = path.prototype as PrototypicalCreatePath
    // const dataPrototype = resolvePath(environment.prototype, pathPrototype.data, null)
    // const data = lookupDataByIdInConcreteEnvironment(environment, dataPrototype.id)
    // // Opacity should be 0
    // // Elevation should be high
    // data.transform.styles.opacity = '0'
    // data.transform.styles.elevation = 0
}

function onSeek(path: ConcreteCreatePath, environment: ConcreteEnvironmentState, t: number) {
    // const pathPrototype = path.prototype as PrototypicalCreatePath
    // const dataPrototype = resolvePath(environment.prototype, pathPrototype.data, null)
    // const data = lookupDataByIdInConcreteEnvironment(environment, dataPrototype.id)
    // data.transform.styles.opacity = `${t}`
    // data.transform.styles.elevation = t
}

function onEnd(path: ConcreteCreatePath, environment: ConcreteEnvironmentState) {
    // const pathPrototype = path.prototype as PrototypicalCreatePath
    // const dataPrototype = resolvePath(environment.prototype, pathPrototype.data, null)
    // const data = lookupDataByIdInConcreteEnvironment(environment, dataPrototype.id)
    // data.transform.styles.opacity = '1'
}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcreteCreatePath(prototype: PrototypicalMovementPath): ConcreteCreatePath {
    return {
        ...createConcretePath(prototype),

        onBegin,
        onSeek,
        onEnd,
    }
}
