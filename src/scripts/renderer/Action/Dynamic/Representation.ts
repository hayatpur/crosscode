import { EnvironmentState } from '../../../environment/EnvironmentState'
import { Executor } from '../../../executor/Executor'
import { Action } from '../Action'
import { ActionRenderer, getActionCoordinates } from '../ActionRenderer'
import { getProxyOfAction } from '../Mapping/ActionMapping'
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
        const actionElement = proxy.action.renderer.element

        const bbox = actionElement.getBoundingClientRect()
        const parentBbox = (actionElement.parentElement as HTMLElement).getBoundingClientRect()

        let y = bbox.top - parentBbox.y
        let x = bbox.left - parentBbox.x

        // Offset by the first element in the vessel
        const vessel = Executor.instance.visualization.mapping.vessel
        const firstElement = vessel.proxies[0]?.action

        if (firstElement && proxy.element.parentElement == vessel.element) {
            const firstBbox = firstElement.renderer.element.getBoundingClientRect()

            x -= firstBbox.left - parentBbox.x
            y -= firstBbox.top - parentBbox.y
        }

        // Scale by the proxy scale
        let height = bbox.height * ActionProxy.heightMultiplier
        let width = bbox.width * ActionProxy.widthMultiplier
        width = Math.max(10, width)

        // y offset is 0 if the action is a child
        if (proxy.action.parent?.execution.nodeData.type == 'Program') {
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
            return [[this.action.execution.postcondition as EnvironmentState, this.action.state.id]]
        } else {
            const frames = []
            for (const step of this.action.steps) {
                frames.push(...step.representation.getFrames())
            }
            return frames
        }
    }

    getControlFlow(): number[][] {
        const proxy = getProxyOfAction(this.action)
        const bbox = proxy?.element.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 }
        if (this.action.steps.length > 0) {
            const controlFlowPoints = [[bbox.x + 10, bbox.y]]
            for (const step of this.action.steps) {
                controlFlowPoints.push(...step.representation.getControlFlow())
            }
            controlFlowPoints.push([bbox.x + 10, bbox.y + bbox.height])
            return controlFlowPoints
        } else {
            // const proxy = getProxyOfAction(this.action)
            // const bbox = proxy.element.getBoundingClientRect()

            if (this.action.execution.nodeData.preLabel == 'Body') {
                return [
                    [bbox.x + 60, bbox.y + bbox.height / 2],
                    [bbox.x + bbox.width, bbox.y + bbox.height / 2],
                ]
            } else if (this.action.execution.nodeData.type == 'FunctionCall') {
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
