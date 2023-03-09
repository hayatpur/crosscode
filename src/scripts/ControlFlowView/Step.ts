import * as ESTree from 'estree'
import { ExecutionGraph, instanceOfExecutionGraph } from '../Analysis/execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode, NodeData } from '../Analysis/execution/primitive/ExecutionNode'
import { Editor, EditorInstance } from '../Editor/Editor'

import { assert } from '../utilities/generic'
import { CFPath, CFPathState } from './ControlFlowPath'
import { setupDefaultsForStep } from './Dynamic/SetupDefaultsForStep'
import { updateControlFlowForStep } from './Dynamic/UpdateControlFlowForStep'

export type StepState = {
    id: string

    // Corresponding execution
    execution: ExecutionGraph | ExecutionNode

    // Attributes
    isMinimized: boolean
    isShowingSteps: boolean
    isFrame: boolean
    isSkipped: boolean

    // Parents id or null if root
    parentId: string | null

    // Sub-steps ids
    subSteps: string[]

    // Frames
    parentFrameId: string | null
    childFrameIds: Set<string>

    // Control flow (only for frames)
    controlFlow: StepControlFlowState

    // Abbreviations
    abbreviationIds: string[]

    // Start and end time relative to the frame it is in
    startTime: number
    endTime: number

    // Global start time
    globalTimeOffset: number
}

export type StepControlFlowState = {
    // Transform
    position: {
        x: number
        y: number
    }

    scale: {
        width: number
        height: number
    }

    shouldHover: boolean
    isHovering: boolean
    ignoreStepClicks: boolean

    path: CFPathState | null
}

export class Steps {
    static steps: { [id: string]: StepState } = {}

    static add(step: StepState) {
        Steps.steps[step.id] = step
    }

    static remove(step: StepState) {
        delete Steps.steps[step.id]
    }

    static get(id: string): StepState {
        return Steps.steps[id]
    }
}

export namespace Step {
    let _stepId = 0
    export function createStepState(
        execution: ExecutionGraph | ExecutionNode,
        parentId: string | null = null,
        parentFrameId: string | null = null
    ): StepState {
        const id = `Step(${++_stepId})`

        if (isFrameByDefault(execution)) {
            parentFrameId = id
        }

        assert(parentFrameId != null, 'Non-frame step requires a frame parent')

        const base: StepState = {
            id: id,

            isMinimized: false,
            isShowingSteps: false,
            isFrame: isFrameByDefault(execution),

            isSkipped: false,

            parentId,
            execution,

            subSteps: [],

            parentFrameId,
            childFrameIds: new Set(),

            controlFlow: createControlFlowRenderer(execution),

            abbreviationIds: [],
            startTime: 0,
            endTime: 0,
            globalTimeOffset: 0,
        }

        Steps.add(base)

        setupDefaultsForStep(id)
        updateControlFlowForStep(id)

        if (isFrameByDefault(execution)) {
            makeStepIntoFrame(id)
        }

        if (base.isFrame) {
            base.controlFlow.path = CFPath.createCFPathState(id)
        }

        return base as StepState
    }

    export function createControlFlowRenderer(execution: ExecutionGraph | ExecutionNode): StepControlFlowState {
        // Container for the action and its label
        // const container = createElement('div', 'control-flow-step-container')

        // // Header for the action (contains label and controls)
        // const header = createElement('div', 'control-flow-step-header', container)
        // const label = createElement('div', 'control-flow-step-label', header)
        // label.innerText = getTitleFromExecution(execution)

        // const element = createElement(
        //     'div',
        //     [
        //         'control-flow-step',
        //         `type-${execution.nodeData.type?.replace(' ', '-')}`,
        //         `pre-label-${execution.nodeData.preLabel?.replace(' ', '-')}`,
        //     ],
        //     container
        // )

        return {
            position: {
                x: 0,
                y: 0,
            },
            scale: {
                width: 0,
                height: 0,
            },

            isHovering: false,
            shouldHover: false,
            ignoreStepClicks: false,

            path: null,
        }
    }

    // export function createSourceCodeRenderer(execution: ExecutionGraph | ExecutionNode): StepSourceCodeRendererState {
    //     // Create dom elements
    //     const classes = [
    //         'action',
    //         `type-${execution.nodeData.type?.replace(' ', '-')}`,
    //         `pre-label-${execution.nodeData.preLabel?.replace(' ', '-')}`,
    //     ]

    //     const element = createElement('div', classes)

    //     return {
    //         element,
    //     }
    // }

