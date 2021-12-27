import * as ESTree from 'estree'
import { apply } from '../../animation/animation'
import {
    AnimationGraph,
    createAnimationGraph,
} from '../../animation/graph/AnimationGraph'
import { addVertex } from '../../animation/graph/graph'
import { AnimationContext } from '../../animation/primitive/AnimationNode'
import { bindAnimation } from '../../animation/primitive/Binding/BindAnimation'
import { moveAndPlaceAnimation } from '../../animation/primitive/Data/MoveAndPlaceAnimation'
import {
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../environment/EnvironmentState'
import { Compiler, getNodeData } from '../Compiler'

export function VariableDeclarator(
    ast: ESTree.VariableDeclarator,
    view: PrototypicalEnvironmentState,
    context: AnimationContext
) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    // Create a register to allocate RHS in
    const register = [
        {
            type: AccessorType.Register,
            value: `${graph.id}__VariableDeclaration`,
        },
    ]

    const doNotFloat = ast.init.type == 'ArrayExpression'

    // Copy / create and float it up RHS
    const init = Compiler.compile(ast.init, view, {
        ...context,
        outputRegister: register,
        doNotFloat,
    })
    addVertex(graph, init, { nodeData: getNodeData(ast.init) })

    // Place down the RHS at a free spot
    if (!doNotFloat) {
        const place = moveAndPlaceAnimation(
            register,
            [],
            ast.init.type == 'Literal'
        )
        addVertex(graph, place, { nodeData: getNodeData(ast) })
        apply(place, view)
    }

    // Allocate a place for variable that *points* to the register @TODO: support other initializations that identifier
    const bind = bindAnimation((ast.id as ESTree.Identifier).name, register)
    addVertex(graph, bind, { nodeData: getNodeData(ast.id) })
    apply(bind, view)

    return graph
}
