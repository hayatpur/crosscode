import * as ESTree from 'estree'
import { createData } from '../../../environment/data/data'
import { DataType } from '../../../environment/data/DataState'
import { addDataAt, declareVariable } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface BindFunctionAnimation extends ExecutionNode {
    identifier: string
    ast: ESTree.FunctionDeclaration
}

function apply(animation: BindFunctionAnimation, environment: EnvironmentState) {
    // Create a reference for variable
    const reference = createData(DataType.Reference, [], `${animation.id}_ReferenceFunction`)
    const referenceLocation = addDataAt(environment, reference, [], `${animation.id}_AddFunction`)

    const data = createData(
        DataType.Function,
        JSON.stringify(animation.ast),
        `${animation.id}_BindFunctionNew`
    )
    const location = addDataAt(environment, data, [], null)

    reference.value = location

    declareVariable(environment, animation.identifier, referenceLocation)
    computeReadAndWrites(
        animation,
        { location, id: data.id },
        { location, id: animation.identifier }
    )
}

function computeReadAndWrites(
    animation: BindFunctionAnimation,
    funcData: DataInfo,
    funcIdentifier: DataInfo
) {
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
