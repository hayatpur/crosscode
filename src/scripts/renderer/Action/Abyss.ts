import { ApplicationState } from '../../ApplicationState'
import { queryAllAction } from '../../utilities/action'
import { createElement } from '../../utilities/dom'
import { assert } from '../../utilities/generic'
import { clearExistingFocus } from '../../visualization/Focus'
import { ForStatementRepresentation } from './Dynamic/ForStatementRepresentation'

export enum AbyssKind {
    Normal,
    ForLoop,
    Spatial,
}

export type AbyssState = {
    id: string
    kind: AbyssKind

    // For abysses that are over breadth
    containerActionId: string | null
    startIndex: number

    // For abysses that are over depth
    referenceActionId: string | null

    // State
    numItems: number

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
                vertex.proxy.container.parentElement?.parentElement?.classList.add('consumed')
            } else {
                vertex.proxy.container.classList.add('consumed')
            }
        }
    } else {
        assert(abyss.referenceActionId != null, 'Reference action ID must be specified')

        let stack: string[] = [abyss.referenceActionId]
        for (let i = 0; i < abyss.numItems; i++) {
            for (const itemId of stack) {
                const item = ApplicationState.actions[itemId]
                item.proxy.container.classList.add('consumed')
            }
        }
    }

    // Update abyss visual
    updateAbyssVisual(id)

    return base
}

export function updateAbyssVisual(abyssId: string) {
    const abyss = ApplicationState.abysses[abyssId]

    // Destroy it if it has 0 items
    if (abyss.numItems == 0) {
        abyss.element.remove()

        for (const action of Object.values(ApplicationState.actions)) {
            if (action.abyssesIds.includes(abyssId)) {
                action.abyssesIds.splice(action.abyssesIds.indexOf(abyssId), 1)
            }
        }

        delete ApplicationState.abysses[abyssId]
        return
    }

    // Remove existing dots
    abyss.dots.forEach((dot) => dot.remove())

    // Update number of dots
    const dots: HTMLElement[] = []

    const totalItems = abyss.kind == AbyssKind.ForLoop ? Math.floor(Math.max(0, abyss.numItems / 3)) : abyss.numItems

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

    // Put it in the right spot
    if (abyss.containerActionId != null) {
        const container = ApplicationState.actions[abyss.containerActionId]
        const startAction = ApplicationState.actions[container.vertices[abyss.startIndex]]

        if (abyss.kind == AbyssKind.Normal) {
            startAction.proxy.container.after(abyss.element)
        } else {
            startAction.proxy.container.parentElement?.parentElement?.after(abyss.element)
        }
    } else if (abyss.referenceActionId != null) {
        const reference = ApplicationState.actions[abyss.referenceActionId]
        abyss.element.classList.add('is-spatial')
        reference.proxy.container.append(abyss.element)
    }

    // Update dots
    abyss.dots = dots
}

export function popAbyssFromStart(abyssId: string) {
    const abyss = ApplicationState.abysses[abyssId]

    if (abyss.containerActionId != null) {
        const container = ApplicationState.actions[abyss.containerActionId]
        const actionId = container.vertices[abyss.startIndex]
        const action = ApplicationState.actions[actionId]

        if (abyss.kind == AbyssKind.Normal) {
            action.proxy.container.classList.remove('consumed')

            abyss.startIndex += 1
            abyss.numItems -= 1

            action.representation.focus()
        } else if (abyss.kind == AbyssKind.ForLoop) {
            action.proxy.container.parentElement?.parentElement?.classList.remove('consumed')

            const focus = ApplicationState.visualization.focus
            assert(focus != null, 'Focus must be set.')

            let numItems = abyss.startIndex == 0 ? 4 : 3
            let iterationIndex = Math.floor(Math.max(0, (abyss.startIndex - 1) / 3))

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
            action.proxy.container.classList.remove('consumed')

            // TODO: Set focus

            // Update abyss
            abyss.numItems -= 1
        } else if (abyss.kind == AbyssKind.ForLoop) {
            action.proxy.container.parentElement?.parentElement?.classList.remove('consumed')

            // Set focus
            const focus = ApplicationState.visualization.focus
            assert(focus != null, 'Focus must be set.')

            // Update abyss
            let numItems = abyss.startIndex + abyss.numItems - 1 == 0 ? 4 : 3
            let iterationIndex = Math.floor(Math.max(0, (abyss.startIndex + abyss.numItems - 2) / 3))

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
            vertex.proxy.container.classList.add('consumed')
        }

        abyss.numItems += length
    } else {
        let iterationIndex = Math.floor(Math.max(0, (abyss.startIndex + abyss.numItems - 1) / 3))

        // Consume elements
        for (let iter = iterationIndex; iter < iterationIndex + length; iter++) {
            const representation = container.representation as ForStatementRepresentation
            representation.iterationElements[iter].classList.add('consumed')
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
            vertex.proxy.container.classList.add('consumed')
        }

        abyss.startIndex -= length
        abyss.numItems += length
    } else if (abyss.kind == AbyssKind.ForLoop) {
        let iterationIndex = Math.floor(Math.max(0, (abyss.startIndex - 1) / 3))

        // Consume elements
        for (let iter = iterationIndex - length; iter < iterationIndex; iter++) {
            const representation = container.representation as ForStatementRepresentation
            representation.iterationElements[iter].classList.add('consumed')
        }

        let numItems = iterationIndex - length == 0 ? 4 : 3

        // Update indices
        abyss.startIndex -= numItems + (length - 1) * 3
        abyss.numItems += numItems + (length - 1) * 3
    }

    updateAbyssVisual(abyssId)
}

export function expandSpatialAbyssForward(abyssId: string) {
    const abyss = ApplicationState.abysses[abyssId]
    assert(abyss.referenceActionId != null, 'Reference action id must not be null')

    const reference = ApplicationState.actions[abyss.referenceActionId]

    // Get spatial children of reference
    const spatialChildren = queryAllAction(reference, (a) => a.isSpatial).slice(abyss.numItems)

    if (spatialChildren.length > 0) {
        const spatialChild = spatialChildren[0]
        spatialChild.proxy.container.classList.add('consumed')
        spatialChild.abyssesIds.push(abyssId)

        abyss.numItems += 1
    }

    updateAbyssVisual(abyssId)
}

export function collapseActionIntoAbyss(actionId: string) {
    const action = ApplicationState.actions[actionId]

    if (action.isSpatial) {
        // Check parent for having a spatial abyss
        const parent = ApplicationState.actions[action.parentID as string]
        const spatialParent = ApplicationState.actions[parent.spatialParentID as string]
        const spatialAbyssId = spatialParent.abyssesIds.find(
            (id) => ApplicationState.abysses[id].kind == AbyssKind.Spatial
        )

        if (spatialAbyssId == null) {
            const newAbyss = createAbyss({
                referenceActionId: action.id,
                numItems: 1,
                kind: AbyssKind.Spatial,
            })
            action.abyssesIds.push(newAbyss.id)
        } else {
            expandSpatialAbyssForward(spatialAbyssId)
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
