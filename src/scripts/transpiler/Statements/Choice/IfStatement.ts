// import * as ESTree from 'estree';
// import { AnimationContext } from '../../../animation/primitive/AnimationNode';
// import { Node, NodeMeta } from '../../Node';
// import { Transpiler } from '../../Transpiler';

// export class IfStatement extends Node {
//     test: Node;
//     consequent?: Node;
//     alternate?: Node;

//     constructor(ast: ESTree.IfStatement, meta: NodeMeta) {
//         super(ast, meta);

//         // Body of if statement
//         this.consequent = null;

//         // Else-if or else
//         this.alternate = null;

//         this.test = Transpiler.transpile(ast.test, meta);
//     }

//     add(node: Node, path: number[]) {
//         // Base-case, there are no more paths to find (i.e. is a block node)
//         if (path.length == 0) {
//             if (this.alternate != null) {
//                 this.alternate.add(node, []);
//                 return;
//             }

//             // TODO: Heuristic based on code format
//             if (node.meta.line - this.meta.line > 1) {
//                 this.alternate = node;
//             } else {
//                 this.consequent = node;
//             }

//             return;
//         }

//         // Slot in to the latest block node
//         this.alternate?.add(node, this.alternate instanceof IfStatement ? path : path.slice(1));
//         this.consequent?.add(node, path.slice(1));
//     }

//     animation(context: AnimationContext) {
//         const graph = createAnimationGraph(this);

//         if (this.test != null) {
//             addVertex(graph, this.test.animation(context), this.test);
//         }

//         // If successful
//         if (this.consequent != null) {
//             addVertex(graph, this.consequent.animation(context), this.consequent);
//         }

//         // If there is an else-if or else block
//         if (this.alternate != null) {
//             addVertex(graph, this.alternate.animation(context), this.alternate);
//         }

//         return graph;
//     }
// }
