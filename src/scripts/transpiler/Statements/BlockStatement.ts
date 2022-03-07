import * as ESTree from 'estree'
import { EnvironmentState } from '../../environment/EnvironmentState'
import { addVertex, applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import {
    ControlOutput,
    ControlOutputData,
    ExecutionContext,
} from '../../execution/primitive/ExecutionNode'
import { createScopeAnimation } from '../../execution/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../execution/primitive/Scope/PopScopeAnimation'
import { clone } from '../../utilities/objects'
import { Compiler, getNodeData } from '../Compiler'

export enum ScopeType {
    None = 'None',
    Default = 'Default',
    Hard = 'Hard',
}

/**
 * A block contains a sequence of one or more statements.
 * @param ast Block Statement AST
 * @param view ViewState state leading up to block statement
 * @param context
 * @returns {ExecutionGraph} animation
 */
export function BlockStatement(
    ast: ESTree.BlockStatement,
    environment: EnvironmentState,
    context: ExecutionContext,
    scopeType: ScopeType = ScopeType.Default
): ExecutionGraph {
    const graph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    context.locationHint = []

    // Create a scope
    if (scopeType == ScopeType.Default) {
        const createScope = createScopeAnimation()
        addVertex(graph, createScope, { nodeData: getNodeData(ast) })
        applyExecutionNode(createScope, environment)
    }

    // Add statements
    for (const statement of ast.body) {
        const controlOutput: ControlOutputData = { output: ControlOutput.None }

        const animation = Compiler.compile(statement, environment, {
            ...context,
            controlOutput,
        })
        addVertex(graph, animation, { nodeData: getNodeData(statement) })

        if (controlOutput.output == ControlOutput.Break) {
            // Keep propagating 'break' until reaching a ForStatement or WhileStatement
            context.controlOutput.output = ControlOutput.Break
            break
        } else if (controlOutput.output == ControlOutput.Continue) {
            // Keep propagating 'continue' until reaching a ForStatement or WhileStatement
            context.controlOutput.output = ControlOutput.Continue
            break
        } else if (controlOutput.output == ControlOutput.Return) {
            // Keep propagating 'return' until reaching a ForStatement or WhileStatement
            context.controlOutput.output = ControlOutput.Return
            break
        }
    }

    // Pop scope
    if (scopeType == ScopeType.Default) {
        const popScope = popScopeAnimation()
        addVertex(graph, popScope, { nodeData: getNodeData(ast) })
        applyExecutionNode(popScope, environment)
    }

    graph.postcondition = clone(environment)
    return graph
}
