// import * as ESTree from 'estree';
// import { AnimationContext } from '../../../animation/primitive/AnimationNode';
// import CreateScopeAnimation from '../../../animation/primitive/Scope/CreateScopeAnimation';
// import PopScopeAnimation from '../../../animation/primitive/Scope/PopScopeAnimation';
// import { Node, NodeMeta } from '../../Node';
// import WhileStatementIteration from './WhileStatementIteration';

// export class WhileStatement extends Node {
//     iterations: WhileStatementIteration[];

//     constructor(ast: ESTree.WhileStatement, meta: NodeMeta) {
//         super(ast, meta);

//         // Iterations of this for loop
//         this.iterations = [];
//     }

//     add(node: Node, path: number[]) {
//         if (node instanceof WhileStatementIteration && path.length == 0) {
//             this.iterations.push(node);
//         } else {
//             this.iterations[this.iterations.length - 1].add(node, path.slice(1));
//         }
//     }

//     animation(context: AnimationContext) {
//         const graph = createAnimationGraph(this);

//         addVertex(graph, new CreateScopeAnimation(), this);

//         for (let i = 0; i < this.iterations.length; i++) {
//             addVertex(graph, this.iterations[i].animation(context), this.iterations[i]);
//         }

//         addVertex(graph, new PopScopeAnimation(), this);

//         return graph;
//     }
// }
