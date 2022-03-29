import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { createEl } from '../../utilities/dom'

export class Query {
    element: HTMLElement

    constructor(executions: (ExecutionGraph | ExecutionNode)[]) {
        this.element = createEl('div', 'query', document.body)
    }
}
