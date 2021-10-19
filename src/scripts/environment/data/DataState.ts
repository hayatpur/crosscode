import { Accessor } from '../EnvironmentState';

export enum DataType {
    Literal = 'Literal',
    Array = 'Array',
    ID = 'ID',
    Reference = 'Reference',
    Register = 'Register',
    Function = 'Function',
}

export interface Transform {
    rendered: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    styles: CSSStyleDeclaration;
}

export interface DataTransform extends Transform {}

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
