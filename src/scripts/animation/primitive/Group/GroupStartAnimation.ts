import { cloneEnvironment, createEnvironment } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { createView, findViewById, getLastActiveEnvironment } from '../../../view/view'
import { ViewPositionModifierType, ViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode, NodeData } from '../AnimationNode'

export interface GroupStartAnimation extends AnimationNode {
    nodeData: NodeData
    groupId: string
    leaveEmpty: boolean
    restart: boolean
}

function onBegin(animation: GroupStartAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    console.log('Starting group...', animation.nodeData.type)

    if (animation.restart) {
        const newView = findViewById(view, animation.groupId)
        newView.isActive = true
        newView.lastActive = performance.now()
    } else {
        // Create a new view
        const newView = createView()
        newView.label = animation.nodeData.type
        newView.id = animation.groupId

        // Create a new environment if needed
        let newEnvironment: EnvironmentState

        const oldEnvironment = getLastActiveEnvironment(view)
        newEnvironment =
            oldEnvironment == null || animation.leaveEmpty
                ? createEnvironment()
                : cloneEnvironment(oldEnvironment, true)

        // Add new environment to the view
        newView.children.push(newEnvironment)

        // Position the new view next to appropriate code
        newView.transform.positionModifiers.push({
            type: ViewPositionModifierType.NextToCode,
            value: animation.nodeData.location,
        })

        // Add the new view to the current view state
        view.children.push(newView)
        newView.isActive = true
        newView.lastActive = performance.now()
    }

    if (options.baking) {
        computeReadAndWrites(animation)
    }

    updateRootViewLayout(view) // Pass for data elements to update
    updateRootViewLayout(view) // Pass for the identifiers to update
}

function onSeek(animation: GroupStartAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: GroupStartAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: GroupStartAnimation) {
    animation._reads = []
    animation._writes = []
}

export function groupStartAnimation(
    nodeData: NodeData,
    groupId: string,
    leaveEmpty = false,
    restart = false,
    options: AnimationOptions = {}
): GroupStartAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'GroupStartAnimation',

        name: 'Group Start',

        nodeData,
        groupId,
        leaveEmpty,
        restart,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
