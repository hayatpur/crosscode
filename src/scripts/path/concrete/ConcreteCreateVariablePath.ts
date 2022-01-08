import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { IdentifierRenderer } from '../../environment/identifier/IdentifierRenderer'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalCreateVariablePath } from '../prototypical/PrototypicalCreateVariablePath'

export interface ConcreteCreateVariablePath extends ConcretePath {}

function onBegin(
    path: ConcreteCreateVariablePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreateVariablePath

    const children = renderer.getAllChildRenderers()
    const identifier = children[pathPrototype.name] as IdentifierRenderer
    identifier.element.style.opacity = `${0}`
    // identifier.element.style.transform = `scale(0)`
}

function onSeek(
    path: ConcreteCreateVariablePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    const pathPrototype = path.prototype as PrototypicalCreateVariablePath
    const children = renderer.getAllChildRenderers()
    const identifier = children[pathPrototype.name] as IdentifierRenderer
    identifier.element.style.opacity = `${2 * t}`
    // identifier.element.style.transform = `scale(${remap(t, 0, 1, 0, 1)})`
}

function onEnd(
    path: ConcreteCreateVariablePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreateVariablePath
    const children = renderer.getAllChildRenderers()
    const identifier = children[pathPrototype.name] as IdentifierRenderer
    identifier.element.style.opacity = `${1}`
    // identifier.element.style.transform = `scale(1)`
}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcreteCreateVariablePath(
    prototype: PrototypicalCreateVariablePath
): ConcreteCreateVariablePath {
    return {
        ...createConcretePath(prototype),

        onBegin,
        onSeek,
        onEnd,
    }
}
