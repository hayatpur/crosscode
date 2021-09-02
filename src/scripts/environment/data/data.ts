import { DataState, DataTransform, DataType } from './DataState';

export function createData(
    type: DataType,
    value: string | boolean | Number | DataState[],
    id: string,
    transform: DataTransform = null,
    frame: number = -1
): DataState {
    return {
        type: type,
        transform: transform ?? {
            x: 0,
            y: 0,
            z: 0,
            width: type == DataType.Literal ? 35 : 0,
            height: type == DataType.Literal ? 35 : 0,
            floating: false,
            opacity: 1,
        },
        value: value,
        id: id,
        frame: frame,
    };
}

export function cloneData(data: DataState, copyId: boolean = true, srcId: string = null): DataState {
    let value = data.value;
    if (data.type == DataType.Array) {
        value = (value as DataState[]).map((value) => cloneData(value, copyId));
    }

    const copy: DataState = {
        id: copyId ? data.id : srcId,
        type: data.type,
        transform: { ...data.transform },
        value: value,
        frame: data.frame,
    };

    return copy;
}

export function replaceDataWith(
    original: DataState,
    data: DataState,
    mask: { id?: boolean; frame?: boolean } = { id: false, frame: false }
) {
    if (!mask.id) original.id = data.id;
    if (!mask.frame) original.frame = data.frame;

    original.value = data.value;
    original.type = data.type;
    original.transform = data.transform;
}
