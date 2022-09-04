import { ApplicationState } from '../../ApplicationState'
import { getAccumulatedBoundingBoxForElements } from '../../utilities/action'
import { createElement } from '../../utilities/dom'
import { assert } from '../../utilities/generic'
import { clearExistingFocus } from '../../visualization/Focus'
import { ForStatementRepresentation } from './Dynamic/ForStatementRepresentation'

export enum AbyssKind {
    Normal = 'Normal',
    ForLoop = 'ForLoop',
    Spatial = 'Spatial',
}

export type AbyssSpatialChild = {
    value: string
    children: AbyssSpatialChild[]
    element: HTMLElement | null
}

export type AbyssState = {
    id: string
    kind: AbyssKind

    // For abysses that are over breadth
    containerActionId: string | null
    startIndex: number
    numItems: number

    // For abysses that are over depth & breadth
    referenceActionId: AbyssSpatialChild | null

    // HTML
    element: HTMLElement
    dotsContainer: HTMLElement
    dots: HTMLElement[]
    label: HTMLElement
}

let __ABYSS_ID = 0
export function createAbyss(overrides: Partial<AbyssState>): AbyssState {
    const id = `Abyss(${++__ABYSS_ID})`

    const element = createElement('div', 'action-proxy-abyss')
    assert(overrides.numItems != null, 'Number of items must be specified')

    const dotsContainer = createElement('div', 'action-proxy-abyss-dots-container', element)
    const label = createElement('div', 'action-proxy-abyss-label', element)

    const base: AbyssState = {
        id,
        kind: AbyssKind.Normal,

        containerActionId: null,
        startIndex: 0,
        numItems: 0,

        referenceActionId: null,

        element,
        dots: [],
        label,
        dotsContainer,
    }

    // Apply overrides
    Object.assign(base, overrides)

    ApplicationState.abysses[id] = base

    // Consume the elements in the abyss
    const abyss = ApplicationState.abysses[id]
    if (abyss.kind != AbyssKind.Spatial) {
        assert(abyss.containerActionId != null, 'Container action ID must be specified')
        const container = ApplicationState.actions[abyss.containerActionId]

        for (let i = abyss.startIndex; i < abyss.startIndex + abyss.numItems; i++) {
            const vertexId = container.vertices[i]
            const vertex = ApplicationState.actions[vertexId]

            if (abyss.kind == AbyssKind.ForLoop) {
                const iteration = Math.floor(Math.max(0, (i - 1) / 3))
                const representation = container.representation as ForStatementRepresentation
                representation.consumeIteration(iteration)
            } else {
                vertex.representation.consume()
            }
        }
    } else {
        assert(abyss.referenceActionId != null, 'Reference action ID must be specified')

        let stack: AbyssSpatialChild[] = [abyss.referenceActionId]

        while (stack.length > 0) {
            const current = stack.pop()!

            const vertex = ApplicationState.actions[current.value]
            vertex.representation.consume()

            stack.push(...current.children)
        }
    }

    // Update abyss visual
    updateAbyssVisual(id)

    return base
}

export function getAbyssControlFlowPoints(abyss: AbyssState, index: number): [[number, number], [number, number]] {
    const bbox = abyss.dotsContainer.getBoundingClientRect()
    const segmentSize = bbox.width / abyss.numItems

    return [
        [bbox.x + segmentSize * (index - abyss.startIndex), bbox.y + bbox.height / 2],
        [bbox.x + segmentSize * (index - abyss.startIndex + 1), bbox.y + bbox.height / 2],
    ]
}

export function getSpatialAbyssControlFlowPoints(abyss: AbyssState, id: string): [[number, number], [number, number]] {
    const bbox = abyss.dotsContainer.getBoundingClientRect()
    const segmentSize = bbox.width / abyss.numItems

    return [
        [bbox.x, bbox.y + bbox.height / 2],
        [bbox.x + bbox.width, bbox.y + bbox.height / 2],
    ]
}

export type AbyssInfo = {
    id: string
    index: number | null
}

