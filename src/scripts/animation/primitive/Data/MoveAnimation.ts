// import { Accessor, Data, DataType, Transform } from '../../../environment/data/data';
// import { Environment } from '../../../environment/environment';
// import { DataMovementPath } from '../../../utilities/DataMovementPath';
// import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph';
// import { AnimationNode, AnimationOptions } from '../AnimationNode';

// export class MoveAnimation extends AnimationNode {
//     inputSpecifier: Accessor[];
//     outputSpecifier: Accessor[];

//     constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[], options: AnimationOptions = {}) {
//         super({ ...options, duration: 80 });

//         this.inputSpecifier = inputSpecifier;
//         this.outputSpecifier = outputSpecifier;
//     }

//     begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         super.begin(environment, options);

//         const move = resolvePath(environment, this.inputSpecifier, null) as DataState;
//         const to = resolvePath(environment, this.outputSpecifier, `${this.id}_to`);

//         updateLayout(view);

//         let end_transform: Transform;

//         if (to instanceof Environment) {
//             // Then it doesn't have a place yet
//             const placeholder = new Data({
//                 id: `${this.id}_Placeholder`,
//                 type: DataType.ID,
//                 value: '_MoveAnimationPlaceholder',
//             });
//             const placeholderLocation = environment.addDataAt([], placeholder, `${this.id}_PlaceHolder`);

//             updateLayout(view);
//             end_transform = { ...placeholder.transform };

//             removeAt(environment, placeholderLocation);
//         } else {
//             end_transform = { ...to.transform };
//         }

//         // Start position
//         const start_transform = { ...move.transform };

//         // Create a movement path to translate the floating container along
//         const path = new DataMovementPath(start_transform, end_transform);
//         path.seek(0);

//         environment._temps['path'] = path;

//         if (options.baking) {
//             this.computeReadAndWrites({ location: getMemoryLocation(environment, (move).foundLocation, id: move.id });
//         }
//     }

//     seek(environment: Environment, time: number) {
//         let t = super.ease(time / this.duration);

//         const path = environment._temps['path'];

//         path.seek(t);
//         const position = path.getPosition(t);

//         let move = resolvePath(environment, this.inputSpecifier, null) as DataState;

//         move.transform.x = position.x;
//         move.transform.y = position.y;
//     }

//     end(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         this.seek(environment, this.duration);
//         environment._temps['path']?.destroy();
//     }

//     computeReadAndWrites(data: AnimationData) {
//         this._reads = [data];
//         this._writes = [data];
//     }
// }
