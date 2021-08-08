import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import { Environment } from '../environment/Environment';
import { ViewRenderer } from './ViewRenderer';

export class View {
    renderer: ViewRenderer;
    animation: AnimationGraph | AnimationNode;

    static views: View[] = [];

    constructor(animation: AnimationGraph | AnimationNode, parent: View) {
        this.animation = animation;

        this.environment = options.environment ?? new Environment();
        this.validLines = options.validLines;

        this.historyEl = document.createElement('div');
        this.historyEl.classList.add('view-history');
        document.body.append(this.historyEl);

        this.environment.validLines = options.validLines;
        this.renderer = options.renderer ?? new ViewRenderer(options);

        this.validLines = options.validLines;
    }

    update() {
        this.renderer.setState(this.environment);
    }

    reset() {
        this.environment = new Environment();
        this.environment.validLines = this.validLines;
        this.renderer.reset();
    }

    destroy() {
        this.renderer.destroy();
        this.environment = undefined;
    }

    static create(options: ViewOptions) {
        const view = new View(options);
        View.views.push(view);
    }

    static destroy() {
        View.views.forEach((view) => view.destroy());
        View.views = [];
    }
}