    export function isBreakable(stepId: string) {
        const step = Steps.get(stepId)
        const execution = step.execution

        if (execution.nodeData.type == 'Arguments') {
            return false
        }

        if (execution.nodeData.type == 'Identifier' || execution.nodeData.type == 'Literal') {
            return false
        }

        // if (execution.nodeData.type == 'ArrayExpression') {
        //     return false
        // }

        return true
    }

    export function isPrimitive(stepId: string) {
        const step = Steps.get(stepId)
        const execution = step.execution

        if (execution.nodeData.type == 'Identifier' || execution.nodeData.type == 'Literal') {
            return true
        }

        if (execution.nodeData.type == 'BinaryExpressionEvaluate') {
            return true
        }

        return false
    }

    export function destroyStep(stepId: string) {
        const step = Steps.get(stepId)
        Steps.remove(step)
    }

    export function makeStepIntoFrame(stepId: string) {
        const step = Steps.get(stepId)
        step.isFrame = true

        if (step.execution.nodeData.type == 'Program') {
            return
        }

        // Add to spatial parent's vertices
        assert(step.parentId != null, 'Action has no parent')
        const parent = Steps.get(step.parentId)
        assert(parent.parentFrameId != null, 'Parent has no spatial parent')
        const spatialParent = Steps.get(parent.parentFrameId)
        spatialParent.childFrameIds.add(step.id)
    }

    export function updateBeam(stepId: string) {
        // const action = ApplicationState.actions[actionID]
        // let startBbox = step.controlFlowRenderer.placeholder.getBoundingClientRect()
        // let endBbox = step.controlFlowRenderer.element.getBoundingClientRect()
        // // If end is consumed
        // const abbreviationInfo = getConsumedAbyss(actionID)
        // let startIsConsumed = false
        // if (abbreviationInfo != null) {
        //     const location = getActionLocationInAbyss(abbreviationInfo.id, actionID)
        //     endBbox = location!.getBoundingClientRect()
        //     // endBbox.y += 18
        //     // endBbox.x += 3
        //     startIsConsumed = true
        // }
        // // If start is consumed
        // const parentAbyssInfo = getConsumedAbyss(step.parentId!)
        // if (parentAbyssInfo != null) {
        //     const parent = ApplicationState.actions[step.parentId!]
        //     const location = getActionLocationInAbyss(parentAbyssInfo.id, parent.parentFrameId!)
        //     startBbox = location!.getBoundingClientRect()
        // }
        // if (abbreviationInfo != null && parentAbyssInfo != null && abbreviationInfo.id == parentAbyssInfo?.id) {
        //     step.controlFlowRenderer.placeholderRay.classList.add('is-overlapping')
        // } else {
        //     step.controlFlowRenderer.placeholderRay.classList.remove('is-overlapping')
        // }
        // if (step.controlFlowRenderer.placeholderRay.parentElement == null) {
        //     throw new Error('Ray has no parent element.')
        // }
        // if (step.isMinimized && !startIsConsumed) {
        //     endBbox.width = 10
        //     endBbox.height = 10
        //     endBbox.y -= 19
        //     endBbox.x -= 8
        // }
        // const svgBbox = step.controlFlowRenderer.placeholderRay.parentElement.getBoundingClientRect()
        // startBbox.x -= svgBbox.x
        // startBbox.y -= svgBbox.y
        // endBbox.x -= svgBbox.x
        // endBbox.y -= svgBbox.y
        // // Add paddings for rounded borders
        // startBbox.x += 2
        // endBbox.x += 4
        // const p1 = [startBbox.x + startBbox.width, startBbox.y]
        // const p2 = [(startBbox.x + startBbox.width + endBbox.x) / 2, startBbox.y]
        // const p3 = [(startBbox.x + startBbox.width + endBbox.x) / 2, endBbox.y]
        // const p4 = [endBbox.x, endBbox.y]
        // // Top
        // let path = `M ${p1[0]} ${p1[1]} C ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}, ${p4[0]} ${p4[1]}`
        // // Bottom
        // path += `L ${p4[0]} ${p4[1] + endBbox.height} C ${p3[0]} ${p3[1] + endBbox.height}, ${p2[0]} ${
        //     p2[1] + startBbox.height
        // }, ${p1[0]} ${p1[1] + startBbox.height}`
        // step.controlFlowRenderer.placeholderRay.setAttribute('d', path)
    }

