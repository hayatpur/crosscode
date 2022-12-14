import { cloneData, createPrimitiveData, replaceDataWith } from '../../../environment/data'
import { addDataAt, getMemoryLocation, resolvePath } from '../../../environment/environment'
import { Accessor, accessorsToString, AccessorType, EnvironmentState } from '../../../environment/EnvironmentState'
import { DataState, DataType } from '../../../renderer/View/Environment/data/DataState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type CopyDataAnimation = ExecutionNode & {
    dataSpecifier: Accessor[]
    outputRegister: Accessor[]
    hardCopy: boolean
}

function apply(animation: CopyDataAnimation, environment: EnvironmentState) {
    const data = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Data`) as DataState
    const copy = cloneData(data, false, `${animation.id}_Copy`)
    const location = addDataAt(environment, copy, [], null)

    // Put it in the floating stack
    const register = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState
    replaceDataWith(register, createPrimitiveData(DataType.ID, copy.id, `${animation.id}_Floating`))

    if (animation.hardCopy) {
        data.value = undefined
    }

    computeReadAndWrites(
        animation,
        {
            location: getMemoryLocation(environment, data).foundLocation,
            id: data.id,
        },
        { location, id: copy.id }
    )

    if (animation.dataSpecifier[0].type == AccessorType.Symbol) {
        animation._reads.push({
            id: animation.dataSpecifier[0].value,
            location: animation.dataSpecifier,
        })
    }
}

function computeReadAndWrites(animation: CopyDataAnimation, original: DataInfo, copy: DataInfo) {
    animation._reads = [original]
    animation._writes = [copy]
}

export function copyDataAnimation(
    dataSpecifier: Accessor[],
    outputRegister: Accessor[],
    hardCopy: boolean = false
): CopyDataAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'CopyDataAnimation',

        // name: `Copy ${accessorsToString(dataSpecifier)} to ${accessorsToString(outputRegister)}`,
        name: `Copy ${accessorsToString(dataSpecifier)}`,

        // Attributes
        dataSpecifier,
        outputRegister,
        hardCopy,

        // Callbacks
        apply,
    }
}
