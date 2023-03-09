import { getAccumulatedBoundingBoxForElements, getLeafStepsFromIDs } from '../../../utilities/action'
import { createElement, createSVGElement } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { ApplicationState } from '../../ApplicationState'
import { createEnvironment } from '../../transpiler/environment'
import { EnvironmentState, FrameInfo, Residual } from '../../transpiler/EnvironmentState'
import { getSelections } from '../../visualization/TimeMarker'
import { getConsumedAbyss } from '../Action/Abyss'
import { getBreakIndexOfFrameIndex } from '../Action/Mapping/ControlFlowView'
import { ReturnAnimation } from '../Trail/ReturnAnimation'
import { TrailGroup } from '../Trail/TrailGroup'
import { EnvironmentRenderer } from './Environment/EnvironmentRenderer'

/* ------------------------------------------------------ */
/*        View displays a series of program states        */
/* ------------------------------------------------------ */
export type DataViewState = {
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

    // Like animation paths (that are acting on a given animation)
    trails: (TrailGroup | ReturnAnimation)[]

    scopeContainers: { [key: string]: HTMLElement }

    // Cache
    prevTime: number

    frameElements: HTMLElement[]

    // Break indices (occurs between actions[index] and actions[index + 1])
    breaks: number[]
    breakElements: HTMLElement[]

    traceIndicators: { trace: HTMLElement; source: HTMLElement }[]
}

