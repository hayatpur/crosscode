import { Accessor } from '../EnvironmentState';

export enum DataType {
    Literal = 'Literal',
    Array = 'Array',
    ID = 'ID',
    Reference = 'Reference',
    Register = 'Register',
    Function = 'Function',
}

export interface DataTransform {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    floating: boolean;
    opacity: number;
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
    return 'type' in data && 'transform' in data && 'value' in data && 'frame' in data && 'id' in data;
}
