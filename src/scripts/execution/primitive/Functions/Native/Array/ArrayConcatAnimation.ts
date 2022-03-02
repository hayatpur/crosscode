import {
    cloneData,
    createPrimitiveData,
    replaceDataWith,
} from '../../../../../environment/data/data'
import { DataState, DataType } from '../../../../../environment/data/DataState'
import { addDataAt, getMemoryLocation, resolvePath } from '../../../../../environment/environment'
import { Accessor, EnvironmentState } from '../../../../../environment/EnvironmentState'
import { DataInfo } from '../../../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../../../ExecutionNode'

export interface ArrayConcatAnimation extends ExecutionNode {
    object: Accessor[]
    args: Accessor[][]
    outputRegister: Accessor[]
}

function apply(animation: ArrayConcatAnimation, environment: EnvironmentState) {
    const object = resolvePath(environment, animation.object, `${animation.id}_Data`) as DataState
    const args = animation.args.map(
        (arg) => resolvePath(environment, arg, `${animation.id}_ArgData`) as DataState
    )

    const objectValue = object.value as DataState[]

    const copy = cloneData(object, false, `${animation.id}_Copy`)
    const copyLocation = addDataAt(environment, copy, [], null)

    // Shallow copy of object
    const readCopy: DataInfo[] = []
    const writeCopy: DataInfo[] = []
    for (let i = 0; i < objectValue.length; i++) {
        readCopy.push({
            location: getMemoryLocation(environment, objectValue[i]).foundLocation,
            id: objectValue[i].id,
        })

        writeCopy.push({
            location: getMemoryLocation(environment, copy.value[i]).foundLocation,
            id: copy.value[i].id,
        })
    }

    const readArgs: DataInfo[] = []
    const writeArgs: DataInfo[] = []
    let originalLength = objectValue.length

    for (let i = 0; i < args.length; i++) {
        const argValue = args[i].value as DataState[]
        for (let j = 0; j < argValue.length; j++) {
            readArgs.push({
                location: getMemoryLocation(environment, argValue[j]).foundLocation,
                id: argValue[j].id,
            })
            const argCopy = cloneData(argValue[j], false, `${animation.id}_ArgCopy_${i}_${j}`)
            // addDataAt(environment, copy, [], null)
            // const argLoc = addDataAt(
            //     environment,
            //     copy,
            //     [
            //         ...location,
            //         {
            //             type: AccessorType.Index,
            //             value: (originalLength + readArgs.length).toString(),
            //         },
            //     ],
            //     null
            // )
            ;(copy.value as DataState[]).push(argCopy)

            writeArgs.push({
                location: getMemoryLocation(environment, argCopy).foundLocation,
                id: argCopy.id,
            })
        }
    }

    // Put it in the floating stack
    const register = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_Floating`
    ) as DataState
    replaceDataWith(register, createPrimitiveData(DataType.ID, copy.id, `${animation.id}_Floating`))

    computeReadAndWrites(
        animation,
        {
            location: getMemoryLocation(environment, object).foundLocation,
            id: object.id,
        },
        {
            location: copyLocation,
            id: copy.id,
        },
        readCopy,
        writeCopy,
        readArgs,
        writeArgs
    )
}

function computeReadAndWrites(
    animation: ArrayConcatAnimation,
    readObject: DataInfo,
    writeObject: DataInfo,
    readCopy: DataInfo[],
    writeCopy: DataInfo[],
    readArgs: DataInfo[],
    writeArgs: DataInfo[]
) {
    animation._reads = [readObject, ...readCopy, ...readArgs]
    animation._writes = [writeObject, ...writeCopy, ...writeArgs]
}

export function ArrayConcatAnimation(
    object: Accessor[],
    args: Accessor[][],
    outputRegister: Accessor[]
): ArrayConcatAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'ArrayConcatAnimation',

        name: 'ArrayConcatAnimation',
        object,
        args,
        outputRegister,

        // Callbacks
        apply,
    }
}
