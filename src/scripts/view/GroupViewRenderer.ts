import * as ESTree from 'estree'
import { Editor } from '../editor/Editor'
import { DataRenderer } from '../environment/data/DataRenderer'
import { LeafViewRenderer } from './LeafViewRenderer'
import {
    GroupViewPositionModifierType,
    GroupViewState,
    instanceOfLeafView,
    RootViewState,
} from './ViewState'

export class GroupViewRenderer {
    element: HTMLDivElement

    // Label
    labelElement: HTMLDivElement

    childRenderers: { [id: string]: LeafViewRenderer | GroupViewRenderer } = {}

    constructor(root = false) {
        this.element = document.createElement('div')
        this.element.classList.add('view')

        this.labelElement = document.createElement('div')
        this.labelElement.classList.add('view-label')

        this.element.append(this.labelElement)
    }

    setState(state: GroupViewState | RootViewState) {
        // Apply transform
        this.element.style.top = `${state.transform.rendered.y}px`
        this.element.style.left = `${state.transform.rendered.x}px`

        // Hit test
        const hits = new Set()

        // Render environments
        for (const child of state.children) {
            if (!(child.id in this.childRenderers)) {
                const renderer = instanceOfLeafView(child)
                    ? new LeafViewRenderer()
                    : new GroupViewRenderer()

                this.childRenderers[child.id] = renderer
                DataRenderer.getStage().append(renderer.element)
            }

            hits.add(child.id)

            let childRenderer = this.childRenderers[child.id]

            if (instanceOfLeafView(child)) {
                childRenderer = childRenderer as LeafViewRenderer
                childRenderer.setState(child)
            } else {
                childRenderer = childRenderer as GroupViewRenderer
                childRenderer.setState(child)
            }
        }

        // Remove environments that are no longer in the view
        for (const id of Object.keys(this.childRenderers)) {
            if (!hits.has(id)) {
                const renderer = this.childRenderers[id]
                renderer.destroy()
                renderer.element.remove()
                delete this.childRenderers[id]
            }
        }

        // Set width and height
        this.element.style.width = `${state.transform.rendered.width}px`
        this.element.style.height = `${state.transform.rendered.height}px`

        // Set label
        this.labelElement.innerText = state.label
            .replace(/([A-Z])/g, ' $1')
            .trim()
    }

    destroy() {
        for (const id of Object.keys(this.childRenderers)) {
            const renderer = this.childRenderers[id]
            renderer.destroy()
            renderer.element.remove()
        }

        this.element.remove()
    }
}

function applyPositionModifiers(
    element: HTMLDivElement,
    state: GroupViewState | RootViewState
) {
    const modifiers = state.transform.positionModifiers

    const fitted = {
        [GroupViewPositionModifierType.NextToCode]: false,
        [GroupViewPositionModifierType.AboveView]: false,
        [GroupViewPositionModifierType.BelowView]: false,
    }

    for (let i = modifiers.length - 1; i >= 0; i--) {
        const modifier = modifiers[i]

        if (fitted[modifier.type]) continue

        if (modifier.type == GroupViewPositionModifierType.NextToCode) {
            const loc = modifier.value as ESTree.SourceLocation

            // Place this view next to the code
            const target = Editor.instance.computeBoundingBox(loc.start.line)
            const current = element.getBoundingClientRect()

            const delta = target.y - current.y
            state.transform.rendered.y += delta
        }

        fitted[modifier.type] = true
    }
}
