import { resolvePath } from '../../environment/environment'
import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalPlacePath } from '../prototypical/PrototypicalPlacePath'

export interface ConcretePlacePath extends ConcretePath {}

function onBegin(
    path: ConcretePlacePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalPlacePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    // const element = renderer.getAllChildRenderers()[dataPrototype.id].element
    // element.style.opacity = `${0}`
    // element.style.transform = `translate(5x, -5px)`
}

function onSeek(
    path: ConcretePlacePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    const pathPrototype = path.prototype as PrototypicalPlacePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    // const element = renderer.getAllChildRenderers()[dataPrototype.id].element
    // element.style.opacity = `${2 * t}`
    // element.style.transform = `translate(${remap(t, 0, 1, 5, 0)}px, ${remap(
    //     t,
    //     0,
    //     1,
    //     -5,
    //     0
    // )}px)`
}

function onEnd(
    path: ConcretePlacePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalPlacePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    // const element = renderer.getAllChildRenderers()[dataPrototype.id].element
    // element.style.opacity = `${1}`
    // element.style.transform = `translate(0px, 0px)`
}

export function createConcretePlacePath(
    prototype: PrototypicalPlacePath
): ConcretePlacePath {
    return {
        ...createConcretePath(prototype),

        onBegin,
        onSeek,
        onEnd,
    }
}
