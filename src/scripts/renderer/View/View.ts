import { Howl } from 'howler'
import { ApplicationState } from '../../ApplicationState'
import { createEnvironment } from '../../environment/environment'
import { EnvironmentState, FrameInfo, Residual } from '../../environment/EnvironmentState'
import { getLeafStepsFromIDs } from '../../utilities/action'
import { createElement, createSVGElement } from '../../utilities/dom'
import { assert } from '../../utilities/generic'
import { getNumericalValueOfStyle } from '../../utilities/math'
import { getSelections } from '../../visualization/Selection'
import { getBreakIndexOfFrameIndex } from '../Action/Mapping/ActionMapping'
import { TrailGroup } from '../Trail/TrailGroup'
import { EnvironmentRenderer } from './Environment/EnvironmentRenderer'

/* ------------------------------------------------------ */
/*        View displays a series of program states        */
/* ------------------------------------------------------ */
export type ViewState = {
    id: string

    actionId: string

    preFrame: EnvironmentState
    frames: FrameInfo[]

    // Container
    container: HTMLElement
    element: HTMLElement

    // SVG overlay
    svg: SVGElement

    // Stack container
    renderers: EnvironmentRenderer[]
    containers: HTMLElement[]

    sound: Howl

    // Like animation paths (that are acting on a given animation)
    trails: TrailGroup[]

    // Cache
    prevTime: number
}

/* --------------------- Initializer -------------------- */
let __VIEW_ID = 0
export function createViewState(overrides: Partial<ViewState> = {}): ViewState {
    const container = createElement('div', 'view-container')

    const label = createElement('div', 'view-label', container)

    const element = createElement('div', 'view', container)
    const svg = createSVGElement('environment-svg', element)

    const sound = new Howl({
        src: ['./src/assets/material_product_sounds/ogg/04 Secondary System Sounds/navigation_transition-left.ogg'],
    })

    assert(overrides.actionId != null, 'Action id must be provided')

    const action = ApplicationState.actions[overrides.actionId]
    label.innerText = action.execution.nodeData.type!

    const base: ViewState = {
        id: `View(${++__VIEW_ID})`,

        preFrame: createEnvironment(),
        frames: [],

        trails: [],

        container,
        element: element,
        svg: svg,

        renderers: [],
        containers: [],

        actionId: overrides.actionId,

        sound: sound,
        prevTime: -1,
    }

    Object.assign(base, overrides)

    return base
}

/* -------------------- Modify State -------------------- */
export function setViewFrames(view: ViewState, frames: FrameInfo[], preFrame: EnvironmentState) {
    /* -------------------- Update frames ------------------- */
    view.frames = [...frames]
    syncViewFrames(view)

    view.preFrame = preFrame

    /* -------------------- Update trails ------------------- */

    // Clean up existing trails
    Object.values(view.trails).forEach((trail) => trail.destroy())
    view.trails = []

    // Create new trails
    for (let i = 0; i < frames.length; i++) {
        const { actionId } = frames[i]
        const action = ApplicationState.actions[actionId]

        const trailGroup = new TrailGroup(action.execution, view.actionId, i)
        view.trails.push(trailGroup)
    }

    view.prevTime = -1
    updateView(view)

    /* ------------------ Update residuals ------------------ */

    // Clean up existing residuals
    for (const frame of view.frames) {
        frame.environment.residuals = []
    }

    // Clean up existing timestamps
    for (const frame of view.frames) {
        frame.environment.timestamps = {}
    }

    // Create new residuals
    // TODO: can make it linear time by maintaining residuals
    for (let i = 0; i < frames.length; i++) {
        // For each frame
        const { environment: frameEnvironment } = frames[i]
        const residuals: Residual[][] = []

        for (let j = 0; j <= i; j++) {
            // For each previous frame
            // const [previousFrameEnvironment, previousFrameAction] = frames[j]
            const trail = view.trails[j]

            const ppFrame = j == 0 ? view.preFrame : frames[j - 1].environment

            residuals.push(trail.computeResidual(ppFrame))
            trail.applyTimestamps(frameEnvironment)
        }

        frameEnvironment.residuals = residuals
    }
}

/* ----------------------- Destroy ---------------------- */
export function destroyView(view: ViewState) {
    view.renderers.forEach((renderer) => renderer.destroy())
    view.container.remove()

    view.trails.forEach((trail) => trail.destroy())
    view.trails = []
}

