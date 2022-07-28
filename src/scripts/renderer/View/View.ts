import { Howl } from 'howler'
import { ApplicationState } from '../../ApplicationState'
import { createEnvironment } from '../../environment/environment'
import { EnvironmentState, Residual } from '../../environment/EnvironmentState'
import { getLeafStepsFromIDs } from '../../utilities/action'
import { createElement, createSVGElement } from '../../utilities/dom'
import { remap } from '../../utilities/math'
import { getBreakIndexOfFrameIndex } from '../Action/Mapping/ActionMapping'
import { TrailGroup } from '../Trail/TrailGroup'
import { EnvironmentRenderer } from './Environment/EnvironmentRenderer'

/* ------------------------------------------------------ */
/*        View displays a series of program states        */
/* ------------------------------------------------------ */
export interface ViewState {
    id: string

    preFrame: EnvironmentState
    frames: EnvironmentState[]

    // Container
    element: HTMLElement

    // SVG overlay
    svg: SVGElement

    // Stack container
    renderers: EnvironmentRenderer[]
    containers: HTMLElement[]

    sound: Howl

    // Like animation paths (that are acting on a given animation)
    trails: TrailGroup[]
}

/* --------------------- Initializer -------------------- */
let __VIEW_ID = 0
export function createViewState(overrides: Partial<ViewState> = {}): ViewState {
    const element = createElement('div', 'view')

    const svg = createSVGElement('environment-svg', element)

    const sound = new Howl({
        src: [
            './src/assets/material_product_sounds/ogg/04 Secondary System Sounds/navigation_transition-left.ogg',
        ],
    })

    const base: ViewState = {
        id: `View(${++__VIEW_ID})`,

        preFrame: createEnvironment(),
        frames: [],

        trails: [],

        element: element,
        svg: svg,

        renderers: [],
        containers: [],

        sound: sound,
    }

    return { ...base, ...overrides }
}

/* -------------------- Modify State -------------------- */
export function setViewFrames(
    view: ViewState,
    frames: [env: EnvironmentState, actionID: string][],
    preFrame: EnvironmentState
) {
    /* -------------------- Update frames ------------------- */
    view.frames = frames.map(([env, actionID]) => env)
    syncViewFrames(view)

    view.preFrame = preFrame

    /* -------------------- Update trails ------------------- */

    // Clean up existing ones
    Object.values(view.trails).forEach((trail) => trail.destroy())
    view.trails = []

    for (let i = 0; i < frames.length; i++) {
        const [env, actionID] = frames[i]
        const action = ApplicationState.actions[actionID]

        const trailGroup = new TrailGroup(action.execution, i)
        view.trails.push(trailGroup)
    }

    updateView(view)

    /* ------------------ Update residuals ------------------ */

    // Clean up existing residuals
    for (const frame of view.frames) {
        frame.residuals = []
    }

    // Clean up existing timestamps
    for (const frame of view.frames) {
        frame.timestamps = {}
    }

    // Create new residuals
    // TODO: can make it linear time by maintaining residuals
    for (let i = 0; i < frames.length; i++) {
        // For each frame
        const [frameEnvironment, frameAction] = frames[i]
        const residuals: Residual[][] = []

        for (let j = 0; j <= i; j++) {
            // For each previous frame
            const [previousFrameEnvironment, previousFrameAction] = frames[j]
            const trail = view.trails[j]

            const ppFrame = j == 0 ? view.preFrame : frames[j - 1][0]

            residuals.push(trail.computeResidual(ppFrame))
            trail.applyTimestamps(frameEnvironment)
        }

        frameEnvironment.residuals = residuals
    }
}

/* ----------------------- Destroy ---------------------- */
export function destroyView(view: ViewState) {
    view.renderers.forEach((renderer) => renderer.destroy())
    view.element.remove()

    view.trails.forEach((trail) => trail.destroy())
    view.trails = []
}

