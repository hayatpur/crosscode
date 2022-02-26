import * as CSS from 'csstype'
import { Accessor } from '../EnvironmentState'

export enum DataType {
    Literal = 'Literal',
    Array = 'Array',
    ID = 'ID',
    Reference = 'Reference',
    Register = 'Register',
    Function = 'Function',
}

export interface TransformStyles extends CSS.Properties {
    elevation?: number
    xoffset?: number
    yoffset?: number
}

export interface Transform {
    rendered: {
        x: number
        y: number
        width: number
        height: number
    }
    styles: TransformStyles
    renderOnlyStyles: TransformStyles
    classList: string[]
}

export interface DataTransform {
    classList: string[]
}

export interface DataState {
    _type: 'DataState'

    type: DataType
    hints: DataTransform

    value: string | boolean | number | DataState[] | Accessor[] | Function

    // Binding frame
    frame: number

    id: string
}

export function instanceOfData(data: any): data is DataState {
    return data != null && data['_type'] === 'DataState'
}
