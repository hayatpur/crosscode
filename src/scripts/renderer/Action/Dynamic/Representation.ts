import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { isPrimitive } from '../../../utilities/action'
import { ActionState, getActionCoordinates } from '../Action'
import { ActionProxyState } from '../Mapping/ActionProxy'

/* ------------------------------------------------------ */
/*              Abstract representation class             */
/* ------------------------------------------------------ */
export class Representation {
    constructor() {}

    // TODO: If statements inside of for loops are bugged
    updateActionVisual(action: ActionState) {
        // Update position
        const bbox = getActionCoordinates(
            action.execution,
            action.parentID
                ? ApplicationState.actions[action.parentID].execution
                : undefined
        )

        action.element.style.left = `${bbox.x}px`
        action.element.style.top = `${bbox.y}px`
        action.element.style.width = `${bbox.width}px`
        action.element.style.height = `${bbox.height}px`

        // Update classes
        action.isShowingSteps
            ? action.element.classList.add('is-showing-steps')
            : action.element.classList.remove('is-showing-steps')
    }

    updateProxyVisual(proxy: ActionProxyState) {
        const action = ApplicationState.actions[proxy.actionID]

        const bbox = getActionCoordinates(
            action.execution,
            action.parentID
                ? ApplicationState.actions[action.parentID].execution
                : undefined
        )

        // Scale by the proxy scale
        let height = bbox.height * ApplicationState.proxyHeightMultiplier
        let width = bbox.width * ApplicationState.proxyWidthMultiplier
        width = Math.max(10, width)

        if (action.isShowingSteps) {
            proxy.element.style.height = `fit-content`
            proxy.element.style.width = `fit-content`
        } else {
            proxy.element.style.height = `${height}px`
            proxy.element.style.width = `${width}px`
        }

        if (action.isSpatial) {
            action.placeholder.style.height = `${height}px`
            action.placeholder.style.width = `${width}px`
        }

        // Update classes
        action.isShowingSteps
            ? proxy.element.classList.add('is-showing-steps')
            : proxy.element.classList.remove('is-showing-steps')

        action.isSpatial
            ? proxy.element.classList.add('is-spatial')
            : proxy.element.classList.remove('is-spatial')

        /* ------------- If statement representation ------------ */
        if (action.execution.nodeData.preLabel == 'Test') {
            if (!action.isShowingSteps) {
                const memory = Object.values(
                    (action.execution.postcondition as EnvironmentState).memory
                )
                const value = memory[memory.length - 1].value
                proxy.element.classList.add(`_Test_${value}`)
                const icon = value ? 'checkmark-outline' : 'close-outline'
                proxy.element.innerHTML = `<ion-icon name="${icon}"></ion-icon>`
            } else {
                // TODO
            }
        }

        /* -------------- Primitive representation -------------- */
        if (isPrimitive(action.execution)) {
            const parent = action

            if (parent.execution.nodeData.location == undefined) {
                throw new Error('Action has no location')
            }

            const label = ApplicationState.editor.getValueAt(
                parent.execution.nodeData.location
            )

            if (label == undefined) {
                throw new Error('Action has no label')
            }

            proxy.element.innerHTML = `${label}`
            monaco.editor
                .colorize(proxy.element.innerHTML, 'javascript', {})
                .then((html) => {
                    proxy.element.innerHTML = html
                })
        }
    }

    // Get frames should call get frames of each step.
    getFrames(
        action: ActionState
    ): [env: EnvironmentState, actionID: string][] {
        if (action.vertices.length == 0) {
            return [
                [action.execution.postcondition as EnvironmentState, action.id],
            ]
        } else {
            const frames = []
            for (const stepID of action.vertices) {
                const step = ApplicationState.actions[stepID]
                frames.push(...step.representation.getFrames(step))
            }
            return frames
        }
    }

    getControlFlow(action: ActionState): number[][] {
        const proxy = action.proxy
        const bbox = proxy?.element.getBoundingClientRect() ?? {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }
        if (action.vertices.length > 0) {
            const controlFlowPoints = []
            for (const stepID of action.vertices) {
                const step = ApplicationState.actions[stepID]
                controlFlowPoints.push(
                    ...step.representation.getControlFlow(step)
                )
            }
            return controlFlowPoints
        } else {
            if (action.execution.nodeData.preLabel == 'Body') {
                return [
                    [bbox.x + 60, bbox.y + bbox.height / 2],
                    [bbox.x + bbox.width, bbox.y + bbox.height / 2],
                ]
            } else if (action.execution.nodeData.type == 'FunctionCall') {
                return [
                    [bbox.x + bbox.width / 2, bbox.y],
                    [bbox.x + bbox.width / 2, bbox.y + bbox.height],
                ]
            }

            return [[bbox.x + 10, bbox.y + bbox.height / 2]]
        }
    }

    destroy() {}
}
