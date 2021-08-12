import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import MoveAnimation from '../../../animation/primitive/Data/MoveAnimation';
import PlaceAnimation from '../../../animation/primitive/Data/PlaceAnimation';
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

        // Right should be in the floating stack
        const right = this.right.animation({
            ...context,
            outputSpecifier,
        });
        graph.addVertex(right, this.right);

        const move = new MoveAnimation(
            [
                { type: AccessorType.Symbol, value: '_FloatingStack' },
                { type: AccessorType.Index, value: -1 },
            ],
            outputSpecifier
        );
        graph.addVertex(move, this);

        const place = new PlaceAnimation(
            [
                { type: AccessorType.Symbol, value: '_FloatingStack' },
                { type: AccessorType.Index, value: -1 },
            ],
            outputSpecifier
        );
        graph.addVertex(place, this);

        return graph;
    }
}
