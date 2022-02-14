import { createData, replacePrototypicalDataWith } from '../../../environment/data/data'
import { DataType, PrototypicalDataState } from '../../../environment/data/DataState'
import { addDataAt, getMemoryLocation, resolvePath } from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface CopyReferenceAnimation extends ExecutionNode {
    dataSpecifier: Accessor[]
    outputRegister: Accessor[]
}

function apply(animation: CopyReferenceAnimation, environment: PrototypicalEnvironmentState) {
    const data = resolvePath(
        environment,
        animation.dataSpecifier,
        `${animation.id}_Data`
    ) as PrototypicalDataState
    const reference = createData(
        DataType.Reference,
        getMemoryLocation(environment, data).foundLocation,
        `${animation.id}_Reference`
    )
    const loc = addDataAt(environment, reference, [], null)

    computeReadAndWrites(
        animation,
        {
            location: getMemoryLocation(environment, data).foundLocation,
            id: data.id,
        },
        { location: loc, id: reference.id }
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
}

function computeReadAndWrites(
    animation: CopyReferenceAnimation,
    original: DataInfo,
    copy: DataInfo
) {
    animation._reads = [original]
    animation._writes = [copy]
}

export function copyReferenceAnimation(
    dataSpecifier: Accessor[],
    outputRegister: Accessor[]
): CopyReferenceAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'CopyReferenceAnimation',

        name: `CopyReference ${accessorsToString(dataSpecifier)} to ${accessorsToString(
            outputRegister
        )}`,

        // Attributes
        dataSpecifier,
        outputRegister,

        // Callbacks
        apply,
    }
}
