import { ApplicationState } from '../../../../../ApplicationState'
import { FrameInfo } from '../../../../../environment/EnvironmentState'
import { reads, writes } from '../../../../../execution/execution'
import { createElement } from '../../../../../utilities/dom'
import { createDataRenderer } from '../../EnvironmentRenderer'
import { DataRenderer } from '../DataRenderer'
import { DataState } from '../DataState'
import { IndexRenderer } from './IndexRenderer'

export class ArrayRenderer extends DataRenderer {
    dataRenderers: {
        [id: string]: {
            hole: HTMLElement
            renderer: DataRenderer
            index: IndexRenderer
            comma: HTMLElement
        }
    } = {}
    closingBrace: HTMLDivElement
    openingBrace: HTMLDivElement

    constructor() {
        super()

        this.element.classList.add('data-array')

        // Opening brace
        this.openingBrace = document.createElement('div')
        this.openingBrace.classList.add('data-array-brace', 'data-array-opening-brace')
        this.openingBrace.innerText = '['

        // Closing brace
        this.closingBrace = document.createElement('div')
        this.closingBrace.classList.add('data-array-brace', 'data-array-closing-brace')
        this.closingBrace.innerText = ']'

        // autoAnimate(this.element)

        // this.element.append(this.openingBrace, this.closingBrace)
    }

    findRendererById(id: string): {
        data: DataRenderer
        column: HTMLElement
    } | null {
        for (const [itemId, item] of Object.entries(this.dataRenderers)) {
            if (itemId === id) {
                return { data: item.renderer, column: item.hole.parentElement! }
            }
        }

        return null
    }

    setState(data: DataState, frame: FrameInfo) {
        const { actionId, overrideExecution } = frame
        const items = data.value as DataState[]

        this.element.innerHTML = ''
        this.element.append(this.openingBrace)

        // Hit test
        const hits = new Set()

        const action = ApplicationState.actions[actionId]
        const ws = writes(overrideExecution ?? action.execution).map((w) => w.id)
        const rs = reads(overrideExecution ?? action.execution).map((r) => r.id)

        // Render data
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            // Create renderer if not there
            if (!(item.id in this.dataRenderers)) {
                const renderer = createDataRenderer(item)
                const index = new IndexRenderer()
                const comma = createElement('div', 'data-array-comma')
                comma.innerText = ','

                const hole = createElement('div', 'hole')
                hole.append(renderer.element)

                this.dataRenderers[item.id] = { hole, renderer, index, comma }
            }

            hits.add(item.id)
            this.element.append(this.dataRenderers[item.id].hole)
            if (i < items.length - 1) {
                this.element.append(this.dataRenderers[item.id].comma)
            }
            this.dataRenderers[item.id].renderer.setState(item, actionId)

            this.dataRenderers[item.id].index.setState(i, this.dataRenderers[item.id].renderer.element, this.element)
            updateIndexClasses(this.dataRenderers[item.id].renderer.element, i, items.length)

            // Update read and writes
            if (ws.includes(item.id)) {
                this.dataRenderers[item.id].renderer.element.classList.add('environment-write')
                this.dataRenderers[item.id].renderer.element.classList.remove('environment-read')
            } else if (rs.includes(item.id)) {
                this.dataRenderers[item.id].renderer.element.classList.add('environment-read')
                this.dataRenderers[item.id].renderer.element.classList.remove('environment-write')
            } else {
                this.dataRenderers[item.id].renderer.element.classList.remove('environment-write')
                this.dataRenderers[item.id].renderer.element.classList.remove('environment-read')
            }
        }

        // Remove data that are no longer in the view
        for (const id of Object.keys(this.dataRenderers)) {
            if (!hits.has(id)) {
                const renderer = this.dataRenderers[id]
                renderer.renderer.destroy()
                renderer.renderer.element.remove()
                renderer.index.element.remove()
                renderer.comma.remove()
                delete this.dataRenderers[id]
            }
        }

        this.element.append(this.closingBrace)
    }

    destroy(): void {
        super.destroy()
        for (const id of Object.keys(this.dataRenderers)) {
            const renderer = this.dataRenderers[id]
            renderer.renderer.destroy()
            renderer.index.element.remove()
            renderer.renderer.element.remove()
            renderer.comma.remove()
        }
        this.dataRenderers = {}
    }

    getAllChildRenderers() {
        let renderers: { [id: string]: DataRenderer } = {}

        for (const [id, item] of Object.entries(this.dataRenderers)) {
            renderers[id] = item.renderer

            renderers = {
                ...renderers,
                ...item.renderer.getAllChildRenderers(),
            }
        }

        return renderers
    }

    /* ------------------------ Focus ----------------------- */
    focus() {
        this.element.classList.remove('secondary-focused')
    }

    clearFocus() {
        this.element.classList.remove('secondary-focused')
    }
}

function updateIndexClasses(el: HTMLElement, index: number, len: number) {
    if (index == 0 && len == 1) {
        el.classList.remove('first-array-item')
        el.classList.remove('last-array-item')
        el.classList.remove('array-item')
        return
    }

    if (index == 0) {
        el.classList.add('first-array-item')
    } else {
        el.classList.remove('first-array-item')
    }

    if (index == len - 1) {
        el.classList.add('last-array-item')
    } else {
        el.classList.remove('last-array-item')
    }

    el.classList.add('array-item')
}
