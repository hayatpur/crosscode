import { createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataType } from '../../../environment/data/DataState';
import { addDataAt, resolvePath } from '../../../environment/environment';
import { Accessor, accessorsToString } from '../../../environment/EnvironmentState';
import { updateRootViewLayout } from '../../../environment/layout';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface ArrayStartAnimation extends AnimationNode {
    dataSpecifier: Accessor[];
    doNotFloat: boolean;
}

function onBegin(animation: ArrayStartAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    // Create a new array somewhere in memory
    const data = createData(DataType.Array, [], `${animation.id}_CreateArray`);
    if (!animation.doNotFloat) {
        data.transform.styles.elevation = 1;
    }
    data.transform.styles.position = 'relative';
    data.transform.styles.left = 0;
    data.transform.styles.top = 0;

    const loc = addDataAt(environment, data, [], null);
    updateRootViewLayout(view);

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: loc,
            id: data.id,
        });
    }

    // Point the output register to the newly created data
    const outputRegister = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Floating`) as DataState;
    replaceDataWith(outputRegister, createData(DataType.ID, data.id, `${animation.id}_OutputRegister`));
}

function onSeek(animation: ArrayStartAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));
}

function onEnd(animation: ArrayStartAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: ArrayStartAnimation, data: AnimationData) {
    animation._reads = [data];
    animation._writes = [data];
}

export function arrayStartAnimation(
    dataSpecifier: Accessor[],
    doNotFloat: boolean = false,
    options: AnimationOptions = {}
): ArrayStartAnimation {
    return {
        ...createAnimationNode(null, { ...options, duration: 10 }),

        name: `Initialize array at ${accessorsToString(dataSpecifier)}`,

        // Attributes
        dataSpecifier,
        doNotFloat,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}

// import { Accessor, AccessorType, DataType } from '../../../environment/data/data';
// import { Environment } from '../../../environment/environment';
// import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph';
// import { AnimationNode, AnimationOptions } from '../AnimationNode';

// export class ArrayStartAnimation extends AnimationNode {
//     dataSpecifier: Accessor[];

//     constructor(dataSpecifier: Accessor[], options: AnimationOptions = {}) {
//         super(options);

//         this.dataSpecifier = dataSpecifier;
//         this.base_duration = 5;
//     }

//     begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         super.begin(environment, options);

//         const output = resolvePath(environment, this.dataSpecifier, null) as DataState;
//         output.type = DataType.Array;
//         output.value = [];

//         const ArrayExpression = resolvePath(
//             environment,
//             [{ type: AccessorType.Symbol, value: '_ArrayExpression' }],
//             `${this.id}_ArrayExpression`,
//             {
//                 noResolvingId: true,
//             }
//         ) as DataState;
//         ArrayExpression.value = output.id;

//         if (options.baking) {
//             this.computeReadAndWrites({
//                 location: getMemoryLocation(environment, (output).foundLocation,
//                 id: output.id,
//             });
//         }
//     }

//     seek(environment: Environment, time: number) {}

//     end(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {}

//     computeReadAndWrites(data: AnimationData) {
//         this._reads = [data];
//         this._writes = [data];
//     }
// }
