import * as ESTree from 'estree'
import { apply } from '../../animation/animation'
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph'
import { addVertex } from '../../animation/graph/graph'
import { AnimationContext } from '../../animation/primitive/AnimationNode'
import { bindAnimation } from '../../animation/primitive/Binding/BindAnimation'
import { groupEndAnimation } from '../../animation/primitive/Group/GroupEndAnimation'
import { groupStartAnimation } from '../../animation/primitive/Group/GroupStartAnimation'
import { createScopeAnimation } from '../../animation/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../animation/primitive/Scope/PopScopeAnimation'
import { getActiveView } from '../../view/view'
import { ViewState } from '../../view/ViewState'
import { Compiler, getNodeData } from '../Compiler'

export function FunctionCall(ast: ESTree.FunctionDeclaration, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    // End any previous group
    const previousGroupId = getActiveView(view).id
    const endPreviousGroup = groupEndAnimation(previousGroupId)
    addVertex(graph, endPreviousGroup, { nodeData: getNodeData(ast) })
    apply(endPreviousGroup, view)

    const startGroup = groupStartAnimation(getNodeData(ast), graph.id)
    addVertex(graph, startGroup, { nodeData: getNodeData(ast) })
    apply(startGroup, view)

    // Create a scope @TODO: HARD SCOPE
    const createScope = createScopeAnimation()
    addVertex(graph, createScope, { nodeData: getNodeData(ast) })
    apply(createScope, view)

    // Bind arguments
    for (let i = 0; i < ast.params.length; i++) {
        const param = ast.params[i] as ESTree.Identifier
        const argRegister = context.args[i]

        const bind = bindAnimation(param.name, argRegister)
        addVertex(graph, bind, { nodeData: getNodeData(ast.params[i]) })
        apply(bind, view)
    }

    // Call function
    const body = Compiler.compile(ast.body, view, { ...context, args: null })
    addVertex(graph, body, { nodeData: getNodeData(ast) })

    // Pop scope
    const popScope = popScopeAnimation()
    addVertex(graph, popScope, { nodeData: getNodeData(ast) })
    apply(popScope, view)

    const endGroup = groupEndAnimation(graph.id)
    addVertex(graph, endGroup, { nodeData: getNodeData(ast) })
    apply(endGroup, view)

    const restartGroup = groupStartAnimation(getNodeData(ast), previousGroupId, false, true)
    addVertex(graph, restartGroup, { nodeData: getNodeData(ast) })
    apply(restartGroup, view)

    return graph
}
