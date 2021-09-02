// import { Separators } from '../../../editor/Separators';
// import { AccessorType } from '../../../environment/data/data';
// import { Environment } from '../../../environment/environment';
// import { remap } from '../../../utilities/math';
// import { ViewPositionModifierType } from '../../../utilities/view';
// import { View } from '../../../view/ViewRenderer';
// import { Trace } from '../../graph/abstraction/Transition';
// import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
// import { AnimationNode, AnimationOptions } from '../AnimationNode';

// export class TransitionAnimation extends AnimationNode {
//     inputState: Environment;
//     outputState: Environment;
//     traces: { [dataId: string]: Trace[][] };

//     constructor(
//         inputState: Environment,
//         outputState: Environment,
//         traces: { [dataId: string]: Trace[][] },
//         showBefore: boolean,
//         options: AnimationOptions = {}
//     ) {
//         super({ ...options, duration: 150 });

//         this.inputState = inputState;
//         this.outputState = outputState;
//         this.traces = traces;
//     }

//     begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         super.begin(environment, options);

//         // This environments view
//         const thisView = Object.values(View.views).find((view) => view.environment == environment);
//         thisView?.positionModifiers.push({ type: ViewPositionModifierType.BelowView, value: null });

//         console.log(this.traces);

//         // Mapping of each data id to a corresponding view
//         const dataToView = getDataToViewMapping(this);

//         // Bring those views right above this view
//         const views = new Set(
//             Object.values(dataToView)
//                 .map((mapping) => mapping.viewId)
//                 .filter((v) => v != null)
//         );

//         for (const id of views) {
//             const view = View.views[id];
//             view.positionModifiers.push({ type: ViewPositionModifierType.AboveView, value: thisView?.animation.id });
//         }

//         // Set to output state but render empty
//         environment.replaceEnvironmentWith(this.outputState, { validIds: true });
//         updateEnvironmentLayout(environment);
//         environment.renderEmpty = true;

//         // const mapping: { [id: string]: { start: Transform; end: Transform } } = {};

//         // Start transforms
//         // this.inputState.updateLayout();
//         // let items = this.inputState.flattenedMemory();
//         // items = items.filter((data) => data && data.type == DataType.Literal);
//         // items.reverse();

//         // this.inputState.log();
//         // this.outputState.log();

//         // for (const [id, mapping] of Object.entries(trace_mapping)) {
//         //     if (mapping.viewId == null) continue;

//         //     const data = View.views[mapping.viewId].environment.resolve(
//         //         { type: AccessorType.ID, value: id },
//         //         null
//         //     ) as DataState;
//         //     data.transform.floating = true;
//         // }

//         // // for (let item of items) {
//         // //     mapping[item.id] = { start: JSON.parse(JSON.stringify(item.transform)), end: null };

//         // //     const data = environment.resolve({ type: AccessorType.ID, value: item.id }, null) as DataState;
//         // //     data.transform.floating = true;
//         // // }

//         // // End transforms
//         // this.outputState.updateLayout();
//         // console.log(this.outputState);
//         // items = this.outputState.flattenedMemory();
//         // items = items.filter((data) => data && data.type == DataType.Literal);
//         // items.reverse();

//         // // for (const [id, writes] of Object.entries(this.trace)) {
//         // //     const data = environment.resolve({ type: AccessorType.ID, value: id }) as DataState;

//         // //     // if (data == null) continue;

//         // //     console.log('\tWrites', id, [...writes]);

//         // //     if (writes.has(item.id)) {
//         // //         mapping[id].end = JSON.parse(JSON.stringify(data.transform));
//         // //     }
//         // // }

//         // for (let item of items) {
//         //     // TODO
//         //     if (!(item.id in mapping)) {
//         //         continue;
//         //     }

//         //     const trace = this.trace[item.id];

//         //     if (trace == null) {
//         //         mapping[item.id].end = mapping[item.id].start;
//         //         continue;
//         //     }

//         //     for (const write of trace) {
//         //         const data = environment.resolve({ type: AccessorType.ID, value: write }, null) as DataState;
//         //         if (data != null && write != item.id) {
//         //             mapping[item.id].end = JSON.parse(JSON.stringify(data.transform));
//         //         }
//         //     }
//         // }

//         if (thisView) Separators.instance.addSeparator(thisView);

//         environment._temps[`${this.id}_DataToView`] = dataToView;
//         environment._temps[`${this.id}_ThisViewId`] = thisView?.animation.id;
//         environment._temps[`${this.id}_ys`] = {};
//     }

//     seek(environment: Environment, time: number) {
//         let tn = time / this.duration;