    export function getStepCoordinates(
        execution: ExecutionGraph | ExecutionNode,
        parentExecution?: ExecutionGraph | ExecutionNode
    ): { x: number; y: number; width: number; height: number } {
        if (execution.nodeData.type == 'BlockStatement') {
            let parentBbox = parentExecution ? getStepCoordinates(parentExecution) : { x: 0, y: 0, width: 0, height: 0 }

            let bbox: {
                x: number
                y: number
                width: number
                height: number
            } = { x: 0, y: 0, width: 0, height: 0 }

            execution = execution as ExecutionGraph

            if (execution.vertices.length == 0) {
                bbox.x = parentBbox.x
                bbox.y = parentBbox.y
            } else {
                bbox = getStepCoordinates(execution.vertices[0])

                let altBbox = {
                    minX: bbox.x,
                    minY: bbox.y,
                    maxX: bbox.x + bbox.width,
                    maxY: bbox.y + bbox.height,
                }

                for (let i = 1; i < execution.vertices.length; i++) {
                    const pBbox = getStepCoordinates(execution.vertices[i])
                    altBbox.minX = Math.min(altBbox.minX, pBbox.x)
                    altBbox.minY = Math.min(altBbox.minY, pBbox.y)
                    altBbox.maxX = Math.max(altBbox.maxX, pBbox.x + pBbox.width)
                    altBbox.maxY = Math.max(altBbox.maxY, pBbox.y + pBbox.height)
                }

                bbox.x = altBbox.minX
                bbox.y = altBbox.minY
                bbox.width = altBbox.maxX - altBbox.minX
                bbox.height = altBbox.maxY - altBbox.minY
            }

            return {
                width: bbox.width,
                height: bbox.height,
                x: bbox.x - parentBbox.x,
                y: bbox.y - parentBbox.y,
            }
        } else {
            const location = execution.nodeData.location as ESTree.SourceLocation
            let bbox = Editor.computeBoundingBoxForLoc(EditorInstance.instance, location)

            let parentBbox = parentExecution ? getStepCoordinates(parentExecution) : { x: 0, y: 0, width: 0, height: 0 }

            if (isChunk(execution.nodeData)) {
                const indentation = location.start.column
                bbox.width -= indentation * 10
            }

            return {
                width: bbox.width,
                height: bbox.height,
                x: bbox.x - parentBbox.x,
                y: bbox.y - parentBbox.y,
            }
        }
    }

    export function isChunk(nodeData: NodeData) {
        const chunks = new Set(['IfStatement', 'WhileStatement', 'DoWhileStatement', 'ForStatement'])
        return chunks.has(nodeData.type ?? '')
    }

    export function isFrameByDefault(execution: ExecutionGraph | ExecutionNode) {
        return execution.nodeData.type == 'FunctionCall' || execution.nodeData.type == 'Program'
    }

    export function clipActionProxy(stepId: string) {
        // const action = ApplicationState.actions[actionID]
        // if (action.spatialVertices.size > 0) {
        //     const bbox = getAccumulatedBoundingBox(
        //         [...action.spatialVertices].map((v) => ApplicationState.actions[v].parentID as string)
        //     )
        //     const actionBbox = step.controlFlowRenderer.element.getBoundingClientRect()
        //     let { y, height } = bbox
        //     y = y - actionBbox.y
        //     // step.controlFlowRenderer.element.style.margin
        //     const firstChild = step.controlFlowRenderer.element.children[0] as HTMLElement
        //     firstChild.style.marginTop = `${-y}px`
        //     step.controlFlowRenderer.element.style.maxHeight = `${height}px`
        //     step.controlFlowRenderer.element.classList.add('clipped')
        // } else {
        //     // Get what things are not going to be clipped by default
        //     throw new Error('No implementation for clipping')
        // }
    }

    export function unClipActionProxy(stepId: string) {
        // TODO
    }

    /* ------------------------------------------------------ */
    /*             Helper functions to Steps                  */
    /* ------------------------------------------------------ */

    /**
     * @param parent
     * @returns leaf steps of the parent
     */
    export function getLeavesOfStep(parent: StepState): StepState[] {
        let leaves: StepState[] = []
        let candidates: StepState[] = [parent]

        while (candidates.length > 0) {
            const candidate = candidates.pop() as StepState
            if (candidate.subSteps.length == 0) {
                leaves.push(candidate)
                continue
            }

            for (const stepId of candidate.subSteps) {
                candidates.push(Steps.get(stepId))
            }
        }

        return leaves
    }

    /**
     * @param step
     * @param query
     * @returns A step (or sub-steps) that satisfy the query or null (depth-first search)
     */
    export function queryStep(step: StepState, query: (animation: StepState) => boolean): StepState | null {
        if (query(step)) {
            return step
        }

        for (const stepId of step.subSteps) {
            const ret = queryStep(Steps.get(stepId), query)
            if (ret != null) {
                return ret
            }
        }

        return null
    }

