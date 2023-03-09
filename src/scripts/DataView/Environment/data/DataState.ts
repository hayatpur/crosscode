import * as CSS from 'csstype'
import { Accessor } from '../../../../transpiler/EnvironmentState'

export enum DataType {
    Literal = 'Literal',
    Array = 'Array',
    ID = 'ID',
    Reference = 'Reference',
    Register = 'Register',
    Function = 'Function',
}

export type TransformStyles = CSS.Properties & {
    elevation?: number
    xoffset?: number
    yoffset?: number
}

export type Transform = {
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

export type DataTransform = {
    classList: string[]
}

export type PrimitiveDataState = {
    _type: 'PrimitiveDataState'
    type: DataType

    value: string | number | boolean | null | Accessor[] | Function

    // Binding frame
    frame: number

    id: string

    builtin?: boolean
}

export type ObjectDataState = {
    _type: 'ObjectDataState'
    value: object

    // Binding frame
    frame: number

    id: string

    builtin?: boolean
}

export type DataState = PrimitiveDataState | ObjectDataState

export function instanceOfData(data: any): data is DataState {
    return data != null && (data['_type'] === 'PrimitiveDataState' || data['_type'] === 'ObjectDataState')
}

export function instanceOfPrimitiveData(data: any): data is PrimitiveDataState {
    return data != null && data['_type'] === 'PrimitiveDataState'
}

export function instanceOfObjectData(data: any): data is ObjectDataState {
    return data != null && data['_type'] === 'ObjectDataState'
}
