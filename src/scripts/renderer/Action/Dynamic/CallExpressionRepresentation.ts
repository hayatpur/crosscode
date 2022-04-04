import { Action } from '../Action'
import { Representation } from './Representation'

export class CallExpressionRepresentation extends Representation {
    constructor(action: Action) {
        super(action)
    }
}
