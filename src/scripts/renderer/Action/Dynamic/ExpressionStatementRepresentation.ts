import { ActionState } from '../Action'
import { Representation } from './Representation'

export class ExpressionStatementRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)
        this.shouldHover = true
    }
}