export function getConsumedAbyss(actionId: string): AbyssInfo | null {
    const action = ApplicationState.actions[actionId]
    const spatialParent = ApplicationState.actions[action.spatialParentID!]

    let isSpatiallyConsumed =
        (action.isSpatial && action.proxy.container.classList.contains('consumed')) ||
        spatialParent.proxy.container.classList.contains('consumed')

    let isNormalConsumed =
        !isSpatiallyConsumed &&
        (action.proxy.container.classList.contains('consumed') ||
            (action.proxy.container.parentElement?.parentElement?.classList.contains('consumed') &&
                action.proxy.container.parentElement?.parentElement?.classList.contains('action-proxy-for-iteration')))

    if (!isSpatiallyConsumed && !isNormalConsumed) {
        return null
    }

    if (isSpatiallyConsumed) {
        for (const [id, abyss] of Object.entries(ApplicationState.abysses)) {
            if (abyss.kind != AbyssKind.Spatial) {
                continue
            }

            const search = [abyss.referenceActionId]
            while (search.length > 0) {
                const current = search.pop()!
                if (current.value == spatialParent.id) {
                    return { id, index: null }
                }

                search.push(...current.children)
            }
        }

        console.log("Couldn't find spatial abyss for consumed action", actionId)
    }

    if (isNormalConsumed) {
        // Find the abyss that it's in
        const container = ApplicationState.actions[action.parentID as string]
        const selfIndex = container.vertices.indexOf(action.id)
        for (const abyssId of container.abyssesIds) {
            const abyss = ApplicationState.abysses[abyssId]
            if (abyss.startIndex <= selfIndex && abyss.startIndex + abyss.numItems >= selfIndex) {
                return { id: abyss.id, index: selfIndex }
            }
        }

        console.log("Couldn't find abyss for consumed action", actionId)
    }

    return null
}

export function updateAbyssVisual(abyssId: string) {
    const abyss = ApplicationState.abysses[abyssId]

    // Destroy it if it has 0 items
    if (abyss.numItems == 0 && abyss.kind != AbyssKind.Spatial) {
        destroyAbyss(abyssId)
        return
    }

    // TODO: Check for destroying spatial

    // Remove existing dots
    abyss.dots.forEach((dot) => dot.remove())

    // Update number of dots
    const dots: HTMLElement[] = []

    let totalItems = abyss.numItems

    if (abyss.kind == AbyssKind.ForLoop) {
        totalItems = Math.floor(Math.max(0, abyss.numItems / 3))
    }

    if (abyss.kind == AbyssKind.Spatial) {
        let count = 0
        let stack: AbyssSpatialChild[] = [abyss.referenceActionId!]

        while (stack.length > 0) {
            const current = stack.pop()!
            count++
            stack.push(...current.children)
        }

        totalItems = count
    }

    if (abyss.kind != AbyssKind.Spatial) {
        for (let i = 0; i < Math.min(3, totalItems); i++) {
            dots.push(createElement('div', 'action-proxy-abyss-dot', abyss.dotsContainer))
        }

        // Event listeners
        dots[0].onclick = (e) => {
            popAbyssFromStart(abyssId)
            e.preventDefault()
            e.stopPropagation()
        }

        if (dots.length > 1) {
            const last = dots[dots.length - 1]
            last.onclick = (e) => {
                popAbyssFromEnd(abyssId)
                e.preventDefault()
                e.stopPropagation()
            }
        }

        // Width and label
        if (totalItems > 3) {
            dots[1].style.width = `${Math.min(totalItems * 2, 10)}px`
        } else {
            abyss.element.style.width = 'inherit'
        }

        abyss.label.innerText = `${totalItems} more`

        assert(abyss.containerActionId != null, 'Container action ID must be specified')
        const container = ApplicationState.actions[abyss.containerActionId]
        const startAction = ApplicationState.actions[container.vertices[abyss.startIndex]]

        if (abyss.kind == AbyssKind.Normal) {
            startAction.proxy.container.after(abyss.element)
        } else {
            startAction.proxy.container.parentElement?.parentElement?.after(abyss.element)
        }
    } else {
        assert(abyss.referenceActionId != null, 'Reference action ID must be specified')
        const elements = updateSpatialDotsPosition(abyss.referenceActionId, { x: 5, y: 5 }, abyss.dotsContainer, null)

        // Update width
        const accBbox = getAccumulatedBoundingBoxForElements(elements)
        abyss.dotsContainer.style.width = `${accBbox.width + 12}px`
        abyss.dotsContainer.style.height = `${accBbox.height + 11}px`

        abyss.element.classList.add('is-spatial')

        const reference = ApplicationState.actions[abyss.referenceActionId.value]
        reference.proxy.container.append(abyss.element)
    }

    // Update dots
    abyss.dots = dots
}

