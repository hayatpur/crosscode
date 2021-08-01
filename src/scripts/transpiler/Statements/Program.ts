import { AnimationGraph } from '../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { BlockStatement } from './BlockStatement';

export class Program extends BlockStatement {
    constructor(ast: any) {
        // A program is a block statement that starts at the beginning
        super(ast, { index: 0, states: { prev: [], current: [], next: [] }, line: 0, path: [] });
    }

    animation(context: AnimationContext = { outputSpecifier: [] }): AnimationGraph {
        const animation = new AnimationGraph(this);

        for (const statement of this.statements) {
            animation.addVertex(statement.animation(context), statement);
        }

        return animation;
    }
}
