import * as ESTree from 'estree';
import { Editor } from '../editor/Editor';
import { ArrayRenderer } from './data/array/ArrayRenderer';
import { DataRenderer } from './data/DataRenderer';
import { DataState, DataType } from './data/DataState';
import { LiteralRenderer } from './data/literal/LiteralRenderer';
import { resolvePath } from './environment';
import { EnvironmentPositionModifierType, EnvironmentState } from './EnvironmentState';
import { IdentifierRenderer } from './identifier/IdentifierRenderer';

export function createDataRenderer(data: DataState) {
    const mapping = {
        [DataType.Literal]: LiteralRenderer,
        [DataType.Array]: ArrayRenderer,
    };

    if (!(data.type in mapping)) {
        console.error('No renderer for', data.type);
    }

    return new mapping[data.type]();
}

export class EnvironmentRenderer {
    element: HTMLDivElement;
    border: HTMLDivElement;

    static BorderPadding = 30;

    dataRenderers: { [id: string]: DataRenderer } = {};
    identifierRenderers: { [id: string]: IdentifierRenderer } = {};

    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('environment');

        this.border = document.createElement('div');
        this.border.classList.add('environment-border');
        this.element.append(this.border);
    }

    setState(state: EnvironmentState) {
        state.transform.rendered.y = state.transform.rendered.y || 0;
        state.transform.rendered.x = state.transform.rendered.x || 0;

        // Apply transform
        this.element.style.top = `${state.transform.rendered.y}px`;
        this.element.style.left = `${state.transform.rendered.x}px`;

        // Memory
        this.renderMemory(state);

        // Render identifiers
        this.renderIdentifiers(state);

        // Compute width & height
        let width = state.transform.rendered.width;
        let height = state.transform.rendered.height;

        // Update position
        // applyPositionModifiers(this.element, state);

        // Update size
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;

        // Set the border
        // this.border.style.width = `${width + EnvironmentRenderer.BorderPadding * 2}px`;
        // this.border.style.height = `${height + EnvironmentRenderer.BorderPadding * 2 + 30}px`;

        // this.border.style.top = `${-EnvironmentRenderer.BorderPadding - 30}px`;
        // this.border.style.left = `${-EnvironmentRenderer.BorderPadding}px`;
    }

    renderMemory(state: EnvironmentState) {
        // Hit test
        const hits = new Set();

        const memory = state.memory
            .filter((m) => m != null)
            .filter((data) => data.type == DataType.Literal || data.type == DataType.Array);

        // Render data
        for (const data of memory) {
            // Create renderer if not there
            if (!(data.id in this.dataRenderers)) {
                const renderer = createDataRenderer(data);
                this.dataRenderers[data.id] = renderer;
                this.element.appendChild(renderer.element);
            }

            hits.add(data.id);
            this.dataRenderers[data.id].setState(data, { environmentRenderer: this });
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
    }

    renderIdentifiers(state: EnvironmentState) {
        // Hit test
        const hits = new Set();

        for (const scope of state.scope) {
            for (const name in scope) {
                if (!(name in this.identifierRenderers)) {
                    const renderer = new IdentifierRenderer();
                    this.identifierRenderers[name] = renderer;
                    this.element.appendChild(renderer.element);
                }

                hits.add(name);

                const reference = scope[name];
                const data = resolvePath(state, reference, null) as DataState;
                this.identifierRenderers[name].setState(name, data);
            }
        }

        // Remove hits that aren't used
        for (const name in this.identifierRenderers) {
            if (!hits.has(name)) {
                const renderer = this.identifierRenderers[name];
                renderer.destroy();
                renderer.element.remove();
                delete this.identifierRenderers[name];
            }
        }
    }

    destroy() {
        for (const id in this.dataRenderers) {
            const renderer = this.dataRenderers[id];
            renderer.destroy();
            renderer.element.remove();
        }

        for (const name in this.identifierRenderers) {
            const renderer = this.identifierRenderers[name];
            renderer.destroy();
        }

        this.element.remove();
        this.border.remove();
    }
}

function applyPositionModifiers(element: HTMLDivElement, state: EnvironmentState) {
    const modifiers = state.transform.positionModifiers;

    const fitted = {
        [EnvironmentPositionModifierType.NextToCode]: false,
        [EnvironmentPositionModifierType.AboveView]: false,
        [EnvironmentPositionModifierType.BelowView]: false,
    };

    for (let i = modifiers.length - 1; i >= 0; i--) {
        const modifier = modifiers[i];

        if (fitted[modifier.type]) continue;

        if (modifier.type == EnvironmentPositionModifierType.NextToCode) {
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
