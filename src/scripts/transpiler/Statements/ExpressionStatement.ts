import * as ESTree from 'estree';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { Node, NodeMeta } from '../Node';
import { Transpiler } from '../Transpiler';

export class ExpressionStatement extends Node {
    expression: Node;

    constructor(ast: ESTree.ExpressionStatement, meta: NodeMeta) {
        super(ast, meta);

        this.expression = Transpiler.transpile(ast.expression, meta);
    }

    animation(context: AnimationContext) {
        return this.expression.animation(context);
    }
}
