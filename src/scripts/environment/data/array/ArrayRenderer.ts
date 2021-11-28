import { createDataRenderer } from '../../EnvironmentRenderer'
import { DataRenderer } from '../DataRenderer'
import { ConcreteDataState } from '../DataState'
import { IndexRenderer } from './IndexRenderer'

export class ArrayRenderer extends DataRenderer {
    dataRenderers: { [id: string]: { renderer: DataRenderer; index: IndexRenderer } } = {}

    constructor() {
        super()

        // Opening brace
        // const openingBrace = document.createElement('div');
        // openingBrace.classList.add('data-array-brace', 'data-array-opening-brace');
        // openingBrace.innerText = '[';

        // // Closing brace
        // const closingBrace = document.createElement('div');
        // closingBrace.classList.add('data-array-brace', 'data-array-closing-brace');
        // closingBrace.innerText = ']';

        // this.element.append(openingBrace, closingBrace);
    }

    setState(data: ConcreteDataState) {
        this.element.classList.add('data-array')

        // Apply transform
        this.element.style.top = `${data.transform.rendered.y - 5 * (data.transform.styles.elevation ?? 0)}px`
        this.element.style.left = `${data.transform.rendered.x + 5 * (data.transform.styles.elevation ?? 0)}px`

        this.element.style.width = `${data.transform.rendered.width}px`
        this.element.style.height = `${data.transform.rendered.height}px`

        if (data.transform.styles.position == 'absolute') {
            this.element.classList.add('floating')
        } else {
            this.element.classList.remove('floating')
        }

        // Hit test
        const hits = new Set()

        const items = data.value as ConcreteDataState[]

        // Render data
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            // Create renderer if not there
            if (!(item.prototype.id in this.dataRenderers)) {
                const renderer = createDataRenderer(item)
                const index = new IndexRenderer()

                this.dataRenderers[item.prototype.id] = { renderer, index }

                DataRenderer.getStage().append(renderer.element)
                DataRenderer.getStage().append(index.element)
            }

            hits.add(item.prototype.id)

            this.dataRenderers[item.prototype.id].renderer.setState(item)
            this.dataRenderers[item.prototype.id].index.setState(i, item.transform.rendered)

            updateIndexClasses(this.dataRenderers[item.prototype.id].renderer.element, i, items.length)
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
    }

    destroy(): void {
        super.destroy()

        for (const id of Object.keys(this.dataRenderers)) {
            const renderer = this.dataRenderers[id]
            renderer.renderer.destroy()
            renderer.index.element.remove()
            renderer.renderer.element.remove()
        }

        this.dataRenderers = {}
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
