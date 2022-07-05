import * as ESTree from 'estree'
import { EnvironmentState } from '../../environment/EnvironmentState'
import { addVertex } from '../../execution/execution'
import { createExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ControlOutput, ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { clone } from '../../utilities/objects'
import { Compiler, getNodeData } from '../Compiler'

export function Program(ast: ESTree.Program, environment: EnvironmentState, context: ExecutionContext) {
    const graph = createExecutionGraph(getNodeData(ast, 'Program'))
    graph.precondition = clone(environment)

    const controlOutput = { output: ControlOutput.None }

    // Add blocks
    for (const statement of ast.body) {
        const animation = Compiler.compile(statement, environment, {
            ...context,
            controlOutput,
        })

        if (animation != null) {
            addVertex(graph, animation, { nodeData: getNodeData(statement, 'Statement') })
        }
    }

    graph.postcondition = clone(environment)
    return graph
}
