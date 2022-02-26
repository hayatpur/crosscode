import { createDataRenderer } from '../../EnvironmentRenderer'
import { DataRenderer } from '../DataRenderer'
import { DataState } from '../DataState'
import { IndexRenderer } from './IndexRenderer'

export class ArrayRenderer extends DataRenderer {
    dataRenderers: {
        [id: string]: { renderer: DataRenderer; index: IndexRenderer }
    } = {}
    closingBrace: HTMLDivElement
    openingBrace: HTMLDivElement

    selection: Set<string> = new Set()

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

        // this.element.append(this.openingBrace, this.closingBrace)
    }

    setState(data: DataState) {
        const items = data.value as DataState[]

        this.element.append(this.openingBrace)

        // Hit test
        const hits = new Set()

        // Render data
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            // Create renderer if not there
            if (!(item.id in this.dataRenderers)) {
                const renderer = createDataRenderer(item)
                const index = new IndexRenderer()
                this.dataRenderers[item.id] = { renderer, index }
                this.element.append(renderer.element)
                // this.element.append(index.element)
            }

            hits.add(item.id)
            this.element.append(this.dataRenderers[item.id].renderer.element)
            this.dataRenderers[item.id].renderer.setState(item)

            if (this.selection.has(item.id)) {
                this.dataRenderers[item.id].renderer.select(this.selection)
            } else {
                this.dataRenderers[item.id].renderer.deselect()
            }

            this.dataRenderers[item.id].index.setState(
                i,
                this.dataRenderers[item.id].renderer.element,
                this.element
            )
            updateIndexClasses(this.dataRenderers[item.id].renderer.element, i, items.length)
        }

        // Remove data that are no longer in the view
        for (const id of Object.keys(this.dataRenderers)) {
            if (!hits.has(id)) {
                const renderer = this.dataRenderers[id]
                renderer.renderer.destroy()
                renderer.renderer.element.remove()
                renderer.index.element.remove()
                delete this.dataRenderers[id]
            }
        }

        this.element.append(this.closingBrace)
    }

    destroy(): void {
        // super.destroy()
        // for (const id of Object.keys(this.dataRenderers)) {
        //     const renderer = this.dataRenderers[id]
        //     renderer.renderer.destroy()
        //     renderer.index.element.remove()
        //     renderer.renderer.element.remove()
        // }
        // this.dataRenderers = {}
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

    select(selection: Set<string>) {
        this.selection = new Set([...selection, ...this.selection])
        for (const id of Object.keys(this.dataRenderers)) {
            const renderer = this.dataRenderers[id].renderer

            if (this.selection.has(id)) {
                renderer.select(this.selection)
            }
        }
    }

    deselect() {
        for (const id of Object.keys(this.dataRenderers)) {
            const renderer = this.dataRenderers[id].renderer
            renderer.deselect()
        }
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
