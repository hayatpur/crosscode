import * as ESTree from 'estree';
import { AnimationGraph } from '../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { BindAnimation } from '../../animation/primitive/Binding/BindAnimation';
import MoveAndPlaceAnimation from '../../animation/primitive/Data/MoveAndPlaceAnimation';
import { AccessorType } from '../../environment/Data';
import { ArrayExpression } from '../Expressions/Array/ArrayExpression';
import { Identifier } from '../Identifier';
import { Node, NodeMeta } from '../Node';
import { Transpiler } from '../Transpiler';

export class VariableDeclarator extends Node {
    init?: Node = null;
    identifier: Identifier;

    constructor(ast: ESTree.VariableDeclarator, meta: NodeMeta) {
        super(ast, meta);

        // Compile RHS of expression (i.e. initial value assigned to this variable)
        if (ast.init != null) {
            this.init = Transpiler.transpile(ast.init, meta);
        }

        // Compile LHS of expression (i.e. the symbol)
        this.identifier = new Identifier(ast.id as ESTree.Identifier, meta);
    }

    animation(context: AnimationContext) {
        const graph: AnimationGraph = new AnimationGraph(this);

        // If memory already exists
        if (
            (this.meta.states.current[this.identifier.name]?.reference > 0 ||
                this.meta.states.prev[this.identifier.name]?.reference > 0) &&
            this.init != null &&
            this.init instanceof Identifier
        ) {
            // Allocate a place for variable
            const bind = new BindAnimation(this.identifier.name, this.init.getSpecifier());
            graph.addVertex(bind, this.identifier);

            return graph;
        } else {
            // Allocate a place for variable
            const bind = new BindAnimation(this.identifier.name);
            graph.addVertex(bind, this.identifier);

            // Assign initial value to variable
            if (this.init instanceof ArrayExpression) {
                const initialize = this.init.animation({
                    ...context,
                    locationHint: [{ type: AccessorType.Symbol, value: this.identifier.name }],
                    outputRegister: [{ type: AccessorType.Symbol, value: this.identifier.name }],
                });
                graph.addVertex(initialize, this.init);
            } else if (this.init != null) {
                const register = [{ type: AccessorType.Register, value: `${this.id}_VariableDeclaration` }];

                // Copy / create and float it up at the location
                const initialize = this.init.animation({
                    ...context,
                    locationHint: [{ type: AccessorType.Symbol, value: this.identifier.name }],
                    outputRegister: register,
                });
                graph.addVertex(initialize, this.init);

                const place = new MoveAndPlaceAnimation(register, [
                    { type: AccessorType.Symbol, value: this.identifier.name },
                ]);
                graph.addVertex(place, this);
            }
        }

        return graph;
    }
}
