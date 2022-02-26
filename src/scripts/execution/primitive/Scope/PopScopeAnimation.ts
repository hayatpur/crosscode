import { popScope } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface PopScopeAnimation extends ExecutionNode {}

function apply(animation: PopScopeAnimation, environment: EnvironmentState) {
    popScope(environment)

    computeReadAndWrites(animation)
}

// TODO: Reads and writes
function computeReadAndWrites(animation: PopScopeAnimation) {
    animation._reads = []
    animation._writes = []
}

export function popScopeAnimation(): PopScopeAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'PopScopeAnimation',

        name: 'Pop Scope',

        // Callbacks
        apply,
    }
}
