import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import MoveAndPlaceAnimation from '../../../animation/primitive/Data/MoveAndPlaceAnimation';
import { AccessorType } from '../../../environment/Data';
import { Identifier } from '../../Identifier';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';
import { MemberExpression } from './MemberExpression';

export class AssignmentExpression extends Node {
    left: Node;
    right: Node;

    constructor(ast: ESTree.AssignmentExpression, meta: NodeMeta) {
        super(ast, meta);

        this.left = Transpiler.transpile(ast.left, meta);
        this.right = Transpiler.transpile(ast.right, meta);
    }

    animation(context: AnimationContext) {
        const graph = new AnimationGraph(this);

        const outputSpecifier =
            this.left instanceof MemberExpression ? this.left.getSpecifier() : (this.left as Identifier).getSpecifier();

        const register = [{ type: AccessorType.Register, value: `${this.id}_Assignment` }];

        // Right should be in the floating stack
        const right = this.right.animation({
            ...context,
            locationHint: outputSpecifier,
            outputRegister: register,
        });
        graph.addVertex(right, this.right);

        const move = new MoveAndPlaceAnimation(register, outputSpecifier);
        graph.addVertex(move, this);

        return graph;
    }
}
