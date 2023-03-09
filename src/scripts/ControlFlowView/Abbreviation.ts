import { ApplicationState } from '../ApplicationState'
import { getAccumulatedBoundingBoxForElements } from '../utilities/action'
import { createElement } from '../utilities/dom'
import { assert } from '../utilities/generic'
import { getTotalDuration } from './ControlFlowCursor'
import { consumeStep } from './Dynamic/ConsumeStep'
import { Steps } from './Step'

export enum AbbreviationKind {
    Normal = 'Normal',
    ForLoop = 'ForLoop',
    Spatial = 'Spatial',
}

export type AbbreviationFrameChild = {
    value: string
    children: AbbreviationFrameChild[]
    element: HTMLElement | null
}

export type AbbreviationState = {
    id: string
    kind: AbbreviationKind

    // For abbreviations that are over breadth (for loops)
    containerActionId: string | null
    startIndex: number
    numItems: number

    // For abbreviations that are over depth (function calls)
    referenceActionId: AbbreviationFrameChild | null

    // HTML
    element: HTMLElement
    dotsContainer: HTMLElement
    dots: HTMLElement[]
    label: HTMLElement

    // If the abbreviations collapses actions in the middle
    expanded: boolean
}

export class Abbreviations {
    static abbreviations: { [id: string]: AbbreviationState } = {}

    static add(abbreviation: AbbreviationState) {
        Abbreviations.abbreviations[abbreviation.id] = abbreviation
    }

    static remove(abbreviation: AbbreviationState) {
        delete Abbreviations.abbreviations[abbreviation.id]
    }

    static get(id: string): AbbreviationState {
        return Abbreviations.abbreviations[id]
    }
}

export namespace Abbreviation {
    let _AbbreviationId = 0
    export function createAbbreviation(overrides: Partial<AbbreviationState>): AbbreviationState {
        const id = `Abbreviation(${++_AbbreviationId})`

        const element = createElement('div', 'action-proxy-abbreviation')
        assert(overrides.numItems != null, 'Number of items must be specified')

        const dotsContainer = createElement('div', 'action-proxy-abbreviation-dots-container', element)
        const label = createElement('div', 'action-proxy-abbreviation-label', element)

        const base: AbbreviationState = {
            id,
            kind: AbbreviationKind.Normal,

            containerActionId: null,
            startIndex: 0,
            numItems: 0,

            referenceActionId: null,

            element,
            dots: [],
            label,
            dotsContainer,

            expanded: false,
        }

        // Apply overrides
        Object.assign(base, overrides)

        Abbreviations.add(base)

        // Consume the elements in the abbreviation
        const abbreviation = Abbreviations.get(id)
        if (abbreviation.kind != AbbreviationKind.Spatial) {
            assert(abbreviation.containerActionId != null, 'Container action ID must be specified')
            const container = Steps.get(abbreviation.containerActionId)

            for (let i = abbreviation.startIndex; i < abbreviation.startIndex + abbreviation.numItems; i++) {
                const vertexId = container.subSteps[i]
                const vertex = Steps.get(vertexId)

                if (abbreviation.kind == AbbreviationKind.ForLoop) {
                    const iteration = Math.floor(Math.max(0, (i - 1) / 3))
                    const representation = container.representation as ForStatementRepresentation
                    representation.consumeIteration(iteration)
                } else {
                    consumeStep(vertex.id)
                }
            }
        } else {
            assert(abbreviation.referenceActionId != null, 'Reference action ID must be specified')

            let stack: AbbreviationFrameChild[] = [abbreviation.referenceActionId]

            while (stack.length > 0) {
                const current = stack.pop()!

                const vertex = Steps.get(current.value)
                consumeStep(vertex.id)

                stack.push(...current.children)
            }
        }

        dotsContainer.onclick = (e) => {
            toggleExpandedAbyss(abbreviation.id)

            e.preventDefault()
            e.stopPropagation()
        }

        // Update abbreviation visual
        updateAbyssVisual(id)

        return base
    }

    export function toggleExpandedAbyss(id: string) {
        const abbreviation = Abbreviations.get(id)
        abbreviation.expanded = !abbreviation.expanded

        updateAbyssVisual(id)

        if (abbreviation.kind != AbbreviationKind.Spatial) {
            const container = Steps.get(abbreviation.containerActionId!)
            // Steps.get(container.parentFrameId!).representation.dirtyFrames = true
        }
    }

