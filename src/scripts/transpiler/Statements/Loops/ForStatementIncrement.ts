import * as ESTree from 'estree';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';

export default class ForStatementIncrement extends Node {
    update: Node;

    constructor(ast: ESTree.ForStatement, meta: NodeMeta) {
        super(ast, meta);

        this.update = Transpiler.transpile(ast.update, meta);
    }

    animation(context: AnimationContext) {
        return this.update.animation(context);
    }
}
