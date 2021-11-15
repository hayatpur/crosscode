import { RootViewState } from '../../../../view/ViewState'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { AnimationData, AnimationRuntimeOptions } from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionMove extends TransitionAnimationNode {}

function onBegin(animation: TransitionMove, view: RootViewState, options: AnimationRuntimeOptions) {
    // const environment = view.environment
    // const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    // environment._temps[`${animation.output.id}TransitionMove`] = {
    //     x: getNumericalValueOfStyle(data.transform.renderOnlyStyles.left || '0px'),
    //     y: getNumericalValueOfStyle(data.transform.renderOnlyStyles.top || '0x'),
    // }
}

function onSeek(animation: TransitionMove, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    // if (time <= 80) {
    //     let t = animation.ease(time / 80)
    //     const environment = view.environment
    //     const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    //     const start = environment._temps[`${animation.output.id}TransitionMove`]
    //     data.transform.renderOnlyStyles.left = `${lerp(start.x, data.transform.rendered.x, t)}px`
    //     data.transform.renderOnlyStyles.top = `${lerp(start.y, data.transform.rendered.y, t)}px`
    //     if (t > 0.5) {
    //         delete data.transform.renderOnlyStyles.borderRadius
    //     }
    // }
}

function onEnd(animation: TransitionMove, view: RootViewState, options: AnimationRuntimeOptions) {
    // const environment = view.environment
    // const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    // console.log(data.transform.renderOnlyStyles.borderRadius)
    // delete data.transform.renderOnlyStyles.left
    // delete data.transform.renderOnlyStyles.top
    // delete data.transform.renderOnlyStyles.borderRadius
}

function applyInvariant(animation: TransitionMove, view: RootViewState) {
    // const environment = view.environment
    // const prevEnvironment = getLastActiveLeafView(view)._environment
    // const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    // const origin = resolvePath(prevEnvironment, [{ type: AccessorType.ID, value: animation.origins[0].id }], null)
    // data.transform.renderOnlyStyles.left = `${origin.transform.rendered.x}px`
    // data.transform.renderOnlyStyles.top = `${origin.transform.rendered.y}px`
    // console.log(getComputedStyleOfData(origin.transform, 'borderRadius'))
    // data.transform.renderOnlyStyles.borderRadius = getComputedStyleOfData(origin.transform, 'borderRadius')
}

export function transitionMove(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionMove {
    return {
        ...createAnimationNode(null, { ...options, duration: 150 }),

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

// function getComputedStyleOfData(data: DataTransform, property: string) {
//     const temp = document.createElement('div')
//     document.getElementById('temporary-layout').append(temp)

//     for (const c of data.classList) {
//         temp.classList.add(c)
//     }

//     for (const [key, value] of Object.entries(data.styles)) {
//         temp.style[key] = value
//     }

//     temp.style.position = 'absolute'

//     reflow(temp)

//     const computed = getComputedStyle(temp, property)
//     // temp.remove()

//     return computed[property]
// }
