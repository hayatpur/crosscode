import * as ESTree from 'estree'
import { clone } from '../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ControlOutput, ControlOutputData, ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { createScopeAnimation } from '../../execution/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../execution/primitive/Scope/PopScopeAnimation'
import { Compiler, getNodeData } from '../Compiler'
import { EnvironmentState } from '../EnvironmentState'

export enum ScopeType {
    None = 'None',
    Default = 'Default',
    Global = 'Global',
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
        // addVertex(graph, createScope, { nodeData: getNodeData(ast, 'Create Scope') })
        applyExecutionNode(createScope, environment)
    }

    let currLine = -1

    // Add statements
    for (const statement of ast.body) {
        const controlOutput: ControlOutputData = { output: ControlOutput.None }

        const animation = Compiler.compile(statement, environment, {
            ...context,
            controlOutput,
        })

        let line = animation.nodeData.location?.start.line as number
        let hasLineBreak = false
        if (line > currLine + 1 && currLine >= 0) {
            // Add a line break
            hasLineBreak = true
        }
        currLine = animation.nodeData.location?.end.line as number

        addVertex(graph, animation, { nodeData: getNodeData(statement, 'Statement', hasLineBreak) })

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
        // addVertex(graph, popScope, { nodeData: getNodeData(ast, 'Pop Scope') })
        applyExecutionNode(popScope, environment)
    }

    graph.postcondition = clone(environment)
    return graph
}
