import { createDataRenderer } from '../../EnvironmentRenderer';
import { DataRenderer, DataRendererOptions } from '../DataRenderer';
import { DataState } from '../DataState';
import { LiteralRenderer } from '../literal/LiteralRenderer';

export class ArrayRenderer extends DataRenderer {
    static BracePadding = 0; // LiteralRenderer.Size / 2;
    static MinHeight = LiteralRenderer.Size;
    static MinWidth = LiteralRenderer.Size * (3 / 2);
    static ElementGap = 2;

    dataRenderers: { [id: string]: { renderer: DataRenderer; indexElement: HTMLDivElement } } = {};

    constructor() {
        super();

        // Opening brace
        // const openingBrace = document.createElement('div');
        // openingBrace.classList.add('brace', 'opening');
        // openingBrace.innerText = '[';

        // // Closing brace
        // const closingBrace = document.createElement('div');
        // closingBrace.classList.add('brace', 'closing');
        // closingBrace.innerText = ']';

        // this.element.append(openingBrace, closingBrace);
    }

    setState(data: DataState, options: DataRendererOptions) {
        this.element.classList.add('array');

        options.zOffset = options.zOffset ?? 0;

        // Apply transform
        this.element.style.top = `${
            data.transform.rendered.y - 5 * (data.transform.styles.elevation + options.zOffset)
        }px`;
        this.element.style.left = `${
            data.transform.rendered.x + 5 * (data.transform.styles.elevation + options.zOffset)
        }px`;

        this.element.style.width = `${data.transform.rendered.width}px`;
        this.element.style.height = `${data.transform.rendered.height}px`;

        if (data.transform.styles.position == 'absolute') {
            this.element.classList.add('floating');
        } else {
            this.element.classList.remove('floating');
        }

        // Hit test
        const hits = new Set();

        const items = data.value as DataState[];
        // Render data
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Create renderer if not there
            if (!(item.id in this.dataRenderers)) {
                const renderer = createDataRenderer(item);

                const indexElement = document.createElement('div');
                indexElement.classList.add('array-index');
                indexElement.innerText = `${i}`;
                indexElement.style.left = `${(LiteralRenderer.Size + ArrayRenderer.ElementGap) * i}px`;

                this.dataRenderers[item.id] = { renderer, indexElement };

                options.environmentRenderer.element.append(renderer.element);
                options.environmentRenderer.element.append(indexElement);
            }

            hits.add(item.id);
            this.dataRenderers[item.id].renderer.setState(item, {
                environmentRenderer: options.environmentRenderer,
                zOffset: options.zOffset + data.transform.styles.elevation,
            });

            if (i == 0 && items.length == 1) {
                this.dataRenderers[item.id].renderer.element.classList.remove('first-array-item');
                this.dataRenderers[item.id].renderer.element.classList.remove('last-array-item');
                this.dataRenderers[item.id].renderer.element.classList.remove('array-item');
                continue;
            }

            if (i == 0) {
                this.dataRenderers[item.id].renderer.element.classList.add('first-array-item');
            } else {
                this.dataRenderers[item.id].renderer.element.classList.remove('first-array-item');
            }

            if (i == items.length - 1) {
                this.dataRenderers[item.id].renderer.element.classList.add('last-array-item');
            } else {
                this.dataRenderers[item.id].renderer.element.classList.remove('last-array-item');
            }

            // if (i > 0 && i < items.length - 1) {
            this.dataRenderers[item.id].renderer.element.classList.add('array-item');
            // } else {
            //     this.dataRenderers[item.id].element.classList.remove('array-item');
            // }
        }

        // Remove data that are no longer in the view
        for (const id in this.dataRenderers) {
            if (!hits.has(id)) {
                const renderer = this.dataRenderers[id];
                renderer.renderer.destroy();
                renderer.renderer.element.remove();
                renderer.indexElement.remove();
                delete this.dataRenderers[id];
            }
        }
    }

    destroy(): void {
        super.destroy();
        for (const id in this.dataRenderers) {
            const renderer = this.dataRenderers[id];
            renderer.renderer.destroy();
            renderer.indexElement.remove();
            renderer.renderer.element.remove();
        }

        this.dataRenderers = {};
    }
}