    export function isIterationTestInMiddleOfAbyss(
        abbreviation: AbbreviationState,
        index: number,
        stepId: string
    ): boolean {
        if (index - abbreviation.startIndex > 5 && abbreviation.startIndex + abbreviation.numItems - index > 5) {
            return true
        }

        return false
    }

    export function getAbyssControlFlowPoints(
        abbreviation: AbbreviationState,
        index: number
    ): [[number, number], [number, number]] {
        const bbox = abbreviation.dotsContainer.getBoundingClientRect()

        if (abbreviation.kind == AbbreviationKind.ForLoop) {
            const iteration = Math.floor(Math.max(0, (index - 1) / 3))

            const startIteration = Math.floor(Math.max(0, abbreviation.startIndex / 3))
            const totalIterations = Math.floor(Math.max(0, abbreviation.numItems / 3))

            // console.log('startIteration', startIteration) // 1
            // console.log('totalIterations', totalIterations) // 2

            if (!abbreviation.expanded) {
                let bbox_dot: DOMRect

                if (iteration == startIteration) {
                    // At the start
                    bbox_dot = abbreviation.dots[0].getBoundingClientRect()
                } else if (iteration == startIteration + totalIterations - 1 && totalIterations >= 2) {
                    // At the end
                    if (totalIterations > 2) {
                        bbox_dot = abbreviation.dots[2].getBoundingClientRect()
                    } else {
                        bbox_dot = abbreviation.dots[1].getBoundingClientRect()
                    }
                } else {
                    // In the middle
                    bbox_dot = abbreviation.dots[1].getBoundingClientRect()
                    // const segmentSize = bbox.width / (totalIterations - 2)

                    // console.log(
                    //     bbox.x + segmentSize * (iteration - startIteration - 1),
                    //     bbox.x + segmentSize * (iteration - startIteration)
                    // )

                    return [
                        [bbox_dot.x, bbox_dot.y + bbox_dot.height / 2],
                        [bbox_dot.x + bbox_dot.width, bbox_dot.y + bbox_dot.height / 2],
                    ]
                }

                return [
                    [bbox_dot.x, bbox_dot.y + bbox_dot.height / 2],
                    [bbox_dot.x + bbox_dot.width, bbox_dot.y + bbox_dot.height / 2],
                ]
            }
        }

        const segmentSize = bbox.width / abbreviation.numItems

        return [
            [bbox.x + segmentSize * (index - abbreviation.startIndex), bbox.y + bbox.height / 2],
            [bbox.x + segmentSize * (index - abbreviation.startIndex + 1), bbox.y + bbox.height / 2],
        ]
    }

    export function getSpatialAbyssControlFlowPoints(
        abbreviation: AbbreviationState,
        id: string
    ): [[number, number], [number, number]] {
        const bbox = abbreviation.dotsContainer.getBoundingClientRect()
        const segmentSize = bbox.width / abbreviation.numItems

        return [
            [bbox.x, bbox.y + bbox.height / 2],
            [bbox.x + bbox.width, bbox.y + bbox.height / 2],
        ]
    }

    export type AbyssInfo = {
        id: string
        index: number | null
    }

    export function getConsumedAbyss(stepId: string): AbyssInfo | null {
        const step = Steps.get(stepId)
        const spatialParent = Steps.get(step.parentFrameId!)

        let isSpatiallyConsumed =
            (step.isFrame && step.controlFlow.container.classList.contains('consumed')) ||
            spatialParent.controlFlow.container.classList.contains('consumed')

        let isNormalConsumed =
            !isSpatiallyConsumed &&
            (step.controlFlow.container.classList.contains('consumed') ||
                (step.controlFlow.container.parentElement?.parentElement?.classList.contains('consumed') &&
                    step.controlFlow.container.parentElement?.parentElement?.classList.contains(
                        'action-proxy-for-iteration'
                    )))

        if (!isSpatiallyConsumed && !isNormalConsumed) {
            return null
        }

        if (isSpatiallyConsumed) {
            for (const [id, abbreviation] of Object.entries(Abbreviations.abbreviations)) {
                if (abbreviation.kind != AbbreviationKind.Spatial) {
                    continue
                }

                const search = [abbreviation.referenceActionId]
                while (search.length > 0) {
                    const current = search.pop()!
                    if (current.value == spatialParent.id) {
                        return { id, index: null }
                    }

                    search.push(...current.children)
                }
            }

            console.log("Couldn't find spatial abbreviation for consumed action", stepId)
        }

        if (isNormalConsumed) {
            // Find the abbreviation that it's in
            const container = Steps.get(step.parentId!)
            const selfIndex = container.subSteps.indexOf(step.id)
            for (const abbreviationId of container.abbreviationIds) {
                const abbreviation = Abbreviations.get(abbreviationId)
                if (
                    abbreviation.startIndex <= selfIndex &&
                    abbreviation.startIndex + abbreviation.numItems >= selfIndex
                ) {
                    return { id: abbreviation.id, index: selfIndex }
                }
            }

            console.log("Couldn't find abbreviation for consumed action", stepId)
        }

        return null
    }

