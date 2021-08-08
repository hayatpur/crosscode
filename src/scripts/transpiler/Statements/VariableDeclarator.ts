import * as ESTree from 'estree';
import { AnimationGraph } from '../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { BindAnimation } from '../../animation/primitive/Binding/BindAnimation';
import MoveAnimation from '../../animation/primitive/Data/MoveAnimation';
import PlaceAnimation from '../../animation/primitive/Data/PlaceAnimation';
import { AccessorType } from '../../environment/Data';
import { ArrayExpression } from '../Expressions/Array/ArrayExpression';
import { Identifier } from '../Identifier';
import { Node, NodeMeta } from '../Node';
import { Transpiler } from '../Transpiler';

export class VariableDeclarator extends Node {
    init?: Node = null;
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
        const graph: AnimationGraph = new AnimationGraph(this);

        // console.log(this.meta.states, this.id.name, this.init);
        // If memory already exists
        if (
            (this.meta.states.current[this.id.name]?.reference > 0 ||
                this.meta.states.prev[this.id.name]?.reference > 0) &&
            this.init != null &&
            this.init instanceof Identifier
        ) {
            // Allocate a place for variable
            const bind = new BindAnimation(this.id.name, this.init.getSpecifier());
            graph.addVertex(bind, this.id);

            return graph;
        } else {
            // Allocate a place for variable
            const bind = new BindAnimation(this.id.name);
            graph.addVertex(bind, this.id);

            // Assign initial value to variable
            if (this.init instanceof ArrayExpression) {
                const initialize = this.init.animation({
                    ...context,
                    outputSpecifier: [{ type: AccessorType.Symbol, value: this.id.name }],
                });
                graph.addVertex(initialize, this.init);
            } else if (this.init != null) {
                // Copy / create and float it up at the location
                const initialize = this.init.animation({
                    ...context,
                    outputSpecifier: [{ type: AccessorType.Symbol, value: this.id.name }],
                });
                graph.addVertex(initialize, this.init);

                const move = new MoveAnimation(
                    [
                        { type: AccessorType.Symbol, value: '_FloatingStack' },
                        { type: AccessorType.Index, value: -1 },
                    ],
                    [{ type: AccessorType.Symbol, value: this.id.name }]
                );
                graph.addVertex(move, this);

                const place = new PlaceAnimation(
                    [
                        { type: AccessorType.Symbol, value: '_FloatingStack' },
                        { type: AccessorType.Index, value: -1 },
                    ],
                    [{ type: AccessorType.Symbol, value: this.id.name }]
                );
                graph.addVertex(place, this);
            }
        }

        return graph;
    }
}
