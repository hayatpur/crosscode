import * as ESTree from 'estree'
import { ApplicationState } from '../../ApplicationState'
import { Editor } from '../../editor/Editor'
import { EnvironmentState } from '../../environment/EnvironmentState'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import {
    ExecutionNode,
    NodeData,
} from '../../execution/primitive/ExecutionNode'
import { createRepresentation, getExecutionSteps } from '../../utilities/action'
import { createElement } from '../../utilities/dom'
import { setViewFrames } from '../View/View'
import { Representation } from './Dynamic/Representation'
import { appendProxyToMapping } from './Mapping/ActionMapping'
import {
    ActionProxyState,
    createActionProxy,
    destroyActionProxy,
} from './Mapping/ActionProxy'

/* ------------------------------------------------------ */
/*    An Action visualizes a node in program execution    */
/* ------------------------------------------------------ */
export interface ActionState {
    id: string

    // Transform
    position: {
        x: number
        y: number
    }

    isShowingSteps: boolean

    isSpatial: boolean

    // Parents id or null if root
    parentID: string | null

    // Corresponding execution
    execution: ExecutionGraph | ExecutionNode

    // Sub-steps
    vertices: string[]
    edges: ActionEdge[]

    // Representation
    representation: Representation
    proxy: ActionProxyState

    element: HTMLElement
    placeholder: HTMLElement // Used for spatial actions
}

/* --------------------- Initializer -------------------- */
let __ACTION_ID = 0
export function createActionState(
    overrides: Partial<ActionState> = {}
): ActionState {
    const id = `Action(${++__ACTION_ID})`

    // Create dom elements
    const element = createElement('div', 'action')

    if (overrides.execution === undefined) {
        throw new Error('Action requires an execution')
    }

    const base: Partial<ActionState> = {
        id: id,
        position: {
            x: 0,
            y: 0,
        },
        isShowingSteps: false,
        isSpatial: overrides.isSpatial ?? false,
        parentID: overrides.parentID,
        execution: overrides.execution,
        element: element,
        vertices: [],
        edges: [],
    }

    ApplicationState.actions[id] = base as ActionState

    base.representation = createRepresentation(ApplicationState.actions[id])
    base.proxy = createActionProxy({ actionID: id })

    if (ApplicationState.visualization.mapping == undefined) {
        throw new Error('Mapping not found.')
    }

    base.representation.updateActionVisual(base as ActionState)

    appendProxyToMapping(base.proxy, ApplicationState.visualization.mapping)

    return { ...(base as ActionState), ...overrides }
}

/* ------------------------------------------------------ */
/*        An Action edge stores path to its parent        */
/* ------------------------------------------------------ */
export interface ActionEdge {
    label: string
}

export function updateAction(action: ActionState) {
    const visualization = ApplicationState.visualization
    action.representation.updateActionVisual(action)
    action.representation.updateProxyVisual(action.proxy)
    // const mapping = visualization.mapping

    // Update mapping, resets time to 0 and then back
    // TODO: Make it cleaner, without having to reset time
    // if (mapping != null) {
    //     const time = mapping.time
    //     mapping.time = 0
    //     setTimeout(() => {
    //         mapping.time = time
    //     })
    // }

    if (visualization.program == undefined) {
        throw new Error('Visualization requires a program')
    }

    // Update frames of the execution
    if (visualization.view != null) {
        setViewFrames(
            visualization.view,
            visualization.program.representation.getFrames(
                visualization.program
            ),
            visualization.program.execution.precondition as EnvironmentState
        )
    }
}

export function destroyAction(action: ActionState) {
    destroyActionProxy(action.proxy)
    action.representation.destroy()
    action.element.remove()
}

