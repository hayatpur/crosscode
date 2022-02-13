import { View } from '../../View'
import { ViewController } from '../../ViewController'
import { ViewRenderer } from '../../ViewRenderer'

export class ForStatementIterationView extends View {}

export class ForStatementIterationViewController extends ViewController {}

export class ForStatementIterationViewRenderer extends ViewRenderer {
    constructor(view: View) {
        super(view)
    }
}