export function getActionLocationInAbyss(abyssId: string, actionId: string) {
    const abyss = ApplicationState.abysses[abyssId]
    const action = ApplicationState.actions[actionId]

    console.log(abyss, action)

    if (abyss.kind == AbyssKind.Spatial) {
        let stack: AbyssSpatialChild[] = [abyss.referenceActionId!]

        while (stack.length > 0) {
            const current = stack.pop()!
            if (current.value == actionId) {
                return current.element
            }

            stack.push(...current.children)
        }
    } else {
        const container = ApplicationState.actions[action.parentID as string]
        const selfIndex = container.vertices.indexOf(action.id)

        if (selfIndex == abyss.startIndex) {
            return abyss.dots[0]
        } else if (selfIndex == abyss.startIndex + abyss.numItems - 1) {
            return abyss.dots[abyss.dots.length - 1]
        } else {
            return abyss.dots[1]
        }
    }

    return null
}

export function updateSpatialDotsPosition(
    node: AbyssSpatialChild,
    offset: { x: number; y: number },
    container: HTMLElement,
    relativeTo: HTMLElement | null
): HTMLElement[] {
    const childrenElements: HTMLElement[] = []

    // Create dot
    if (node.element == null) {
        node.element = createElement('div', ['action-proxy-abyss-dot', 'action-proxy-abyss-dot-spatial'], container)
    }

    // Update self
    let x = 0
    let y = 0

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

    node.children.forEach((child) => {
        const childElements: HTMLElement[] = []
        childElements.push(...updateSpatialDotsPosition(child, { ...rOffset }, container, node.element!))

        // If hit something
        if (childElements.length > 0) {
            const bbox = getAccumulatedBoundingBoxForElements(childElements)
            rOffset.y += bbox.height + 2
        }

        childrenElements.push(...childElements)
    })

    return childrenElements
}

export function destroyAbyss(abyssId: string) {
    const abyss = ApplicationState.abysses[abyssId]
    abyss.element.remove()

    // Free the consumed items
    if (abyss.kind != AbyssKind.Spatial) {
        const container = ApplicationState.actions[abyss.containerActionId as string]
        for (let i = abyss.startIndex; i < abyss.startIndex + abyss.numItems; i++) {
            const vertexId = container.vertices[i]
            const vertex = ApplicationState.actions[vertexId]

            if (abyss.kind == AbyssKind.ForLoop) {
                const iteration = Math.floor(Math.max(0, (i - 1) / 3))
                const representation = container.representation as ForStatementRepresentation
                representation.unConsumeIteration(iteration)
            } else {
                vertex.representation.unConsume()
            }
        }
    } else {
        assert(abyss.referenceActionId != null, 'Reference action ID must be specified')

        let stack: AbyssSpatialChild[] = [abyss.referenceActionId]

        while (stack.length > 0) {
            const current = stack.pop()!

            const vertex = ApplicationState.actions[current.value]
            vertex.representation.unConsume()

            stack.push(...current.children)
        }
    }

    for (const action of Object.values(ApplicationState.actions)) {
        if (action.abyssesIds.includes(abyssId)) {
            action.abyssesIds.splice(action.abyssesIds.indexOf(abyssId), 1)
        }
    }

    delete ApplicationState.abysses[abyssId]
}

export function popAbyssFromStart(abyssId: string) {
    const abyss = ApplicationState.abysses[abyssId]

    if (abyss.containerActionId != null) {
        const container = ApplicationState.actions[abyss.containerActionId]
        const actionId = container.vertices[abyss.startIndex]
        const action = ApplicationState.actions[actionId]

        if (abyss.kind == AbyssKind.Normal) {
            action.representation.unConsume()

            abyss.startIndex += 1
            abyss.numItems -= 1

            action.representation.focus()
        } else if (abyss.kind == AbyssKind.ForLoop) {
            const focus = ApplicationState.visualization.focus
            assert(focus != null, 'Focus must be set.')

            let numItems = abyss.startIndex == 0 ? 4 : 3
            let iterationIndex = Math.floor(Math.max(0, (abyss.startIndex - 1) / 3))

            const representation = container.representation as ForStatementRepresentation
            representation.unConsumeIteration(iterationIndex)

            clearExistingFocus()
            focusIteration(container.id, iterationIndex)

            abyss.startIndex += numItems
            abyss.numItems -= numItems

            updateForLoopAbyss(container.id)
        }
    } else {
        // TODO
    }

    updateAbyssVisual(abyssId)
}

