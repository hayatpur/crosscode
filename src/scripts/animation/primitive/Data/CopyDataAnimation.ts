import { cloneData, createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataType, PositionType } from '../../../environment/data/DataState';
import { addDataAt, resolvePath } from '../../../environment/environment';
import { Accessor, accessorsToString } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface CopyDataAnimation extends AnimationNode {
    dataSpecifier: Accessor[];
    outputRegister: Accessor[];
    hardCopy: boolean;
}

function onBegin(animation: CopyDataAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    const data = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Data`) as DataState;
    const copy = cloneData(data, false, `${animation.id}_Copy`);
    copy.transform.depth = 0;
    copy.transform.positionType = PositionType.Absolute;

    const location = addDataAt(environment, copy, [], null);
    environment._temps[`CopyDataAnimation${animation.id}`] = location;

    // Put it in the floating stack
    const register = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState;
    replaceDataWith(register, createData(DataType.ID, copy.id, `${animation.id}_Floating`));

    if (animation.hardCopy) {
        console.log('Hard copying...');
        data.value = undefined;
    }

    if (options.baking) {
        // animation.computeReadAndWrites(
        //     {
        //         location: getMemoryLocation(environment, data).foundLocation,
        //         id: data.id,
        //     },
        //     { location, id: copy.id }
        // );
    }
}

function onSeek(animation: CopyDataAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const copy = resolvePath(environment, environment._temps[`CopyDataAnimation${animation.id}`], null) as DataState;
    copy.transform.depth = t;
}

function onEnd(animation: CopyDataAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    const copy = resolvePath(environment, environment._temps[`CopyDataAnimation${animation.id}`], null) as DataState;
    copy.transform.depth = 1;

    copy.transform.positionType = PositionType.Absolute;
}

export function copyDataAnimation(
    dataSpecifier: Accessor[],
    outputRegister: Accessor[],
    hardCopy: boolean = false,
    options: AnimationOptions = {}
): CopyDataAnimation {
    return {
        ...createAnimationNode(null, options),

        name: `Copy ${accessorsToString(dataSpecifier)} to ${accessorsToString(outputRegister)}`,

        // Attributes
        dataSpecifier,
        outputRegister,
        hardCopy,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
