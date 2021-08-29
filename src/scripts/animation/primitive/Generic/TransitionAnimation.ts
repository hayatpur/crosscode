import { Separators } from '../../../editor/Separators';
import { Transform } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { lerp } from '../../../utilities/math';
import { ViewPositionModifierType } from '../../../utilities/view';
import { View } from '../../../view/View';
import { Trace } from '../../graph/abstraction/Transition';
import { AnimationGraphRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export class TransitionAnimation extends AnimationNode {
    inputState: Environment;
    outputState: Environment;
    traces: { [dataId: string]: Trace[][] };

    constructor(
        inputState: Environment,
        outputState: Environment,
        traces: { [dataId: string]: Trace[][] },
        showBefore: boolean,
        options: AnimationOptions = {}
    ) {
        super({ ...options, duration: 150 });

        this.inputState = inputState;
        this.outputState = outputState;
        this.traces = traces;
    }

    begin(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {
        super.begin(environment, options);

        // Mapping of each data id to a corresponding view
        // const trace_mapping: { [id: string]: { viewId: string } } = {};
        // Object.keys(this.trace).forEach((id) => (trace_mapping[id] = { viewId: null }));

        // This environments view
        const thisView = Object.values(View.views).find((view) => view.environment == environment);

        // // Find views that have the relevant variables
        // for (const [viewId, view] of Object.entries(View.views)) {
        //     if (view.animation.globalTime > this.globalTime || view.animation == this || !view.animation.showing)
        //         continue;

        //     for (const [dataId, mapping] of Object.entries(trace_mapping)) {
        //         if (mapping.viewId != null) continue;

        //         const data = view.environment.resolve({ type: AccessorType.ID, value: dataId }, null) as Data;
        //         if (data != null) mapping.viewId = viewId;
        //     }
        // }

        // // Bring those views right above this view
        // const relevantViews = new Set(
        //     Object.values(trace_mapping)
        //         .map((mapping) => mapping.viewId)
        //         .filter((v) => v != null)
        // );

        // for (const id of relevantViews) {
        //     const other = View.views[id];
        //     other.positionModifiers.push({ type: ViewPositionModifierType.AboveView, value: thisView?.animation.id });
        // }

        thisView?.positionModifiers.push({ type: ViewPositionModifierType.BelowView, value: null });

        environment.replaceEnvironmentWith(this.outputState, { validIds: true });
        environment.renderEmpty = true;
        environment.updateLayout();

        // if (options.baking) {
        //     this.computeReadAndWrites();
        // }

        environment.beforeOffset = -1;

        // const mapping: { [id: string]: { start: Transform; end: Transform } } = {};

        // // Start transforms
        // this.inputState.updateLayout();
        // let items = this.inputState.flattenedMemory();
        // items = items.filter((data) => data && data.type == DataType.Literal);
        // items.reverse();

        // this.inputState.log();
        // this.outputState.log();

        // for (const [id, mapping] of Object.entries(trace_mapping)) {
        //     if (mapping.viewId == null) continue;

        //     const data = View.views[mapping.viewId].environment.resolve(
        //         { type: AccessorType.ID, value: id },
        //         null
        //     ) as Data;
        //     data.transform.floating = true;
        // }

        // // for (let item of items) {
        // //     mapping[item.id] = { start: JSON.parse(JSON.stringify(item.transform)), end: null };

        // //     const data = environment.resolve({ type: AccessorType.ID, value: item.id }, null) as Data;
        // //     data.transform.floating = true;
        // // }

        // // End transforms
        // this.outputState.updateLayout();
        // console.log(this.outputState);
        // items = this.outputState.flattenedMemory();
        // items = items.filter((data) => data && data.type == DataType.Literal);
        // items.reverse();

        // // for (const [id, writes] of Object.entries(this.trace)) {
        // //     const data = environment.resolve({ type: AccessorType.ID, value: id }) as Data;

        // //     // if (data == null) continue;

        // //     console.log('\tWrites', id, [...writes]);

        // //     if (writes.has(item.id)) {
        // //         mapping[id].end = JSON.parse(JSON.stringify(data.transform));
        // //     }
        // // }

        // for (let item of items) {
        //     // TODO
        //     if (!(item.id in mapping)) {
        //         continue;
        //     }

        //     const trace = this.trace[item.id];

        //     if (trace == null) {
        //         mapping[item.id].end = mapping[item.id].start;
        //         continue;
        //     }

        //     for (const write of trace) {
        //         const data = environment.resolve({ type: AccessorType.ID, value: write }, null) as Data;
        //         if (data != null && write != item.id) {
        //             mapping[item.id].end = JSON.parse(JSON.stringify(data.transform));
        //         }
        //     }
        // }

        if (thisView) Separators.instance.addSeparator(thisView);

        // environment._temps[`${this.id}_Transition`] = mapping;
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);

        let mapping: { [id: string]: { start: Transform; end: Transform } } =
            environment._temps[`${this.id}_Transition`];

        environment.beforeOffset = lerp(-1, 0, Math.min(1, t));

        for (const [id, { start, end }] of Object.entries(mapping)) {
            // Changes

            // if (start && end) {
            //     const data = environment.resolve({ type: AccessorType.ID, value: id }) as Data;
            //     data.transform.x = lerp(start.x, end.x, t);
            //     data.transform.y = lerp(start.y, end.y, t);
            // }

            // Deletions
            // if (start && !end) {
            //     const data = environment.resolve({ type: AccessorType.ID, value: id }) as Data;
            //     data.transform.z = 2 * t + 1;
            //     data.transform.opacity = (1 - t) ** 2;
            // }

            // Insertions
            if (!start && end) {
                // const data = environment.resolve({ type: AccessorType.ID, value: id }) as Data;
                // data.transform.z = t;
                // data.transform.opacity = 1 - t ** 2;
            }
        }
    }

    end(environment: Environment, options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
        environment.replaceEnvironmentWith(this.outputState);
        environment.updateLayout();
        environment.renderEmpty = false;
    }

    computeReadAndWrites() {
        this._reads = [];
        this._writes = [];
    }
}
