import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { createElement } from '../../utilities/dom'

export class Query {
    element: HTMLElement

    constructor(executions: (ExecutionGraph | ExecutionNode)[]) {
        this.element = createElement('div', 'query', document.body)
    }
}
