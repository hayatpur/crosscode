import * as ESTree from 'estree'
import { convertIdentifierToLiteral } from '../../../environment/data'
import { cleanUpRegister } from '../../../environment/environment'
import { AccessorType, EnvironmentState } from '../../../environment/EnvironmentState'
import { addVertex, applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { findMember } from '../../../execution/primitive/Data/FindMember'
import { getMember } from '../../../execution/primitive/Data/GetMember'
import { ExecutionContext } from '../../../execution/primitive/ExecutionNode'
import { clone } from '../../../utilities/objects'
import { Compiler, getNodeData } from '../../Compiler'

/**
 *
 * @param ast
 * @param view
 * @param context
 * @returns
 */
export function MemberExpression(
    ast: ESTree.MemberExpression,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    console.log('Gets here', ast)

    // Create a register which'll *point* to the location of object
    const objectRegister = [{ type: AccessorType.Register, value: `${graph.id}_Object` }]
    const object = Compiler.compile(ast.object, environment, {
        ...context,
        feed: false,
        outputRegister: objectRegister,
    })
    addVertex(graph, object, { nodeData: getNodeData(ast.object, 'Object') })

    // Create a register that'll point to the location of computed property
    const propertyRegister = [{ type: AccessorType.Register, value: `${graph.id}_Property` }]

    // Something like obj[i], or obj['x']
    const property = Compiler.compile(
        ast.computed ? ast.property : convertIdentifierToLiteral(ast.property as ESTree.Identifier),
        environment,
        {
            ...context,
            outputRegister: propertyRegister,
            feed: false,
        }
    )
    addVertex(graph, property, { nodeData: getNodeData(ast.property, 'Property') })

    // Compute the result
    if (context.feed) {
        const find = findMember(objectRegister, propertyRegister, context.outputRegister)
        addVertex(graph, find, { nodeData: getNodeData(ast, 'Find Member') })
        applyExecutionNode(find, environment)
    } else {
        const member = getMember(objectRegister, propertyRegister, context.outputRegister)
        addVertex(graph, member, { nodeData: getNodeData(ast, 'Get Member') })
        applyExecutionNode(member, environment)
    }

    cleanUpRegister(environment, objectRegister[0].value)
    cleanUpRegister(environment, propertyRegister[0].value)

    graph.postcondition = clone(environment)
    return graph
}
