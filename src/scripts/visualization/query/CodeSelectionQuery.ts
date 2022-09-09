import * as ESTree from 'estree'
import monaco from 'monaco-editor'
import { ApplicationState } from '../../ApplicationState'
import { getDepthOfExecution, queryExecutionGraph } from '../../execution/execution'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { collapseActionIntoAbyss, getConsumedAbyss } from '../../renderer/Action/Abyss'
import { ActionState } from '../../renderer/Action/Action'
import { getAbstractionPath } from '../../utilities/action'
import { assert } from '../../utilities/generic'
import { getClosestMatch } from '../../utilities/math'

export type CodeQueryState = {
    actions: ActionState[]
}

export function createCodeQuerySelector() {
    // Update after 0.5s of no keyboard activity
    let typingTimer: any

    ApplicationState.editor.onSelectionUpdate.add((e) => {
        // Remove any existing query
        // ApplicationState.currentQuery.destroy()

        clearTimeout(typingTimer)
        typingTimer = setTimeout(() => onCodeQuerySelectionUpdate(e), 500)
    })
}

export function onCodeQuerySelectionUpdate(e: monaco.editor.ICursorSelectionChangedEvent) {
    const selectionBbox = ApplicationState.editor.computeBoundingBoxForLoc({
        start: { line: e.selection.startLineNumber, column: e.selection.startColumn },
        end: { line: e.selection.endLineNumber, column: e.selection.endColumn },
    })

    if (selectionBbox == null) {
        return
    }

    const paddingX = 20
    const paddingY = 10

    selectionBbox.x -= paddingX
    selectionBbox.y -= paddingY
    selectionBbox.width += paddingX * 2
    selectionBbox.height += paddingY * 2

    if (ApplicationState.editor.getSelectedText().length > 0) {
        // ApplicationState.currentQuery = getQuery({
        //     start: { line: e.selection.startLineNumber, column: e.selection.startColumn },
        //     end: { line: e.selection.endLineNumber, column: e.selection.endColumn },
        // })
        getQuery({
            start: { line: e.selection.startLineNumber, column: e.selection.startColumn },
            end: { line: e.selection.endLineNumber, column: e.selection.endColumn },
        })
    }
}

export function getQuery(selection: ESTree.SourceLocation) {
    let executionSelection = getClosestMatch(selection) ?? []

    const programId = ApplicationState.visualization.programId as string
    const program = ApplicationState.actions[programId]

    executionSelection.sort((a, b) => {
        const aDepth = getDepthOfExecution(a, program.execution as ExecutionGraph)
        const bDepth = getDepthOfExecution(b, program.execution as ExecutionGraph)

        return aDepth - bDepth
    })

    let createdActionsIds: string[] = []
    let createdSpatialActionsIds: string[] = []

    for (const execution of executionSelection) {
        // Two cases:
        // 1. If the execution is already shown, just highlight it
        // TODO

        // 2. If the execution is not shown, create it
        const parent = getParentInRoot(execution) // Get existing parent
        assert(parent != null, 'Parent is null')

        let executionPath = getAbstractionPath(parent.execution as ExecutionGraph, execution) as (
            | ExecutionGraph
            | ExecutionNode
        )[]

        let currentParent = parent

        executionPath.shift() // Remove the current parent

        // Keep sub-dividing the parent, until it reaches the 'execution'
        while (currentParent.execution.id != execution.id && executionPath.length > 0) {
            const next = executionPath.shift()
            assert(next != null, 'Next is null')

            if (!currentParent.isShowingSteps) {
                currentParent.representation.createSteps()
            }

            const currentParentId = currentParent.vertices.find(
                (v) => ApplicationState.actions[v].execution.id == next.id
            ) as string

            currentParent = ApplicationState.actions[currentParentId]

            if (currentParent.isSpatial) {
                createdSpatialActionsIds.push(currentParent.id!)
            }
        }

        // Leaves / end points!
        createdActionsIds.push(currentParent.id)

        // Filter out this spatial parent
        createdSpatialActionsIds = createdSpatialActionsIds.filter((a) => a != currentParent.spatialParentID)
    }

    // for (const action of createdActions) {
    //     const spatialParent = ApplicationState.actions[action.spatialParentID as string]

    //     // Add an abyss *before* the execution
    //     for (let i = spatialParent.vertices.length - 1; i >= 0; i--) {
    //         const vId = spatialParent.vertices[i]
    //         const v = ApplicationState.actions[vId]
    //         if (vId != action.id && !containsSpatialChild(v)) {
    //             console.log(v.execution.nodeData)
    //             collapseActionIntoAbyss(vId)
    //         }
    //     }
    // }

    console.log(createdSpatialActionsIds)
    for (const actionId of createdSpatialActionsIds) {
        const abyssInfo = getConsumedAbyss(actionId)
        if (abyssInfo == null) {
            collapseActionIntoAbyss(actionId)
        }
    }
}

// Expand the root Action to include the step
export function getParentInRoot(goal: ExecutionGraph | ExecutionNode): ActionState | null {
    let programId = ApplicationState.visualization.programId as string
    let parent: ActionState = ApplicationState.actions[programId]
    // let views = []

    while (true) {
        if (instanceOfExecutionNode(parent.execution.id)) {
            if (parent.execution.id == goal.id) {
                return parent
            } else {
                console.warn('Animation not found - reached end')
                break
            }
        }

        let foundMatch = false
        for (const stepID of parent.vertices) {
            // TODO support bundles
            const step = ApplicationState.actions[stepID]
            const contains = queryExecutionGraph(step.execution, (animation) => animation.id == goal.id) != null

            if (contains) {
                parent = step
                foundMatch = true
                break
            }
        }

        if (!foundMatch) {
            return parent
        }
    }

    return null
}
