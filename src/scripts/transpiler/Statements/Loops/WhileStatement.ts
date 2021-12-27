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
import { createScopeAnimation } from '../../../animation/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../../animation/primitive/Scope/PopScopeAnimation'
import { PrototypicalDataState } from '../../../environment/data/DataState'
import { resolvePath } from '../../../environment/environment'
import {
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import { Compiler, getNodeData } from '../../Compiler'

export function WhileStatement(
    ast: ESTree.WhileStatement,
    view: PrototypicalEnvironmentState,
    context: AnimationContext
) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    // Create a scope
    const createScope = createScopeAnimation()
    addVertex(graph, createScope, { nodeData: getNodeData(ast) })
    apply(createScope, view)

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
        addVertex(graph, test, { nodeData: getNodeData(ast.test) })
        const testData = resolvePath(
            view,
            testRegister,
            null
        ) as PrototypicalDataState // @TODO: Add a probe test animation
        const testValue = testData.value as boolean
        if (!testValue) break

        // Body
        const controlOutput: ControlOutputData = { output: ControlOutput.None }
        const body = Compiler.compile(ast.body, view, {
            ...context,
            controlOutput: controlOutput,
        })
        addVertex(graph, body, { nodeData: getNodeData(ast.body) })

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
