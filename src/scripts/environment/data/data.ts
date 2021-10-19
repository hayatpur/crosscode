import { Accessor } from '../EnvironmentState';
import { DataState, DataTransform, DataType, LayoutType, PositionType } from './DataState';
import { LiteralRenderer } from './literal/LiteralRenderer';

export function createData(
    type: DataType,
    value: string | boolean | Number | DataState[] | Accessor[],
    id: string,
    transform: DataTransform = null,
    frame: number = -1
): DataState {
    return {
        type: type,
        transform: transform ?? {
            _x: 0,
            _y: 0,
            top: 0,
            left: 0,
            depth: 0,
            width: type == DataType.Literal ? LiteralRenderer.Size : 0,
            height: type == DataType.Literal ? LiteralRenderer.Size : 0,
            opacity: 1,
            positionType: PositionType.Relative,
            layout: type == DataType.Array ? { type: LayoutType.Horizontal, innerPadding: 0, outerPadding: 0 } : null,
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

    if (mask.frame && data.type == DataType.Array) {
        (data.value as DataState[]).forEach((data) => (data.frame = original.frame));
    }
}
