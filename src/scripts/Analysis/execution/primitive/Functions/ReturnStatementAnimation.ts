import { DataState } from '../../../../DataView/Environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../transpiler/environment'
import { EnvironmentState } from '../../../transpiler/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode, ReturnData } from '../ExecutionNode'

export type ReturnStatementAnimation = ExecutionNode & {
    returnData: ReturnData
}

function apply(animation: ReturnStatementAnimation, environment: EnvironmentState) {
    const data = resolvePath(environment, animation.returnData.register, `${animation.id}_Data`) as DataState
    data.frame = animation.returnData.frame

    const ref = resolvePath(environment, animation.returnData.register, `${animation.id}_Data`, null, {
        noResolvingReference: true,
    }) as DataState
    ref.frame = animation.returnData.frame

    // Any reference that points to data should also be uplifted
    // for (const id of Object.keys(environment.memory)) {
    //     const ref = environment.memory[id]
    //     if (instanceOfPrimitiveData(ref) && ref.type == DataType.Reference) {
    //         const resolves = resolvePath(
    //             environment,
    //             ref.value as Accessor[],
    //             `${animation.id}_RefData`
    //         ) as DataState
    //         if (resolves.value == data.value) {
    //             ref.frame = animation.returnData.frame
    //         }
    //     }
    // }

    computeReadAndWrites(animation, {
        location: getMemoryLocation(environment, data).foundLocation,
        id: data.id,
    })
}

function computeReadAndWrites(animation: ReturnStatementAnimation, data: DataInfo) {
    animation._reads = [data]
    animation._writes = []
}

export function returnStatementAnimation(returnData: ReturnData): ReturnStatementAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'ReturnStatementAnimation',

        name: 'Return Statement',

        returnData,

        // Callbacks
        apply,
    }
}
