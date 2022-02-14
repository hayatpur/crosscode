import { PrototypicalDataState } from '../../../environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../environment/environment'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode, ReturnData } from '../ExecutionNode'

export interface ReturnStatementAnimation extends ExecutionNode {
    returnData: ReturnData
}

function apply(animation: ReturnStatementAnimation, environment: PrototypicalEnvironmentState) {
    const data = resolvePath(
        environment,
        animation.returnData.register,
        `${animation.id}_Data`
    ) as PrototypicalDataState
    data.frame = animation.returnData.frame

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
