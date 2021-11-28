import * as ESTree from 'estree'
import { apply } from '../../../animation/animation'
import { AnimationGraph, createAnimationGraph } from '../../../animation/graph/AnimationGraph'
import { addVertex } from '../../../animation/graph/graph'
import { AnimationContext, ControlOutput, ControlOutputData } from '../../../animation/primitive/AnimationNode'
import { consumeDataAnimation } from '../../../animation/primitive/Data/ConsumeDataAnimation'
import { PrototypicalDataState } from '../../../environment/data/DataState'
import { resolvePath } from '../../../environment/environment'
import { AccessorType } from '../../../environment/EnvironmentState'
import { RootViewState } from '../../../view/ViewState'
import { Compiler, getNodeData } from '../../Compiler'

export function IfStatement(ast: ESTree.IfStatement, view: RootViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    // Points to the result of the test
    const testRegister = [{ type: AccessorType.Register, value: `${graph.id}_TestIf` }]

    const test = Compiler.compile(ast.test, view, { ...context, outputRegister: testRegister })
    addVertex(graph, test, { nodeData: getNodeData(ast.test) })

    // @TODO: Add a probe test animation
    const testData = resolvePath(view.environment, testRegister, null) as PrototypicalDataState
    const testValue = testData.value as boolean

    // Consume testData
    const consume = consumeDataAnimation(testRegister)
    addVertex(graph, consume, { nodeData: getNodeData(ast.test) })
    apply(consume, view)

    const controlOutput: ControlOutputData = { output: ControlOutput.None }

    if (testValue) {
        // Execute the body
        const body = Compiler.compile(ast.consequent, view, { ...context, controlOutput })
        addVertex(graph, body, { nodeData: getNodeData(ast.consequent) })
    } else if (ast.alternate != null) {
        // Execute the alternate (if any)
        const alternate = Compiler.compile(ast.alternate, view, { ...context, controlOutput })
        addVertex(graph, alternate, { nodeData: getNodeData(ast.alternate) })
    }

    context.controlOutput.output = controlOutput.output

    return graph
}
