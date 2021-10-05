import { PositionType } from '../environment/data/DataState';
import { createEnvironment } from '../environment/environment';
import { EnvironmentState, instanceOfEnvironment } from '../environment/EnvironmentState';
import { ViewState } from './ViewState';

let CUR_VIEW_ID = 0;

export function createView(
    options: { noChildren?: boolean; isRoot?: boolean } = { noChildren: false, isRoot: false }
): ViewState {
    return {
        id: `View(${++CUR_VIEW_ID})`,
        transform: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            opacity: 1,
            positionModifiers: [],
            positionType: PositionType.Relative,
        },
        children: options.noChildren ? [] : [createEnvironment()],
        label: '[NONE]',
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
