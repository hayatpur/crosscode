import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { getExecutionSteps, isPrimitive } from '../../../utilities/action'
import { reflow } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { Keyboard } from '../../../utilities/Keyboard'
import { getNumericalValueOfStyle, lerp } from '../../../utilities/math'
import { clearExistingFocus, isFocused } from '../../../visualization/Focus'
import { collapseActionIntoAbyss } from '../Abyss'
import { ActionState, createActionState, destroyAction, getActionCoordinates, updateAction } from '../Action'
import { isSpatialByDefault } from '../Mapping/ActionProxy'

/* ------------------------------------------------------ */
/*              Abstract representation class             */
/* ------------------------------------------------------ */
export class Representation {
    actionId: string
    shouldHover: boolean = false
    ignoreStepClicks: boolean = false

    /**
     * Only class since typescript doesn't have type classes :(
     * @param action
     */
    constructor(action: ActionState) {
        this.actionId = action.id
    }

    // TODO: If statements inside of for loops are bugged
    updateActionVisual() {
        const action = ApplicationState.actions[this.actionId]

        // Update position
        const bbox = getActionCoordinates(
            action.execution,
            action.parentID ? ApplicationState.actions[action.parentID].execution : undefined
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

    postCreate() {}

    updateProxyVisual() {
        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        const bbox = getActionCoordinates(
            action.execution,
            action.parentID ? ApplicationState.actions[action.parentID].execution : undefined
        )

        // Scale by the proxy scale
        let height = bbox.height * ApplicationState.proxyHeightMultiplier
        let width = bbox.width * ApplicationState.proxyWidthMultiplier
        width = Math.max(10, width)
        height = Math.max(10, height)

        if (action.isShowingSteps) {
            proxy.element.style.height = `fit-content`
            proxy.element.style.width = `fit-content`
        } else {
            proxy.element.style.height = `${height}px`
            proxy.element.style.width = `${width}px`
        }

        if (action.isSpatial && action.placeholder != null && action.execution.nodeData.type != 'Program') {
            action.placeholder.style.height = `${height}px`
            action.placeholder.style.width = `${width}px`
        }

        // Update classes
        action.isShowingSteps
            ? proxy.element.classList.add('is-showing-steps')
            : proxy.element.classList.remove('is-showing-steps')

        action.isShowingSteps
            ? proxy.container.classList.add('is-showing-steps')
            : proxy.container.classList.remove('is-showing-steps')

        action.isSpatial ? proxy.container.classList.add('is-spatial') : proxy.container.classList.remove('is-spatial')

        // Add line break if necessary
        if (action.execution.nodeData.hasLineBreak) {
            proxy.container.classList.add('has-line-break')
        } else {
            proxy.container.classList.remove('has-line-break')
        }

        /* ------------- If statement representation ------------ */
        if (action.execution.nodeData.preLabel == 'Test') {
            if (!action.isShowingSteps) {
                const memory = Object.values((action.execution.postcondition as EnvironmentState).memory)
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

            const label = ApplicationState.editor.getValueAt(parent.execution.nodeData.location)

            if (label == undefined) {
                throw new Error('Action has no label')
            }

            proxy.element.innerHTML = `${label.trim()}`
            monaco.editor.colorize(proxy.element.innerHTML, 'javascript', {}).then((html) => {
                proxy.element.innerHTML = html
                proxy.element.classList.add('fit-width')
                reflow(proxy.element)
                proxy.element.style.width = `${proxy.element.getBoundingClientRect().width}px`
                proxy.element.classList.remove('fit-width')
            })
        }
    }

    updateSpatialActionProxyPosition(offset: { x: number; y: number }): string[] {
        const action = ApplicationState.actions[this.actionId]

        const spatialIDs = []

        // Update self
        if (action.isSpatial) {
            if (action.execution.nodeData.type == 'Program') {
                action.proxy.container.style.left = `${offset.x}px`
                action.proxy.container.style.top = `${offset.y}px`
            } else {
                assert(action.parentID != null, 'Non-program action has no parent.')
                const parent = ApplicationState.actions[action.parentID]

                assert(parent.spatialParentID != null, 'Non-program action has no spatial parent.')
                const spatialParent = ApplicationState.actions[parent.spatialParentID]
                const spatialParentBbox = spatialParent.proxy.container.getBoundingClientRect()

                const vizBbox = (action.proxy.container.parentElement as HTMLElement).getBoundingClientRect()

                const bbox = getPrincipleBbox(action)

                const x = spatialParentBbox.x + spatialParentBbox.width + offset.x - vizBbox.x
                const y = spatialParentBbox.y + offset.y

                const px = getNumericalValueOfStyle(action.proxy.container.style.left, x)
                const py = getNumericalValueOfStyle(action.proxy.container.style.top, y)

                action.proxy.container.style.left = `${lerp(px, x, 0.2)}px`
                action.proxy.container.style.top = `${lerp(py, y, 0.2)}px`
            }

            spatialIDs.push(action.id)

            // Consume offset if spatial
            offset.x = 0
            offset.y = 0
        }

        // Update children
        if (action.isShowingSteps) {
            spatialIDs.push(...this.updateSpatialActionProxyPositionChildren(offset))
        }

        return spatialIDs
    }

    updateSpatialActionProxyPositionChildren(offset: { x: number; y: number }): string[] {
        const action = ApplicationState.actions[this.actionId]
        const spatialIDs: string[] = []

        action.vertices.forEach((id) => {
            const vertex = ApplicationState.actions[id]
            spatialIDs.push(...vertex.representation.updateSpatialActionProxyPosition(offset))
        })

        return spatialIDs
    }

    // Get frames should call get frames of each step.
    getFrames(): [env: EnvironmentState, actionID: string][] {
        const action = ApplicationState.actions[this.actionId]

        if (action.vertices.length == 0) {
            return [[action.execution.postcondition as EnvironmentState, action.id]]
        } else {
            const frames = []
            for (const stepID of action.vertices) {
                const step = ApplicationState.actions[stepID]
                frames.push(...step.representation.getFrames())
            }
            return frames
        }
    }

    getControlFlow(): number[][] {
        const action = ApplicationState.actions[this.actionId]

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
                controlFlowPoints.push(...step.representation.getControlFlow())
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

    /**
     * Breaks down the action into sub-steps in-line.
     * @param action
     */
    createSteps() {
        const action = ApplicationState.actions[this.actionId]

        const t = performance.now()

        if (action.isShowingSteps) {
            console.warn('Steps already created! Destroying existing.')
            action.vertices.forEach((id) => destroyAction(ApplicationState.actions[id]))
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
                isSpatial: isSpatialByDefault(steps[i]),
                spatialParentID: action.spatialParentID,
            })
            action.vertices.push(step.id)
            action.edges.push({
                label: steps[i].nodeData.preLabel ?? 'Unknown',
            })

            // Append step to action
            action.element.appendChild(step.element)
        }

        // console.log(`[${action.id}] Created ${steps.length} steps for  in ${performance.now() - t}ms`)

        // Update state
        action.isShowingSteps = true
        updateAction(action)

        for (const stepId of action.vertices) {
            const step = ApplicationState.actions[stepId]
            step.representation.postCreate()
        }

        // console.log(`[${action.id}] Updated action in ${performance.now() - t}ms`)
    }

    minimize() {
        const action = ApplicationState.actions[this.actionId]

        if (action.isShowingSteps) {
            action.vertices.forEach((id) => {
                const step = ApplicationState.actions[id]

                if (!step.isSpatial) {
                    step.representation.minimize()
                }
            })
        }

        action.proxy.container.classList.add('is-minimized')
        action.minimized = true

        if (action.isSpatial) {
            const minimizeButton = action.proxy.header.children[1].children[0] as HTMLElement
            minimizeButton.innerText = '+'
        }
    }

    maximize() {
        const action = ApplicationState.actions[this.actionId]

        if (action.isShowingSteps) {
            action.vertices.forEach((id) => {
                const step = ApplicationState.actions[id]

                if (!step.isSpatial) {
                    step.representation.maximize()
                }
            })
        }

        action.proxy.container.classList.remove('is-minimized')
        action.minimized = false

        if (action.isSpatial) {
            const minimizeButton = action.proxy.header.children[1].children[0] as HTMLElement
            minimizeButton.innerText = '-'
        }
    }

    clip() {}

    unClip() {}

    focus() {
        const action = ApplicationState.actions[this.actionId]
        action.proxy.element.classList.add('is-focused')

        const focus = ApplicationState.visualization.focus
        assert(focus != null, 'Focus is null')

        clearExistingFocus()

        focus.focusedActions.push(action.id)
    }

    /**
     * Remove division of sub-steps, and show the original action.
     */
    destroySteps() {
        const action = ApplicationState.actions[this.actionId]

        action.vertices.forEach((id) => destroyAction(ApplicationState.actions[id]))
        action.vertices = []
        action.edges = []

        action.isShowingSteps = false

        updateAction(action)
    }

    toggleSteps() {
        const action = ApplicationState.actions[this.actionId]

        if (action.isShowingSteps) {
            this.destroySteps()
        } else {
            this.createSteps()
        }
    }

    clicked(): boolean {
        const action = ApplicationState.actions[this.actionId]

        if (Keyboard.instance.isPressed('Alt')) {
            console.log('Grouping!', action.execution.nodeData.type)
            // Grouper
            if (action.proxy.isHovering) {
                collapseActionIntoAbyss(action.id)
                return true
            }
        } else if (Keyboard.instance.isPressed('Control')) {
            if (
                (action.isSpatial && !(action.execution.nodeData.type == 'Program') && action.isShowingSteps) ||
                this.ignoreStepClicks
            ) {
                return false
            }

            action.representation.toggleSteps()
            return true
        } else if (action.proxy.isHovering) {
            // Pointer
            if (isFocused(action.id)) {
                clearExistingFocus()
            } else {
                action.representation.focus()
            }
            return true
        }

        return false
    }

    setupHoverListener() {
        const action = ApplicationState.actions[this.actionId]

        action.proxy.element.addEventListener('mouseenter', (e) => {
            const action = ApplicationState.actions[this.actionId]

            if (action.representation.shouldHover) {
                action.proxy.isHovering = true
                action.proxy.element.classList.add('is-hovering')
            }

            e.preventDefault()
            e.stopPropagation()
        })

        action.proxy.element.addEventListener('mouseleave', (e) => {
            const action = ApplicationState.actions[this.actionId]

            if (action.proxy.isHovering) {
                action.proxy.isHovering = false
                action.proxy.element.classList.remove('is-hovering')
            }

            e.preventDefault()
            e.stopPropagation()
        })
    }

    setupClickListener() {
        const action = ApplicationState.actions[this.actionId]

        action.proxy.element.addEventListener('click', (e) => {
            console.log('Clicked', action.execution.nodeData.type)
            let success = this.clicked()

            if (success) {
                e.preventDefault()
                e.stopPropagation()
            }
        })
    }

    setupEventListeners() {
        this.setupClickListener()
        this.setupHoverListener()
    }

    destroy() {}
}

export function getPrincipleBbox(action: ActionState) {
    assert(action.isSpatial, 'Action is not spatial.')

    const bbox = action.proxy.container.getBoundingClientRect()

    for (const spatialChildId of action.spatialVertices) {
        const spatialChild = ApplicationState.actions[spatialChildId]
        const childBbox = getPrincipleBbox(spatialChild)

        bbox.y = Math.min(bbox.y, childBbox.y)
        bbox.width = Math.max(bbox.width, childBbox.x + childBbox.width - bbox.x)
        bbox.height = Math.max(bbox.height, childBbox.y + childBbox.height - bbox.y)
    }

    return bbox
}
