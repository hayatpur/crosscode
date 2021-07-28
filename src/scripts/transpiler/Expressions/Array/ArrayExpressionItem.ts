//@ts-check

import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { AccessorType } from '../../../environment/Data';
import { Literal } from '../../Literal';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';

export interface ArrayExpressionItemAST {
    type: string;
    index: ESTree.Literal;
    item: ESTree.Expression;
}

export class ArrayExpressionItem extends Node {
    item: Node;
    index: Literal;

    constructor(ast: ArrayExpressionItemAST, meta: NodeMeta) {
        super(<any>ast, meta);

        this.item = Transpiler.transpile(ast.item, meta);
        this.index = new Literal(ast.index, meta);
    }

    animation(context: AnimationContext): AnimationGraph {
        const graph = new AnimationGraph(this);

        const animation = this.item.animation({
            ...context,
            outputSpecifier: [
                ...context.outputSpecifier,
                { type: AccessorType.Index, value: this.index.value as number },
            ],
            speedMultiplier: Math.sqrt((this.index.value as number) + 1),
        });
        graph.addVertex(animation, this);

        return graph;
    }
}
