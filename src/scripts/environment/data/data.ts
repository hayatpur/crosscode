import * as ESTree from 'estree'
import { clone } from '../../utilities/objects'
import { Accessor } from '../EnvironmentState'
import {
    ConcreteDataState,
    ConcreteDataTransform,
    DataType,
    PrototypicalDataState,
    PrototypicalDataTransform,
    Transform,
} from './DataState'

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
    value: string | boolean | Number | PrototypicalDataState[] | Accessor[],
    id: string,
    hints: PrototypicalDataTransform = null,
    frame: number = -1
): PrototypicalDataState {
    return {
        _type: 'PrototypicalDataState',
        type: type,
        hints: hints ?? {
            paths: [],
            classList: ['data-i', ...getDataClassNames(type)],
        },
        value: value,
        id: id,
        frame: frame,
    }
}

export function createConcreteData(
    prototype: PrototypicalDataState = null,
    value: string | boolean | Number | ConcreteDataState[] | Accessor[] = null,
    transform: ConcreteDataTransform = null
): ConcreteDataState {
    return {
        _type: 'ConcreteDataState',
        prototype,
        transform: transform ?? {
            ...createTransform(),
            styles: {},
            classList: ['data-i', ...getDataClassNames(prototype.type)],
        },
        value: value,
    }
}

export function getDataClassNames(type: DataType): string[] {
    const mapping = {
        [DataType.Literal]: ['data-literal-i'],
        [DataType.Array]: ['data-array-i'],
    }

    return mapping[type] ?? []
}

export function clonePrototypicalData(
    data: PrototypicalDataState,
    copyId: boolean = true,
    srcId: string = null
): PrototypicalDataState {
    const copy = clone(data)
    copy.id = copyId ? data.id : srcId
    return copy
}

export function cloneConcreteData(
    data: ConcreteDataState,
    copyId: boolean = true,
    srcId: string = null
): ConcreteDataState {
    const copy = clone(data)
    copy.prototype.id = copyId ? data.prototype.id : srcId
    return copy
}

export function replacePrototypicalDataWith(
    original: PrototypicalDataState,
    data: PrototypicalDataState,
    mask: { id?: boolean; frame?: boolean } = { id: false, frame: false }
) {
    const copy = clonePrototypicalData(data)

    if (!mask.id) original.id = copy.id
    if (!mask.frame) original.frame = copy.frame

    original.value = copy.value
    original.type = copy.type
    original.hints = copy.hints

    if (mask.frame && copy.type == DataType.Array) {
        ;(original.value as PrototypicalDataState[]).forEach((el) => (el.frame = original.frame))
    }
}

export function convertIdentifierToLiteral(data: ESTree.Identifier): ESTree.Literal {
    return {
        ...data,
        type: 'Literal',
        value: data.name,
    }
}
