import * as ESTree from 'estree'
import { apply } from '../../animation/animation'
import { createAnimationGraph } from '../../animation/graph/AnimationGraph'
import { addVertex } from '../../animation/graph/graph'
import { AnimationContext, ControlOutput } from '../../animation/primitive/AnimationNode'
import { groupEndAnimation } from '../../animation/primitive/Group/GroupEndAnimation'
import { groupStartAnimation } from '../../animation/primitive/Group/GroupStartAnimation'
import { RootViewState } from '../../view/ViewState'
import { Compiler, getNodeData } from '../Compiler'

export function Program(ast: ESTree.Program, view: RootViewState, context: AnimationContext) {
    const graph = createAnimationGraph(getNodeData(ast))

    const controlOutput = { output: ControlOutput.None }

    let group = null
    let groupInitialized = false
    let line = null

    let first = true

    // Add blocks
    for (const statement of ast.body) {
        const delta = statement.loc.start.line - line
        line = statement.loc.start.line

        if (group == null || delta > 1) {
            if (group != null) {
                // End the current group
                const groupEnd = groupEndAnimation(group.id)
                addVertex(group, groupEnd, { nodeData: getNodeData(statement) })
                apply(groupEnd, view)

                // Put the group in the overall graph
                addVertex(graph, group, { nodeData: getNodeData(ast) })

                first = false
                groupInitialized = false
            }

            group = createAnimationGraph(getNodeData(ast), { isGroup: true })
        }

        if (!groupInitialized) {
            // Start the current group
            const groupStart = groupStartAnimation(getNodeData(statement), group.id)
            addVertex(group, groupStart, { nodeData: getNodeData(statement) })
            apply(groupStart, view)

            groupInitialized = true
        }

        const animation = Compiler.compile(statement, view, { ...context, controlOutput })

        addVertex(group, animation, { nodeData: getNodeData(statement) })
    }

    if (group != null) {
        addVertex(graph, group, { nodeData: getNodeData(ast) })
    }

    return graph
}