    export function queryAllStep(step: StepState, query: (animation: StepState) => boolean): StepState[] {
        const acc = []

        if (query(step)) {
            acc.push(step)
        }

        for (const stepId of step.subSteps) {
            acc.push(...queryAllStep(Steps.get(stepId), query))
        }

        return acc
    }

    export function getAllSteps(step: StepState): StepState[] {
        const allSteps = []

        let steps = step.subSteps

        for (const stepId of steps) {
            const step = Steps.get(stepId)
            allSteps.push(step, ...getAllSteps(step))
        }

        return allSteps
    }

    export function getLabelOfExecution(execution: ExecutionGraph | ExecutionNode) {
        return (instanceOfExecutionNode(execution) ? execution.name : execution.nodeData.type ?? '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
    }

    export function getExecutionSteps(execution: ExecutionGraph | ExecutionNode): (ExecutionGraph | ExecutionNode)[] {
        if (instanceOfExecutionGraph(execution) && !isSkippedByDefault(execution)) {
            return execution.vertices
        } else {
            return []
        }
    }

    export function isSkippedByDefault(execution: ExecutionGraph | ExecutionNode): boolean {
        if (execution.nodeData.type == 'Arguments') {
            return true
        }

        if (execution.nodeData.type == 'Identifier' && execution.nodeData.preLabel == 'Name') {
            return true
        }

        if (execution.nodeData.type == 'ReturnStatementAnimation') {
            return true
        }

        return false
    }

    export function getLeafSteps(steps: StepState[], filterOutTrimmed: boolean = true): StepState[] {
        const result: StepState[] = []

        for (const step of steps) {
            if (filterOutTrimmed && step.isSkipped) continue

            if (step.subSteps.length > 0) {
                result.push(
                    ...getLeafSteps(
                        step.subSteps.map((id) => Steps.get(id)),
                        filterOutTrimmed
                    )
                )
            } else {
                result.push(step)
            }
        }

        return result
    }

    export function getLeafStepsFromIDs(stepIds: string[]): StepState[] {
        const result: StepState[] = []

        for (const stepId of stepIds) {
            const step = Steps.get(stepId)

            if (step.subSteps.length > 0) {
                result.push(...getLeafStepsFromIDs(step.subSteps))
            } else {
                result.push(step)
            }
        }

        return result
    }

    export function getAbstractionPath(
        parent: ExecutionGraph | ExecutionNode,
        target: ExecutionGraph | ExecutionNode
    ): (ExecutionGraph | ExecutionNode)[] | null {
        if (parent == target) {
            return [parent]
        }

        if (instanceOfExecutionGraph(parent)) {
            for (const vertex of parent.vertices) {
                const ret = getAbstractionPath(vertex, target)

                if (ret != null) {
                    return [parent, ...ret]
                }
            }
        }

        return null
    }

    export function queryExecutionGraph(
        animation: ExecutionGraph | ExecutionNode,
        query: (animation: ExecutionGraph | ExecutionNode) => boolean
    ): ExecutionGraph | ExecutionNode | null {
        if (query(animation)) {
            return animation
        }

        if (instanceOfExecutionGraph(animation)) {
            for (const vertex of animation.vertices) {
                const ret = Step.queryExecutionGraph(vertex, query)
                if (ret != null) {
                    return ret
                }
            }
        }

        return null
    }

    // export function getAccumulatedBoundingBox(Ids: string[]) {
    //     assert(Ids.length > 0, 'No Ids provided.')

    //     const bbox = Steps.get(Ids[0]).controlFlowRenderer.container.getBoundingClientRect()

    //     for (const id of Ids) {
    //         const child = Steps.get(id)
    //         const childBbox = child.controlFlowRenderer.container.getBoundingClientRect()

    //         bbox.x = Math.min(bbox.x, childBbox.x)
    //         bbox.y = Math.min(bbox.y, childBbox.y)
    //         bbox.width = Math.max(bbox.width, childBbox.x + childBbox.width - bbox.x)
    //         bbox.height = Math.max(bbox.height, childBbox.y + childBbox.height - bbox.y)
    //     }

    //     return bbox
    // }

    export function isStatement(execution: ExecutionGraph | ExecutionNode) {
        const statements = new Set([
            'IfStatement',
            'ForStatement',
            'WhileStatement',
            'VariableDeclaration',
            'ReturnStatement',
            'ExpressionStatement',
        ])

        return statements.has(execution.nodeData?.type ?? '')
    }

    export function getTitleFromExecution(execution: ExecutionGraph | ExecutionNode) {
        let name = execution.nodeData.type ?? ''
        name = name.replace(/([A-Z])/g, ' $1').trim()
        return name
    }
}
