import { Accessor } from '../EnvironmentState';

export enum DataType {
    Literal = 'Literal',
    Array = 'Array',
    ID = 'ID',
    Reference = 'Reference',
    Register = 'Register',
    Function = 'Function',
}

export enum PositionType {
    Absolute = 'Absolute',
    Relative = 'Relative',
}

export interface Transform {
    x: number;
    y: number;
    width: number;
    height: number;
    positionType: PositionType;
}

export interface DataTransform extends Transform {
    z: number;
    opacity: number;
}

export function getZPane(z: number): number {
    if (z < 1) {
        return 0;
    } else {
        return 1;
    }
}

export interface DataState {
    type: DataType;
    transform: DataTransform;

    value: string | boolean | Number | DataState[] | Accessor[];

    // Binding frame
    frame: number;

    id: string;
}

export function instanceOfData(data: any): data is DataState {
    return (
        'type' in data && 'transform' in data && 'value' in data && 'frame' in data && 'id' in data
    );
}
