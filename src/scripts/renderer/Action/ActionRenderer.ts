import { Editor } from '../../editor/Editor'
import { Executor } from '../../executor/Executor'
import { createEl } from '../../utilities/dom'
import { getNumericalValueOfStyle } from '../../utilities/math'
import { Action } from './Action'

/* ------------------------------------------------------ */
/*                     Action Renderer                    */
/* ------------------------------------------------------ */
export class ActionRenderer {
    // Parent element
    element: HTMLElement

    // Header
    header: HTMLElement
    headerLabel: HTMLElement
    headerPreLabel: HTMLElement

    // Footer
    footer: HTMLElement
    footerLabel: HTMLElement
    footerPreLabel: HTMLElement

    // Timeline
    baseElement: HTMLElement

    // Body contains a timeline
    // body: HTMLElement
    stepContainer: HTMLElement
    viewContainer: HTMLElement

    // Expandable
    expandButton: HTMLElement

    // Controls
    // controlsContainer: HTMLElement
    // controls: HTMLElement[]

    // View controls
    // toggleView: HTMLElement
    mappingContainer: HTMLElement

    representationIndicatorContainer: HTMLElement

    /* ----------------------- Create ----------------------- */

    constructor() {
        // Create dom elements
        this.create()
    }

    create() {
        this.element = createEl('div', 'action')

        // Body
        this.stepContainer = createEl('div', 'action-step-container', this.element)
        this.mappingContainer = createEl('div', 'action-mapping-container', this.element)
        this.viewContainer = createEl('div', 'action-view-container', this.element)

        // Header
        this.header = createEl('div', 'action-header', this.stepContainer)
        this.headerPreLabel = createEl('div', 'action-pre-label', this.header)
        this.headerLabel = createEl('div', 'action-label', this.header)

        // Timeline
        this.baseElement = createEl('div', 'action-base', this.element)

        // Footer
        this.footer = createEl('div', 'action-footer', this.stepContainer)
        this.footerPreLabel = createEl('div', 'action-pre-label', this.footer)
        this.footerLabel = createEl('div', 'action-label', this.footer)

        this.expandButton = createEl('div', 'action-expand-button')

        // Representation
        this.representationIndicatorContainer = createEl(
            'div',
            'action-representation-indicator-container',
            this.header
        )

        // Controls
        // this.controlsContainer = createEl('div', 'action-controls', this.header)
        // this.controls = []
        // for (const label of ['A', 'B', 'C', 'D', 'E']) {
        //     const control = createEl('div', 'action-control-button', this.controlsContainer)
        //     control.innerHTML = label
        //     control.classList.add(`hidden`)
        //     this.controls.push(control)
        // }

        // View controls
        // this.toggleView = createEl('div', 'action-toggle-view', this.viewContainer)
        // this.toggleView.innerHTML = '<ion-icon name="chevron-back-outline"></ion-icon>'
    }

    /* ----------------------- Render ----------------------- */

    render(action: Action) {
        // Set label
        // this.preLabel.innerHTML = action.execution.nodeData.preLabel ?? ''

        // if (action.timeline.state.isRoot) {
        //     // TODO Fix
        //     this.preLabel.innerHTML = getLabelOfExecution(action.execution)
        // }
        // console.warn(action.state.isShowingView, action.execution.nodeData.type)

        this.updateClasses(action)

        this.renderSteps(action)
        this.renderViews(action)

        // Update mapping
        setTimeout(() => action.mapping?.render(), 100)
    }

    updateClasses(action: Action) {
        // Set classes
        action.execution.nodeData.type == 'Program'
            ? this.element.classList.add('program')
            : this.element.classList.remove('program')

        action.steps.length > 0
            ? this.element.classList.add('showing-steps')
            : this.element.classList.remove('showing-steps')

        action.state.inline
            ? this.element.classList.add('inline')
            : this.element.classList.remove('inline')

        action.state.isFocusedStep
            ? this.element.classList.add('focused-step')
            : this.element.classList.remove('focused-step')

        action.state.isShowingView
            ? this.element.classList.add('showing-view')
            : this.element.classList.remove('showing-view')

        action.state.inSitu
            ? this.element.classList.add('in-situ')
            : this.element.classList.remove('in-situ')
    }

    renderSteps(action: Action) {
        // Set position of steps and views
        this.stepContainer.innerHTML = ''
        this.stepContainer.appendChild(this.header)
        this.stepContainer.appendChild(this.baseElement)
        if (action.steps.length > 0) {
            for (let i = 0; i < action.steps.length; i++) {
                const step = action.steps[i]

                if (step.state.inSitu) {
                    // For statement
                    if (action.execution.nodeData.type == 'ForStatement') {
                        let headerSteps = new Set<string>(['Initial', 'Test', 'Update'])
                        if (headerSteps.has(step.execution.nodeData.preLabel)) {
                            this.stepContainer.appendChild(step.renderer.element)
                            const stepBbox = Editor.instance.computeBoundingBoxForLoc(
                                step.execution.nodeData.location
                            )
                            const parentBbox = Editor.instance.computeBoundingBoxForLoc(
                                action.execution.nodeData.location
                            )

                            step.renderer.element.style.left = `${stepBbox.x - parentBbox.x + 2}px`
                            step.renderer.element.style.top = `${stepBbox.y - parentBbox.y}px`
                        } else {
                            step.renderer.element.style.left = `30px`
                            step.renderer.element.style.top = `35px`
                        }
                    }
                    // Others
                    else {
                        this.stepContainer.appendChild(step.renderer.element)
                        const stepBbox = Editor.instance.computeBoundingBoxForLoc(
                            step.execution.nodeData.location
                        )
                        const parentBbox = Editor.instance.computeBoundingBoxForLoc(
                            action.execution.nodeData.location
                        )

                        const stepX = stepBbox.x - parentBbox.x
                        const stepY = stepBbox.y - parentBbox.y

                        step.renderer.element.style.left = `${stepX + 2}px`
                        step.renderer.element.style.top = `${stepY}px`
                    }
                }
                if (step.state.inline) {
                    this.stepContainer.appendChild(step.renderer.element)

                    if (step instanceof Action && step.state.isFocusedStep) {
                        // Move to where the focus is
                        const area = action.interactionAreas.find(
                            (area) => area.execution == step.execution
                        )
                        if (area) {
                            const left = getNumericalValueOfStyle(area.element.style.left, 0)
                            step.state.position.x = left
                        }
                    }
                } else {
                    // TODO: Why is this executing every frame?
                    // console.warn('Rendering step')
                    // Set position
                    const thisBbox = this.element.getBoundingClientRect()
                    const stepBbox = step.renderer.element.getBoundingClientRect()
                    const vizBbox = Executor.instance.visualization.element.getBoundingClientRect()
                    const camera = Executor.instance.visualization.camera

                    step.state.position.x =
                        thisBbox.x + thisBbox.width - vizBbox.x - camera.state.position.x + 100
                    step.state.position.y = Executor.instance.visualization.root.state.position.y
                    step.renderer.render(step)
                    // camera.state.position.y
                }
            }
        }
        this.stepContainer.appendChild(this.footer)
    }

    renderViews(action: Action) {
        // Set position of steps and views
        this.viewContainer.innerHTML = ''

        if (action.state.isShowingView) {
            // View
            for (let i = 0; i < action.views.length; i++) {
                const view = action.views[i]
                this.viewContainer.appendChild(view.renderer.element)
            }
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.element.remove()

        this.element = null

        this.header = null
        this.headerLabel = null
        this.headerPreLabel = null

        this.footer = null
        this.footerLabel = null
        this.footerPreLabel = null
    }
}
