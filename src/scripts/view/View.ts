import { createEnvironment } from '../environment/environment';
import { EnvironmentState } from '../environment/EnvironmentState';
import { ViewState } from './ViewState';

export function createView(): ViewState {
    return {
        transform: {
            x: 0,
            y: 0,
            opacity: 1,
            positionModifiers: [],
        },
        environments: [createEnvironment()],
    };
}

export function getCurrentEnvironment(view: ViewState): EnvironmentState {
    return view.environments[view.environments.length - 1];
}
