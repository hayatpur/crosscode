import { PositionType } from '../environment/data/DataState';
import { createEnvironment } from '../environment/environment';
import { EnvironmentState, instanceOfEnvironment } from '../environment/EnvironmentState';
import { ViewState } from './ViewState';

export function createView(): ViewState {
    this.id = 0;
    return {
        id: `View(${++this.id})`,
        transform: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            opacity: 1,
            positionModifiers: [],
            positionType: PositionType.Relative,
        },
        children: [createEnvironment()],
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

export function updateViewLayout(view: ViewState) {}
