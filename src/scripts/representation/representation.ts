import { AnimationRendererRepresentation } from '../environment/AnimationRenderer'
import { createConcreteCreateArrayPath } from '../path/concrete/ConcreteCreateArrayPath'
import { createConcreteCreatePath } from '../path/concrete/ConcreteCreatePath'
import { createConcreteCreateReferencePath } from '../path/concrete/ConcreteCreateReferencePath'
import { createConcreteCreateVariablePath } from '../path/concrete/ConcreteCreateVariablePath'
import { createConcreteMovementPath } from '../path/concrete/ConcreteMovementPath'
import { createConcretePlacePath } from '../path/concrete/ConcretePlacePath'
import { ConcretePath, PrototypicalPath } from '../path/path'
import { EnvironmentRepresentation } from './EnvironmentRepresentation'

export function getPathFromEnvironmentRepresentation(
    representation: EnvironmentRepresentation | AnimationRendererRepresentation,
    path: PrototypicalPath
): ConcretePath {
    const mapping = {
        PrototypicalCreatePath: createConcreteCreatePath,
        PrototypicalCreateArrayPath: createConcreteCreateArrayPath,
        PrototypicalMovementPath: createConcreteMovementPath,
        PrototypicalCreateReferencePath: createConcreteCreateReferencePath,
        PrototypicalCreateVariablePath: createConcreteCreateVariablePath,
        PrototypicalPlacePath: createConcretePlacePath,
    }

    if (!(path.type in mapping)) {
        console.warn('Concrete path not found for type', path.type)
        return null
    }

    return mapping[path.type](path)
}
