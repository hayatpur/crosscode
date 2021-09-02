import { EnvironmentState } from '../environment/EnvironmentState';

// A view is a collection of environments
export interface ViewState {
    transform: ViewTransform;
    environments: EnvironmentState[];
}

export interface ViewTransform {
    x: number;
    y: number;
    opacity: number;
    positionModifiers: ViewPositionModifier[];
}

export interface ViewPositionModifier {
    type: ViewPositionModifierType;
    value: any;
}

export enum ViewPositionModifierType {
    NextToCode = 'NextToCode',
    AboveView = 'AboveView',
    BelowView = 'BelowView',
}
