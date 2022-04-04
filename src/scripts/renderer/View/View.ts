import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { ViewController } from './ViewController'
import { ViewRenderer } from './ViewRenderer'
import { createViewState, ViewState } from './ViewState'

/* ------------------------------------------------------ */
/*        View displays a series of program states        */
/* ------------------------------------------------------ */
export class View {
    state: ViewState
    renderer: ViewRenderer
    controller: ViewController

    executions: (ExecutionGraph | ExecutionNode)[] = []
    representingExecutions: (ExecutionGraph | ExecutionNode)[] = []

    constructor() {
        this.state = createViewState()
        this.renderer = new ViewRenderer()
        this.controller = new ViewController(this)
        this.controller.updateTime(0)
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.controller.destroy()
        this.renderer.destroy()
    }
}
