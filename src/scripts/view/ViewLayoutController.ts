import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import { View } from './View';

export class ViewLayoutController {
    parent: HTMLDivElement;

    constructor(root: AnimationGraph) {
        this.parent = document.createElement('div');
        this.parent.classList.add('view-layout-parent');

        document.body.append(this.parent);

        this.createView(root, this.parent);
    }

    createView(node: AnimationGraph | AnimationNode, parentElement: HTMLDivElement) {
        const el = createElement(node.constructor.name);
        parentElement.append(el);

        if (node.isSection) {
            const view = new View({ parentElement: el });
        }

        if (node instanceof AnimationGraph) {
            for (const vertex of node.vertices) {
                this.createView(vertex, el);
            }
        }
    }
}

function createElement(label: string): HTMLDivElement {
    const el = document.createElement('div');
    el.classList.add('view-layout-element');

    const labelEl = document.createElement('div');
    labelEl.classList.add('view-layout-label');
    labelEl.innerText = label;

    el.append(label);

    return el;
}
