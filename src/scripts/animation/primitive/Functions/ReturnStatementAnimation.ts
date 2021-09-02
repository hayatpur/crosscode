// import { Accessor } from '../../../environment/data/data';
// import { Environment } from '../../../environment/environment';
// import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph';
// import { AnimationNode, AnimationOptions } from '../AnimationNode';

// export class ReturnStatementAnimation extends AnimationNode {
//     inputSpecifier: Accessor[];

//     constructor(inputSpecifier: Accessor[], options: AnimationOptions = {}) {
//         super(options);
//         this.inputSpecifier = inputSpecifier;
//     }

//     begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         super.begin(environment, options);
//         let data = resolvePath(environment, this.inputSpecifier, `${this.id}_Data`) as DataState;

//         data.frame -= 2;

//         if (options.baking) {
//             this.computeReadAndWrites({ location: getMemoryLocation(environment, (data).foundLocation, id: data.id });
//         }
//     }

//     seek(environment: Environment, time: number) {}

//     end(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {}

//     computeReadAndWrites(data: AnimationData) {
//         this._reads = [data];
//         this._writes = [];
//     }
// }
