import { EnvironmentState } from '../../../environment/EnvironmentState'
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

    update() {}

    updateActionVisual(renderer: ActionRenderer) {
        const loc = this.action.execution.nodeData.location
        const bbox = getActionCoordinates(loc, this.action.parent?.execution.nodeData.location)

        renderer.element.style.left = `${bbox.x}px`
        renderer.element.style.top = `${bbox.y}px`
        renderer.element.style.width = `${bbox.width}px`
        renderer.element.style.height = `${bbox.height}px`
    }

    updateProxyVisual(proxy: ActionProxy) {
        const bbox = proxy.action.renderer.element.getBoundingClientRect()
        const parentBbox = proxy.action.renderer.element.parentElement.getBoundingClientRect()

        let y = bbox.top - parentBbox.y
        let x = bbox.left - parentBbox.x

        let height = bbox.height * ActionProxy.heightMultiplier
        let width = bbox.width * ActionProxy.widthMultiplier

        // y offset is 0 if the action is a child
        if (proxy.action.parent.execution.nodeData.type == 'Program') {
            y += (bbox.height - height) / 2
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

    destroy() {
        this.action = null
    }
}
