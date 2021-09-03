import * as ESTree from 'estree';
import { DataState } from '../../../environment/data/DataState';
import { resolvePath } from '../../../environment/environment';
import { Accessor, accessorsToString, AccessorType } from '../../../environment/EnvironmentState';
import { lerp } from '../../../utilities/math';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface BinaryExpressionSetup extends AnimationNode {
    leftSpecifier: Accessor[];
    rightSpecifier: Accessor[];
    operator: ESTree.BinaryOperator;
}

function onBegin(animation: BinaryExpressionSetup, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    //   Find left data
    let left = resolvePath(environment, animation.leftSpecifier, `${animation.id}_Left`) as DataState;
    environment._temps[`LeftData${animation.id}`] = [{ type: AccessorType.ID, value: left.id }];

    // Find right data
    let right = resolvePath(environment, animation.rightSpecifier, `${animation.id}_Right`) as DataState;
    environment._temps[`RightData${animation.id}`] = [{ type: AccessorType.ID, value: right.id }];

    // Target left transform
    environment._temps[`LeftTransform${animation.id}`] = {
        init_x: left.transform.x,
        init_y: left.transform.y,
        x: (left.transform.x + right.transform.x) / 2 - 25,
        y: (left.transform.y + right.transform.y) / 2 - 5,
    };

    // Target right transform
    environment._temps[`RightTransform${animation.id}`] = {
        init_x: right.transform.x,
        init_y: right.transform.y,
        x: (left.transform.x + right.transform.x) / 2 + 25,
        y: (left.transform.y + right.transform.y) / 2 - 5,
    };

    // if (options.baking) {
    //     animation.computeReadAndWrites(
    //         { location: getMemoryLocation(environment, left).foundLocation, id: left.id },
    //         { location: getMemoryLocation(environment, right).foundLocation, id: right.id }
    //     );
    // }
}

function onSeek(animation: BinaryExpressionSetup, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState;
    const right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState;

    const leftTransform = environment._temps[`LeftTransform${animation.id}`];
    const rightTransform = environment._temps[`RightTransform${animation.id}`];

    // Move left
    left.transform.x = lerp(leftTransform.init_x, leftTransform.x, t);
    left.transform.y = lerp(leftTransform.init_y, leftTransform.y, t);

    // Move right
    right.transform.x = lerp(rightTransform.init_x, rightTransform.x, t);
    right.transform.y = lerp(rightTransform.init_y, rightTransform.y, t);
}

function onEnd(animation: BinaryExpressionSetup, view: ViewState, options: AnimationRuntimeOptions) {}

export function binaryExpressionSetup(
    leftSpecifier: Accessor[],
    rightSpecifier: Accessor[],
    operator: ESTree.BinaryOperator,
    options: AnimationOptions = {}
): BinaryExpressionSetup {
    return {
        ...createAnimationNode(null, options),
        baseDuration: 60,

        name: `Binary Setup ${accessorsToString(leftSpecifier)} ${operator} ${accessorsToString(rightSpecifier)}`,

        // Attributes
        leftSpecifier,
        rightSpecifier,
        operator,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}

// export class BinaryExpressionSetup extends AnimationNode {
//     leftSpecifier: Accessor[];
//     rightSpecifier: Accessor[];
//     operator: ESTree.BinaryOperator;

//     constructor(
//         leftSpecifier: Accessor[],
//         rightSpecifier: Accessor[],
//         operator: ESTree.BinaryOperator,
//         options: AnimationOptions = {}
//     ) {
//         super({ ...options, duration: 60 });

//         this.leftSpecifier = leftSpecifier;
//         this.rightSpecifier = rightSpecifier;

//         this.operator = operator;
//     }

//     begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         super.begin(environment, options);
//         // Find left data
//         let left = resolvePath(environment, this.leftSpecifier, `${this.id}_Left`) as DataState;
//         environment._temps[`LeftData${this.id}`] = [{ type: AccessorType.ID, value: left.id }];

//         // Find right data
//         let right = resolvePath(environment, this.rightSpecifier, `${this.id}_Right`) as DataState;
//         environment._temps[`RightData${this.id}`] = [{ type: AccessorType.ID, value: right.id }];

//         // Target left transform
//         environment._temps[`LeftTransform${this.id}`] = {
//             init_x: left.transform.x,
//             init_y: left.transform.y,
//             x: (left.transform.x + right.transform.x) / 2 - 25,
//             y: (left.transform.y + right.transform.y) / 2 - 5,
//         };

//         // Target right transform
//         environment._temps[`RightTransform${this.id}`] = {
//             init_x: right.transform.x,
//             init_y: right.transform.y,
//             x: (left.transform.x + right.transform.x) / 2 + 25,
//             y: (left.transform.y + right.transform.y) / 2 - 5,
//         };

//         if (options.baking) {
//             this.computeReadAndWrites(
//                 { location: getMemoryLocation(environment, (left).foundLocation, id: left.id },
//                 { location: getMemoryLocation(environment, (right).foundLocation, id: right.id }
//             );
//         }
//     }

//     seek(environment: Environment, time: number) {
//         let t = super.ease(time / this.duration);

//         const left = resolvePath(environment, environment._temps[`LeftData${this.id}`], null) as DataState;
//         const right = resolvePath(environment, environment._temps[`RightData${this.id}`], null) as DataState;

//         const leftTransform = environment._temps[`LeftTransform${this.id}`];
//         const rightTransform = environment._temps[`RightTransform${this.id}`];

//         // Move left
//         left.transform.x = lerp(leftTransform.init_x, leftTransform.x, t);
//         left.transform.y = lerp(leftTransform.init_y, leftTransform.y, t);

//         // Move right
//         right.transform.x = lerp(rightTransform.init_x, rightTransform.x, t);
//         right.transform.y = lerp(rightTransform.init_y, rightTransform.y, t);
//     }

//     end(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         this.seek(environment, this.duration);
//     }

//     computeReadAndWrites(leftData: AnimationData, rightData: AnimationData) {
//         this._reads = [leftData, rightData];
//         this._writes = [];
//     }
// }
