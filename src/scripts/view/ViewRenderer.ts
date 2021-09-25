import { EnvironmentRenderer } from '../environment/EnvironmentRenderer';
import { instanceOfEnvironment } from '../environment/EnvironmentState';
import { ViewState } from './ViewState';

export class ViewRenderer {
    element: HTMLDivElement;
    childRenderers: { [id: string]: EnvironmentRenderer | ViewRenderer } = {};

    constructor(root = false) {
        this.element = document.createElement('div');
        this.element.classList.add('view');

        if (root) {
            document.querySelector('#root-view').appendChild(this.element);
        }
    }

    setState(state: ViewState) {
        // Apply transform
        this.element.style.top = `${state.transform.y}px`;
        this.element.style.left = `${state.transform.x}px`;

        // Hit test
        const hits = new Set();

        // Render environments
        for (const child of state.children) {
            if (!(child.id in this.childRenderers)) {
                const renderer = instanceOfEnvironment(child)
                    ? new EnvironmentRenderer()
                    : new ViewRenderer();

                this.childRenderers[child.id] = renderer;
                this.element.appendChild(renderer.element);
            }

            hits.add(child.id);

            const childRenderer = this.childRenderers[child.id];

            if (instanceOfEnvironment(child)) {
                (childRenderer as EnvironmentRenderer).setState(child);
            } else {
                (childRenderer as ViewRenderer).setState(child);
            }
        }

        // Remove environments that are no longer in the view
        for (const id in this.childRenderers) {
            if (!hits.has(id)) {
                const renderer = this.childRenderers[id];
                renderer.destroy();
                this.element.removeChild(renderer.element);
                delete this.childRenderers[id];
            }
        }
    }

    destroy() {
        this.element.remove();
    }
}
