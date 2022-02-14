import { instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { View } from '../View'
import { ViewController } from '../ViewController'
import { ViewRenderer } from '../ViewRenderer'

export class ForStatementView extends View {}

export class ForStatementViewRenderer extends ViewRenderer {}

export class ForStatementViewController extends ViewController {
    queryChildren() {
        if (instanceOfExecutionGraph(this.view.originalAnimation)) {
            return this.view.originalAnimation.vertices.slice(1, -2)
        } else {
            return []
        }
    }
}
