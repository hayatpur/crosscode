import { Action } from '../Action'
import { Representation } from './Representation'

export class IfStatementRepresentation extends Representation {
    isExpanded: boolean = false

    constructor(action: Action) {
        super(action)
    }
}
