import * as ESTree from 'estree';
import { Editor } from '../editor/Editor';
import { EnvironmentRenderer } from '../environment/EnvironmentRenderer';
import { instanceOfEnvironment } from '../environment/EnvironmentState';
import { ViewPositionModifierType, ViewState } from './ViewState';

export class ViewRenderer {
    element: HTMLDivElement;
    childRenderers: { [id: string]: EnvironmentRenderer | ViewRenderer } = {};

    constructor(root = false) {
        this.element = document.createElement('div');
        this.element.classList.add('view');

        if (root) {
            document.querySelector('#view-container').appendChild(this.element);
        }
    }

    setState(state: ViewState) {
        // Apply transform
        this.element.style.top = `${state.transform.rendered.x}px`;
        this.element.style.left = `${state.transform.rendered.y}px`;

        // Hit test
        const hits = new Set();

        // Render environments
        for (const child of state.children) {
            if (!(child.id in this.childRenderers)) {
                console.log(state.id, 'Creating a new child...', child.id);
                const renderer = instanceOfEnvironment(child) ? new EnvironmentRenderer() : new ViewRenderer();

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
                console.log(state.id, 'Destroying a new child...', id);
                const renderer = this.childRenderers[id];
                renderer.destroy();
                renderer.element.remove();
                delete this.childRenderers[id];
            }
        }

        if (state.isRoot) {
            this.element.classList.add('root');
        } else {
            this.element.classList.remove('root');
        }

        if (!state.isRoot) {
            // applyPositionModifiers(this.element, state);
        }

        // Compute width and height
        let width = state.transform.rendered.width;
        let height = state.transform.rendered.height;

        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
    }

    destroy() {
        for (const id in this.childRenderers) {
            const renderer = this.childRenderers[id];
            renderer.destroy();
        }

        this.element.remove();
    }
}

function applyPositionModifiers(element: HTMLDivElement, state: ViewState) {
    const modifiers = state.transform.positionModifiers;

    const fitted = {
        [ViewPositionModifierType.NextToCode]: false,
        [ViewPositionModifierType.AboveView]: false,
        [ViewPositionModifierType.BelowView]: false,
    };

    for (let i = modifiers.length - 1; i >= 0; i--) {
        const modifier = modifiers[i];

        if (fitted[modifier.type]) continue;

        if (modifier.type == ViewPositionModifierType.NextToCode) {
            const loc = modifier.value as ESTree.SourceLocation;

            // Place this view next to the code
            const target = Editor.instance.computeBoundingBox(loc.start.line);
            const current = element.getBoundingClientRect();

            const delta = target.y - current.y;
            state.transform.rendered.y += delta;
        }

        fitted[modifier.type] = true;
    }
}