    export function updateAbyssVisual(abbreviationId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)

        // Destroy it if it has 0 items
        if (abbreviation.numItems == 0 && abbreviation.kind != AbbreviationKind.Spatial) {
            destroyAbyss(abbreviationId)
            return
        }

        // TODO: Check for destroying spatial

        // Remove existing dots
        abbreviation.dots.forEach((dot) => dot.remove())

        // Update number of dots
        const dots: HTMLElement[] = []

        let totalItems = abbreviation.numItems

        if (abbreviation.kind == AbbreviationKind.ForLoop) {
            totalItems = Math.floor(Math.max(0, abbreviation.numItems / 3))
        }

        if (abbreviation.kind == AbbreviationKind.Spatial) {
            let count = 0
            let stack: AbyssSpatialChild[] = [abbreviation.referenceActionId!]

            while (stack.length > 0) {
                const current = stack.pop()!
                count++
                stack.push(...current.children)
            }

            totalItems = count
        }

        if (abbreviation.kind != AbbreviationKind.Spatial) {
            let numDots = abbreviation.expanded ? totalItems : Math.min(3, totalItems)
            for (let i = 0; i < numDots; i++) {
                dots.push(createElement('div', 'action-proxy-abbreviation-dot', abbreviation.dotsContainer))
            }

            // Event listeners
            dots[0].onclick = (e) => {
                if (e.ctrlKey || e.metaKey) {
                    popAbyssFromStart(abbreviationId)
                } else {
                    navigateToStartOfAbyss(abbreviationId)
                }

                e.preventDefault()
                e.stopPropagation()
            }

            if (dots.length > 1) {
                const last = dots[dots.length - 1]
                last.onclick = (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        popAbyssFromEnd(abbreviationId)
                    } else {
                        navigateToEndOfAbyss(abbreviationId)
                    }

                    e.preventDefault()
                    e.stopPropagation()
                }
            }

            if (dots.length == 3 && !abbreviation.expanded) {
                dots[1].onclick = (e) => {
                    if (e.ctrlKey || e.metaKey) {
                    } else {
                        navigateToMidOfAbyss(abbreviationId)
                    }

                    e.preventDefault()
                    e.stopPropagation()
                }
            }

            if (dots.length > 2 && abbreviation.expanded) {
                for (let k = 1; k < dots.length - 1; k++) {
                    dots[k].onclick = (e) => {
                        if (e.ctrlKey || e.metaKey) {
                        } else {
                            navigateToIndexOfAbyss(abbreviationId, k)
                        }

                        e.preventDefault()
                        e.stopPropagation()
                    }
                }
            }

            // Width and label
            if (totalItems > 3 && !abbreviation.expanded) {
                dots[1].style.width = `${Math.min(totalItems * 2, 10)}px`
            } else {
                abbreviation.element.style.width = 'inherit'
            }

            abbreviation.label.innerText = `${totalItems} more`

            assert(abbreviation.containerActionId != null, 'Container action ID must be specified')
            const container = Steps.get(abbreviation.containerActionId)
            const startAction = ApplicationState.actions[container.subSteps[abbreviation.startIndex]]

