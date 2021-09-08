import { cloneData, createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataType } from '../../../environment/data/DataState';
import { addDataAt, getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment';
import { Accessor } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface GetMember extends AnimationNode {
    objectRegister: Accessor[];
    propertyRegister?: Accessor[]; // Only if computed
    outputRegister: Accessor[];

    property?: any; // Only if not computed
    computed: boolean;
}

function onBegin(animation: GetMember, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    const object = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`) as DataState;

    if (object.type != DataType.Array) {
        console.error('Invalid object type in index');
        return;
    }

    let copy: DataState = null;

    if (animation.computed) {
        // Get property
        const property = resolvePath(environment, animation.propertyRegister, `${animation.id}_Property`) as DataState;
        animation.property = property.value;
        removeAt(environment, getMemoryLocation(environment, property).foundLocation);
        const data = (object.value as DataState[])[animation.property];
        copy = data;

        if (data.type == DataType.Literal) {
            copy = cloneData(data, false, `${animation.id}_Copy`);
            addDataAt(environment, copy, [], null);
        } else {
            copy = data;
        }
    } else {
        const value = (object.value as DataState[])[animation.property] as any;

        copy = createData(DataType.Literal, value, `${animation.id}_CreateNonComputed`);
        addDataAt(environment, copy, [], null);
    }

    // Remove object (reference)
    const objectReference = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`, null, {
        noResolvingReference: true,
    }) as DataState;
    removeAt(environment, getMemoryLocation(environment, objectReference).foundLocation, {
        noResolvingReference: true,
    });

    // Point the output register to the newly created data
    const outputRegister = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState;
    replaceDataWith(outputRegister, createData(DataType.ID, copy.id, `${animation.id}_OutputRegister`));
}

function onSeek(animation: GetMember, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));
    const environment = getCurrentEnvironment(view);
}

function onEnd(animation: GetMember, view: ViewState, options: AnimationRuntimeOptions) {}

export function getMember(
    objectRegister: Accessor[],
    propertyRegister: Accessor[],
    outputRegister: Accessor[],
    property: any,
    computed: boolean,
    options: AnimationOptions = {}
): GetMember {
    return {
        ...createAnimationNode(null, options),

        name: 'GetMember',

        // Attributes
        objectRegister,
        propertyRegister,
        outputRegister,
        property,
        computed,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
