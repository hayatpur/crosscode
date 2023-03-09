import * as ESTree from 'estree'
import {
    DataState,
    DataType,
    instanceOfObjectData,
    ObjectDataState,
    PrimitiveDataState,
    Transform,
} from '../../DataView/Environment/data/DataState'
import { clone } from '../../utilities/objects'

import { Accessor } from './EnvironmentState'

export function createTransform(): Transform {
    return {
        styles: {},
        renderOnlyStyles: {},
        rendered: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        classList: [],
    }
}

export function createPrimitiveData(
    type: DataType,
    value: string | boolean | number | Accessor[] | Function | null,
    id: string,
    frame: number = -1,
    builtin: boolean = false
): PrimitiveDataState {
    return {
        _type: 'PrimitiveDataState',
        type: type,
        value: value,
        id: id,
        frame: frame,
        builtin,
    }
}

export function createObjectData(
    value: object,
    id: string,
    frame: number = -1,
    builtin: boolean = false
): ObjectDataState {
    return {
        _type: 'ObjectDataState',
        value: value,
        id: id,
        frame: frame,
        builtin,
    }
}

export function getDataClassNames(type: DataType): string[] {
    const mapping = {
        [DataType.Literal]: ['data-literal-i'],
        [DataType.Array]: ['data-array-i'],
    }

    return mapping[type] ?? []
}

export function cloneData(data: DataState, copyID: boolean = true, srcID: string = null): DataState {
    const copy = clone(data)
    copy.id = copyID ? data.id : srcID
    copy.builtin = false
    return copy
}

export function replaceDataWith(
    original: DataState,
    data: DataState,
    mask: { id?: boolean; frame?: boolean } = { id: false, frame: false }
) {
    const originalCopy = cloneData(original)

    Object.assign(original, clone(data))

    if (mask.id) original.id = originalCopy.id

    if (mask.frame) {
        original.frame = originalCopy.frame

        if (instanceOfObjectData(original)) {
            if (Array.isArray(original.value)) {
                original.value.forEach((el) => (el.frame = original.frame))
            } else {
                Object.values(original.value).forEach((el) => (el.frame = original.frame))
            }
        }
    }

    original.builtin = false
}

export function convertIdentifierToLiteral(data: ESTree.Identifier): ESTree.Literal {
    return {
        ...data,
        type: 'Literal',
        value: data.name,
    }
}
