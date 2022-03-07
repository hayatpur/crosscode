import { AbstractionSelection } from '../execution/graph/abstraction/Abstractor'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../execution/primitive/ExecutionNode'
import { ExecutionRenderer, View } from '../renderer/Action/Action'
import {
    ForStatementView,
    ForStatementViewController,
    ForStatementViewRenderer,
} from '../renderer/ForStatement/ForStatementView'
import {
    ForStatementIterationView,
    ForStatementIterationViewController,
    ForStatementIterationViewRenderer,
} from '../renderer/ForStatement/Iteration/ForStatementIterationView'
import { ViewController } from '../renderer/ViewController'
import { ViewRenderer } from '../renderer/ViewRenderer'

export interface TempView {
    originalExecution: ExecutionNode | ExecutionGraph
    renderer: {
        element: HTMLElement
    }
}

export function createViewRenderer(view: View) {
    if (view.originalExecution.nodeData.type == 'ForStatement') {
        return new ForStatementViewRenderer(view)
    } else if (view.originalExecution.nodeData.type == 'ForStatementIteration') {
        return new ForStatementIterationViewRenderer(view)
    } else {
        return new ViewRenderer(view)
    }
}

export function createViewController(view: View) {
    if (view.originalExecution.nodeData.type == 'ForStatement') {
        return new ForStatementViewController(view)
    } else if (view.originalExecution.nodeData.type == 'ForStatementIteration') {
        return new ForStatementIterationViewController(view)
    } else {
        return new ViewController(view)
    }
}

export function createView(animation: ExecutionGraph | ExecutionNode, options: CreateViewOptions) {
    if (animation.nodeData.type == 'ForStatement') {
        return new ForStatementView(animation, options)
    } else if (animation.nodeData.type == 'ForStatementIteration') {
        return new ForStatementIterationView(animation, options)
    } else {
        return new View(animation, options)
    }
}

/** Any functions to execution renderer that don't modify it */

export function getAbstractionSelection(
    executionRenderer: ExecutionRenderer
): AbstractionSelection {
    if (!executionRenderer.state.isShowingSteps) {
        return {
            id: executionRenderer.id,
            selection: null,
        }
    }

    return executionRenderer.timeline.getAbstractionSelection(executionRenderer.execution.id)
}
