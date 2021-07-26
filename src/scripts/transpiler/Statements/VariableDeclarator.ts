import * as ESTree from 'estree';
import { AnimationGraph } from '../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { BindAnimation } from '../../animation/primitive/BindAnimation';
import { AccessorType } from '../../environment/Data';
import { Identifier } from '../Identifier';
import { Node, NodeMeta } from '../Node';
import { Transpiler } from '../Transpiler';

export class VariableDeclarator extends Node {
    init?: Node;
    id: Identifier;

    constructor(ast: ESTree.VariableDeclarator, meta: NodeMeta) {
        super(ast, meta);

        // Compile RHS of expression (i.e. initial value assigned to this variable)
        if (ast.init != null) {
            this.init = Transpiler.transpile(ast.init, meta);
        }

        // Compile LHS of expression (i.e. the symbol)
        this.id = new Identifier(ast.id as ESTree.Identifier, meta);
    }

    animation(context: AnimationContext) {
        // Return an animation graph that is composed of our two animations - 'bind' and 'init',
        // the graph should dissolve into the parent graph

        const graph: AnimationGraph = new AnimationGraph(this);

        // Animation that allocates space for the variable
        // const bind = new BindAnimationSequence(th, context.getSectionData);
        // graph.addVertex(bind, this);

        // Animation that completes data fragment and places it in the variable
        // if (isSimple(this.init)) {
        const init = this.init.animation(context);
        graph.addVertex(init, this);

        const bind = new BindAnimation(this.id.name, [{ type: AccessorType.Symbol, value: '_LatestExpression' }]);
        graph.addVertex(bind, this);

        // } else {
        //     const computation = new ComputationAnimationGraph(this.id, this.init);
        //     graph.addVertex(computation);
        // }

        // graph.computeEdges();
        // graph.addEdge(new FlowEdge(0, 1, this.getData.bind(this)));

        // graph.dissolve();

        return graph;
    }
}
