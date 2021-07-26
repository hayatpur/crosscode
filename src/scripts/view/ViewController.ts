import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import { Environment } from '../environment/Environment';
import { Ticker } from '../utilities/Ticker';
import { ViewRenderer } from './ViewRenderer';

export class ViewController {
    environment: Environment;
    renderer: ViewRenderer;

    constructor(environment: Environment = null, renderer: ViewRenderer = null) {
        this.environment = environment ?? new Environment();
        this.renderer = renderer ?? new ViewRenderer();
    }

    update() {
        this.renderer.setState(this.environment);
    }

    isValid(animation: AnimationGraph | AnimationNode): boolean {
        return true;
    }
}
