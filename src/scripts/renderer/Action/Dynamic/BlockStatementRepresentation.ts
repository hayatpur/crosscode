import { Action } from '../Action'
import { Representation } from './Representation'

export class BlockStatementRepresentation extends Representation {
    constructor(action: Action) {
        super(action)
    }
}
