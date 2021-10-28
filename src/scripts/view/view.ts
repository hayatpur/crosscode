import { createTransform } from '../environment/data/data';
import { createEnvironment } from '../environment/environment';
import { EnvironmentState, instanceOfEnvironment } from '../environment/EnvironmentState';
import { ViewState } from './ViewState';

let CUR_VIEW_ID = 0;

export function createView(
    options: { noChildren?: boolean; isRoot?: boolean } = { noChildren: false, isRoot: false }
): ViewState {
    return {
        _type: 'ViewState',
        id: `View(${++CUR_VIEW_ID})`,
        transform: {
            ...createTransform(),
            styles: {},
            positionModifiers: [],
            classList: ['view-i'],
        },
        children: options.noChildren ? [] : [createEnvironment()],
        label: '',
        isRoot: options.isRoot ? true : false,
    };
}

export function getCurrentEnvironment(view: ViewState): EnvironmentState {
    const lastChild = view.children[view.children.length - 1];

    if (instanceOfEnvironment(lastChild)) {
        return lastChild;
    } else {
        return getCurrentEnvironment(lastChild);
    }
}