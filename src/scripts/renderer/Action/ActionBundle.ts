import { EnvironmentState } from '../../environment/EnvironmentState'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { createEl } from '../../utilities/dom'
import { Action } from './Action'

/* ------------------------------------------------------ */
/*    A bundle is a group of actions on the same depth    */
/* ------------------------------------------------------ */

// TODO: Once a bundle is broken, it can't be rejoined
export class ActionBundle {
    renderer: {
        element: HTMLElement
    }
    actions: (Action | ActionBundle)[]
    parentAction: Action

    /* ----------------------- Create ----------------------- */
    constructor(parentAction: Action, actions: (Action | ActionBundle)[]) {
        this.parentAction = parentAction
        this.actions = actions

        this.create()
    }

    create() {
        const element = createEl('div', 'action-bundle')
        element.innerText = '···'

        this.renderer = { element }
    }

    getPreCondition(): EnvironmentState {
        const first = this.actions[0]

        if (first instanceof ActionBundle) {
            return first.getPreCondition()
        } else {
            return first.execution.precondition
        }
    }

    getPostCondition(): EnvironmentState {
        const last = this.actions[this.actions.length - 1]

        if (last instanceof ActionBundle) {
            return last.getPostCondition()
        } else {
            return last.execution.postcondition
        }
    }

    getPostExecution(): ExecutionGraph | ExecutionNode {
        const last = this.actions[this.actions.length - 1]

        if (last instanceof ActionBundle) {
            return last.getPostExecution()
        } else {
            return last.execution
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {}
}
