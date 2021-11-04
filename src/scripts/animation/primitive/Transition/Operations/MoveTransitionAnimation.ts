import { DataTransform } from '../../../../environment/data/DataState'
import { resolvePath } from '../../../../environment/environment'
import { AccessorType } from '../../../../environment/EnvironmentState'
import { reflow } from '../../../../utilities/dom'
import { getNumericalValueOfStyle, lerp } from '../../../../utilities/math'
import { getCurrentEnvironment, getPreviousEnvironment } from '../../../../view/view'
import { ViewState } from '../../../../view/ViewState'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { AnimationData, AnimationRuntimeOptions } from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionMove extends TransitionAnimationNode {}

function onBegin(animation: TransitionMove, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view)
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)

    environment._temps[`${animation.output.id}TransitionMove`] = {
        x: getNumericalValueOfStyle(data.transform.renderOnlyStyles.left || '0px'),
        y: getNumericalValueOfStyle(data.transform.renderOnlyStyles.top || '0x'),
    }
}

function onSeek(animation: TransitionMove, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))
    const environment = getCurrentEnvironment(view)
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    const start = environment._temps[`${animation.output.id}TransitionMove`]

    data.transform.renderOnlyStyles.left = `${lerp(start.x, data.transform.rendered.x, t)}px`
    data.transform.renderOnlyStyles.top = `${lerp(start.y, data.transform.rendered.y, t)}px`

    if (t > 0.5) {
        delete data.transform.renderOnlyStyles.borderRadius
    }
}

function onEnd(animation: TransitionMove, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view)
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    console.log(data.transform.renderOnlyStyles.borderRadius)

    delete data.transform.renderOnlyStyles.left
    delete data.transform.renderOnlyStyles.top
    delete data.transform.renderOnlyStyles.borderRadius
}

function applyInvariant(animation: TransitionMove, view: ViewState) {
    const environment = getCurrentEnvironment(view)
    const prevEnvironment = getPreviousEnvironment(view)

    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    const origin = resolvePath(prevEnvironment, [{ type: AccessorType.ID, value: animation.origins[0].id }], null)

    data.transform.renderOnlyStyles.left = `${origin.transform.rendered.x}px`
    data.transform.renderOnlyStyles.top = `${origin.transform.rendered.y}px`

    console.log(getComputedStyleOfData(origin.transform, 'borderRadius'))
    data.transform.renderOnlyStyles.borderRadius = getComputedStyleOfData(origin.transform, 'borderRadius')
}

export function transitionMove(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionMove {
    return {
        ...createAnimationNode(null, { ...options, duration: 80 }),

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

function getComputedStyleOfData(data: DataTransform, property: string) {
    const temp = document.createElement('div')
    document.getElementById('temporary-layout').append(temp)

    for (const c of data.classList) {
        temp.classList.add(c)
    }

    for (const [key, value] of Object.entries(data.styles)) {
        temp.style[key] = value
    }

    temp.style.position = 'absolute'

    reflow(temp)

    const computed = getComputedStyle(temp, property)
    // temp.remove()

    return computed[property]
}
