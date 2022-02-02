import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import {
    ForStatementView,
    ForStatementViewController,
    ForStatementViewRenderer,
} from '../view/ForStatement/ForStatementView'
import {
    ForStatementIterationView,
    ForStatementIterationViewController,
    ForStatementIterationViewRenderer,
} from '../view/ForStatement/Iteration/ForStatementIterationView'
import { View } from '../view/View'
import { ViewController } from '../view/ViewController'
import { ViewRenderer } from '../view/ViewRenderer'

export function createViewRenderer(view: View) {
    if (view.originalAnimation.nodeData.type == 'ForStatement') {
        return new ForStatementViewRenderer(view)
    } else if (
        view.originalAnimation.nodeData.type == 'ForStatementIteration'
    ) {
        return new ForStatementIterationViewRenderer(view)
    } else {
        return new ViewRenderer(view)
    }
}

export function createViewController(view: View) {
    if (view.originalAnimation.nodeData.type == 'ForStatement') {
        return new ForStatementViewController(view)
    } else if (
        view.originalAnimation.nodeData.type == 'ForStatementIteration'
    ) {
        return new ForStatementIterationViewController(view)
    } else {
        return new ViewController(view)
    }
}

export function createView(animation: AnimationGraph | AnimationNode) {
    if (animation.nodeData.type == 'ForStatement') {
        return new ForStatementView(animation)
    } else if (animation.nodeData.type == 'ForStatementIteration') {
        return new ForStatementIterationView(animation)
    } else {
        return new View(animation)
    }
}