            if (abbreviation.kind == AbbreviationKind.Normal) {
                startAction.controlFlowRenderer.container.after(abbreviation.element)
            } else {
                startAction.controlFlowRenderer.container.parentElement?.parentElement?.after(abbreviation.element)
            }
        } else {
            assert(abbreviation.referenceActionId != null, 'Reference action ID must be specified')
            const elements = updateSpatialDotsPosition(
                abbreviation.referenceActionId,
                { x: 5, y: 5 },
                abbreviation.dotsContainer,
                null,
                abbreviation
            )

            // Update width
            const accBbox = getAccumulatedBoundingBoxForElements(elements)
            abbreviation.dotsContainer.style.width = `${accBbox.width + 12}px`
            abbreviation.dotsContainer.style.height = `${accBbox.height + 11}px`

            abbreviation.element.classList.add('is-frame')

            const reference = ApplicationState.actions[abbreviation.referenceActionId.value]
            reference.controlFlowRenderer.container.append(abbreviation.element)

            // Setup event listeners
            const stack = [abbreviation.referenceActionId]
            while (stack.length > 0) {
                const current = stack.pop()!

                current.element!.onclick = (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        if (current.children.length == 0) {
                            popLeafFromSpatialAbyss(abbreviationId, current.value)
                        } else if (abbreviation.referenceActionId == current) {
                            popRootFromSpatialAbyss(abbreviationId)
                        }
                    } else {
                        navigateToSpatialAbyss(abbreviationId, current.value)
                    }

                    e.preventDefault()
                    e.stopPropagation()
                }

                stack.push(...current.children)
            }

            abbreviation.label.innerText = `${totalItems} more`
        }

        // Update dots
        abbreviation.dots = dots
    }

    export function navigateToSpatialAbyss(abbreviationId: string, target: string) {}

    export function popLeafFromSpatialAbyss(abbreviationId: string, target: string) {
        const abbreviation = Abbreviations.get(abbreviationId)
        // console.log(clone(abbreviation.referenceActionId))

        // Find target
        const stack: [AbyssSpatialChild, AbyssSpatialChild | null][] = [[abbreviation.referenceActionId!, null]]
        let targetAndTargetParent: [AbyssSpatialChild, AbyssSpatialChild | null] | null = null

        while (stack.length > 0) {
            const current = stack.pop()!

            if (current[0].value == target) {
                targetAndTargetParent = current
                break
            }

            for (const child of current[0].children) {
                stack.push([child, current[0]])
            }
        }

        if (targetAndTargetParent == null) {
            console.warn("Can't find leaf to remove")
            return
        }

        const [targetChild, targetParent] = targetAndTargetParent
        targetParent!.children.splice(targetParent!.children.indexOf(targetChild), 1)

        targetChild.element!.remove()

        const action = ApplicationState.actions[targetChild.value]
        action.representation.unConsume()

        // Update visual
        updateAbyssVisual(abbreviationId)

        // console.log(clone(abbreviation.referenceActionId))

        const program = ApplicationState.actions[ControlFlowViewInstance.instance.rootStepId!]
        program.representation.dirtyFrames = true
    }

    export function popRootFromSpatialAbyss(abbreviationId: string) {}

    export function navigateToStartOfAbyss(abbreviationId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)
        const container = Steps.get(abbreviation.containerActionId!)

        const startAction = ApplicationState.actions[container.subSteps[abbreviation.startIndex]]

        const spatial = Steps.get(container.parentFrameId!)
        const controlFlow = spatial.controlFlow!

        const selection = TimeMarkers.get(controlFlow.cursor.stepId)
        selection.targetGlobalTime = startAction.globalTimeOffset + getTotalDuration(startAction.id)
    }

    export function navigateToEndOfAbyss(abbreviationId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)
        const container = Steps.get(abbreviation.containerActionId!)

        const endAction =
            ApplicationState.actions[container.subSteps[abbreviation.startIndex + abbreviation.numItems - 1]]

        const spatial = Steps.get(container.parentFrameId!)
        const controlFlow = spatial.controlFlow!

        const selection = TimeMarkers.get(controlFlow.cursor.stepId)
        selection.targetGlobalTime = endAction.globalTimeOffset + getTotalDuration(endAction.id)
    }

    export function navigateToMidOfAbyss(abbreviationId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)
        const container = Steps.get(abbreviation.containerActionId!)

        let midIndex =
            abbreviation.kind == AbbreviationKind.ForLoop ? abbreviation.startIndex + 3 : abbreviation.startIndex + 1

        if (abbreviation.kind == AbbreviationKind.ForLoop && abbreviation.startIndex == 0) {
            midIndex += 1
        }

        const endAction =
            ApplicationState.actions[container.subSteps[abbreviation.startIndex + abbreviation.numItems - 1]]

        const spatial = Steps.get(container.parentFrameId!)
        const controlFlow = spatial.controlFlow!

        const selection = TimeMarkers.get(controlFlow.cursor.stepId)
        selection.targetGlobalTime = endAction.globalTimeOffset + getTotalDuration(endAction.id)
    }

    export function navigateToIndexOfAbyss(abbreviationId: string, index: number) {
        const abbreviation = Abbreviations.get(abbreviationId)
        const container = Steps.get(abbreviation.containerActionId!)

        let actualIndex = abbreviation.startIndex + index

        if (abbreviation.kind == AbbreviationKind.ForLoop) {
            actualIndex = 4 + index * 3

            if (index == 0) {
                actualIndex = 0
            }
        }

        const action = ApplicationState.actions[container.subSteps[actualIndex]]
        const spatial = Steps.get(container.parentFrameId!)
        const controlFlow = spatial.controlFlow!

        const selection = TimeMarkers.get(controlFlow.cursor.stepId)
        selection.targetGlobalTime = action.globalTimeOffset + getTotalDuration(step.id)
    }

    export function getActionLocationInAbyss(abbreviationId: string, stepId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)
        const step = Steps.get(stepId)

        if (abbreviation.kind == AbbreviationKind.Spatial) {
            let stack: AbyssSpatialChild[] = [abbreviation.referenceActionId!]

            while (stack.length > 0) {
                const current = stack.pop()!
                if (current.value == stepId) {
                    return current.element
                }

                stack.push(...current.children)
            }
        } else {
            const container = Steps.get(step.parentId!)
            const selfIndex = container.subSteps.indexOf(step.id)

            if (selfIndex == abbreviation.startIndex) {
                return abbreviation.dots[0]
            } else if (selfIndex == abbreviation.startIndex + abbreviation.numItems - 1) {
                return abbreviation.dots[abbreviation.dots.length - 1]
            } else {
                return abbreviation.dots[1]
            }
        }

        return null
    }

    export function updateSpatialDotsPosition(
        node: AbyssSpatialChild,
        offset: { x: number; y: number },
        container: HTMLElement,
        relativeTo: HTMLElement | null,
        abbreviation: AbbreviationState
    ): HTMLElement[] {
        const childrenElements: HTMLElement[] = []

        // Create dot
        if (node.element == null) {
            node.element = createElement(
                'div',
                ['action-proxy-abbreviation-dot', 'action-proxy-abbreviation-dot-spatial'],
                container
            )
        }

        // Update self
        let x = 0
        let y = 0

        let isInMiddle = relativeTo != null && node.children.length > 0

        if (isInMiddle) {
            // Check if last one
            const lastChild = node.children[node.children.length - 1]
            if (lastChild.children.length == 0) {
                isInMiddle = false
            }
        }

        if (relativeTo != null) {
            const parentBbox = relativeTo.getBoundingClientRect()
            const containerBbox = container.getBoundingClientRect()

            x = parentBbox.x + parentBbox.width + offset.x - containerBbox.x
            y = parentBbox.y + offset.y - containerBbox.y
        } else {
            x = offset.x
            y = offset.y
        }

        node.element.style.left = `${x}px`
        node.element.style.top = `${y}px`

        childrenElements.push(node.element)

        // Update children
        const rOffset = { x: 2, y: 0 }

        if (isInMiddle && !abbreviation.expanded) {
            rOffset.x = -5
        }

        node.children.forEach((child) => {
            const childElements: HTMLElement[] = []
            childElements.push(
                ...updateSpatialDotsPosition(child, { ...rOffset }, container, node.element!, abbreviation)
            )

            // If hit something
            if (childElements.length > 0) {
                const bbox = getAccumulatedBoundingBoxForElements(childElements)
                rOffset.y += bbox.height + 2
            }

            childrenElements.push(...childElements)
        })

        return childrenElements
    }

    export function destroyAbyss(abbreviationId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)
        abbreviation.element.remove()

        // Free the consumed items
        if (abbreviation.kind != AbbreviationKind.Spatial) {
            const container = ApplicationState.actions[abbreviation.containerActionId as string]
            for (let i = abbreviation.startIndex; i < abbreviation.startIndex + abbreviation.numItems; i++) {
                const vertexId = container.steps[i]
                const vertex = Steps.get(vertexId)

                if (abbreviation.kind == AbbreviationKind.ForLoop) {
                    const iteration = Math.floor(Math.max(0, (i - 1) / 3))
                    const representation = container.representation as ForStatementRepresentation
                    representation.unConsumeIteration(iteration)
                } else {
                    vertex.representation.unConsume()
                }
            }
        } else {
            assert(abbreviation.referenceActionId != null, 'Reference action ID must be specified')

            let stack: AbyssSpatialChild[] = [abbreviation.referenceActionId]

            while (stack.length > 0) {
                const current = stack.pop()!

                const vertex = Steps.get(current.value)
                vertex.representation.unConsume()

                stack.push(...current.children)
            }
        }

        for (const action of Object.values(ApplicationState.actions)) {
            if (action.abbreviationIds.includes(abbreviationId)) {
                action.abbreviationIds.splice(action.abbreviationIds.indexOf(abbreviationId), 1)
            }
        }

        ApplicationState.actions[ControlFlowViewInstance.instance.rootStepId!].representation.dirtyFrames = true

        delete Abbreviations.get(abbreviationId)
    }

    export function popAbyssFromStart(abbreviationId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)

        if (abbreviation.containerActionId != null) {
            const container = Steps.get(abbreviation.containerActionId)
            const stepId = container.subSteps[abbreviation.startIndex]
            const step = Steps.get(stepId)

            if (abbreviation.kind == AbbreviationKind.Normal) {
                action.representation.unConsume()

                abbreviation.startIndex += 1
                abbreviation.numItems -= 1

                action.representation.focus()
            } else if (abbreviation.kind == AbbreviationKind.ForLoop) {
                let numItems = abbreviation.startIndex == 0 ? 4 : 3
                let iterationIndex = Math.floor(Math.max(0, (abbreviation.startIndex - 1) / 3))

                const representation = container.representation as ForStatementRepresentation
                representation.unConsumeIteration(iterationIndex)

                abbreviation.startIndex += numItems
                abbreviation.numItems -= numItems

                updateForLoopAbyss(container.id, iterationIndex)

                Steps.get(step.parentFrameId!).representation.dirtyFrames = true
            }
        } else {
            // TODO
        }

        updateAbyssVisual(abbreviationId)
    }

    export function popAbyssFromEnd(abbreviationId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)

        if (abbreviation.containerActionId != null) {
            const container = Steps.get(abbreviation.containerActionId)
            const stepId = container.subSteps[abbreviation.startIndex + abbreviation.numItems - 1]
            const step = Steps.get(stepId)

            if (abbreviation.kind == AbbreviationKind.Normal) {
                // Remove consumed
                action.representation.unConsume()

                // TODO: Set focus

                // Update abbreviation
                abbreviation.numItems -= 1
            } else if (abbreviation.kind == AbbreviationKind.ForLoop) {
                // Update abbreviation
                let numItems = abbreviation.startIndex + abbreviation.numItems - 1 == 0 ? 4 : 3
                let iterationIndex = Math.floor(Math.max(0, (abbreviation.startIndex + abbreviation.numItems - 2) / 3))

                const representation = container.representation as ForStatementRepresentation
                representation.unConsumeIteration(iterationIndex)

                // clearExistingFocus()
                // focusIteration(container.id, iterationIndex)

                abbreviation.numItems -= numItems

                // Collapse un-focused iterations.
                updateForLoopAbyss(container.id, iterationIndex)

                Steps.get(step.parentFrameId!).representation.dirtyFrames = true
            }
        } else {
            // TODO
        }

        updateAbyssVisual(abbreviationId)
    }

    export function expandAbyssForward(abbreviationId: string, length: number = 1) {
        const abbreviation = Abbreviations.get(abbreviationId)
        assert(abbreviation.containerActionId != null, 'Container action id must not be null')

        const container = Steps.get(abbreviation.containerActionId)

        if (abbreviation.kind == AbbreviationKind.Normal) {
            for (
                let i = abbreviation.startIndex + abbreviation.numItems;
                i < abbreviation.startIndex + abbreviation.numItems + length;
                i++
            ) {
                const vertexId = container.subSteps[i]
                const vertex = Steps.get(vertexId)
                consumeStep(vertex.id)
            }

            abbreviation.numItems += length
        } else {
            let iterationIndex = Math.floor(Math.max(0, (abbreviation.startIndex + abbreviation.numItems - 1) / 3))

            // Consume elements
            for (let iter = iterationIndex; iter < iterationIndex + length; iter++) {
                const representation = container.representation as ForStatementRepresentation
                representation.consumeIteration(iter)
            }

            // Update indices
            let numItems = iterationIndex == 0 ? 4 : 3
            abbreviation.numItems += numItems + (length - 1) * 3
        }

        Steps.get(container.parentFrameId!).representation.dirtyFrames = true

        updateAbyssVisual(abbreviationId)
    }

    export function expandAbyssBackward(abbreviationId: string, length: number = 1) {
        const abbreviation = Abbreviations.get(abbreviationId)
        assert(abbreviation.containerActionId != null, 'Container action id must not be null')

        const container = Steps.get(abbreviation.containerActionId)

        if (abbreviation.kind == AbbreviationKind.Normal) {
            for (let i = abbreviation.startIndex - length; i < abbreviation.startIndex; i++) {
                const vertexId = container.subSteps[i]
                const vertex = Steps.get(vertexId)
                consumeStep(vertex.id)
            }

            abbreviation.startIndex -= length
            abbreviation.numItems += length
        } else if (abbreviation.kind == AbbreviationKind.ForLoop) {
            let iterationIndex = Math.floor(Math.max(0, (abbreviation.startIndex - 1) / 3))

            // Consume elements
            for (let iter = iterationIndex - length; iter < iterationIndex; iter++) {
                const representation = container.representation as ForStatementRepresentation
                representation.consumeIteration(iter)
            }

            let numItems = iterationIndex - length == 0 ? 4 : 3

            // Update indices
            abbreviation.startIndex -= numItems + (length - 1) * 3
            abbreviation.numItems += numItems + (length - 1) * 3
        }

        Steps.get(container.parentFrameId!).representation.dirtyFrames = true
        updateAbyssVisual(abbreviationId)
    }

    export function expandSpatialAbyssForward(abbreviationId: string, newActionId: string) {
        const newAction = ApplicationState.actions[newActionId]
        assert(newAction.isSpatial, 'New action must be spatial.')

        // Expand abbreviation to include this this action
        const abbreviation = Abbreviations.get(abbreviationId)

        // Find index of parent abbreviation
        let search = [abbreviation.referenceActionId]
        let found: AbyssSpatialChild | null = null
        while (search.length > 0) {
            const current = search.pop()!
            const currentAction = Steps.get(current.value)

            if (currentAction.spatialVertices != null && currentAction.spatialVertices.has(newActionId)) {
                found = current

                break
            }

            if (current.children != null) {
                search = search.concat(current.children)
            }
        }

        assert(found != null, 'Action must be a child of the parent abbreviation.')

        // Expand abbreviation
        if (found.children == null) {
            found.children = []
        }

        found.children.push({
            value: newActionId,
            children: [],
            element: null,
        })

        newAction.representation.consume()

        updateAbyssVisual(abbreviationId)
    }

    export function collapseActionIntoAbyss(stepId: string) {
        const step = Steps.get(stepId)

        if (step.isFrame) {
            // Check parent for having a spatial abbreviation
            const parent = Steps.get(step.parentId!)
            const parentAbyssInfo = getConsumedAbyss(parent.id)

            if (parentAbyssInfo == null) {
                console.log('Creating a new abbreviation.', parent)
                const newAbyss = createAbyss({
                    referenceActionId: { value: step.id, children: [], element: null },
                    numItems: 1,
                    kind: AbbreviationKind.Spatial,
                })
                action.abbreviationIds.push(newAbyss.id)
            } else {
                expandSpatialAbyssForward(parentAbyssInfo.id, step.id)
            }
        } else {
            const parent = Steps.get(step.parentId!)
            const index = parent.vertices.indexOf(stepId)

            // If there are any abbreviations which are adjacent to the index
            let abbreviation: AbbreviationState | null = null
            let isAfter = false

            for (const candidateAbyssId of parent.abbreviationIds) {
                const candidate = ApplicationState.abbreviations[candidateAbyssId]

                if (candidate.startIndex - index == 1) {
                    abbreviation = candidate
                } else if (candidate.startIndex + candidate.numItems - index == 0) {
                    abbreviation = candidate
                    isAfter = true
                }
            }

            // Create abbreviation if it doesn't exist
            if (abbreviation == null) {
                const newAbyss = createAbyss({
                    containerActionId: step.parentId,
                    startIndex: index,
                    numItems: 1,
                })
                parent.abbreviationIds.push(newAbyss.id)
            } else {
                // Update abbreviation to account for the new action
                if (isAfter) {
                    expandAbyssForward(abbreviation.id)
                } else {
                    expandAbyssBackward(abbreviation.id)
                }
            }
        }
    }

    export function collapseForIterationIntoAbyss(forActionId: string, iterationIndex: number) {
        const forAction = ApplicationState.actions[forActionId]

        // Find the adjacent abbreviation
        let adjacentAbyss: AbyssState | null = null
        let isAfter = false

        for (const candidateAbyssId of forAction.abbreviationIds) {
            const candidate = ApplicationState.abbreviations[candidateAbyssId]
            let index = iterationIndex * 3 + 1
            let numItems = 3

            if (iterationIndex == 0) {
                index = 0
                numItems = 4
            }

            if (candidate.startIndex - index - numItems == 0) {
                adjacentAbyss = candidate
            } else if (candidate.startIndex + candidate.numItems - index == 0) {
                adjacentAbyss = candidate
                isAfter = true
            }
        }

        if (adjacentAbyss == null) {
            let startIndex = iterationIndex * 3 + 1
            let numItems = 3

            if (iterationIndex == 0) {
                startIndex = 0
                numItems = 4
            }

            const abbreviation = createAbyss({
                containerActionId: forAction.id,
                startIndex: startIndex,
                numItems: numItems,
                kind: AbbreviationKind.ForLoop,
            })
            forAction.abbreviationIds.push(abbreviation.id)
            updateAbyssVisual(abbreviation.id)
        } else {
            if (isAfter) {
                expandAbyssForward(adjacentAbyss.id)
            } else {
                expandAbyssBackward(adjacentAbyss.id)
            }
        }

        ApplicationState.actions[forAction.parentFrameId!].representation.dirtyFrames = true
    }

    export function updateForLoopAbyss(forActionId: string, focusIteration: number, forced: boolean = false) {
        const forAction = ApplicationState.actions[forActionId]

        // Collapse any iterations that are not selected
        const totalVertices = (forAction.vertices.length - 2) / 3

        if (!ApplicationState.visualization.PARAMS.Closure && !forced) {
            return
        }

        for (let iter = 0; iter < totalVertices; iter++) {
            let startIndex = iter * 3 + 1
            let numItems = 3

            if (iter == 0) {
                startIndex = 0
                numItems = 4
            }

            // If vertex is selected
            let isSelected = iter == focusIteration

            if (!isSelected) {
                const representation = forAction.representation as ForStatementRepresentation
                const isConsumed = representation.iterationElements[iter].classList.contains('consumed')

                if (!isConsumed) {
                    collapseForIterationIntoAbyss(forActionId, iter)
                }
            }
        }
    }

    export function updateAbyssSelection(abbreviationId: string) {
        const abbreviation = Abbreviations.get(abbreviationId)

        if (abbreviation.kind != AbbreviationKind.Spatial) {
            const container = Steps.get(abbreviation.containerActionId!)

            // Update first dot
            const firstIter = ApplicationState.actions[container.subSteps[abbreviation.startIndex]]
            if (firstIter.representation.isSelected) {
                abbreviation.dots[0].classList.add('is-selected')
            } else {
                abbreviation.dots[0].classList.remove('is-selected')
            }

            // Update mid (if it exists)
            {
                let isMidSelected = false
                let midStart =
                    abbreviation.startIndex +
                    (abbreviation.kind == AbbreviationKind.ForLoop ? (abbreviation.startIndex == 0 ? 4 : 3) : 1)
                let midEnd =
                    abbreviation.kind == AbbreviationKind.ForLoop
                        ? abbreviation.startIndex + abbreviation.numItems - 3
                        : abbreviation.startIndex + abbreviation.numItems - 1
                let midIncrement = abbreviation.kind == AbbreviationKind.ForLoop ? 3 : 1

                if (!abbreviation.expanded && abbreviation.dots.length > 2) {
                    for (let i = midStart; i < midEnd; i += midIncrement) {
                        const item = ApplicationState.actions[container.subSteps[i]]
                        if (item.representation.isSelected) {
                            isMidSelected = true
                            break
                        }
                    }

                    if (isMidSelected) {
                        abbreviation.dots[1].classList.add('is-selected')
                    } else {
                        abbreviation.dots[1].classList.remove('is-selected')
                    }
                } else {
                    for (let i = midStart; i < midEnd; i += midIncrement) {
                        const item = ApplicationState.actions[container.subSteps[i]]
                        let k =
                            abbreviation.kind == AbbreviationKind.ForLoop ? Math.floor(Math.max(0, (i - 1) / 3)) - 1 : i

                        if (item.representation.isSelected) {
                            abbreviation.dots[k].classList.add('is-selected')
                        } else {
                            abbreviation.dots[k].classList.remove('is-selected')
                        }
                    }
                }
            }

            // Update last dot
            if (abbreviation.dots.length > 1) {
                const lastIter =
                    ApplicationState.actions[container.subSteps[abbreviation.startIndex + abbreviation.numItems - 3]]
                if (lastIter.representation.isSelected) {
                    abbreviation.dots[abbreviation.dots.length - 1].classList.add('is-selected')
                } else {
                    abbreviation.dots[abbreviation.dots.length - 1].classList.remove('is-selected')
                }
            }
        }
    }

    export function destroyAbyssCleanup(abbreviation: AbbreviationState) {
        abbreviation.dotsContainer.remove()
        abbreviation.element.remove()
        abbreviation.label.remove()
    }
}
