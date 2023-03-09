import { Editor, EditorInstance } from '../Editor/Editor'
import { createElement, createPathElement, createSVGElement } from '../utilities/dom'
import { objEquals } from '../utilities/math'
import { clone } from '../utilities/objects'
import { Ticker } from '../Utilities/Ticker'
import { Step, Steps, StepState } from './Step'

export type CFVRendererState = {
    container: HTMLElement
    element: HTMLElement
    svgCanvas: SVGElement

    tickId: string

    steps: { [key: string]: StepCFVRendererState }
}

export type StepCFVRendererState = {
    element: HTMLElement

    container: HTMLElement

    // For frames
    header: HTMLElement | null

    controls: HTMLElement | null
    placeholder: HTMLElement | null
    beam: HTMLElement | null
    path: PathCFVRendererState | null

    prevStep: StepState | null
}

export type PathCFVRendererState = {
    container: SVGElement | undefined
    overlayContainer: SVGElement | undefined

    flowPathChunks: SVGPathElement[]
    stepRadii: SVGCircleElement[]

    flowPath: SVGPathElement
}

export class CFVRendererInstance {
    static instance: CFVRendererState
}

export namespace CFVRenderer {
    /* -------------------- Overall View -------------------- */
    export function createCFVRenderer(container: HTMLElement): CFVRendererState {
        const element = createElement('div', 'control-flow-view', container)
        const svgCanvas = createSVGElement('control-flow-view-svg', element)

        const tickId = Ticker.instance.registerTick(() => updateCFVRenderer())

        const renderer: CFVRendererState = {
            container,
            element,
            svgCanvas,
            steps: {},
            tickId,
        }

        CFVRendererInstance.instance = renderer

        return renderer
    }

    let prevMargin = 0
    export function updateCFVRenderer() {
        const renderer = CFVRendererInstance.instance

        // Update visualization container position
        const margin = Editor.getMaxWidth(EditorInstance.instance) + 70
        if (prevMargin != margin) {
            renderer.container.style.left = `${margin}px`
            prevMargin = margin
        }

        // Remove all steps that are no longer in the control flow view
        for (const stepId in renderer.steps) {
            if (!(stepId in Steps.steps)) {
                destroyStepCFVRenderer(renderer.steps[stepId])
                delete renderer.steps[stepId]
            }
        }

        for (const stepId in Steps.steps) {
            // Add missing step renderers
            if (!(stepId in renderer.steps)) {
                const step = Steps.get(stepId)
                renderer.steps[stepId] = createStepCFVRenderer(step)
            }

            // Update step renderers
            updateStepCFVRenderer(renderer.steps[stepId], Steps.get(stepId))
        }
    }

    export function destroyCFVRenderer(renderer: CFVRendererState) {
        renderer.element.remove()

        for (const stepId in renderer.steps) {
            destroyStepCFVRenderer(renderer.steps[stepId])
        }

        renderer.steps = {}
    }

    /* ---------------- Individual Step View ---------------- */
    export function createStepCFVRenderer(step: StepState): StepCFVRendererState {
        const renderer = CFVRendererInstance.instance

        const container = createElement('div', 'control-flow-step-container', renderer.element)

        const element = createElement(
            'div',
            [
                'control-flow-step',
                `type-${step.execution.nodeData.type?.replace(' ', '-')}`,
                `pre-label-${step.execution.nodeData.preLabel?.replace(' ', '-')}`,
            ],
            container
        )

        let header: HTMLElement | null = null
        let controls: HTMLElement | null = null
        let placeholder: HTMLElement | null = null
        let beam: HTMLElement | null = null
        let path: PathCFVRendererState | null = null

        // If is a frame
        if (step.isFrame) {
            // Header for the action (contains label and controls)
            header = createElement('div', 'control-flow-step-header', container)
            const label = createElement('div', 'control-flow-step-label', header)
            label.innerText = Step.getTitleFromExecution(step.execution)

            // Add controls
            controls = createElement('div', 'action-proxy-controls', header)
            const minimize = createElement('div', 'action-proxy-controls-button', controls)
            minimize.innerText = '-'

            // Create path
            path = {
                container: createSVGElement('control-flow-svg', element),
                overlayContainer: createSVGElement(['control-flow-svg', 'control-flow-svg-overlay'], element),
                flowPath: createPathElement('control-flow-path', element),
                flowPathChunks: [],
                stepRadii: [],
            }

            // minimize.addEventListener('click', () => {
            //     if (step.isMinimized) {
            //         maximizeStep(stepId)
            //     } else {
            //         minimizeStep(stepId)
            //     }
            // })

            // if (step.execution.nodeData.type != 'Program') {
            //     const originalParent = Steps.get(step.parentId).controlFlow.element

            //     // Create placeholder
            //     step.controlFlow.placeholder = createElement('div', 'action-proxy-placeholder')
            //     originalParent.append(step.controlFlow.placeholder)

            //     appendStepToCFV(action.controlFlowRenderer, mapping)
            //     action.representation.updateProxyVisual()

            //     // Create beam
            //     const svg = createSVGElement('ray-svg')
            //     step.controlFlow.placeholderRay = createPathElement('action-proxy-ray', svg)
            //     step.controlFlow.container.insertBefore(svg, step.controlFlow.container.firstChild)

            //     // Update ray
            //     action.rayTickId = Ticker.instance.registerTick(() => {
            //         updateBeam(step.id)
            //     })

            //     // Add to spatial parent's vertices
            //     const parent = Steps.get(step.parentId)
            //     assert(parent.parentFrameId != null, 'Parent has no spatial parent')
            //     const spatialParent = ApplicationState.actions[parent.parentFrameId]
            //     spatialParent.spatialVertices.add(step.id)
            // }
        }

        return {
            element,
            header,
            controls,
            container,
            placeholder,
            beam,
            path,
            prevStep: null,
        }
    }

    export function updateStepCFVRenderer(renderer: StepCFVRendererState, step: StepState) {
        // Update position
        if (!objEquals(renderer.prevStep?.controlFlow.position, step.controlFlow.position)) {
            renderer.container.style.top = `${step.controlFlow.position.y}px`
            renderer.container.style.left = `${step.controlFlow.position.x}px`
        }

        // Update size
        if (!objEquals(renderer.prevStep?.controlFlow.scale, step.controlFlow.scale)) {
            renderer.container.style.width = `${step.controlFlow.scale.width}px`
            renderer.container.style.height = `${step.controlFlow.scale.height}px`
        }

        renderer.prevStep = clone(step)
    }

    export function destroyStepCFVRenderer(step: StepCFVRendererState) {
        step.container.remove()

        step.beam?.remove()
        step.placeholder?.remove()
    }
}
