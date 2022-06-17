import { Action } from '../Action'
import { Representation } from './Representation'

export class IfStatementRepresentation extends Representation {
    constructor(action: Action) {
        super(action)
    }
}
