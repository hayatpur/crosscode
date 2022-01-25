import * as ESTree from 'estree'
import { apply } from '../../../animation/animation'
import {
    AnimationGraph,
    createAnimationGraph,
} from '../../../animation/graph/AnimationGraph'
import { addVertex } from '../../../animation/graph/graph'
import {
    AnimationContext,
    ControlOutput,
    ControlOutputData,
} from '../../../animation/primitive/AnimationNode'
import { consumeDataAnimation } from '../../../animation/primitive/Data/ConsumeDataAnimation'
import { createScopeAnimation } from '../../../animation/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../../animation/primitive/Scope/PopScopeAnimation'
import { PrototypicalDataState } from '../../../environment/data/DataState'
import { resolvePath } from '../../../environment/environment'
import {
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import { Compiler, getNodeData } from '../../Compiler'

export function ForStatement(
    ast: ESTree.ForStatement,
    view: PrototypicalEnvironmentState,
    context: AnimationContext
) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    // Create a scope
    const createScope = createScopeAnimation()
    addVertex(graph, createScope, { nodeData: getNodeData(ast) })
    apply(createScope, view)

    let iteration = createAnimationGraph({
        ...getNodeData(ast),
        type: 'ForStatementIteration',
    })

    // Init
    const init = Compiler.compile(ast.init, view, context)
    addVertex(iteration, init, { nodeData: getNodeData(ast.init) })

    // Points to the result of test

    let _i = 0
    // Loop
    while (true) {
        // Test
        const testRegister = [
            { type: AccessorType.Register, value: `${graph.id}_TestIf${_i}` },
        ]
        const test = Compiler.compile(ast.test, view, {
            ...context,
            outputRegister: testRegister,
        })
        addVertex(iteration, test, { nodeData: getNodeData(ast.test) })
        const testData = resolvePath(
            view,
            testRegister,
            null
        ) as PrototypicalDataState // @TODO: Add a probe test animation
        const testValue = testData.value as boolean
        // Consume testData
        const consume = consumeDataAnimation(testRegister)
        addVertex(test, consume, { nodeData: getNodeData(ast.test) })
        apply(consume, view)
        if (!testValue) break

        // Body
        const controlOutput: ControlOutputData = { output: ControlOutput.None }
        const body = Compiler.compile(ast.body, view, {
            ...context,
            controlOutput: controlOutput,
        })

        addVertex(iteration, body, { nodeData: getNodeData(ast.body) })

        if (controlOutput.output == ControlOutput.Break) {
            context.controlOutput.output = ControlOutput.None
            break
        } else if (controlOutput.output == ControlOutput.Continue) {
            context.controlOutput.output = ControlOutput.None
        } else if (controlOutput.output == ControlOutput.Return) {
            context.controlOutput.output = ControlOutput.Return
            break
        }

        // Update
        const update = Compiler.compile(ast.update, view, context)
        addVertex(iteration, update, { nodeData: getNodeData(ast.update) })

        // Add iteration to the graph
        addVertex(graph, iteration, {
            nodeData: {
                ...getNodeData(ast),
                type: 'ForStatementIteration',
            },
        })

        iteration = createAnimationGraph({
            ...getNodeData(ast),
            type: 'ForStatementIteration',
        })

        _i++
    }

    if (context.controlOutput.output != ControlOutput.Return) {
        context.controlOutput.output = ControlOutput.None
    }

    // Pop scope
    const popScope = popScopeAnimation()
    addVertex(graph, popScope, { nodeData: getNodeData(ast) })
    apply(popScope, view)

    return graph
}
