import { DataRenderer } from '../DataRenderer'
import { DataState } from '../DataState'
import { ObjectItemRenderer } from './ObjectItemRenderer'

export class ObjectRenderer extends DataRenderer {
    dataRenderers: {
        [id: string]: ObjectItemRenderer
    } = {}

    constructor() {
        super()

        this.element.classList.add('object-renderer')
    }

    setState(data: DataState) {
        const obj = data.value as { [id: string]: DataState }

        const hits = new Set()

        for (const [key, value] of Object.entries(obj)) {
            // Create renderer if not there
            if (!(key in this.dataRenderers)) {
                const renderer = new ObjectItemRenderer()
                this.dataRenderers[key] = renderer
                this.element.append(renderer.element)
            }

            hits.add(key)
            this.element.append(this.dataRenderers[key].element)
            this.dataRenderers[key].setState(key, value)
        }

        // Remove data that are no longer in the view
        for (const id of Object.keys(this.dataRenderers)) {
            if (!hits.has(id)) {
                const renderer = this.dataRenderers[id]
                renderer.destroy()
                delete this.dataRenderers[id]
            }
        }
    }

    destroy(): void {
        super.destroy()
        for (const id of Object.keys(this.dataRenderers)) {
            const renderer = this.dataRenderers[id]
            renderer.destroy()
        }
        this.dataRenderers = {}
    }

    getAllChildRenderers() {
        let renderers: { [id: string]: DataRenderer } = {}
        for (const [id, item] of Object.entries(this.dataRenderers)) {
            renderers[id] = item.dataRenderer
            renderers = {
                ...renderers,
                ...item.dataRenderer.getAllChildRenderers(),
            }
        }
        return renderers
    }

    select(selection: Set<string>) {
        // this.selection = new Set([...selection, ...this.selection])
        // for (const id of Object.keys(this.dataRenderers)) {
        //     const renderer = this.dataRenderers[id].renderer
        //     if (this.selection.has(id)) {
        //         renderer.select(this.selection)
        //     }
        // }
    }

    deselect() {
        // for (const id of Object.keys(this.dataRenderers)) {
        //     const renderer = this.dataRenderers[id].renderer
        //     renderer.deselect()
        // }
    }
}
