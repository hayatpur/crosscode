import { EnvironmentState } from '../../../environment/EnvironmentState'
import { Executor } from '../../../executor/Executor'
import { Action } from '../Action'
import { ActionRenderer, getActionCoordinates } from '../ActionRenderer'
import { ActionProxy } from '../Mapping/ActionProxy'

/* ------------------------------------------------------ */
/*              Abstract representation class             */
/* ------------------------------------------------------ */
export class Representation {
    action: Action

    constructor(action: Action) {
        this.action = action
    }

    updateActionVisual(renderer: ActionRenderer) {
        const bbox = getActionCoordinates(this.action.execution, this.action.parent?.execution)

        const paddingX = this.action.state.isShowingSteps ? 0 : 0
        const paddingY = this.action.state.isShowingSteps ? 0 : 0

        renderer.element.style.left = `${bbox.x - paddingX}px`
        renderer.element.style.top = `${bbox.y - paddingY}px`
        renderer.element.style.width = `${bbox.width + paddingX * 2}px`
        renderer.element.style.height = `${bbox.height + paddingY * 2}px`
    }

    updateProxyVisual(proxy: ActionProxy) {
        const bbox = proxy.action.renderer.element.getBoundingClientRect()
        const parentBbox = proxy.action.renderer.element.parentElement.getBoundingClientRect()

        let y = bbox.top - parentBbox.y
        let x = bbox.left - parentBbox.x

        let height = bbox.height * ActionProxy.heightMultiplier
        let width = bbox.width * ActionProxy.widthMultiplier
        width = Math.max(10, width)

        // y offset is 0 if the action is a child
        if (proxy.action.parent.execution.nodeData.type == 'Program') {
            y += (bbox.height - height) / 2
        } else {
            y *= ActionProxy.heightMultiplier
        }

        x *= ActionProxy.widthMultiplier

        proxy.element.style.top = `${y}px`
        proxy.element.style.left = `${x}px`
        proxy.element.style.height = `${height}px`
        proxy.element.style.width = `${width}px`
    }

    // Get frames should call get frames of each step.
    getFrames(): [env: EnvironmentState, actionId: string][] {
        if (this.action.steps.length == 0) {
            return [[this.action.execution.postcondition, this.action.state.id]]
        } else {
            const frames = []
            for (const step of this.action.steps) {
                frames.push(...step.representation.getFrames())
            }
            return frames
        }
    }

    getControlFlow(): number[][] {
        if (this.action.steps.length > 0) {
            const controlFlowPoints = []
            for (const step of this.action.steps) {
                controlFlowPoints.push(...step.representation.getControlFlow())
            }
            return controlFlowPoints
        } else {
            const proxy = Executor.instance.visualization.mapping.getProxyOfAction(this.action)
            const bbox = proxy.element.getBoundingClientRect()

            if (this.action.execution.nodeData.preLabel == 'Body') {
                return [
                    [bbox.x + 60, bbox.y + bbox.height / 2],
                    [bbox.x + bbox.width + 20, bbox.y + bbox.height / 2],
                    [bbox.x + bbox.width + 20, bbox.y + bbox.height / 2 - 27.5],
                ]
            }

            return [[bbox.x + 10, bbox.y + bbox.height / 2]]
        }
    }

    destroy() {
        this.action = null
    }
}
