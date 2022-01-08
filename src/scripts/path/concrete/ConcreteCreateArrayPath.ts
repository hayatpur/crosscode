import { ArrayRenderer } from '../../environment/data/array/ArrayRenderer'
import { resolvePath } from '../../environment/environment'
import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalCreateArrayPath } from '../prototypical/PrototypicalCreateArrayPath'

export interface ConcreteCreateArrayPath extends ConcretePath {}

function onBegin(
    path: ConcreteCreateArrayPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreateArrayPath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    const children = renderer.getAllChildRenderers()
    const array = children[dataPrototype.id] as ArrayRenderer

    array.openingBrace.style.opacity = `${0}`
    array.closingBrace.style.opacity = `${0}`
}

function onSeek(
    path: ConcreteCreateArrayPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    const pathPrototype = path.prototype as PrototypicalCreateArrayPath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    const children = renderer.getAllChildRenderers()
    const array = children[dataPrototype.id] as ArrayRenderer

    array.openingBrace.style.opacity = `${t}`
    array.closingBrace.style.opacity = `${t}`
}

function onEnd(
    path: ConcreteCreateArrayPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreateArrayPath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    const children = renderer.getAllChildRenderers()
    const array = children[dataPrototype.id] as ArrayRenderer

    array.openingBrace.style.opacity = `${1}`
    array.closingBrace.style.opacity = `${1}`
}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcreteCreateArrayPath(
    prototype: PrototypicalCreateArrayPath
): ConcreteCreateArrayPath {
    return {
        ...createConcretePath(prototype),

        onBegin,
        onSeek,
        onEnd,
    }
}