export function popAbyssFromEnd(abyssId: string) {
    const abyss = ApplicationState.abysses[abyssId]

    if (abyss.containerActionId != null) {
        const container = ApplicationState.actions[abyss.containerActionId]
        const actionId = container.vertices[abyss.startIndex + abyss.numItems - 1]
        const action = ApplicationState.actions[actionId]

        if (abyss.kind == AbyssKind.Normal) {
            // Remove consumed
            action.representation.unConsume()

            // TODO: Set focus

            // Update abyss
            abyss.numItems -= 1
        } else if (abyss.kind == AbyssKind.ForLoop) {
            // Set focus
            const focus = ApplicationState.visualization.focus
            assert(focus != null, 'Focus must be set.')

            // Update abyss
            let numItems = abyss.startIndex + abyss.numItems - 1 == 0 ? 4 : 3
            let iterationIndex = Math.floor(Math.max(0, (abyss.startIndex + abyss.numItems - 2) / 3))

            const representation = container.representation as ForStatementRepresentation
            representation.unConsumeIteration(iterationIndex)

            clearExistingFocus()
            focusIteration(container.id, iterationIndex)

            abyss.numItems -= numItems

            // Collapse un-focused iterations.
            updateForLoopAbyss(container.id)
        }
    } else {
        // TODO
    }

    updateAbyssVisual(abyssId)
}

export function expandAbyssForward(abyssId: string, length: number = 1) {
    const abyss = ApplicationState.abysses[abyssId]
    assert(abyss.containerActionId != null, 'Container action id must not be null')

    const container = ApplicationState.actions[abyss.containerActionId]

    if (abyss.kind == AbyssKind.Normal) {
        for (let i = abyss.startIndex + abyss.numItems; i < abyss.startIndex + abyss.numItems + length; i++) {
            const vertexId = container.vertices[i]
            const vertex = ApplicationState.actions[vertexId]
            vertex.representation.consume()
        }

        abyss.numItems += length
    } else {
        let iterationIndex = Math.floor(Math.max(0, (abyss.startIndex + abyss.numItems - 1) / 3))

        // Consume elements
        for (let iter = iterationIndex; iter < iterationIndex + length; iter++) {
            const representation = container.representation as ForStatementRepresentation
            representation.consumeIteration(iter)
        }

        // Update indices
        let numItems = iterationIndex == 0 ? 4 : 3
        abyss.numItems += numItems + (length - 1) * 3
    }

    updateAbyssVisual(abyssId)
}

export function expandAbyssBackward(abyssId: string, length: number = 1) {
    const abyss = ApplicationState.abysses[abyssId]
    assert(abyss.containerActionId != null, 'Container action id must not be null')

    const container = ApplicationState.actions[abyss.containerActionId]

    if (abyss.kind == AbyssKind.Normal) {
        for (let i = abyss.startIndex - length; i < abyss.startIndex; i++) {
            const vertexId = container.vertices[i]
            const vertex = ApplicationState.actions[vertexId]
            vertex.representation.consume()
        }

        abyss.startIndex -= length
        abyss.numItems += length
    } else if (abyss.kind == AbyssKind.ForLoop) {
        let iterationIndex = Math.floor(Math.max(0, (abyss.startIndex - 1) / 3))

        // Consume elements
        for (let iter = iterationIndex - length; iter < iterationIndex; iter++) {
            const representation = container.representation as ForStatementRepresentation
            representation.consumeIteration(iter)
        }

        let numItems = iterationIndex - length == 0 ? 4 : 3

        // Update indices
        abyss.startIndex -= numItems + (length - 1) * 3
        abyss.numItems += numItems + (length - 1) * 3
    }

    updateAbyssVisual(abyssId)
}

export function expandSpatialAbyssForward(abyssId: string, newActionId: string) {
    const newAction = ApplicationState.actions[newActionId]
    assert(newAction.isSpatial, 'New action must be spatial.')

    // Expand abyss to include this this action
    const abyss = ApplicationState.abysses[abyssId]

    // Find index of parent abyss
    let search = [abyss.referenceActionId]
    let found: AbyssSpatialChild | null = null
    while (search.length > 0) {
        const current = search.pop()!
        const currentAction = ApplicationState.actions[current.value]

        if (currentAction.spatialVertices != null && currentAction.spatialVertices.has(newActionId)) {
            found = current

            break
        }

        if (current.children != null) {
            search = search.concat(current.children)
        }
    }

    assert(found != null, 'Action must be a child of the parent abyss.')

    // Expand abyss
    if (found.children == null) {
        found.children = []
    }

    found.children.push({
        value: newActionId,
        children: [],
        element: null,
    })

    newAction.representation.consume()

    updateAbyssVisual(abyssId)
}

