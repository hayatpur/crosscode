import { Steps } from '../Step'

export function getControlFlowPointsForStep(
    stepId: string,
    usePlaceholder: boolean = true,
    referencePoint: { x: number; y: number } = { x: 0, y: 0 }
): [number, number][] | null {
    const step = Steps.get(stepId)

    if (step.isTrimmed) {
        return null
    }

    let bbox = step.controlFlow.element.getBoundingClientRect()

    // const abyssInfo = getConsumedAbyss(action.id)

    // if (abyssInfo != null && !action.isSpatial) {
    //     // Find the abyss that it's in, and return that position
    //     const abyss = ApplicationState.abysses[abyssInfo.id]

    //     const parent = ApplicationState.actions[action.parentID!]

    //     if (parent.execution.nodeData.type == 'ForStatement') {
    //         // The first test should get skipped
    //         if (action.execution.nodeData.preLabel == 'Test' && parent.vertices[1] == action.id) {
    //             return null
    //         }

    //         // Any tests in the 'middle' of a consumed abyss should be skipped
    //         if (!abyss.expanded && isIterationTestInMiddleOfAbyss(abyss, abyssInfo.index!, action.id)) {
    //             return null
    //         }

    //         // If body statement, skip
    //         if (action.execution.nodeData.preLabel == 'Body') {
    //             return null
    //         }

    //         // If update statement, skip
    //         if (action.execution.nodeData.preLabel == 'Update') {
    //             return null
    //         }
    //     }

    //     return getAbyssControlFlowPoints(abyss, abyssInfo.index!)
    // }

    if (step.isFrame && step.controlFlow.placeholder != null && usePlaceholder) {
        bbox = step.controlFlow.placeholder.getBoundingClientRect()
    }
    // else if (action.isSpatial && abyssInfo != null) {
    //     const abyss = ApplicationState.abysses[abyssInfo.id]

    //     return getSpatialAbyssControlFlowPoints(abyss, action.id)
    // }

    if (bbox.height == 0 || bbox.width == 0) {
        return null
    }

    const offset = Math.min(2, bbox.height * 0.1)

    // if (action.execution.nodeData.type == 'FunctionCall' && referencePoint.x != 0) {
    //     return [
    //         [referencePoint.x, bbox.y + offset],
    //         [referencePoint.x, bbox.y + bbox.height - offset],
    //     ]
    // }

    return [
        [bbox.x + bbox.width / 2, bbox.y + offset],
        [bbox.x + bbox.width / 2, bbox.y + bbox.height - offset],
    ]
}
