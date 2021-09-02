// import { Accessor } from '../../../environment/data/data';
// import { Environment } from '../../../environment/environment';
// import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph';
// import { AnimationNode, AnimationOptions } from '../AnimationNode';

// export class PlaceAnimation extends AnimationNode {
//     inputSpecifier: Accessor[];
//     outputSpecifier: Accessor[];

//     constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[], options: AnimationOptions = {}) {
//         super(options);
//         this.inputSpecifier = inputSpecifier;
//         this.outputSpecifier = outputSpecifier;
//     }

//     begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         super.begin(environment, options);
//     }

//     seek(environment: Environment, time: number) {
//         let t = super.ease(time / this.duration);

//         let input = resolvePath(environment, this.inputSpecifier, null) as DataState;

//         input.transform.z = 1 - t;
//     }

//     end(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         const input = resolvePath(environment, this.inputSpecifier, null) as DataState;
//         const to = resolvePath(environment, this.outputSpecifier, `${this.id}_to`) as DataState;

//         if (options.baking) {
//             this.computeReadAndWrites(
//                 { location: getMemoryLocation(environment, (input).foundLocation, id: input.id },
//                 { location: getMemoryLocation(environment, (to).foundLocation, id: to.id }
//             );
//         }

//         if (to instanceof Environment) {
//             removeAt(environment, getMemoryLocation(environment, (input).foundLocation);
//         } else {
//             // Remove the copy
//             removeAt(environment, getMemoryLocation(environment, (input).foundLocation);
//             to.replaceWith(input, { frame: true, id: true });
//         }

//         input.transform.floating = false;
//         input.transform.z = 0;
//     }

//     computeReadAndWrites(inputData: AnimationData, outputData: AnimationData) {
//         this._reads = [inputData];
//         this._writes = [outputData];
//     }
// }
