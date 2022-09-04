import { ActionState } from '../Action'
import { Representation } from './Representation'

export class AssignmentExpressionRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)
        this.shouldHover = true
    }
}
