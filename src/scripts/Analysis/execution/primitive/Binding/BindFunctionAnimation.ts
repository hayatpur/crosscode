import * as ESTree from 'estree'
import { DataType } from '../../../../DataView/Environment/data/DataState'
import { createPrimitiveData } from '../../../transpiler/data'
import { addDataAt, declareVariable } from '../../../transpiler/environment'
import { EnvironmentState } from '../../../transpiler/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type BindFunctionAnimation = ExecutionNode & {
    identifier: string
    ast: ESTree.FunctionDeclaration
}

function apply(animation: BindFunctionAnimation, environment: EnvironmentState) {
    // Create a reference for variable
    const reference = createPrimitiveData(DataType.Reference, [], `${animation.id}_ReferenceFunction`)
    const referenceLocation = addDataAt(environment, reference, [], `${animation.id}_AddFunction`)

    const data = createPrimitiveData(
        DataType.Function,
        JSON.stringify(animation.ast),
        `${animation.id}_BindFunctionNew`
    )
    const location = addDataAt(environment, data, [], null)

    reference.value = location

    declareVariable(environment, animation.identifier, referenceLocation)
    computeReadAndWrites(animation, { location, id: data.id }, { location, id: animation.identifier })
}

function computeReadAndWrites(animation: BindFunctionAnimation, funcData: DataInfo, funcIdentifier: DataInfo) {
    animation._reads = []
    animation._writes = [funcData, funcIdentifier]
}

export function bindFunctionAnimation(
    identifier: string,
    ast: ESTree.FunctionDeclaration = null
): BindFunctionAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'BindFunctionAnimation',
        name: `Bind Function (${identifier})`,

        // Attributes
        identifier,
        ast,

        // Callbacks
        apply,
    }
}
