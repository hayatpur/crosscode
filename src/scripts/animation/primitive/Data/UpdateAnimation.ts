import * as ESTree from 'estree';
import { DataState } from '../../../environment/data/DataState';
import { resolvePath } from '../../../environment/environment';
import { Accessor } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface UpdateAnimation extends AnimationNode {
    dataSpecifier: Accessor[];
    operator: ESTree.UpdateOperator;
}

function onBegin(animation: UpdateAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    const data = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Data`) as DataState;

    switch (animation.operator) {
        case '++':
            data.value = (data.value as number) + 1;
            break;
        case '--':
            data.value = (data.value as number) - 1;
            break;
        default:
            console.warn('Unrecognized update operator', animation.operator);
    }
}

function onSeek(animation: UpdateAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: UpdateAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

export function updateAnimation(
    dataSpecifier: Accessor[],
    operator: ESTree.UpdateOperator,
    options: AnimationOptions = {}
): UpdateAnimation {
    return {
        ...createAnimationNode(null, options),

        name: 'UpdateAnimation',

        // Attributes
        dataSpecifier,
        operator,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
