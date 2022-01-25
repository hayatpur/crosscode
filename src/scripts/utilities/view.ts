import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import { ForStatementView } from '../view/ForStatement/ForStatementView'
import { ForStatementViewController } from '../view/ForStatement/ForStatementViewController'
import { ForStatementViewRenderer } from '../view/ForStatement/ForStatementViewRenderer'
import { View } from '../view/View'
import { ViewController } from '../view/ViewController'
import { ViewRenderer } from '../view/ViewRenderer'

export function createViewRenderer(view: View) {
    if (view.originalAnimation.nodeData.type == 'ForStatement') {
        return new ForStatementViewRenderer(view)
    } else {
        return new ViewRenderer(view)
    }
}

export function createViewController(view: View) {
    if (view.originalAnimation.nodeData.type == 'ForStatement') {
        return new ForStatementViewController(view)
    } else {
        return new ViewController(view)
    }
}

export function createView(animation: AnimationGraph | AnimationNode) {
    if (animation.nodeData.type == 'ForStatement') {
        return new ForStatementView(animation)
    } else {
        return new View(animation)
    }
}
