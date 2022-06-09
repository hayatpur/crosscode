import { Action } from '../Action'
import { Representation } from './Representation'

export class IfStatementRepresentation extends Representation {
    isExpanded: boolean = false

    constructor(action: Action) {
        super(action)
    }

    // Get frames should call get frames of each step.
    // getFrames(): [env: EnvironmentState, actionId: string][] {
    //     if (this.action.steps.length == 0) {
    //         return [[this.action.execution.postcondition, this.action.state.id]]
    //     } else {
    //         const frames = []
    //         for (let i = 1; i < this.action.steps.length; i++) {
    //             frames.push(...this.action.steps[i].representation.getFrames())
    //         }
    //         return frames
    //     }
    // }
}
