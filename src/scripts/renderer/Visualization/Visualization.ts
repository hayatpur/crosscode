import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { Executor } from '../../executor/Executor'
import { createElement } from '../../utilities/dom'
import { Action, createSteps } from '../Action/Action'
import { ActionMapping } from '../Action/Mapping/ActionMapping'
import { View } from '../View/View'

/* ------------------------------------------------------ */
/*                Visualizes code execution               */
/* ------------------------------------------------------ */
export class Visualization {
    // Source-code
    program: Action

    // Source-code to view mapping
    mapping: ActionMapping

    container: HTMLElement

    // View
    view: View

    /* ----------------------- Create ----------------------- */
    constructor(execution: ExecutionGraph) {
        // Early bind
        Executor.instance.visualization = this

        // Root action
        this.program = new Action(execution, null)
        createSteps(this.program)

        this.container = this.createContainer()
        this.view = new View()
        this.mapping = new ActionMapping()
    }

    createContainer() {
        const el = createElement('div', 'visualization-container', document.body)
        const margin = Editor.instance.getMaxWidth() + 70

        el.style.left = `${margin}px`
        return el
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.mapping.destroy()
        this.view.destroy()
        this.program.destroy()

        this.container.remove()
    }
}
