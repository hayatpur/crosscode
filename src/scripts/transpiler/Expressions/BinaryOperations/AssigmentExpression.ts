import * as astring from 'astring';
import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import MoveAndPlaceAnimation from '../../../animation/primitive/Data/MoveAndPlaceAnimation';
import UpdateAnimation from '../../../animation/primitive/Data/UpdateAnimation';
import { AccessorType } from '../../../environment/Data';
import { Evaluator } from '../../../executor/Evaluator';
import { Identifier } from '../../Identifier';
import { Literal } from '../../Literal';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';
import { MemberExpression } from './MemberExpression';

export class AssignmentExpression extends Node {
    left: Node;
    right: Node;
    operator: ESTree.AssignmentOperator;
    right_str: string;
    newValue: any;

    constructor(ast: ESTree.AssignmentExpression, meta: NodeMeta) {
        super(ast, meta);

        this.left = Transpiler.transpile(ast.left, meta);
        this.right = Transpiler.transpile(ast.right, meta);

        this.right_str = astring.generate(ast.right);
        this.newValue = Evaluator.evaluate(
            `(${astring.generate(ast)}, ${astring.generate(ast.left)})`,
            meta.states.prev
        ).data;
        this.operator = ast.operator;
    }

    animation(context: AnimationContext) {
        const graph = new AnimationGraph(this);

        const register = [{ type: AccessorType.Register, value: `${this.id}_Assignment` }];

        const leftSpecifier =
            this.left instanceof MemberExpression ? this.left.getSpecifier() : (this.left as Identifier).getSpecifier();

        if (this.operator == '=') {
            // Right should be in the floating stack
            const right = this.right.animation({
                ...context,
                locationHint: leftSpecifier,
                outputRegister: register,
            });
            graph.addVertex(right, this.right);

            const move = new MoveAndPlaceAnimation(register, leftSpecifier, right instanceof Literal);
            graph.addVertex(move, this);
        } else {
            // Lift up LHS
            const left = this.left.animation({ ...context, locationHint: leftSpecifier, outputRegister: register });
            graph.addVertex(left, this.left);

            // Apply the operation
            const update = new UpdateAnimation(register, `${this.operator} ${this.right_str}`, this.newValue);
            graph.addVertex(update, this.right);

            const move = new MoveAndPlaceAnimation(register, leftSpecifier, true);
            graph.addVertex(move, this);
        }

        return graph;
    }
}
