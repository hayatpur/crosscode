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
