import { Steps } from '../Step'

export function updateControlFlowTimeForStep(stepId: string, originId: string, isSpatiallyConsumed: boolean = false) {
    const step = Steps.get(stepId)

    // if (step.steps.length > 0 && !step.isFrame && isSpatiallyConsumed) {
    //     // Start
    //     let [x, y] = getLastPointInPathChunks(controlFlow.flowPathChunks)!
    //     x += ApplicationState.Epsilon
    //     addPointToPathChunks(controlFlow.flowPathChunks, x, y)
    //     action.startTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)

    //     // Steps
    //     for (let s = 0; s < step.steps.length; s++) {
    //         const stepID = step.steps[s]
    //         const step = ApplicationState.actions[stepID]

    //         // Add start point to path
    //         step.representation.updateControlFlow(controlFlow, originId, true)
    //     }

    //     // End
    //     let [x2, y2] = getLastPointInPathChunks(controlFlow.flowPathChunks)!
    //     x2 += ApplicationState.Epsilon
    //     addPointToPathChunks(controlFlow.flowPathChunks, x2, y2)
    //     action.endTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)

    //     return
    // } else if (isSpatiallyConsumed) {
    //     // Start
    //     let [x, y] = getLastPointInPathChunks(controlFlow.flowPathChunks)!
    //     x += ApplicationState.Epsilon
    //     addPointToPathChunks(controlFlow.flowPathChunks, x, y)
    //     action.startTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)

    //     // Delta
    //     let delta = ApplicationState.Epsilon
    //     if (action.isSpatial) {
    //         const origin = ApplicationState.actions[originId]
    //         const representation = origin.representation as FunctionCallRepresentation
    //         delta = representation.sizePerSpatialStep
    //     }

    //     // End
    //     x += delta
    //     addPointToPathChunks(controlFlow.flowPathChunks, x, y)
    //     action.endTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)
    //     return
    // }

    /* ----------------- Not spatially consumed ----------------- */
    // const consumed = getConsumedAbyss(action.id)
    // const consumed = null
    // const cf = step.controlFlowRenderer

    // if (step.steps.length > 0 && (!step.isFrame || step.id == originId)) {
    //     let starts: number[] = []
    //     let ends: number[] = []

    //     // Start for selectable groups
    //     if (
    //         (consumed == null && step.execution.nodeData.type == 'ForStatement') ||
    //         step.execution.nodeData.type == 'BlockStatement'
    //     ) {
    //         const containerBbox = cf.controlFlow!.container!.getBoundingClientRect()
    //         const bbox = cf.element.getBoundingClientRect()

    //         if (getLastPointInPathChunks(cf.controlFlow!.flowPathChunks) != null) {
    //             const [x, y] = getLastPointInPathChunks(cf.controlFlow!.flowPathChunks)!
    //             addPointToPathChunks(cf.controlFlow!.flowPathChunks, x, bbox.y - containerBbox.y)
    //         }

    //         createNewPathChunk(cf.controlFlow!)
    //     } else if (action.representation.isSelectableGroup) {
    //         // Get the start of this group
    //         let start = this.getControlFlowPoints(false)![0]
    //         const containerBbox = cf.controlFlow!.container!.getBoundingClientRect()

    //         start[0] -= containerBbox.x
    //         start[1] -= containerBbox.y

    //         addPointToPathChunks(cf.controlFlow!.flowPathChunks, start[0], start[1])
    //         action.startTime = getTotalLengthOfPathChunks(cf.controlFlow!.flowPathChunks)
    //         starts.push(action.startTime)
    //     }

    //     for (let s = 0; s < step.steps.length; s++) {
    //         const subStepId = step.steps[s]
    //         const subStep = Steps.get(subStepId)
    //         // subStep.overrideSkipped = false
    //         // subStep.overrideAggregation = null

    //         if (consumed == null && action.execution.nodeData.type == 'ForStatement' && s == 0) {
    //             const containerBbox = cf.controlFlow!.container!.getBoundingClientRect()
    //             const bbox = action.proxy.element.getBoundingClientRect()
    //             const stepBbox = step.proxy.element.getBoundingClientRect()
    //             addPointToPathChunks(
    //                 cf.controlFlow!.flowPathChunks,
    //                 stepBbox.x + stepBbox.width / 2 - containerBbox.x,
    //                 bbox.y - containerBbox.y
    //             )
    //         }

    //         // Add start point to path
    //         step.representation.updateControlFlow(cf.controlFlow!, originId)

    //         const stepConsumed = getConsumedAbyss(step.id)

    //         if (stepConsumed == null && action.execution.nodeData.type == 'ForStatement') {
    //             if (step.execution.nodeData.preLabel == 'Body') {
    //                 const [x, y] = getLastPointInPathChunks(cf.controlFlow!.flowPathChunks)!

    //                 const bbox = action.proxy.element.getBoundingClientRect()
    //                 const containerBbox = cf.controlFlow!.container!.getBoundingClientRect()

    //                 addPointToPathChunks(cf.controlFlow!.flowPathChunks, bbox.x + bbox.width - containerBbox.x, y)

    //                 const nextStep = ApplicationState.actions[step.steps[s + 1]]
    //                 const nextStepBbox = nextStep.proxy.element.getBoundingClientRect()

    //                 addPointToPathChunks(
    //                     cf.controlFlow!.flowPathChunks,
    //                     bbox.x + bbox.width - containerBbox.x,
    //                     nextStepBbox.y + nextStepBbox.height / 2 - containerBbox.y
    //                 )
    //             } else if (step.execution.nodeData.preLabel == 'Update') {
    //                 createNewPathChunk(cf.controlFlow!)
    //             }
    //         }

    //         if (consumed == null && step.execution.nodeData.type == 'CallExpression' && s == 1) {
    //             const firstStep = Steps.get(step.steps[0])
    //             firstStep.startTime = step.startTime
    //             firstStep.endTime = step.startTime + (step.endTime - step.startTime) / 4

    //             step.startTime = firstStep.endTime
    //         }

    //         if (consumed == null && step.execution.nodeData.type == 'BinaryExpression') {
    //             if (s == 0 || s == 1) {
    //                 createNewPathChunk(cf.controlFlow!)
    //             }
    //         }

    //         if (consumed == null && step.execution.nodeData.type == 'VariableDeclaration' && s == 1) {
    //             const firstStep = Steps.get(step.steps[0])

    //             if (firstStep.isShowingSteps) {
    //                 if (firstStep.execution.nodeData.type == 'BinaryExpression') {
    //                     let firstStepLastChild = Steps.get(firstStep.steps[firstStep.steps.length - 1])

    //                     step.startTime =
    //                         firstStepLastChild.endTime - (1 * (firstStep.endTime - firstStep.startTime)) / 4
    //                     step.endTime = firstStepLastChild.endTime

    //                     firstStepLastChild.endTime = step.startTime
    //                     firstStep.endTime = step.startTime
    //                 } else if (firstStep.execution.nodeData.type == 'CallExpression') {
    //                     step.startTime = firstStep.startTime + (3 * (firstStep.endTime - firstStep.startTime)) / 4
    //                     step.endTime = firstStep.endTime

    //                     firstStep.endTime = firstStep.startTime
    //                 }
    //             } else {
    //                 step.startTime = firstStep.endTime
    //                 step.endTime = firstStep.endTime
    //             }
    //         }

    //         if (stepConsumed != null && step.execution.nodeData.type == 'ForStatement') {
    //             // If test statement and s == 1 then skip
    //             const prev = Steps.get(step.steps[s - 1])
    //             const abyss = Steps.get(stepConsumed.id)

    //             // Only the first test should get skipped
    //             if (s == 1 && step.execution.nodeData.preLabel == 'Test') {
    //                 step.startTime = prev.endTime
    //                 step.endTime = prev.endTime
    //                 step.representation.overrideSkipped = true
    //             }

    //             if (
    //                 !abyss.expanded &&
    //                 step.execution.nodeData.preLabel == 'Test' &&
    //                 isIterationTestInMiddleOfAbyss(
    //                     ApplicationState.abysses[stepConsumed.id],
    //                     stepConsumed.index!,
    //                     step.id
    //                 )
    //             ) {
    //                 step.startTime = prev.endTime
    //                 step.endTime = prev.endTime
    //                 step.representation.overrideSkipped = true
    //             }

    //             if (step.execution.nodeData.preLabel == 'Test' && !step.representation.overrideSkipped) {
    //                 // Is a test statement that hasn't been skipped
    //                 // TODO: Also do variable declarations

    //                 let aggregation: string[] | null = null

    //                 if (abyss.startIndex == stepConsumed.index || abyss.expanded) {
    //                     // Aggregate next three steps
    //                     aggregation = [step.steps[s], step.steps[s + 1], step.steps[s + 2]]
    //                 } else if (abyss.startIndex + abyss.numItems - 3 == stepConsumed.index) {
    //                     // Aggregate next three steps
    //                     aggregation = [step.steps[s], step.steps[s + 1], step.steps[s + 2]]
    //                 } else {
    //                     // In the middle
    //                     aggregation = []
    //                     for (let p = s; p < abyss.startIndex + abyss.numItems - 3; p++) {
    //                         aggregation.push(step.steps[p])
    //                     }
    //                 }

    //                 step.representation.overrideAggregation = aggregation
    //             }

    //             // If body statement, skip
    //             if (step.execution.nodeData.preLabel == 'Body') {
    //                 step.startTime = prev.endTime
    //                 step.endTime = prev.endTime
    //                 step.representation.overrideSkipped = true
    //             }

    //             // If update statement, skip
    //             if (step.execution.nodeData.preLabel == 'Update') {
    //                 step.startTime = prev.endTime
    //                 step.endTime = prev.endTime
    //                 step.representation.overrideSkipped = true
    //             }
    //         }

    //         starts.push(step.startTime)
    //         ends.push(step.endTime)
    //     }

    //     // End for selectable groups
    //     if (action.representation.isSelectableGroup) {
    //         const lastPoint = getLastPointInPathChunks(controlFlow.flowPathChunks)!
    //         const containerBbox = controlFlow.container!.getBoundingClientRect()

    //         let end = this.getControlFlowPoints(false, {
    //             x: lastPoint[0] + containerBbox.x,
    //             y: lastPoint[1] + containerBbox.y,
    //         })!.at(-1)!

    //         end[0] -= containerBbox.x
    //         end[1] -= containerBbox.y

    //         let returnAnimation: ActionState | null = null
    //         let returnAnimationParent: ActionState | null = null

    //         if (consumed == null && action.execution.nodeData.type == 'FunctionCall') {
    //             const returnStep = queryAction(action, (step) => step.execution.nodeData.type == 'ReturnStatement')!
    //             returnAnimation = ApplicationState.actions[returnStep.vertices[1]]
    //             returnAnimation.startTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)

    //             returnAnimationParent = returnStep
    //         }

    //         addPointToPathChunks(controlFlow.flowPathChunks, end[0], end[1])

    //         if (consumed == null && action.execution.nodeData.type == 'FunctionCall') {
    //             if (action.minimized) {
    //                 addPointToPathChunks(controlFlow.flowPathChunks, end[0], end[1] + 4)
    //                 addPointToPathChunks(controlFlow.flowPathChunks, end[0] - 15, end[1] + 4)
    //                 addPointToPathChunks(controlFlow.flowPathChunks, end[0] - 15, end[1] + 2)
    //             } else {
    //                 addPointToPathChunks(controlFlow.flowPathChunks, end[0], end[1] + 8)
    //                 addPointToPathChunks(controlFlow.flowPathChunks, end[0] - 15, end[1] + 8)
    //                 addPointToPathChunks(controlFlow.flowPathChunks, end[0] - 15, end[1] + 2)
    //             }
    //         }

    //         if (returnAnimation != null) {
    //             returnAnimation.endTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)
    //             returnAnimationParent!.endTime = returnAnimation.endTime
    //         }

    //         action.endTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)

    //         ends.push(action.endTime)
    //     }

    //     starts = starts.filter((s) => s != null)
    //     ends = ends.filter((s) => s != null)

    //     if (starts.length > 0 && ends.length > 0) {
    //         action.startTime = starts[0]
    //         action.endTime = ends[ends.length - 1]

    //         // if (action.isSpatial) {
    //         //     console.log('Assigning start time ...', action.startTime, action.id)
    //         //     console.log(ApplicationState.actions)
    //         // }
    //     }
    // } else {
    //     let points = null
    //     const last = getLastPointInPathChunks(controlFlow.flowPathChunks)
    //     const containerBbox = controlFlow.container!.getBoundingClientRect()
    //     points = this.getControlFlowPoints(
    //         true,
    //         last != null ? { x: last[0] + containerBbox.x, y: last[1] + containerBbox.y } : { x: 0, y: 0 }
    //     )

    //     if (points != null) {
    //         const start = points[0]
    //         const end = points.at(-1)!

    //         const containerBbox = controlFlow.container!.getBoundingClientRect()

    //         start[0] -= containerBbox.x
    //         start[1] -= containerBbox.y
    //         end[0] -= containerBbox.x
    //         end[1] -= containerBbox.y

    //         addPointToPathChunks(controlFlow.flowPathChunks, start[0], start[1])
    //         action.startTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)

    //         // Add points in middle
    //         for (let i = 1; i < points.length - 1; i++) {
    //             const point = points[i]
    //             point[0] -= containerBbox.x
    //             point[1] -= containerBbox.y

    //             addPointToPathChunks(controlFlow.flowPathChunks, point[0], point[1])
    //         }

    //         // if (action.isSpatial && action.id != originId) {
    //         //     action.globalTimeOffset = action.startTime
    //         // }

    //         addPointToPathChunks(controlFlow.flowPathChunks, end[0], end[1])
    //         action.endTime = getTotalLengthOfPathChunks(controlFlow.flowPathChunks)
    //     }
    // }
}
