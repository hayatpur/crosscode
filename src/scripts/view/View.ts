import {
    AbstractionConfig,
    AggregateOptimizerGoal,
    applyAbstractions,
} from '../animation/graph/abstraction/AbstractionController';
import { AnimationGraph, AnimationGroup } from '../animation/graph/AnimationGraph';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import { Editor } from '../editor/Editor';
import { Environment } from '../environment/Environment';
import { Executor } from '../executor/Executor';
import { camelCaseToSentence } from '../utilities/string';
import { Ticker } from '../utilities/Ticker';
import { ViewRenderer } from './ViewRenderer';

export class View {
    animation: AnimationGraph | AnimationNode;
    parent: View;

    // Only if showing
    renderer: ViewRenderer;
    environment: Environment;

    // Only if animation group and showing
    codeSection: HTMLDivElement;

    element: HTMLDivElement;

    children: View[] = [];

    static shownViews: Set<View> = new Set();

    abstractions: AbstractionConfig = null;
    abstractionMenu: HTMLDivElement;

    constructor(animation: AnimationGraph | AnimationNode, parent?: View) {
        this.animation = animation;
        this.parent = parent;

        if (animation instanceof AnimationNode) {
            return;
        }

        this.abstractions = { Aggregations: [], Transitions: [], DataAnnotations: [], Layouts: [], ShowBefore: [] };

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

            this.createControls(labelEl);

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

        if (animation.showing && this.animation instanceof AnimationGroup) {
            const group = this.animation as AnimationGroup;
            const { bbox, startRow, endRow } = group.getLocation();
            Editor.instance.createLens(
                `[${this.animation.id}] ${camelCaseToSentence(this.animation.getName())}`,
                startRow
            );
            this.createSection(group);
        }

        Ticker.instance.registerTickFrom(() => {
            this.tick();
        }, `ViewUpdate_${animation.id}`);
    }

    createSection(group: AnimationGroup) {
        this.codeSection = document.createElement('div');
        this.codeSection.classList.add('code-section');
        document.body.append(this.codeSection);

        setTimeout(() => {
            const { bbox, startRow, endRow } = group.getLocation();
            if (bbox == null) return;

            // Add padding
            const padding = 10;
            bbox.x -= padding;
            bbox.y -= padding;
            bbox.width += 2 * padding;
            bbox.height += 2 * padding;
            this.codeSection.style.left = `${bbox.left}px`;
            this.codeSection.style.top = `${bbox.top}px`;
            this.codeSection.style.width = `${bbox.width}px`;
            this.codeSection.style.height = `${bbox.height}px`;
        }, 2000);
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
        if (this.animation instanceof AnimationNode || this.animation.showing) return;

        Executor.instance.paused = true;
        const time = Executor.instance.time;

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

        if (this.animation instanceof AnimationGroup) {
            this.createSection(this.animation as AnimationGroup);
        }

        // Apply animations
        Executor.instance.animation.reset();
        Executor.instance.view.reset();

        const environments = [...View.shownViews].map((view) => view.environment);
        Executor.instance.animation?.seek(environments, time);

        Executor.instance.view.update();
        Executor.instance.paused = false;
    }

