import { popScope } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { clone } from '../../../utilities/objects'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface PopScopeAnimation extends ExecutionNode {}

function apply(animation: PopScopeAnimation, environment: EnvironmentState) {
    console.log('Before pop', clone(environment))
    popScope(environment)
    console.log('After pop', clone(environment))
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