export function collapseActionIntoAbyss(actionId: string) {
    const action = ApplicationState.actions[actionId]

    if (action.isSpatial) {
        // Check parent for having a spatial abyss
        const parent = ApplicationState.actions[action.parentID as string]
        const parentAbyssInfo = getConsumedAbyss(parent.id)

        if (parentAbyssInfo == null) {
            const newAbyss = createAbyss({
                referenceActionId: { value: action.id, children: [], element: null },
                numItems: 1,
                kind: AbyssKind.Spatial,
            })
            action.abyssesIds.push(newAbyss.id)
        } else {
            expandSpatialAbyssForward(parentAbyssInfo.id, action.id)
        }
    } else {
        const parent = ApplicationState.actions[action.parentID as string]
        const index = parent.vertices.indexOf(actionId)

        // If there are any abysses which are adjacent to the index
        let abyss: AbyssState | null = null
        let isAfter = false

        for (const candidateAbyssId of parent.abyssesIds) {
            const candidate = ApplicationState.abysses[candidateAbyssId]

            if (candidate.startIndex - index == 1) {
                abyss = candidate
            } else if (candidate.startIndex + candidate.numItems - index == 0) {
                abyss = candidate
                isAfter = true
            }
        }

        // Create abyss if it doesn't exist
        if (abyss == null) {
            const newAbyss = createAbyss({
                containerActionId: action.parentID,
                startIndex: index,
                numItems: 1,
            })
            parent.abyssesIds.push(newAbyss.id)
        } else {
            // Update abyss to account for the new action
            if (isAfter) {
                expandAbyssForward(abyss.id)
            } else {
                expandAbyssBackward(abyss.id)
            }
        }
    }
}

export function collapseForIterationIntoAbyss(forActionId: string, iterationIndex: number) {
    const forAction = ApplicationState.actions[forActionId]

    // Find the adjacent abyss
    let adjacentAbyss: AbyssState | null = null
    let isAfter = false

    for (const candidateAbyssId of forAction.abyssesIds) {
        const candidate = ApplicationState.abysses[candidateAbyssId]
        let index = iterationIndex * 3 + 1
        let numItems = 3

        if (iterationIndex == 0) {
            index = 0
            numItems = 4
        }

        console.log(candidate.startIndex, candidate.numItems, index, numItems)

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

        const abyss = createAbyss({
            containerActionId: forAction.id,
            startIndex: startIndex,
            numItems: numItems,
            kind: AbyssKind.ForLoop,
        })
        forAction.abyssesIds.push(abyss.id)
        updateAbyssVisual(abyss.id)
    } else {
        // console.log(iterationIndex, adjacentAbyss.element, isAfter)
        if (isAfter) {
            expandAbyssForward(adjacentAbyss.id)
        } else {
            expandAbyssBackward(adjacentAbyss.id)
        }
    }
}

export function updateForLoopAbyss(forActionId: string) {
    const forAction = ApplicationState.actions[forActionId]

    // Collapse any iterations that are not selected
    const totalVertices = (forAction.vertices.length - 2) / 3

    for (let iter = 0; iter < totalVertices; iter++) {
        let startIndex = iter * 3 + 1
        let numItems = 3

        if (iter == 0) {
            startIndex = 0
            numItems = 4
        }

        const vertexIds = forAction.vertices.slice(startIndex, startIndex + numItems)

        // If vertex is selected
        let isSelected = false
        for (const selectedVertexIds of ApplicationState.visualization.focus?.focusedActions ?? []) {
            if (Array.isArray(selectedVertexIds) && JSON.stringify(vertexIds) == JSON.stringify(selectedVertexIds)) {
                isSelected = true
                break
            }
        }

        if (!isSelected) {
            const representation = forAction.representation as ForStatementRepresentation
            const isConsumed = representation.iterationElements[iter].classList.contains('consumed')

            if (!isConsumed) {
                collapseForIterationIntoAbyss(forActionId, iter)
            }
        }
    }
}

export function focusIteration(forActionId: string, iterationIndex: number) {
    const focus = ApplicationState.visualization.focus
    assert(focus != null, 'Focus must be set.')

    const forAction = ApplicationState.actions[forActionId]
    let start = iterationIndex * 3 + 1
    let numItems = 3

    if (iterationIndex == 0) {
        start = 0
        numItems = 4
    }

    focus.focusedActions.push(forAction.vertices.slice(start, start + numItems))

    const representation = forAction.representation as ForStatementRepresentation
    representation.iterationElements[iterationIndex].classList.add('is-focused')
}