/* --------------------- Initializer -------------------- */
export function createViewState(overrides: Partial<ViewState> = {}): ViewState {
    const container = createElement('div', 'view-container')

    const label = createElement('div', 'view-label', container)

    const element = createElement('div', 'view', container)
    const svg = createSVGElement('environment-svg', element)
    const programId = ControlFlowViewInstance.instance.rootStepId!
    const scopeContainers: { [key: string]: HTMLElement } = {}
    scopeContainers[programId] = createElement('div', 'scope-container', container)

    const base: ViewState = {
        preFrame: createEnvironment(),
        frames: [],

        trails: [],

        container,
        element: element,
        svg: svg,

        renderers: [],
        containers: [],

        prevTime: -1,
        scopeContainers,
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
        const { stepId } = frames[i]
        const step = Steps.get(stepId)

        if (step.execution.nodeData.type == 'ReturnStatementAnimation') {
            const returnAnimation = new ReturnAnimation(step.execution, i)
            view.trails.push(returnAnimation)

            returnAnimation.setReturnDetails(frames[i - 1].environment, step.id, action.parentFrameId!)
        } else {
            const trailGroup = new TrailGroup(frames[i].overrideExecution ?? step.execution, i)
            view.trails.push(trailGroup)
        }
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

    const program = ApplicationState.actions[ControlFlowViewInstance.instance.rootStepId!]

    // Update scope containers
    const scopeHits: Set<string> = new Set()
    for (const [stepId, action] of Object.entries(ApplicationState.actions)) {
        if (!step.isFrame) continue

        let scope = view.scopeContainers[stepId]
        if (scope == null) {
            scope = createElement('div', 'scope-container', view.container)
            view.scopeContainers[stepId] = scope
        }

        scopeHits.add(stepId)
    }

    // Remove unused scope containers
    for (const [stepId, scope] of Object.entries(view.scopeContainers)) {
        if (!scopeHits.has(stepId)) {
            scope.remove()
            delete view.scopeContainers[stepId]
        }
    }

    // Update scope container positions
    updateScopeContainerPositions(program.id, { x: 35, y: 115 }, null)

    // Update position
    // const targetLeft = getNumericalValueOfStyle(program.controlFlowRenderer.container.style.left)
    // const targetTop = getNumericalValueOfStyle(program.controlFlowRenderer.container.style.top)

    // view.container.style.left = `${targetLeft}px`
    // view.container.style.top = `${targetTop}px`

    if (view.prevTime == globalTime) return

    /* --------------- Find the closest frame --------------- */

    // Get selected action(s)
    let { selectedIds: allSelectedSet, amounts, closestId } = getSelections(globalTime)
    const allSelected = [...allSelectedSet].filter((selection) =>
        view.frames.some((frame) => frame.stepId == selection)
    )

    if (allSelected.length == 0 && closestId == null) {
        // No action selected
        console.warn('No action selected')
        view.prevTime == globalTime
        return
    } else if (allSelected.length > 1) {
        // Multiple actions selected
        console.warn('Multiple actions selected')
    }

    const selected = allSelected.length > 0 ? allSelected[0] : closestId!

    // Find the selected frame
    const selectedFrameIndex = view.frames.findIndex((frame) => frame.stepId == selected)

    if (selectedFrameIndex == -1) {
        const selectedAction = ApplicationState.actions[selected]
        console.warn('Selected frame not found', selectedAction.execution.nodeData.type, selectedAction.id)
        view.prevTime = globalTime
        return
    }

    const selectedFrameAmount = amounts[selected]
    // const steps = getLeafStepsFromIDs(program.vertices)

    // if (steps.length == 0) {
    //     return
    // }

    // for (let i = steps.length - 1; i >= 0; i--) {
    //     // const controlf = steps[i].controlFlowRenderer
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
    //     const proxy = steps[i].controlFlowRenderer
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
    view.renderers[candidateBreakIndex].render(view.frames[selectedFrameIndex])

    const totalTime = selectedFrameIndex + selectedFrameAmount

    for (let k = 0; k < 2; k++) {
        // Post-update pass for each trail group
        for (let i = 0; i < view.trails.length; i++) {
            if (k == 0 && view.trails[i] instanceof ReturnAnimation) continue
            if (k == 1 && !(view.trails[i] instanceof ReturnAnimation)) continue

            const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
            const trails = view.trails[i]

            // Has already occurred
            if (i < selectedFrameIndex) {
                trails.updateTime(1, view.renderers[breakIndex], totalTime)
            }
        }

        // Update pass for each trail group
        for (let i = 0; i < view.trails.length; i++) {
            if (k == 0 && view.trails[i] instanceof ReturnAnimation) continue
            if (k == 1 && !(view.trails[i] instanceof ReturnAnimation)) continue

            const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
            const trails = view.trails[i]

            if (i == selectedFrameIndex) {
                trails.updateTime(selectedFrameAmount, view.renderers[breakIndex], totalTime)
            }
        }

        // Post update
        for (let i = 0; i < view.trails.length; i++) {
            if (k == 0 && view.trails[i] instanceof ReturnAnimation) continue
            if (k == 1 && !(view.trails[i] instanceof ReturnAnimation)) continue

            const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
            const trailGroup = view.trails[i]

            // Occurred before the current frame
            if (i < selectedFrameIndex) {
                trailGroup.postUpdate(1, view.renderers[breakIndex], totalTime)
            }
            // Occurred after the current frame
            else if (i > selectedFrameIndex) {
                trailGroup.postUpdate(0, view.renderers[breakIndex], totalTime)
            }
            // Occurred at the current frame
            else {
                trailGroup.postUpdate(selectedFrameAmount, view.renderers[breakIndex], totalTime)
            }
        }

        for (let i = 0; i < view.trails.length; i++) {
            if (k == 0 && view.trails[i] instanceof ReturnAnimation) continue
            if (k == 1 && !(view.trails[i] instanceof ReturnAnimation)) continue

            const trails = view.trails[i]
            const breakIndex = getBreakIndexOfFrameIndex(mapping, i)

            trails.trails!.forEach((trail) => trail.renderer.alwaysUpdate(view.renderers[breakIndex]))
        }
    }

    // /* ----------- Update position of containers ------------ */
    // for (let i = 0; i < view.containers.length; i++) {
    //     const container = view.containers[i]
    //     // const breakIndex = mapping.breaks[i] ?? steps.length - 1
    //     // const prevBreakIndex = mapping.breaks[i - 1] ?? 0

    //     // If candidate is in the same break
    //     if (candidateBreakIndex == i) {
    //         const activeAction = steps[0].controlFlowRenderer
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
    const programId = ControlFlowViewInstance.instance.rootStepId
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

export function updateScopeContainerPositions(
    id: string,
    offset: { x: number; y: number },
    relativeTo: HTMLElement | null
): HTMLElement[] {
    const childrenElements: HTMLElement[] = []

    // Update self
    let x = 0
    let y = 0

    const step = Steps.get(id)
    const scopeContainer = ApplicationState.visualization.view!.scopeContainers[id]
    const containerBbox = ApplicationState.visualization.view!.container.getBoundingClientRect()
    const abbreviation = getConsumedAbyss(id)
    if (abbreviation != null) {
        scopeContainer.classList.add('consumed')
    } else {
        scopeContainer.classList.remove('consumed')
    }

    if (relativeTo != null) {
        const parentBbox = relativeTo.getBoundingClientRect()
        x = parentBbox.x + parentBbox.width + offset.x - containerBbox.x
        y = parentBbox.y + offset.y - containerBbox.y

        if (relativeTo.classList.contains('consumed') && abbreviation == null) {
            x += 50
        }
    } else {
        x = offset.x
        y = offset.y
    }

    scopeContainer.style.left = `${x}px`
    scopeContainer.style.top = `${y}px`

    childrenElements.push(scopeContainer)

    // Update children
    const rOffset = { x: 50, y: 0 }

    for (const vertexId of action.spatialVertices) {
        const childElements: HTMLElement[] = []
        if (abbreviation != null) {
            rOffset.x = 0
        }

        childElements.push(...updateScopeContainerPositions(vertexId, { ...rOffset }, scopeContainer))

        // If hit something
        if (childElements.length > 0) {
            const bbox = getAccumulatedBoundingBoxForElements(childElements)
            rOffset.y += bbox.height + 20
        }

        childrenElements.push(...childElements)
    }

    return childrenElements
}
