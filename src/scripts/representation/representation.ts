import { createConcreteCreatePath } from '../path/concrete/ConcreteCreatePath'
import { createConcreteMovementPath } from '../path/concrete/ConcreteMovementPath'
import { createConcretePlacementPath } from '../path/concrete/ConcretePlacementPath'
import { ConcretePath, PrototypicalPath } from '../path/path'
import { EnvironmentRepresentation } from './EnvironmentRepresentation'

export function getPathFromEnvironmentRepresentation(
    representation: EnvironmentRepresentation,
    path: PrototypicalPath
): ConcretePath {
    const mapping = {
        PrototypicalCreatePath: createConcreteCreatePath,
        PrototypicalMovementPath: createConcreteMovementPath,
        PrototypicalPlacementPath: createConcretePlacementPath,
    }

    if (!(path.type in mapping)) {
        console.warn('Concrete path not found for type', path.type)
        return null
    }

    return mapping[path.type](path)
}
