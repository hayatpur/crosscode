import { resolvePath } from '../../environment/environment'
import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { remap } from '../../utilities/math'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalCreatePath } from '../prototypical/PrototypicalCreatePath'

export interface ConcreteCreatePath extends ConcretePath {}

function onBegin(
    path: ConcreteCreatePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreatePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    const element = renderer.getAllChildRenderers()[dataPrototype.id].element
    element.style.opacity = `${0}`
    element.style.transform = `translate(5x, -5px)`
}

function onSeek(
    path: ConcreteCreatePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    const pathPrototype = path.prototype as PrototypicalCreatePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    const element = renderer.getAllChildRenderers()[dataPrototype.id].element
    element.style.opacity = `${2 * t}`
    element.style.transform = `translate(${remap(t, 0, 1, 5, 0)}px, ${remap(
        t,
        0,
        1,
        -5,
        0
    )}px)`
}

function onEnd(
    path: ConcreteCreatePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreatePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    const element = renderer.getAllChildRenderers()[dataPrototype.id].element
    element.style.opacity = `${1}`
    element.style.transform = `translate(0px, 0px)`
}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcreteCreatePath(
    prototype: PrototypicalCreatePath
): ConcreteCreatePath {
    return {
        ...createConcretePath(prototype),

        onBegin,
        onSeek,
        onEnd,
    }
}
