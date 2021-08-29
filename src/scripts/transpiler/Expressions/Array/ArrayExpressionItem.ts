//@ts-check

import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import MoveAndPlaceAnimation from '../../../animation/primitive/Data/MoveAndPlaceAnimation';
import { AccessorType } from '../../../environment/Data';
import { Literal } from '../../Literal';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';

export interface ArrayExpressionItemAST {
    type: string;
    index: ESTree.Literal;
    item: ESTree.Expression;
    loc: ESTree.SourceLocation;
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

        const register = [{ type: AccessorType.Register, value: `${this.id}__ArrayExpressionItem` }];

        // Creates literal / expression onto outputRegister
        const animation = this.item.animation({
            ...context,
            outputRegister: register,
        });
        graph.addVertex(animation, this);

        // Move and place it
        const place = new MoveAndPlaceAnimation(register, context.outputRegister, this.item instanceof Literal);
        graph.addVertex(place, this);

        return graph;
    }

    // reads(options = {}): Set<Accessor[]> {
    //     let set: Set<Accessor[]> = new Set();
    //     this.elements.forEach((el) => (set = new Set([...set, ...el.reads(options)])));
    //     return set;
    // }

    // writes(options = {}): Set<Accessor[]> {
    //     let set: Set<Accessor[]> = new Set();
    //     this.elements.forEach((el) => (set = new Set([...set, ...el.writes(options)])));
    //     return set;
    // }
}
