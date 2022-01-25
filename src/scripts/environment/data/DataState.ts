import * as CSS from 'csstype'
import { PrototypicalPath } from '../../path/path'
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

export interface ConcreteDataTransform extends Transform {}

export interface PrototypicalDataTransform {
    classList: string[]
    paths: PrototypicalPath[]
}

export interface PrototypicalDataState {
    _type: 'PrototypicalDataState'

    type: DataType
    hints: PrototypicalDataTransform

    value:
        | string
        | boolean
        | number
        | PrototypicalDataState[]
        | Accessor[]
        | Function

    // Binding frame
    frame: number

    id: string
}

export interface ConcreteDataState {
    _type: 'ConcreteDataState'

    prototype: PrototypicalDataState
    transform: ConcreteDataTransform
    value: string | boolean | number | ConcreteDataState[] | Accessor[]
}

export function instanceOfPrototypicalData(
    data: any
): data is PrototypicalDataState {
    return data['_type'] === 'PrototypicalDataState'
}

export function instanceOfConcreteData(data: any): data is ConcreteDataState {
    return data['_type'] === 'ConcreteDataState'
}
