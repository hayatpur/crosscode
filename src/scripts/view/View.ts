import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import { Editor } from '../editor/Editor';
import { Environment } from '../environment/Environment';
import { camelCaseToSentence } from '../utilities/string';
import { Ticker } from '../utilities/Ticker';
import {
    applyPositionModifier,
    createCodeSection,
    destroyAbstractionMenu,
    getLocation,
    updateCodeSection,
    ViewPositionModifier,
    ViewPositionModifierType,
} from '../utilities/view';
import { ViewRenderer } from './ViewRenderer';

export interface ViewTransform {
    x: number;
    y: number;
    opacity: number;
}

export class View {
    animation: AnimationGraph | AnimationNode;
    parent: View;

    // Only if showing
    renderer: ViewRenderer;
    environment: Environment;

    // Only if animation group and showing
    codeSection: HTMLDivElement;

    // Main element
    element: HTMLDivElement;
    childrenContainer: HTMLDivElement;

    children: View[] = [];

    static shownViews: Set<View> = new Set();
    static views: { [id: string]: View } = {};

    abstractionMenu: HTMLDivElement;

    transform: ViewTransform;

    positionModifiers: ViewPositionModifier[] = [{ type: ViewPositionModifierType.NextToCode, value: null }];

    constructor(animation: AnimationGraph | AnimationNode, parent?: View) {
        this.animation = animation;
        this.parent = parent;

        this.transform = { x: 0, y: 0, opacity: 1 };

        // TODO: Support animation nodes
        if (animation instanceof AnimationNode) {
            return;
        }

        // Store it globally
        View.views[animation.id] = this;

        this.element = document.createElement('div');
        this.element.classList.add('view-element');

        this.childrenContainer = document.createElement('div');
        this.childrenContainer.classList.add('view-children-container');

        // Add to parent / body
        if (parent != null) {
            parent.childrenContainer.append(this.element);

            // Set label
            // const labelEl = document.createElement('div');
            // labelEl.classList.add('view-label');
            // labelEl.innerHTML = `[${animation.id}] ${camelCaseToSentence(animation.getName())}`;

            // this.element.append(labelEl);

            // createViewControls(this, labelEl);

            this.element.style.opacity = '1';
            // setTimeout(() => (this.element.style.opacity = '1'), 200);
        } else {
            this.element.classList.add('root');
            document.body.append(this.element);
        }

        this.element.append(this.childrenContainer);

        // If showing, create renderer AND stop propagating through tree
        if (animation.showing) {
            this.environment = animation.precondition.copy();
            this.environment.validIds = new Set([this.animation.id]);
            console.log('Valid Ids', this.environment.validIds);

            this.renderer = new ViewRenderer();
            this.element.append(this.renderer.element);
            View.shownViews.add(this);

            this.element.classList.add('showing-renderer');
        }
        // Otherwise, propagate through children
        else if (animation instanceof AnimationGraph) {
            for (const child of animation.vertices) {
                this.children.push(new View(child, this));
            }
        }

        // Create a visual in the code this represents
        if (animation.showing && this.animation instanceof AnimationGraph) {
            const { bbox, startRow, endRow } = getLocation(this.animation);
            Editor.instance.createLens(
                `[${this.animation.id}] ${camelCaseToSentence(this.animation.getName())}`,
                startRow,
                this.animation.id
            );
            this.codeSection = createCodeSection();
        }

        Ticker.instance.registerTickFrom(() => {
            this.tick();
        }, `ViewUpdate_${animation.id}`);
    }

    updateLayout() {}

    // Runs every frame
    tick() {
        if (this.parent == null) {
            // Then make sure each child is at least Editor.instance.getMaxWidth() + 50 on the x
            this.element.style.left = `${Editor.instance.getMaxWidth() + 50}px`;
        } else if (this.animation.showing && this.animation instanceof AnimationGraph) {
            this.positionModifiers.forEach((modifier) => applyPositionModifier(this, modifier));

            this.element.style.top = `${this.transform.y}px`;
            this.element.style.left = `${this.transform.x}px`;
        }

        if (this.animation.playing || this.parent == null) {
            this.element.classList.remove('hidden');
            this.element.classList.remove('has-played');
            this.element.classList.add('running');
            this.codeSection?.classList.add('running');
        } else if (this.animation.hasPlayed) {
            let top_parent = this as View;
            while (top_parent.parent.parent != null) {
                top_parent = top_parent.parent;
            }

            if (top_parent.parent.children[top_parent.parent.children.length - 1] == top_parent) {
            } else {
                this.element.classList.add('has-played');
            }
            // this.element.classList.add('has-played');
            this.element.classList.remove('running');
            this.codeSection?.classList.remove('running');
            // this.element.classList.remove('minimized');
        } else {
            this.element.classList.add('hidden');
            this.element.classList.remove('running');
            this.codeSection?.classList.remove('running');
        }

        if (this.codeSection != null) {
            updateCodeSection(this);
        }
    }

    // Runs when environment changes
    update() {
        if (this.animation instanceof AnimationNode) return;

        if (this.animation.showing) {
            this.renderer.setState(this.environment);
        } else {
            for (const child of this.children) {
                child.update();
            }
        }
    }

    // Reset the animation
    reset() {
        if (this.animation instanceof AnimationNode) return;

        this.positionModifiers = [{ type: ViewPositionModifierType.NextToCode, value: null }];

        if (this.animation.showing) {
            this.renderer.reset();
            this.environment = this.animation.precondition.copy();
            this.environment.validIds = new Set([this.animation.id]);
        }

        for (const child of this.children) {
            child.reset();
        }
    }

    // Destroy the animation
    destroy() {
        if (this.animation instanceof AnimationNode) return;

        // this.renderer.destroy();
        // this.environment = undefined;

        if (this.animation == undefined) return;

        Ticker.instance.removeTickFrom(`ViewUpdate_${this.animation.id}`);

        if (this.animation.showing) {
            this.renderer?.destroy();
            this.environment = undefined;
            this.renderer = undefined;
            View.shownViews.delete(this);
        }

        delete View.views[this.animation.id];

        Editor.instance.clearLens(this.animation.id);
        this.codeSection?.remove();
        destroyAbstractionMenu(this);

        for (const child of this.children) {
            child.destroy();
        }

        this.element.remove();
        this.element = undefined;

        this.animation = undefined;
        this.parent = undefined;
    }
}
