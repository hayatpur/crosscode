import * as CSS from 'csstype';
import { Accessor } from '../EnvironmentState';

export enum DataType {
    Literal = 'Literal',
    Array = 'Array',
    ID = 'ID',
    Reference = 'Reference',
    Register = 'Register',
    Function = 'Function',
}

export interface TransformStyles extends CSS.Properties {
    elevation?: number;
}

export interface Transform {
    rendered: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    styles: TransformStyles;
    renderOnlyStyles: TransformStyles;
    classList: string[];
}

export interface DataTransform extends Transform {}

export interface DataState {
    _type: 'DataState';

    type: DataType;
    transform: DataTransform;

    value: string | boolean | Number | DataState[] | Accessor[];

    // Binding frame
    frame: number;

    id: string;
}

export function instanceOfData(data: any): data is DataState {
    const x = document.createElement('div');
    return data['_type'] === 'DataState';
}
