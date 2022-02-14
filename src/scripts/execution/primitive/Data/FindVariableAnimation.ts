import { createData, replacePrototypicalDataWith } from '../../../environment/data/data'
import { DataType, PrototypicalDataState } from '../../../environment/data/DataState'
import { resolvePath } from '../../../environment/environment'
import {
    Accessor,
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface FindVariableAnimation extends ExecutionNode {
    identifier: string
    outputRegister: Accessor[]
}

function apply(animation: FindVariableAnimation, environment: PrototypicalEnvironmentState) {
    const reference = resolvePath(
        environment,
        [{ type: AccessorType.Symbol, value: animation.identifier }],
        null,
        null,
        { noResolvingReference: true }
    )

    // Put it in the floating stack
    const register = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_FloatingRegister`
    ) as PrototypicalDataState

    replacePrototypicalDataWith(
        register,
        createData(DataType.ID, reference.id, `${animation.id}_Floating`)
    )

    computeReadAndWrites(animation)
}

/**
 * TODO
 */
function computeReadAndWrites(animation: FindVariableAnimation) {
    animation._reads = []
    animation._writes = []
}

export function findVariableAnimation(
    identifier: string,
    outputRegister: Accessor[]
): FindVariableAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'FindVariableAnimation',

        name: `Locating ${identifier}`,

        // Attributes
        identifier,
        outputRegister,

        // Callbacks
        apply,
    }
}
