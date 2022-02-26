import { getArrow } from 'curved-arrows'
import { AnimationOptions, createAnimationNode, duration } from '../../../../animation/animation'
import { DataRenderer } from '../../../../environment/data/DataRenderer'
import { EnvironmentRenderer } from '../../../../environment/EnvironmentRenderer'
import { EnvironmentState } from '../../../../environment/EnvironmentState'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionMove extends TransitionAnimationNode {
    movement?: SVGPathElement
}

function onBegin(animation: TransitionMove, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null) {
        return
    }

    animation.movement?.remove()
    animation.movement = createPath(animation, renderer)
}

function onSeek(animation: TransitionMove, environment: EnvironmentState, time: number) {
    let t = animation.ease(time / duration(animation))

    const renderer = environment.renderer
    if (renderer == null) {
        return
    }

    const to = renderer.getAllChildRenderers()[animation.output.id] as DataRenderer
    const { x, y } = animation.movement.getPointAtLength(t * this.movement.getTotalLength())
    to.element.style.transform = `translate(${x}px, ${y}px)`
}

function onEnd(animation: TransitionMove, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null) {
        return
    }

    const to = renderer.getAllChildRenderers()[animation.output.id] as DataRenderer
    to.element.style.transform = `translate(0px, 0px)`
    animation.movement?.remove()
    animation.movement = null
}

function applyInvariant(animation: TransitionMove, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null || animation.isPlaying) {
        return
    }

    if (animation.movement == null) {
        animation.movement = createPath(animation, renderer)
    }

    const to = renderer.getAllChildRenderers()[animation.output.id] as DataRenderer
    const { x, y } = animation.movement.getPointAtLength(0)
    to.element.style.transform = `translate(${x}px, ${y}px)`
}

export function transitionMove(
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionMove {
    return {
        ...createAnimationNode({ ...options, delay: 0, duration: 20 }),

        name: 'TransitionMove',

        output,
        origins,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,

        // Transition
        applyInvariant,
    }
}

function createPath(animation: TransitionMove, renderer: EnvironmentRenderer) {
    const from = renderer.getAllChildRenderers()[animation.origins[0].id] as DataRenderer
    const to = renderer.getAllChildRenderers()[animation.output.id] as DataRenderer

    // The movement path
    const movement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    movement.classList.add('movement-path')
    movement.style.opacity = '0'
    document.getElementById('svg-canvas').append(movement)

    const fromBbox = from.element.getBoundingClientRect()
    const toBbox = to.element.getBoundingClientRect()

    // path.delta = {
    //     x: fromBbox.x - toBbox.x,
    //     y: fromBbox.y - toBbox.y,
    // }
    let start = { x: fromBbox.x - toBbox.x, y: fromBbox.y - toBbox.y }
    let end = { x: 0, y: 0 }

    if (renderer.separated) {
        const offset =
            renderer.preRenderer
                .getAllChildRenderers()
                [animation.origins[0].id].element.getBoundingClientRect().y - fromBbox.y

        console.log('Offsetting...', offset)
        start.y += offset
    }

    let mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }

    // Convex
    if (renderer.separated) {
        const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getArrow(start.x, start.y, end.x, end.y, {
            padEnd: 0,
            padStart: 0,
        })
        movement.setAttribute('d', `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`)
    } else {
        let convex = start.x < end.x
        mid.y += (convex ? 1 : -1) * Math.abs(end.x - start.x) * 0.5
        movement.setAttribute('d', `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`)
    }

    return movement
}
