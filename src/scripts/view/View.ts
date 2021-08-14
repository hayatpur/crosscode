import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import { Environment } from '../environment/Environment';
import { camelCaseToSentence } from '../utilities/string';
import { Ticker } from '../utilities/Ticker';
import { ViewRenderer } from './ViewRenderer';

export class View {
    animation: AnimationGraph | AnimationNode;
    parent: View;

    // Only if showing
    renderer: ViewRenderer;
    environment: Environment;

    element: HTMLDivElement;

    children: View[] = [];

    static shownViews: Set<View> = new Set();

    constructor(animation: AnimationGraph | AnimationNode, parent?: View) {
        this.animation = animation;
        this.parent = parent;

        this.element = document.createElement('div');
        this.element.classList.add('view-element');

        // Add to parent / body
        if (parent != null) {
            parent.element.append(this.element);

            // Set label
            const labelEl = document.createElement('div');
            labelEl.classList.add('view-label');
            labelEl.innerHTML = `[${animation.id}] ${camelCaseToSentence(animation.getName())}`;
            // if (animation instanceof AnimationGraph) {
            //     labelEl.innerHTML = `${animation.node.constructor.name}`;
            // } else {
            //     labelEl.innerHTML = `${animation.constructor.name}`;
            // }
            // labelEl.innerHTML = camelCaseToSentence(labelEl.innerHTML);
            this.element.append(labelEl);

            this.createControls();

            this.element.style.opacity = '0.4';
            setTimeout(() => (this.element.style.opacity = '1'), 200);
        } else {
            this.element.classList.add('root');
            document.body.append(this.element);

            let maxWidth = 0;
            for (const lineEl of document.querySelectorAll('.view-line')) {
                const tokens = lineEl.children[0].children;
                if (tokens.length > 0) {
                    const last = tokens[tokens.length - 1];
                    const bbox = last.getBoundingClientRect();
                    maxWidth = Math.max(maxWidth, bbox.right);
                } else {
                    const bbox = lineEl.getBoundingClientRect();
                    maxWidth = Math.max(maxWidth, bbox.left);
                }
            }

            this.element.style.left = `${maxWidth + 50}px`;
        }

        // If showing, create renderer AND stop propagating through tree
        if (animation.showing) {
            this.environment = animation.precondition.copy();
            this.environment.validIds = new Set([this.animation.id]);
            this.renderer = new ViewRenderer(this.element);
            View.shownViews.add(this);

            this.element.classList.add('showing-renderer');
        }
        // Otherwise, propagate through children
        else if (animation instanceof AnimationGraph) {
            for (const child of animation.vertices) {
                this.children.push(new View(child, this));
            }
        }

        Ticker.instance.registerTickFrom(() => {
            this.tick();
        }, `ViewUpdate_${animation.id}`);
    }

    minimize() {
        alert('Not implemented');
    }

    maximize() {
        alert('Not implemented');
    }

    /** CONTROLS **/

    toggleShow() {
        this.element.classList.toggle('hidden');
    }

    aggregate() {
        // this.animation.aggregate();
    }

    collapse() {
        if (this.animation.showing) return;

        this.animation.hasPlayed = false;
        // this.animation.playing = false;
        this.children.forEach((child) => {
            child.animation.hasPlayed = false;
            child.animation.playing = false;
        });

        this.children.forEach((child) => child.destroy());
        this.children = [];
        this.animation.showing = true;

        if (this.animation.showing) {
            this.environment = this.animation.precondition.copy();
            this.environment.validIds = new Set([this.animation.id]);
            this.renderer = new ViewRenderer(this.element);
            View.shownViews.add(this);

            this.element.classList.add('showing-renderer');
        }
    }

    split() {
        if (this.animation instanceof AnimationNode || !this.animation.showing) return;

        if (this.animation.showing) {
            this.renderer.destroy();
            this.environment = undefined;
            this.renderer = undefined;
        }

        for (const vertex of this.animation.vertices) {
            vertex.showing = true;
        }
        this.animation.showing = false;

        this.element.classList.remove('showing-renderer');

        View.shownViews.delete(this);

        for (const child of this.animation.vertices) {
            this.children.push(new View(child, this));
        }
    }

    createControls() {
        const controls = document.createElement('div');
        controls.classList.add('view-controls');

        // Show button
        const show = document.createElement('div');
        show.classList.add('view-controls-button');
        show.innerHTML = '<ion-icon name="eye"></ion-icon>';
        show.addEventListener('click', () => {
            this.toggleShow();

            if (this.element.classList.contains('hidden')) {
                show.innerHTML = '<ion-icon name="eye-off"></ion-icon>';
            } else {
                show.innerHTML = '<ion-icon name="eye"></ion-icon>';
            }
        });
        controls.append(show);

        // Aggregate button
        const aggregate = document.createElement('div');
        aggregate.classList.add('view-controls-button');
        aggregate.innerHTML = '<ion-icon name="cut"></ion-icon>';
        aggregate.addEventListener('click', () => {
            this.aggregate();
        });
        controls.append(aggregate);

        // Collapse button
        const collapse = document.createElement('div');
        collapse.classList.add('view-controls-button');
        collapse.innerHTML = '<ion-icon name="remove"></ion-icon>';
        collapse.addEventListener('click', () => {
            this.collapse();
        });
        controls.append(collapse);

        // Split button
        const split = document.createElement('div');
        split.classList.add('view-controls-button');
        split.innerHTML = '<ion-icon name="apps"></ion-icon>';
        split.addEventListener('click', () => {
            this.split();
        });
        controls.append(split);

        // Destroy button
        // const destroyButton = document.createElement('button');
        // destroyButton.classList.add('view-destroy');
        // destroyButton.innerHTML = 'destroy';
        // destroyButton.addEventListener('click', () => {
        //     this.destroy();
        // });
        // controls.append(destroyButton);

        this.element.append(controls);
    }

    tick() {
        if (this.animation.playing || this.parent == null) {
            this.element.classList.remove('hidden');
            this.element.classList.remove('has-played');
        } else if (this.animation.hasPlayed) {
            if (this.parent.parent == null && this.parent.children[this.parent.children.length - 1] == this) {
            } else {
                this.element.classList.add('has-played');
            }
            // this.element.classList.remove('minimized');
        } else {
            this.element.classList.add('hidden');
        }
    }

    update() {
        if (this.animation.showing) {
            this.renderer.setState(this.environment);
        } else {
            for (const child of this.children) {
                child.update();
            }
        }
    }

    reset() {
        if (this.animation.showing) {
            this.renderer.reset();
            this.environment = this.animation.precondition.copy();
            this.environment.validIds = new Set([this.animation.id]);
        }

        for (const child of this.children) {
            child.reset();
        }
    }

    destroy() {
        // this.renderer.destroy();
        // this.environment = undefined;

        if (this.animation == undefined) return;

        Ticker.instance.removeTickFrom(`ViewUpdate_${this.animation.id}`);

        if (this.animation.showing) {
            this.renderer.destroy();
            this.environment = undefined;
            this.renderer = undefined;
            View.shownViews.delete(this);
        }

        for (const child of this.children) {
            child.destroy();
        }

        this.element.remove();
        this.element = undefined;

        this.animation = undefined;
        this.parent = undefined;
    }
}
