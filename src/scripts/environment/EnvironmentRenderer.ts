import { clone } from '../utilities/objects';
import { ArrayRenderer } from './data/array/ArrayRenderer';
import { DataRenderer } from './data/DataRenderer';
import { DataState, DataType } from './data/DataState';
import { LiteralRenderer } from './data/literal/LiteralRenderer';
import { flattenedEnvironmentMemory } from './environment';
import { EnvironmentState } from './EnvironmentState';

export class EnvironmentRenderer {
    element: HTMLDivElement;

    dataRenderers: { [id: string]: DataRenderer } = {};

    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('environment');
    }

    setState(state: EnvironmentState) {
        // Apply transform
        this.element.style.top = `${state.transform?.y ?? 0}px`;
        this.element.style.left = `${state.transform?.x ?? 0}px`;

        // Hit test
        const hits = new Set();

        // const flattened = flattenedEnvironmentMemory(state);

        // Memory
        const memory = state.memory
            .filter((m) => m != null)
            .filter((data) => data.type == DataType.Literal || data.type == DataType.Array);

        const offsets: { [id: string]: number } = {};

        let width = 0;
        let height = 0;

        // Render data
        for (const data of memory) {
            if (data.type == DataType.Array) {
                for (const item of data.value as DataState[]) {
                    offsets[item.id] = data.transform.z;
                }
            }

            // Create renderer if not there
            if (!(data.id in this.dataRenderers)) {
                const renderer = this.createRenderer(data);
                this.dataRenderers[data.id] = renderer;
                this.element.appendChild(renderer.element);
            }

            hits.add(data.id);

            const dataRenderer = this.dataRenderers[data.id];

            if (data.type == DataType.Literal && offsets[data.id] != null) {
                const copy = clone(data);
                copy.transform.z += offsets[data.id];
                dataRenderer.setState(copy);
            } else {
                dataRenderer.setState(data);
            }
        }

        // Remove data that are no longer in the view
        for (const id in this.dataRenderers) {
            if (!hits.has(id)) {
                const renderer = this.dataRenderers[id];
                renderer.destroy();
                renderer.element.remove();
                delete this.dataRenderers[id];
            }
        }

        for (const child of this.element.children) {
            const bbox = child.getBoundingClientRect();
            width = Math.max(width, bbox.x + bbox.width);
            height = Math.max(height, bbox.y + bbox.height);
        }

        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
    }

    destroy() {
        this.element.remove();
    }

    createRenderer(data: DataState): DataRenderer {
        const mapping = {
            [DataType.Literal]: LiteralRenderer,
            [DataType.Array]: ArrayRenderer,
        };

        if (!(data.type in mapping)) {
            console.error('No renderer for', data.type);
        }

        return new mapping[data.type]();
    }
}
