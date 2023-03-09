import { DataState, DataType } from '../../../../DataView/Environment/data/DataState'
import { createObjectData, createPrimitiveData, replaceDataWith } from '../../../transpiler/data'
import { addDataAt, resolvePath } from '../../../transpiler/environment'
import { Accessor, accessorsToString, EnvironmentState } from '../../../transpiler/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type ArrayStartAnimation = ExecutionNode & {
    dataSpecifier: Accessor[]
}

function apply(animation: ArrayStartAnimation, environment: EnvironmentState) {
    // Create a new array somewhere in memory
    const data = createObjectData([], `${animation.id}_CreateArray`)

    const loc = addDataAt(environment, data, [], null)

    computeReadAndWrites(animation, {
        location: loc,
        id: data.id,
    })

    // Point the output register to the newly created data
    const outputRegister = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Floating`) as DataState
    replaceDataWith(outputRegister, createPrimitiveData(DataType.ID, data.id, `${animation.id}_OutputRegister`))
}

function computeReadAndWrites(animation: ArrayStartAnimation, data: DataInfo) {
    animation._reads = [data]
    animation._writes = [data]
}

export function arrayStartAnimation(dataSpecifier: Accessor[]): ArrayStartAnimation {
    return {
        ...createExecutionNode(null),

        _name: 'ArrayStartAnimation',

        name: `Initialize array at ${accessorsToString(dataSpecifier)}`,

        // Attributes
        dataSpecifier,

        // Callbacks
        apply,
    }
}