    split() {
        if (this.animation instanceof AnimationNode || !this.animation.showing) return;

        Executor.instance.paused = true;
        const time = Executor.instance.time;

        if (this.animation.showing) {
            this.renderer.destroy();
            this.environment = undefined;
            this.renderer = undefined;
            this.codeSection?.remove();
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

        // Apply animations
        Executor.instance.animation.reset();
        Executor.instance.view.reset();

        const environments = [...View.shownViews].map((view) => view.environment);
        Executor.instance.animation?.seek(environments, time);

        Executor.instance.view.update();
        Executor.instance.paused = false;
    }

    createControls(labelEl: HTMLDivElement) {
        if (this.animation instanceof AnimationNode) return;

        const controls = document.createElement('div');
        controls.classList.add('view-controls');

        // Show button
        // const show = document.createElement('div');
        // show.classList.add('view-controls-button');
        // show.innerHTML = '<ion-icon name="eye"></ion-icon>';
        // show.addEventListener('click', () => {
        //     this.toggleShow();

        //     if (this.element.classList.contains('hidden')) {
        //         show.innerHTML = '<ion-icon name="eye-off"></ion-icon>';
        //     } else {
        //         show.innerHTML = '<ion-icon name="eye"></ion-icon>';
        //     }
        // });
        // controls.append(show);

        // Aggregate button
        // const aggregate = document.createElement('div');
        // aggregate.classList.add('view-controls-button');
        // aggregate.innerHTML = '<ion-icon name="cut"></ion-icon>';
        // aggregate.addEventListener('click', () => {
        //     this.aggregate();
        // });
        // controls.append(aggregate);

        // Toggle expand button
        const expand = document.createElement('div');
        expand.classList.add('view-controls-button');
        expand.innerHTML = `<ion-icon name="${this.animation.showing ? 'add' : 'remove'}"></ion-icon>`;
        expand.addEventListener('click', () => {
            if (this.animation.showing) {
                this.split();
            } else {
                this.collapse();
            }

            expand.innerHTML = `<ion-icon name="${this.animation.showing ? 'add' : 'remove'}"></ion-icon>`;
        });
        labelEl.prepend(expand);

        const abstract = document.createElement('div');
        abstract.classList.add('view-controls-button', 'view-controls-button-abstract');
        abstract.innerHTML = `<ion-icon name="brush"></ion-icon>`;
        abstract.addEventListener('click', () => {
            abstract.classList.toggle('clicked');

            if (abstract.classList.contains('clicked')) {
                // Show abstraction menu
                this.createAbstractionMenu(abstract.getBoundingClientRect());
            } else {
                this.destroyAbstractionMenu();
            }
        });
        labelEl.append(abstract);

        // Collapse button
        // const collapse = document.createElement('div');
        // collapse.classList.add('view-controls-button');
        // collapse.innerHTML = '<ion-icon name="remove"></ion-icon>';
        // collapse.addEventListener('click', () => {
        //     this.collapse();
        // });
        // labelEl.append(collapse);

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

    showMenu() {
        throw new Error('Method not implemented.');
    }

    createAbstractionButton(labelText): { group: HTMLDivElement; input: HTMLInputElement; label: HTMLLabelElement } {
        // Aggregate abstraction menu
        const group = document.createElement('div');
        group.classList.add('group');

        const input = document.createElement('input');
        input.classList.add('inp-cbx');
        input.id = `${this.animation.id}-${labelText}`;
        input.setAttribute('type', 'checkbox');
        group.append(input);

        const label = document.createElement('label');
        label.classList.add('cbx', 'mb-1');
        label.setAttribute('for', `${this.animation.id}-${labelText}`);
        label.innerHTML = `<span>
             <svg width="12px" height="10px">
                 <use xlink:href="#check"></use>
             </svg>
         </span>
         <span>${labelText}</span>`;
        group.append(label);

        return { group, input, label };
    }

    createAbstractionMenu(position: { x: number; y: number }) {
        this.abstractionMenu = document.createElement('div');
        this.abstractionMenu.classList.add('view-abstraction-menu');

        // Aggregate button
        const {
            group: aggregateGroup,
            input: aggregateInput,
            label: aggregateLabel,
        } = this.createAbstractionButton('Aggregate');

        aggregateInput.onclick = () => {
            if (aggregateInput.checked) {
                this.abstractions.Aggregations = [{ Depth: 0, Goal: AggregateOptimizerGoal.Default }];
            } else {
                this.abstractions.Aggregations = [];
            }
        };

        this.abstractionMenu.append(aggregateGroup);

        // Aggregate button
        const {
            group: aggregateChildrenGroup,
            input: aggregateChildrenInput,
            label: aggregateChildrenLabel,
        } = this.createAbstractionButton('Aggregate Children');

        aggregateChildrenInput.onclick = () => {
            if (aggregateChildrenInput.checked) {
                this.abstractions.Aggregations = [{ Depth: 0, Goal: AggregateOptimizerGoal.Default, Children: true }];
            } else {
                this.abstractions.Aggregations = [];
            }
        };

        this.abstractionMenu.append(aggregateChildrenGroup);

        // Transition button
        const {
            group: transitionGroup,
            input: transitionInput,
            label: transitionLabel,
        } = this.createAbstractionButton('Transition');

        transitionInput.onclick = () => {
            this.abstractions.Transitions = transitionInput.checked ? [{ PriorityVariables: [] }] : [];
        };
        this.abstractionMenu.append(transitionGroup);

        // Dissolve button
        const {
            group: dissolveGroup,
            input: dissolveInput,
            label: dissolveLabel,
        } = this.createAbstractionButton('Dissolve');

        dissolveInput.onclick = () => {
            this.abstractions.Dissolve = dissolveInput.checked ? [{ shouldDissolve: true }] : [];
        };
        this.abstractionMenu.append(dissolveGroup);

        // Show before button
        const {
            group: showBeforeGroup,
            input: showBeforeInput,
            label: showBeforeLabel,
        } = this.createAbstractionButton('Show before');

        showBeforeInput.onclick = () => {
            // this.abstractions.Dissolve = showBeforeInput.checked ? [{ shouldDissolve: true }] : [];
        };
        this.abstractionMenu.append(showBeforeGroup);

        // Layout button
        const { group: layoutGroup, input: layoutInput, label: layoutLabel } = this.createAbstractionButton('Layout');

        showBeforeInput.onclick = () => {
            // this.abstractions.Dissolve = showBeforeInput.checked ? [{ shouldDissolve: true }] : [];
        };
        this.abstractionMenu.append(showBeforeGroup);

        // Annotation button
        const {
            group: annotationGroup,
            input: annotationInput,
            label: annotationLabel,
        } = this.createAbstractionButton('Annotation');

        annotationInput.onclick = () => {
            // this.abstractions.Dissolve = annotationInput.checked ? [{ shouldDissolve: true }] : [];
        };
        this.abstractionMenu.append(annotationGroup);

        // Apply button
        const apply = document.createElement('div');
        apply.classList.add('view-abstraction-menu-apply');
        apply.innerText = 'Apply';
        apply.addEventListener('click', () => {
            applyAbstractions(this.animation as AnimationGraph, this.abstractions);
            this.destroyAbstractionMenu();
        });

        this.abstractionMenu.append(apply);

        this.abstractionMenu.style.left = `${position.x - 100}px`;
        this.abstractionMenu.style.top = `${position.y - 135}px`;

        document.body.append(this.abstractionMenu);
    }

    destroyAbstractionMenu() {
        this.abstractionMenu?.remove();
        this.abstractionMenu = undefined;
    }

    tick() {
        if (this.animation.playing || this.parent == null) {
            this.element.classList.remove('hidden');
            this.element.classList.remove('has-played');
            this.codeSection?.classList.add('running');
        } else if (this.animation.hasPlayed) {
            if (this.parent.parent == null && this.parent.children[this.parent.children.length - 1] == this) {
            } else {
                this.element.classList.add('has-played');
            }
            this.codeSection?.classList.remove('running');
            // this.element.classList.remove('minimized');
        } else {
            this.element.classList.add('hidden');
            this.codeSection?.classList.remove('running');
        }
    }

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

    reset() {
        if (this.animation instanceof AnimationNode) return;

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
        if (this.animation instanceof AnimationNode) return;

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

        this.codeSection?.remove();
        this.destroyAbstractionMenu();

        for (const child of this.children) {
            child.destroy();
        }

        this.element.remove();
        this.element = undefined;

        this.animation = undefined;
        this.parent = undefined;
    }
}
