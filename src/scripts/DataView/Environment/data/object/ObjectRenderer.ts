import { FrameInfo } from '../../../../../transpiler/EnvironmentState'
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

    findRendererById(id: string): {
        data: DataRenderer
        column: HTMLElement
    } | null {
        console.log(id, Object.keys(this.dataRenderers))

        for (const [key, renderer] of Object.entries(this.dataRenderers)) {
            if (key.split('@')[0] == id) {
                return { data: renderer.dataRenderer, column: null! }
            }
        }

        for (const [containerId, containerRenderer] of Object.entries(this.dataRenderers)) {
            if (containerRenderer.dataRenderer instanceof ObjectRenderer) {
                const item = containerRenderer.dataRenderer.findRendererById(id)
                if (item != null) {
                    return item
                }
            }
        }

        return null
    }

    setState(data: DataState, frame: FrameInfo) {
        const { stepId } = frame
        const obj = data.value as { [id: string]: DataState }
        const hits = new Set()

        // Need to do both data *and* key as separate things
        for (const [key, value] of Object.entries(obj)) {
            const storeKey = `${value.id}@${key}`

            // Create renderer if not there
            if (!(storeKey in this.dataRenderers)) {
                const renderer = new ObjectItemRenderer()
                this.dataRenderers[storeKey] = renderer
            }

            hits.add(storeKey)
            this.element.append(this.dataRenderers[storeKey].element)
            this.dataRenderers[storeKey].setState(key, value, stepId)
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
            renderers[id.split('@')[0]] = item.dataRenderer
            renderers = {
                ...renderers,
                ...item.dataRenderer.getAllChildRenderers(),
            }
        }

        // console.log('The whole thing:', renderers, this.dataRenderers)
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
