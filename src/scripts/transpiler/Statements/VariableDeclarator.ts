import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { bindAnimation } from '../../animation/primitive/Binding/BindAnimation';
import { moveAndPlaceAnimation } from '../../animation/primitive/Data/MoveAndPlaceAnimation';
import { AccessorType } from '../../environment/EnvironmentState';
import { Identifier } from '../Identifier';
import { Literal } from '../Literal';
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
        const graph: AnimationGraph = createAnimationGraph(this);

        // If memory already exists
        if (
            (this.meta.states.current[this.identifier.name]?.reference > 0 ||
                this.meta.states.prev[this.identifier.name]?.reference > 0) &&
            this.init != null &&
            this.init instanceof Identifier
        ) {
            // Allocate a place for variable
            const bind = bindAnimation(this.identifier.name, this.init.getSpecifier());
            addVertex(graph, bind, this.identifier);

            return graph;
        } else {
            // Allocate a place for variable
            const bind = bindAnimation(this.identifier.name);
            addVertex(graph, bind, this.identifier);

            // Assign initial value to variable
            // if (this.init instanceof ArrayExpression) {
            //     const initialize = this.init.animation({
            //         ...context,
            //         locationHint: [{ type: AccessorType.Symbol, value: this.identifier.name }],
            //         outputRegister: [{ type: AccessorType.Symbol, value: this.identifier.name }],
            //     });
            //     addVertex(graph, initialize, this.init);
            // } else if (this.init != null) {
            const register = [{ type: AccessorType.Register, value: `${this.id}__VariableDeclaration` }];

            // Copy / create and float it up at the location
            const initialize = this.init.animation({
                ...context,
                locationHint: [{ type: AccessorType.Symbol, value: this.identifier.name }],
                outputRegister: register,
            });
            addVertex(graph, initialize, this.init);

            const place = moveAndPlaceAnimation(
                register,
                [{ type: AccessorType.Symbol, value: this.identifier.name }],
                this.init instanceof Literal
            );
            addVertex(graph, place, this);
        }
        // }

        return graph;
    }
}
