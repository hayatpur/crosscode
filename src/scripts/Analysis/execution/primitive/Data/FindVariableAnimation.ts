import { DataState, DataType } from '../../../../DataView/Environment/data/DataState'
import { createPrimitiveData, replaceDataWith } from '../../../transpiler/data'
import { getMemoryLocation, resolvePath } from '../../../transpiler/environment'
import { Accessor, AccessorType, EnvironmentState } from '../../../transpiler/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type FindVariableAnimation = ExecutionNode & {
    identifier: string
    outputRegister: Accessor[]
}

function apply(animation: FindVariableAnimation, environment: EnvironmentState) {
    const reference = resolvePath(
        environment,
        [{ type: AccessorType.Symbol, value: animation.identifier }],
        null,
        null,
        { noResolvingReference: true }
    )

    // Put it in the floating stack
    const register = resolvePath(environment, animation.outputRegister, `${animation.id}_FloatingRegister`) as DataState

    replaceDataWith(register, createPrimitiveData(DataType.ID, reference.id, `${animation.id}_Floating`))

    computeReadAndWrites(animation, {
        location: getMemoryLocation(environment, reference as DataState).foundLocation!,
        id: reference.id,
    })
}

/**
 * TODO
 */
function computeReadAndWrites(animation: FindVariableAnimation, ref: DataInfo) {
    animation._reads = [ref]
    animation._writes = []
}

export function findVariableAnimation(identifier: string, outputRegister: Accessor[]): FindVariableAnimation {
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
