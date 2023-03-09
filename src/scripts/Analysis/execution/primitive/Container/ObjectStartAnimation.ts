import { DataType } from '../../../../DataView/Environment/data/DataState'
import { createObjectData, createPrimitiveData, replaceDataWith } from '../../../transpiler/data'
import { addDataAt, resolvePath } from '../../../transpiler/environment'
import { Accessor, accessorsToString, EnvironmentState } from '../../../transpiler/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type ObjectStartAnimation = ExecutionNode & {
    dataSpecifier: Accessor[]
}

function apply(animation: ObjectStartAnimation, environment: EnvironmentState) {
    // Create a new array somewhere in memory
    const data = createObjectData({}, `${animation.id}_CreateObject`)

    const loc = addDataAt(environment, data, [], null)

    computeReadAndWrites(animation, {
        location: loc,
        id: data.id,
    })

    // Point the output register to the newly created data
    const outputRegister = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Floating`) as DataState
    replaceDataWith(outputRegister, createPrimitiveData(DataType.ID, data.id, `${animation.id}_OutputRegister`))
}

function computeReadAndWrites(animation: ObjectStartAnimation, data: DataInfo) {
    animation._reads = [data]
    animation._writes = [data]
}

export function objectStartAnimation(dataSpecifier: Accessor[]): ObjectStartAnimation {
    return {
        ...createExecutionNode(null),

        _name: 'ObjectStartAnimation',

        name: `Initialize object at ${accessorsToString(dataSpecifier)}`,

        // Attributes
        dataSpecifier,

        // Callbacks
        apply,
    }
}