/* --------------------- Update time -------------------- */
export function updateView(view: ViewState) {
    const mapping = ApplicationState.visualization.mapping!
    const globalTime = ApplicationState.visualization.selections['main']._globalTime

    const action = ApplicationState.actions[view.actionId]

    // Update position
    const targetLeft = getNumericalValueOfStyle(action.proxy.container.style.left)
    const targetTop = getNumericalValueOfStyle(action.proxy.container.style.top)

    view.container.style.left = `${targetLeft}px`
    view.container.style.top = `${targetTop}px`

    if (view.prevTime == globalTime) return

    /* --------------- Find the closest frame --------------- */

    // Get selected action(s) in the current spatial thing
    let { selectedIds: allSelectedSet, amounts, closestId } = getSelections(globalTime)
    const allSelected = [...allSelectedSet]
        .filter((selection) => ApplicationState.actions[selection].spatialParentID == action.id)
        .filter((selection) => view.frames.some((frame) => frame.actionId == selection))

    if (allSelected.length == 0 && closestId == null) {
        // No action selected
        console.warn('No action selected')
        return
    } else if (allSelected.length > 1) {
        // Multiple actions selected
        console.warn('Multiple actions selected')
    }

    const selected = allSelected.length > 0 ? allSelected[0] : closestId!

    // Find the selected frame
    const selectedFrameIndex = view.frames.findIndex((frame) => frame.actionId == selected)
    const selectedFrameAmount = amounts[selected]
    // const steps = getLeafStepsFromIDs(program.vertices)

    // if (steps.length == 0) {
    //     return
    // }

    // for (let i = steps.length - 1; i >= 0; i--) {
    //     // const controlf = steps[i].proxy
    //     const start = steps[i].globalTimeOffset
    //     const end = steps[i].globalTimeOffset + getTotalDuration(steps[i].id)
    //     candidate = i

    //     if (time >= start) {
    //         amount = Math.min(remap(time, start, end, 0, 1), 1)
    //         if (time <= end) {
    //             if (!proxy.element.classList.contains('is-playing')) {
    //                 view.sound.rate(Math.max(0.5, 3 - Math.abs(start - end) / 20))
    //                 view.sound.play()
    //             }

    //             const action = ApplicationState.actions[proxy.actionID]
    //             action.element.classList.add('is-playing')
    //             proxy.element.classList.add('is-playing')
    //         }
    //         break
    //     }
    // }

    /* ------------------- Assign classes ------------------- */
    // for (let i = 0; i < steps.length; i++) {
    //     const proxy = steps[i].proxy
    //     const action = ApplicationState.actions[proxy.actionID]

    //     if (i != candidate) {
    //         action.element.classList.remove('is-playing')
    //         proxy.element.classList.remove('is-playing')
    //     }
    //     if (i < candidate) {
    //         action.element.classList.add('has-played')
    //         proxy.element.classList.add('has-played')
    //     } else {
    //         action.element.classList.remove('has-played')
    //         proxy.element.classList.remove('has-played')
    //     }
    // }

    // if (candidate == -1) {
    //     console.warn('No candidate frame found.')
    //     return
    // }

    /* --------------- Show the current frame --------------- */

    /* -------------------- Apply breaks -------------------- */

    /* -------------------- Apply trails -------------------- */
    const candidateBreakIndex = getBreakIndexOfFrameIndex(mapping, selectedFrameIndex)
    view.renderers[candidateBreakIndex].render(view.frames[selectedFrameIndex].environment)

    // Update
    for (let i = 0; i < view.trails.length; i++) {
        const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
        const trails = view.trails[i]

        if (i < selectedFrameIndex) {
            trails.updateTime(1, view.renderers[breakIndex])
        } else if (i > selectedFrameIndex) {
            // TODO: Why?
            // trails.updateTime(0, this.renderer)
        } else {
            trails.updateTime(selectedFrameAmount, view.renderers[breakIndex])
        }
    }

    // Post update
    for (let i = 0; i < view.trails.length; i++) {
        const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
        const trailGroup = view.trails[i]

        // Occurred before the current frame
        if (i < selectedFrameIndex) {
            trailGroup.postUpdate(1, view.renderers[breakIndex])
        }
        // Occurred after the current frame
        else if (i > selectedFrameIndex) {
            trailGroup.postUpdate(0, view.renderers[breakIndex])
        }
        // Occurred at the current frame
        else {
            trailGroup.postUpdate(selectedFrameAmount, view.renderers[breakIndex])
        }
    }

    for (let i = 0; i < view.trails.length; i++) {
        const trails = view.trails[i]
        const breakIndex = getBreakIndexOfFrameIndex(mapping, i)

        trails.trails!.forEach((trail) => trail.renderer.alwaysUpdate(view.renderers[breakIndex]))
    }

    // /* ----------- Update position of containers ------------ */
    // for (let i = 0; i < view.containers.length; i++) {
    //     const container = view.containers[i]
    //     // const breakIndex = mapping.breaks[i] ?? steps.length - 1
    //     // const prevBreakIndex = mapping.breaks[i - 1] ?? 0

    //     // If candidate is in the same break
    //     if (candidateBreakIndex == i) {
    //         const activeAction = steps[0].proxy
    //         const activeActionBbox = activeAction.element.getBoundingClientRect()
    //         container.style.top = `${
    //             activeActionBbox.top + activeActionBbox.height / 2 - container.getBoundingClientRect().height / 2
    //         }px`

    //         container.classList.remove('will-play')
    //         container.classList.remove('has-played')
    //     } else if (candidateBreakIndex < i) {
    //         container.classList.add('will-play')
    //         container.classList.remove('has-played')
    //     } else {
    //         container.classList.add('has-played')
    //         container.classList.remove('will-play')
    //     }
    // }

    view.prevTime = globalTime
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
    const programId = ApplicationState.visualization.programId
    assert(programId != undefined, 'Program is undefined')
    const program = ApplicationState.actions[programId]

    const steps = getLeafStepsFromIDs(program?.vertices ?? [])
    for (let i = 0; i < mapping.breaks.length; i++) {
        const actionToBreakOn = steps[0]
        const actionToBreakOnBbox = actionToBreakOn.element.getBoundingClientRect()

        const nextAction = steps[mapping.breaks[i] + 1]
        const nextActionBbox = nextAction?.element.getBoundingClientRect()

        if (nextActionBbox != null) {
            mapping.breakElements[i].style.top = `${(actionToBreakOnBbox.bottom + nextActionBbox.top) / 2}px`
        } else {
            mapping.breakElements[i].style.top = `${actionToBreakOnBbox.bottom + 20}px`
        }
    }
}