/* --------------------- Update time -------------------- */
export function updateView(view: ViewState) {
    const mapping = ApplicationState.visualization.mapping

    if (mapping == undefined) {
        throw new Error('No mapping defined.')
    }

    const time = mapping.time

    let candidate = 0
    let amount = 0

    /* --------------- Find the closest frame --------------- */
    const steps = getLeafStepsFromIDs(
        ApplicationState.visualization.program?.vertices ?? []
    )

    if (steps.length == 0) {
        return
    }

    for (let i = steps.length - 1; i >= 0; i--) {
        const proxy = steps[i].proxy
        const start = proxy.timeOffset
        const end = start + proxy.element.getBoundingClientRect().height // TODO: Fix end point calculation
        candidate = i

        if (time >= start) {
            amount = Math.min(remap(time, start, end, 0, 1), 1)
            if (time <= end) {
                if (!proxy.element.classList.contains('is-playing')) {
                    view.sound.rate(
                        Math.max(0.5, 3 - Math.abs(start - end) / 20)
                    )
                    view.sound.play()
                }

                const action = ApplicationState.actions[proxy.actionID]
                action.element.classList.add('is-playing')
                proxy.element.classList.add('is-playing')
            }
            break
        }
    }

    /* ------------------- Assign classes ------------------- */
    for (let i = 0; i < steps.length; i++) {
        const proxy = steps[i].proxy
        const action = ApplicationState.actions[proxy.actionID]

        if (i != candidate) {
            action.element.classList.remove('is-playing')
            proxy.element.classList.remove('is-playing')
        }
        if (i < candidate) {
            action.element.classList.add('has-played')
            proxy.element.classList.add('has-played')
        } else {
            action.element.classList.remove('has-played')
            proxy.element.classList.remove('has-played')
        }
    }

    if (candidate == -1) {
        console.warn('No candidate frame found.')
        return
    }

    /* --------------- Show the current frame --------------- */

    /* -------------------- Apply breaks -------------------- */

    /* -------------------- Apply trails -------------------- */
    const candidateBreakIndex = getBreakIndexOfFrameIndex(mapping, candidate)

    view.renderers[candidateBreakIndex].render(view.frames[candidate])

    for (let i = 0; i < view.trails.length; i++) {
        const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
        const trails = view.trails[i]
        if (i < candidate) {
            trails.updateTime(1, view.renderers[breakIndex])
        } else if (i > candidate) {
            // trails.updateTime(0, this.renderer)
        } else {
            trails.updateTime(amount, view.renderers[breakIndex])
        }
    }

    for (let i = 0; i < view.trails.length; i++) {
        const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
        const trails = view.trails[i]
        if (i < candidate) {
            trails.postUpdate(1, view.renderers[breakIndex])
        } else if (i > candidate) {
            trails.postUpdate(0, view.renderers[breakIndex])
        } else {
            trails.postUpdate(amount, view.renderers[breakIndex])
        }
    }

    for (let i = 0; i < view.trails.length; i++) {
        const trails = view.trails[i]
        const breakIndex = getBreakIndexOfFrameIndex(mapping, i)

        trails.trails.forEach((trail) =>
            trail.renderer.alwaysUpdate(view.renderers[breakIndex])
        )
    }

    /* ----------- Update position of containers ------------ */
    for (let i = 0; i < view.containers.length; i++) {
        const container = view.containers[i]
        // const breakIndex = mapping.breaks[i] ?? steps.length - 1
        // const prevBreakIndex = mapping.breaks[i - 1] ?? 0

        // If candidate is in the same break
        if (candidateBreakIndex == i) {
            const activeAction = steps[0].proxy
            const activeActionBbox =
                activeAction.element.getBoundingClientRect()
            container.style.top = `${
                activeActionBbox.top +
                activeActionBbox.height / 2 -
                container.getBoundingClientRect().height / 2
            }px`

            container.classList.remove('will-play')
            container.classList.remove('has-played')
        } else if (candidateBreakIndex < i) {
            container.classList.add('will-play')
            container.classList.remove('has-played')
        } else {
            container.classList.add('has-played')
            container.classList.remove('will-play')
        }
    }
}

/**
 * Sync the frames with the state.
 * TODO: Currently destroys and re-instantiates - can be incremental.
 */
export function syncViewFrames(view: ViewState) {
    /* ------------------ Destroy existing ------------------ */
    view.renderers.forEach((renderer) => renderer?.destroy())
    view.renderers = []

    view.containers.forEach((container) => container.remove())
    view.containers = []

    /* --------------------- Create new --------------------- */
    const mapping = ApplicationState.visualization.mapping

    if (mapping == undefined) {
        throw new Error('No mapping defined.')
    }

    // Create containers
    for (let i = 0; i < mapping.breaks.length + 1; i++) {
        const container = createElement('div', 'environment-container')
        view.containers.push(container)
        view.element.appendChild(container)
    }

    // Create renderers
    for (let i = 0; i < mapping.breaks.length + 1; i++) {
        const renderer = new EnvironmentRenderer()
        view.renderers.push(renderer)

        const container = view.containers[i]
        container.appendChild(renderer.element)
    }

    /* ----------- Place breaks at right position ----------- */
    const steps = getLeafStepsFromIDs(
        ApplicationState.visualization.program?.vertices ?? []
    )
    for (let i = 0; i < mapping.breaks.length; i++) {
        const actionToBreakOn = steps[0]
        const actionToBreakOnBbox =
            actionToBreakOn.element.getBoundingClientRect()

        const nextAction = steps[mapping.breaks[i] + 1]
        const nextActionBbox = nextAction?.element.getBoundingClientRect()

        if (nextActionBbox != null) {
            mapping.breakElements[i].style.top = `${
                (actionToBreakOnBbox.bottom + nextActionBbox.top) / 2
            }px`
        } else {
            mapping.breakElements[i].style.top = `${
                actionToBreakOnBbox.bottom + 20
            }px`
        }
    }
}
