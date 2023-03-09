import { ApplicationState } from '../../../ApplicationState'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class ExpressionStatementRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)
        this.shouldHover = true
    }

    createSteps(): void {
        super.createSteps()

        const action = ApplicationState.actions[this.actionId]
        const execution = action.execution as ExecutionGraph

        // let isAssignment = false
        // if (execution.vertices.length > 0 && execution.vertices[0].nodeData.preLabel == 'AssignmentIdentifier') {
        //     isAssignment = true
        // }

        // const proxy = action.proxy

        // if (isAssignment) {
        //      TODO
        //      Swap second and third child in the proxy
        //      const secondChild = proxy.element.children[1]
        //      const thirdChild = proxy.element.children[2]
        //      proxy.element.insertBefore(thirdChild, secondChild)

        //     this.isBreakable = false
        // }
    }
}