export function makeSpatial(action: ActionState) {
    action.isSpatial = true

    console.log('Making action spatial')

    if (action.proxy.element.parentElement == undefined) {
        throw new Error('Action has no parent element.')
    }

    action.placeholder = createElement('div', 'action-proxy-placeholder')
    action.proxy.element.parentElement.insertBefore(
        action.placeholder,
        action.proxy.element
    )

    if (ApplicationState.visualization.mapping == undefined) {
        throw new Error('Mapping not found.')
    }

    ApplicationState.visualization.mapping.element.appendChild(
        action.proxy.element
    )
    action.representation.updateProxyVisual(action.proxy)
}

/**
 * Breaks down the action into sub-steps in-line.
 * @param action
 */
export function createSteps(action: ActionState) {
    if (action.isShowingSteps) {
        console.warn('Steps already created! Destroying existing.')
        action.vertices.forEach((id) =>
            destroyAction(ApplicationState.actions[id])
        )
    }

    action.vertices = []
    action.edges = []

    let steps = getExecutionSteps(action.execution)

    // Create direct descendants
    for (let i = 0; i < steps.length; i++) {
        // Create step state
        const step = createActionState({
            execution: steps[i],
            parentID: action.id,
        })
        action.vertices.push(step.id)
        action.edges.push({ label: steps[i].nodeData.preLabel ?? 'Unknown' })

        // Add to element
        action.element.appendChild(step.element)
    }

    // Update state
    action.isShowingSteps = true
    updateAction(action)
}

/**
 * Remove division of sub-steps, and show the original action.
 * @param action
 */
export function destroySteps(action: ActionState) {
    action.vertices.forEach((id) => destroyAction(ApplicationState.actions[id]))
    action.vertices = []
    action.edges = []

    action.isShowingSteps = false

    updateAction(action)
}

/* ------------------------------------------------------ */
/*                     Action Renderer                    */
/* ------------------------------------------------------ */
export function getActionCoordinates(
    execution: ExecutionGraph | ExecutionNode,
    parentExecution?: ExecutionGraph | ExecutionNode
): { x: number; y: number; width: number; height: number } {
    if (execution.nodeData.type == 'BlockStatement') {
        let parentBbox = parentExecution
            ? getActionCoordinates(parentExecution)
            : { x: 0, y: 0, width: 0, height: 0 }

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
            bbox = getActionCoordinates(execution.vertices[0])

            let altBbox = {
                minX: bbox.x,
                minY: bbox.y,
                maxX: bbox.x + bbox.width,
                maxY: bbox.y + bbox.height,
            }

            for (let i = 1; i < execution.vertices.length; i++) {
                const pBbox = getActionCoordinates(execution.vertices[i])
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

        // if (execution.vertices.some((v) => isChunk(v.nodeData))) {
        //     const indentation = (execution.nodeData.location as ESTree.SourceLocation).start.column
        //     bbox.width -= indentation * 4
        // }

        return {
            width: bbox.width,
            height: bbox.height,
            x: bbox.x - parentBbox.x,
            y: bbox.y - parentBbox.y,
        }
    } else {
        const location = execution.nodeData.location as ESTree.SourceLocation
        let bbox = Editor.instance.computeBoundingBoxForLoc(location)

        let parentBbox = parentExecution
            ? getActionCoordinates(parentExecution)
            : { x: 0, y: 0, width: 0, height: 0 }

        if (isChunk(execution.nodeData)) {
            const indentation = location.start.column
            // const charWidth = bbox.width / (location.end.column - location.start.column)
            // console.log(charWidth)
            bbox.width -= indentation * 10
        }

        return {
            width: bbox.width, // TODO Why us there an offset? Because monaco offsets after load
            height: bbox.height,
            x: bbox.x - parentBbox.x,
            y: bbox.y - parentBbox.y,
        }
    }
}

export function isChunk(nodeData: NodeData) {
    const chunks = new Set([
        'IfStatement',
        'WhileStatement',
        'DoWhileStatement',
        'ForStatement',
    ])
    return chunks.has(nodeData.type ?? '')
}
