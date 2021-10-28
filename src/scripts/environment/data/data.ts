import { clone } from '../../utilities/objects';
import { Accessor } from '../EnvironmentState';
import { DataState, DataTransform, DataType, Transform } from './DataState';

export function createTransform(): Transform {
    return {
        styles: {},
        rendered: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        classList: [],
    };
}

export function createData(
    type: DataType,
    value: string | boolean | Number | DataState[] | Accessor[],
    id: string,
    transform: DataTransform = null,
    frame: number = -1
): DataState {
    return {
        _type: 'DataState',
        type: type,
        transform: transform ?? {
            ...createTransform(),
            styles: {},
            classList: ['data-i', ...getDataClassNames(type)],
        },
        value: value,
        id: id,
        frame: frame,
    };
}

export function getDataClassNames(type: DataType): string[] {
    const mapping = {
        [DataType.Literal]: ['data-literal-i'],
        [DataType.Array]: ['data-array-i'],
    };

    return mapping[type] ?? [];
}

export function cloneData(data: DataState, copyId: boolean = true, srcId: string = null): DataState {
    let value = data.value;
    if (data.type == DataType.Array) {
        value = (value as DataState[]).map((value) => cloneData(value, copyId));
    }

    const copy: DataState = {
        _type: 'DataState',
        id: copyId ? data.id : srcId,
        type: data.type,
        transform: clone(data.transform),
        value: value,
        frame: data.frame,
    };

    return copy;
}

export function replaceDataWithMutable(
    original: DataState,
    data: DataState,
    mask: { id?: boolean; frame?: boolean } = { id: false, frame: false }
) {
    if (!mask.id) original.id = data.id;
    if (!mask.frame) original.frame = data.frame;

    original.value = data.value;
    original.type = data.type;
    original.transform = data.transform;

    if (mask.frame && data.type == DataType.Array) {
        (data.value as DataState[]).forEach((data) => (data.frame = original.frame));
    }
}

export function replaceDataWith(
    original: DataState,
    data: DataState,
    mask: { id?: boolean; frame?: boolean } = { id: false, frame: false }
) {
    const copy = cloneData(data);

    if (!mask.id) original.id = copy.id;
    if (!mask.frame) original.frame = copy.frame;

    original.value = copy.value;
    original.type = copy.type;
    original.transform = copy.transform;

    if (mask.frame && copy.type == DataType.Array) {
        (original.value as DataState[]).forEach((el) => (el.frame = original.frame));
    }
}
