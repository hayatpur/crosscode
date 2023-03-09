import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../ApplicationState'
import { Editor, EditorInstance } from '../../Editor/Editor'
import { reflow } from '../../utilities/dom'
import { Step, Steps } from '../Step'

export enum LayoutType {
    Horizontal,
    Vertical,
}

export type LayoutSpec = {
    type: LayoutType
    padding: number
}

export function updateControlFlowLayout(stepId: string, spec: LayoutSpec) {
    const step = Steps.get(stepId)

    let x = 0
    let y = 0

    let w = 0
    let h = 0

    for (const childId of step.subSteps) {
        const child = Steps.get(childId)
        const childWidth = child.controlFlow.scale.width
        const childHeight = child.controlFlow.scale.height
        child.controlFlow.position.x = x
        child.controlFlow.position.y = y

        if (spec.type == LayoutType.Horizontal) {
            x += childWidth + spec.padding
            w += childWidth + spec.padding
            h = Math.max(h, childHeight)
        } else if (spec.type == LayoutType.Vertical) {
            y += childHeight + spec.padding
            h += childHeight + spec.padding
            w = Math.max(w, childWidth)
        } else {
            console.error('Unknown layout type')
        }
    }

    return { w, h }
}

export function updateControlFlowForStep(stepId: string) {
    const step = Steps.get(stepId)
    const cf = step.controlFlow

    const bbox = Step.getStepCoordinates(step.execution, step.parentId ? Steps.get(step.parentId).execution : undefined)

    // Scale by the proxy scale
    let height = bbox.height * ApplicationState.controlFlowHeightMultiplier
    let width = bbox.width * ApplicationState.controlFlowWidthMultiplier
    width = Math.max(10, width)
    height = Math.max(10, height)

    if (step.isShowingSteps) {
        const { w, h } = updateControlFlowLayout(stepId, { type: LayoutType.Vertical, padding: 10 })
        width = w
        height = h
    }

    cf.scale.height = height
    cf.scale.width = width

    // cf.element.style.height = `${height}px`
    // cf.element.style.width = `${width}px`

    // if (step.isFrame && cf.placeholder != null && step.execution.nodeData.type != 'Program') {
    //     cf.placeholder.style.height = `${height}px`
    //     cf.placeholder.style.width = `${width}px`
    // }

    // // Update classes
    // step.isShowingSteps ? cf.element.classList.add('is-showing-steps') : cf.element.classList.remove('is-showing-steps')

    // step.isShowingSteps
    //     ? cf.container.classList.add('is-showing-steps')
    //     : cf.container.classList.remove('is-showing-steps')

    // step.isFrame ? cf.container.classList.add('is-frame') : cf.container.classList.remove('is-frame')
    // step.isTrimmed ? cf.element.classList.add('is-trimmed') : cf.element.classList.remove('is-trimmed')
    // step.isPrimitive ? cf.element.classList.add('is-primitive') : cf.element.classList.remove('is-primitive')
    // step.isSkipped ? cf.container.classList.add('is-skipped') : cf.container.classList.remove('is-skipped')

    // // Add line break if necessary
    // if (step.execution.nodeData.hasLineBreak) {
    //     cf.container.classList.add('has-line-break')
    // } else {
    //     cf.container.classList.remove('has-line-break')
    // }

    // cf.element.setAttribute('title', getTitleFromExecution(step.execution))

    /* ------------------------------------------------------ */
    /*                 Dynamic Representations                */
    /* ------------------------------------------------------ */

    /* ------------- If statement representation ------------ */
    if (step.execution.nodeData.preLabel == 'Test') {
        if (!step.isShowingSteps) {
            // const memory = Object.values((step.execution.postcondition as EnvironmentState).memory)
            // const value = memory[memory.length - 1].value
            // // cf.element.classList.add(`_Test_${value}`)
            // const icon = value ? 'checkmark-outline' : 'close-outline'
            // cf.element.innerHTML = `<ion-icon name="${icon}"></ion-icon>`
        } else {
            // TODO
        }
    }

    /* -------------- Primitive representation -------------- */
    if (Step.isPrimitive(stepId)) {
        if (step.execution.nodeData.location == undefined) {
            throw new Error('Action has no location')
        }

        let label = Editor.getValueAt(EditorInstance.instance, step.execution.nodeData.location)

        if (label == undefined) {
            throw new Error('Action has no label')
        }

        if (step.execution.nodeData.preLabel == 'AssignmentEquals') {
            label = '='
        }

        cf.element.innerHTML = `${label.trim()}`

        monaco.editor.colorize(cf.element.innerHTML, 'javascript', {}).then((html) => {
            cf.element.innerHTML = html
            cf.element.classList.add('fit-width')
            reflow(cf.element)
            cf.element.style.width = `${cf.element.getBoundingClientRect().width}px`
            cf.element.classList.remove('fit-width')
        })
    }
}
