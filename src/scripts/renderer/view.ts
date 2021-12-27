import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import { View } from '../view/View'

export function createViewFromAnimation(
    animation: AnimationGraph | AnimationNode
): View {
    const view = new View(animation.id)

    return view
}
