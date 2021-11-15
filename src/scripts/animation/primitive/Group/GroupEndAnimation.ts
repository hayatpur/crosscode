import { findViewById } from '../../../view/view'
import { RootViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface GroupEndAnimation extends AnimationNode {
    groupId: string
}

function onBegin(animation: GroupEndAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    console.log('Ending group...', animation.nodeData.type)

    if (options.baking) {
        computeReadAndWrites(animation)
    }

    const groupView = findViewById(view, animation.groupId)
    groupView.isActive = false
    groupView.lastActive = performance.now()
}

function onSeek(animation: GroupEndAnimation, view: RootViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: GroupEndAnimation, view: RootViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: GroupEndAnimation) {
    animation._reads = []
    animation._writes = []
}

export function groupEndAnimation(groupId: string, options: AnimationOptions = {}): GroupEndAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'GroupEndAnimation',

        name: 'Group End',

        groupId,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
