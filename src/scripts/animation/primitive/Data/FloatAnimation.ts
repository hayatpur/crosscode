import { DataState } from '../../../environment/data/DataState';
import { resolvePath } from '../../../environment/environment';
import { Accessor } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface FloatAnimation extends AnimationNode {
    dataSpecifier: Accessor[];
}

function onBegin(animation: FloatAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    // if (options.baking) {
    //     const data = resolvePath(environment, this.dataSpecifier, null) as DataState;
    //     this.computeReadAndWrites({ location: getMemoryLocation(environment, (data).foundLocation, id: data.id }));
    // }
}

function onSeek(animation: FloatAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const data = resolvePath(environment, this.dataSpecifier, null) as DataState;
    data.transform.floating = true;
    data.transform.z = t;
}

function onEnd(animation: FloatAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

export function floatAnimation(dataSpecifier: Accessor[], options: AnimationOptions = {}): FloatAnimation {
    return {
        ...createAnimationNode(null, options),

        name: 'FloatAnimation',

        // Attributes
        dataSpecifier,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}

// export class FloatAnimation extends AnimationNode {
//     dataSpecifier: Accessor[];

//     constructor(dataSpecifier: Accessor[], options: AnimationOptions = {}) {
//         super(options);
//         this.dataSpecifier = dataSpecifier;
//     }

//     begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         super.begin(environment, options);

//         if (options.baking) {
//             const data = resolvePath(environment, this.dataSpecifier, null) as DataState;
//             this.computeReadAndWrites({ location: getMemoryLocation(environment, (data).foundLocation, id: data.id });
//         }
//     }

//     seek(environment: Environment, time: number) {
//         let t = super.ease(time / this.duration);
//         const data = resolvePath(environment, this.dataSpecifier, null) as DataState;
//         data.transform.floating = true;
//         data.transform.z = t;
//     }

//     end(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {}

//     computeReadAndWrites(data: AnimationData) {
//         this._reads = [data];
//         this._writes = [];
//     }
// }
