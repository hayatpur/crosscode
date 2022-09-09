import { ApplicationState } from '../../ApplicationState'
import { resolvePath } from '../../environment/environment'
import { AccessorType, EnvironmentState, instanceOfEnvironment, Residual } from '../../environment/EnvironmentState'
import { reads } from '../../execution/execution'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { getPerfectArrow } from '../../utilities/dom'
import { assert } from '../../utilities/generic'
import { getSpatialActionsPathFromRoot } from '../../visualization/Selection'
import {
    EnvironmentRenderer,
    getHardScopeGlobalIndex,
    getHardScopeIndex,
} from '../View/Environment/EnvironmentRenderer'
import { Trail } from './Trail'

/* ------------------------------------------------------ */
/*           A collection of parallel trails              */
/* ------------------------------------------------------ */
export class ReturnAnimation {
    execution: ExecutionGraph | ExecutionNode | null
    trails: Trail[] = []
    prevEnvironment: EnvironmentState | null = null
    tempReturnAnimationNode: HTMLElement | null = null
    trace: SVGPathElement

    tempReturnEnvironment: EnvironmentRenderer | null = null
    functionCallId: string | null = null
    returnActionId: string | null = null

    constructor(execution: ExecutionGraph | ExecutionNode, time: number) {
        this.execution = execution

        // Create movement trace
        this.trace = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.trace.classList.add('action-mapping-connection', 'trail-move', 'trail-return')

        const visualization = ApplicationState.visualization
        visualization.view!.svg.appendChild(this.trace)
    }

    setReturnDetails(environment: EnvironmentState, returnActionId: string, functionCallId: string) {
        this.prevEnvironment = environment
        this.functionCallId = functionCallId
        this.returnActionId = returnActionId

        // Create environment renderer
        this.tempReturnEnvironment = new EnvironmentRenderer([
            {
                type: 'scope',
                value: 'latest',
            },
        ])
        this.tempReturnEnvironment.render({ environment: this.prevEnvironment, actionId: returnActionId })
    }

    updateTime(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        if (amount == 0) {
            // Has not executed yet (or has gone back to the start).

            this.tempReturnAnimationNode?.remove()
            this.tempReturnAnimationNode = null

            // this.tempReturnEnvironment
            // this.tempReturnEnvironment?.destroy()
            // this.tempReturnEnvironment = null

            return
        }

        assert(this.tempReturnEnvironment != null, 'tempReturnEnvironment should be instantiated')

        // Just show the environment in the right scope, it should already be created!
        const scopeContainer = ApplicationState.visualization.view!.scopeContainers[this.functionCallId!]
        if (this.tempReturnEnvironment.element.parentElement != scopeContainer) {
            scopeContainer.innerHTML = ''
            scopeContainer.append(this.tempReturnEnvironment.element)
        }

        this.tempReturnEnvironment.element.classList.add('temp-return-environment')

        if (amount == 1) {
            // Has completely executed. Make sure tempReturn is removed and tempReturnEnvironment is instantiated.
            this.tempReturnAnimationNode?.remove()
            this.tempReturnAnimationNode = null

            const returnElementId = reads(this.execution!)[0].id
            const returnElement = environment.findRendererById(returnElementId)!
            if (returnElement != null) {
                returnElement.data.element.style.opacity = `${1}`
            }

            return
        }

        // Is currently running. The current environment should have a return value in the eventual position.
        const returnElementId = reads(this.execution!)[0].id
        const returnElementRenderer = environment.findRendererById(returnElementId)!

        const prevReturn = resolvePath(this.prevEnvironment!, [{ type: AccessorType.ID, value: returnElementId }], null)
        const prevReturnRenderer = this.tempReturnEnvironment.findRendererById(returnElementId)!

        if (instanceOfEnvironment(prevReturn)) {
            console.warn('Cannot find return value in prev env')
            return
        }
        // Make sure tempReturn is added to the right place
        const prevScopeIndex = getHardScopeIndex(
            getHardScopeGlobalIndex(prevReturn, this.prevEnvironment!),
            this.prevEnvironment!
        )
        const actionIds = getSpatialActionsPathFromRoot()
        const container = ApplicationState.visualization.view!.scopeContainers[actionIds[prevScopeIndex]]

        if (this.tempReturnAnimationNode == null) {
            this.tempReturnAnimationNode = returnElementRenderer.data.element.cloneNode(true) as HTMLElement
            this.tempReturnAnimationNode.classList.add('temp-return-animation-node')
            document.body.appendChild(this.tempReturnAnimationNode)
        }

        if (prevReturnRenderer == null) {
            return
        }

        if (!prevReturnRenderer.data.element.isConnected || !returnElementRenderer.data.element.isConnected) {
            this.tempReturnAnimationNode.classList.add('hidden')
            return
        } else {
            this.tempReturnAnimationNode.classList.remove('hidden')
        }

        const viewBbox = ApplicationState.visualization.view!.element.getBoundingClientRect()
        const startBbox = prevReturnRenderer.data.element.getBoundingClientRect()
        const endBbox = returnElementRenderer.data.element.getBoundingClientRect()

        const [d, ex, ey, endAngleAsDegrees] = getPerfectArrow(
            startBbox.x + startBbox.width / 2 - viewBbox.x,
            startBbox.y + startBbox.height / 2 - viewBbox.y,
            endBbox.x + endBbox.width / 2 - viewBbox.x,
            endBbox.y + endBbox.height / 2 - viewBbox.y
        )
        this.trace.setAttribute('d', d)

        let { x, y } = this.trace.getPointAtLength(amount * this.trace.getTotalLength())

        // Update transform
        x -= endBbox.width / 2
        y -= endBbox.height / 2

        // Update temp position
        const traceContainerBbox = this.trace.parentElement!.getBoundingClientRect()
        this.tempReturnAnimationNode.style.left = `${x + traceContainerBbox.x}px`
        this.tempReturnAnimationNode.style.top = `${y + traceContainerBbox.y}px`

        returnElementRenderer.data.element.style.opacity = `${0}`
        this.tempReturnAnimationNode.style.opacity = `${1}`
    }

    postUpdate(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        if (amount == 0) {
            // Has not executed yet (or has gone back to the start).

            this.tempReturnAnimationNode?.remove()
            this.tempReturnAnimationNode = null

            return
        }
    }

    computeResidual(environment: EnvironmentState): Residual[] {
        return []
    }

    applyTimestamps(environment: EnvironmentState) {}

    destroy() {
        this.tempReturnAnimationNode?.remove()
    }
}
