import * as ESTree from 'estree'
import { clone } from '../../utilities/objects'
import { Accessor } from '../EnvironmentState'
import { DataState, DataTransform, DataType, Transform } from './DataState'

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

export function createData(
    type: DataType,
    value: string | boolean | number | DataState[] | Accessor[] | Function,
    id: string,
    hints: DataTransform = null,
    frame: number = -1
): DataState {
    return {
        _type: 'DataState',
        type: type,
        hints: hints ?? {
            classList: ['data-i', ...getDataClassNames(type)],
        },
        value: value,
        id: id,
        frame: frame,
    }
}

export function getDataClassNames(type: DataType): string[] {
    const mapping = {
        [DataType.Literal]: ['data-literal-i'],
        [DataType.Array]: ['data-array-i'],
    }

    return mapping[type] ?? []
}

export function cloneData(
    data: DataState,
    copyId: boolean = true,
    srcId: string = null
): DataState {
    const copy = clone(data)
    copy.id = copyId ? data.id : srcId
    return copy
}

export function replaceDataWith(
    original: DataState,
    data: DataState,
    mask: { id?: boolean; frame?: boolean } = { id: false, frame: false }
) {
    const copy = cloneData(data)

    if (!mask.id) original.id = copy.id
    if (!mask.frame) original.frame = copy.frame

    original.value = copy.value
    original.type = copy.type
    original.hints = copy.hints

    if (mask.frame && copy.type == DataType.Array) {
        ;(original.value as DataState[]).forEach((el) => (el.frame = original.frame))
    }
}

export function convertIdentifierToLiteral(data: ESTree.Identifier): ESTree.Literal {
    return {
        ...data,
        type: 'Literal',
        value: data.name,
    }
}
