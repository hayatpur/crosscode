// import * as ESTree from 'estree';
// import { AnimationContext } from '../../../animation/primitive/AnimationNode';
// import { Node, NodeMeta } from '../../Node';
// import { Transpiler } from '../../Transpiler';
// import ForStatementIncrement from './ForStatementIncrement';

// export class ForStatementIteration extends Node {
//     test: Node;
//     incr: any;
//     block: Node;
//     parent: this;

//     constructor(ast: ESTree.ForStatement, meta: NodeMeta) {
//         super(ast, meta);
//         this.test = Transpiler.transpile(ast.test, meta);
//         this.incr = null;
//     }

//     add(node: Node, path: number[]) {
//         // Base-case, there are no more paths to find (i.e. is a block node)
//         if (path.length == 0) {
//             if (node instanceof ForStatementIncrement) {
//                 this.incr = node;
//                 return;
//             } else if (this.block == null) {
//                 this.block = node;
//                 return;
//             }

//             console.error('[ForStatementIteration] Did not match');
//         }

//         // Slot in to the latest block node
//         this.block.add(node, path.slice(1));
//     }

//     animation(context: AnimationContext) {
//         const graph = createAnimationGraph(this);

//         if (this.block != null) {
//             const animation = this.block.animation(context);
//             addVertex(graph, animation, this.block);
//         }

//         return graph;
//     }
// }