//         let dataToView: {
//             [id: string]: {
//                 viewId: string;
//             };
//         } = environment._temps[`${this.id}_DataToView`];

//         let ys = environment._temps[`${this.id}_ys`];

//         const thisViewId = environment._temps[`${this.id}_ThisViewId`];
//         if (thisViewId == null) return;

//         if (tn < 0.2) {
//             let t = super.ease(remap(tn, 0, 0.2, 0, 1));

//             // Float up / copy
//             for (const dataId of Object.keys(this.traces)) {
//                 const viewId = dataToView[dataId].viewId;
//                 const data = View.views[viewId].environment.resolve(
//                     { type: AccessorType.ID, value: dataId },
//                     null
//                 ) as DataState;
//                 data.transform.floating = true;
//                 data.transform.z = t;
//                 ys[dataId] = data.transform.y;
//             }
//         } else if (tn < 0.8) {
//             let t = super.ease(remap(tn, 0.2, 0.8, 0, 1));

//             // const dy = View.views[thisViewId.id];

//             // Move
//             for (const dataId of Object.keys(this.traces)) {
//                 const viewId = dataToView[dataId].viewId;
//                 const data = View.views[viewId].environment.resolve(
//                     { type: AccessorType.ID, value: dataId },
//                     null
//                 ) as DataState;
//                 data.transform.y = ys[dataId] + 125 * t;
//             }
//         } else {
//             let t = super.ease(remap(tn, 0.8, 1, 0, 1));
//             // Place
//             for (const dataId of Object.keys(this.traces)) {
//                 const viewId = dataToView[dataId].viewId;
//                 const data = View.views[viewId].environment.resolve(
//                     { type: AccessorType.ID, value: dataId },
//                     null
//                 ) as DataState;
//                 data.transform.floating = true;
//                 data.transform.z = 1 - t;
//             }
//         }

//         // let mapping: { [id: string]: { start: Transform; end: Transform } } =
//         //     environment._temps[`${this.id}_Transition`];

//         // for (const [id, { start, end }] of Object.entries(mapping)) {
//         //     // Changes

//         //     // if (start && end) {
//         //     //     const data = environment.resolve({ type: AccessorType.ID, value: id }) as DataState;
//         //     //     data.transform.x = lerp(start.x, end.x, t);
//         //     //     data.transform.y = lerp(start.y, end.y, t);
//         //     // }

//         //     // Deletions
//         //     // if (start && !end) {
//         //     //     const data = environment.resolve({ type: AccessorType.ID, value: id }) as DataState;
//         //     //     data.transform.z = 2 * t + 1;
//         //     //     data.transform.opacity = (1 - t) ** 2;
//         //     // }

//         //     // Insertions
//         //     if (!start && end) {
//         //         // const data = environment.resolve({ type: AccessorType.ID, value: id }) as DataState;
//         //         // data.transform.z = t;
//         //         // data.transform.opacity = 1 - t ** 2;
//         //     }
//         // }
//     }

//     end(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         let dataToView: {
//             [id: string]: {
//                 viewId: string;
//             };
//         } = environment._temps[`${this.id}_DataToView`];

//         for (const dataId of Object.keys(this.traces)) {
//             const viewId = dataToView[dataId].viewId;
//             if (View.views[viewId] == null) continue;
//             const data = View.views[viewId].environment.resolve(
//                 { type: AccessorType.ID, value: dataId },
//                 null
//             ) as DataState;
//             data.transform.floating = false;
//             data.transform.y = 0;
//             View.views[viewId].updateEnvironmentLayout(environment);
//             View.views[viewId].update();
//         }

//         environment.replaceEnvironmentWith(this.outputState);
//         updateEnvironmentLayout(environment);
//         environment.renderEmpty = false;
//     }

//     computeReadAndWrites() {
//         this._reads = [];
//         this._writes = [];
//     }
// }

// function getDataToViewMapping(animation: TransitionAnimation) {
//     const dataToView: { [id: string]: { viewId: string } } = {};
//     Object.keys(animation.traces).forEach((dataId) => {
//         dataToView[dataId] = { viewId: null };
//     });

//     // Find views that have the relevant variables, for each view
//     for (const [viewId, view] of Object.entries(View.views)) {
//         if (view.animation.globalTime > animation.globalTime || view.animation == animation || !view.animation.showing)
//             continue;

//         // Find if its environment contains any data
//         for (const [dataId, mapping] of Object.entries(dataToView)) {
//             if (mapping.viewId != null) continue;
//             view.environment.log();

//             const data = view.environment.resolve({ type: AccessorType.ID, value: dataId }, null) as DataState;
//             if (data != null) mapping.viewId = viewId;
//         }
//     }

//     return dataToView;
// }
