import * as ESTree from 'estree'
import { cloneEnvironment, createEnvironment } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { createView, getCurrentEnvironment } from '../../../view/view'
import { ViewPositionModifierType, ViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface GroupStartAnimation extends AnimationNode {
    firstGroup: boolean
    loc: ESTree.SourceLocation
    label: string
    leaveEmpty: boolean
}

function onBegin(animation: GroupStartAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    // Create a new view
    const newView = createView({ noChildren: true })
    newView.label = animation.label

    // Create a new environment if needed
    let newEnvironment: EnvironmentState

    if (animation.firstGroup) {
        newEnvironment = getCurrentEnvironment(view)
        const index = view.children.indexOf(newEnvironment)
        view.children.splice(index, 1)
    } else {
        const environment = getCurrentEnvironment(view)
        newEnvironment = animation.leaveEmpty ? createEnvironment() : cloneEnvironment(environment, true)
    }

    // Add new environment to the view
    newView.children.push(newEnvironment)

    // Position the new view next to appropriate code
    newView.transform.positionModifiers.push({
        type: ViewPositionModifierType.NextToCode,
        value: animation.loc,
    })

    // Add the new view to the current view state
    view.children.push(newView)

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
    firstGroup: boolean = false,
    loc: ESTree.SourceLocation,
    label: string,
    leaveEmpty = false,
    options: AnimationOptions = {}
): GroupStartAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'GroupStartAnimation',

        name: 'Group Start',

        firstGroup,
        loc,
        label,
        leaveEmpty,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
