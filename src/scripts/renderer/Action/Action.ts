import * as ESTree from 'estree'
import { ApplicationState } from '../../ApplicationState'
import { EnvironmentState } from '../../environment/EnvironmentState'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import {
    ExecutionNode,
    NodeData,
} from '../../execution/primitive/ExecutionNode'
import { createRepresentation } from '../../utilities/action'
import {
    createElement,
    createPathElement,
    createSVGElement,
} from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
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

    isDragging: boolean

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

    // Used for spatial actions
    placeholder: HTMLElement
    placeholderRay: SVGPathElement
}

/* --------------------- Initializer -------------------- */
let __ACTION_ID = 0
export function createActionState(
    overrides: Partial<ActionState> = {}
): ActionState {
    const id = `Action(${++__ACTION_ID})`

    if (overrides.execution === undefined) {
        throw new Error('Action requires an execution')
    }

    // Create dom elements
    const classes = [
        'action',
        `type-${overrides.execution.nodeData.type?.replace(' ', '-')}`,
        `pre-label-${overrides.execution.nodeData.preLabel?.replace(' ', '-')}`,
    ]

    const element = createElement('div', classes)

    const parentID = overrides.parentID || null

    const base: Partial<ActionState> = {
        id: id,
        position: {
            x: 0,
            y: 0,
        },
        isShowingSteps: false,
        isSpatial: overrides.isSpatial ?? false,
        parentID: parentID,
        execution: overrides.execution,
        element: element,
        vertices: [],
        edges: [],
        isDragging: false,
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

    const originalParent = action.proxy.element.parentElement

    if (originalParent == undefined) {
        throw new Error('Action has no parent element.')
    }

    action.placeholder = createElement('div', 'action-proxy-placeholder')
    originalParent.insertBefore(action.placeholder, action.proxy.element)

    const mapping = ApplicationState.visualization.mapping

    if (mapping == undefined) {
        throw new Error('Mapping not found.')
    }

    mapping.element.appendChild(action.proxy.element)
    action.representation.updateProxyVisual(action.proxy)

    // Create ray
    const svg = createSVGElement('ray-svg')
    action.placeholderRay = createPathElement('action-proxy-ray', svg)
    originalParent.appendChild(svg)

    // Update ray
    Ticker.instance.registerTick(() => {
        updateActionRay(action.id)
    })

    // Update focus
    if (ApplicationState.visualization.focus == undefined) {
        throw new Error('Focus not found.')
    }

    ApplicationState.visualization.focus.currentFocus = action.id
}

export function updateActionRay(actionID: string) {
    const action = ApplicationState.actions[actionID]

    const startBbox = action.placeholder.getBoundingClientRect()
    const endBbox = action.proxy.element.getBoundingClientRect()

    if (action.placeholderRay.parentElement == null) {
        throw new Error('Ray has no parent element.')
    }

    const svgBbox = action.placeholderRay.parentElement.getBoundingClientRect()

    startBbox.x -= svgBbox.x
    startBbox.y -= svgBbox.y

    endBbox.x -= svgBbox.x
    endBbox.y -= svgBbox.y

    // Add paddings for rounded borders
    startBbox.x -= 4
    endBbox.x += 4

    // const path = `M ${startBbox.x + 0.9 * startBbox.width} ${startBbox.y}
    //               L ${endBbox.x + 0.1 * endBbox.width} ${endBbox.y}
    //               L ${endBbox.x + 0.1 * endBbox.width} ${
    //     endBbox.y + endBbox.height
    // }
    //               L ${startBbox.x + 0.9 * startBbox.width} ${
    //     startBbox.y + startBbox.height
    // }`

    const p1 = [startBbox.x + startBbox.width, startBbox.y]
    const p2 = [(startBbox.x + startBbox.width + endBbox.x) / 2, startBbox.y]
    const p3 = [(startBbox.x + startBbox.width + endBbox.x) / 2, endBbox.y]
    const p4 = [endBbox.x, endBbox.y]

    // Top
    let path = `M ${p1[0]} ${p1[1]} C ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}, ${p4[0]} ${p4[1]}`

    // Bottom
    path += `L ${p4[0]} ${p4[1] + endBbox.height} C ${p3[0]} ${
        p3[1] + endBbox.height
    }, ${p2[0]} ${p2[1] + startBbox.height}, ${p1[0]} ${
        p1[1] + startBbox.height
    }`

    action.placeholderRay.setAttribute('d', path)
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
        let bbox = ApplicationState.editor.computeBoundingBoxForLoc(location)

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
