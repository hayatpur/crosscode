import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
// import { ArrayExpressionItemAST } from './Expressions/Array/ArrayExpressionItem';

export interface NodeMeta {
    index: number;
    states: {
        prev: { [s: string]: any };
        current: { [s: string]: any };
        next: { [s: string]: any };
    };
    line: number;
    path: number[];
}

export class Node {
    meta: NodeMeta;
    loc: ESTree.SourceLocation;
    type: string;

    static id = 0;
    id: string;

    constructor(ast: ESTree.Node, meta: NodeMeta) {
        this.meta = meta;
        this.loc = ast.loc;
        this.type = ast.type;

        // console.log(ast);
        // if (ast.type == "ArrayExpressionItem") {
        //   this.astring = astring.generate((ast as ArrayExpressionItemAST).item);
        // } else if (ast.type == "ForStatementIteration") {
        //   this.astring = astring.generate((ast as ForStatementIteration).);
        // } else {
        //   this.astring = astring.generate(ast);
        // }

        this.id = `Node(${Node.id})`;
        Node.id += 1;
    }

    animation(context?: AnimationContext): AnimationGraph {
        console.error('[Node] Animation method not implemented for', this);
        return createAnimationGraph(null);
    }

    add(node: Node, path: number[]) {
        console.error('[Node] Add method not implemented for', this);
    }
}
