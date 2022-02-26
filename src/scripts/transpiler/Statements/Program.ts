import * as ESTree from 'estree'
import { EnvironmentState } from '../../environment/EnvironmentState'
import { createExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { addVertex } from '../../execution/graph/graph'
import { ControlOutput, ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { clone } from '../../utilities/objects'
import { Compiler, getNodeData } from '../Compiler'

export function Program(
    ast: ESTree.Program,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const controlOutput = { output: ControlOutput.None }

    // Add blocks
    for (const statement of ast.body) {
        const animation = Compiler.compile(statement, environment, {
            ...context,
            controlOutput,
        })
        addVertex(graph, animation, { nodeData: getNodeData(statement, 'statement') })
    }

    graph.postcondition = clone(environment)
    return graph
}
