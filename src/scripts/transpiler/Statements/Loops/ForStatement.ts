// import * as ESTree from 'estree';
// import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
// import { AnimationContext } from '../../../animation/primitive/AnimationNode';
// import CreateScopeAnimation from '../../../animation/primitive/Scope/CreateScopeAnimation';
// import PopScopeAnimation from '../../../animation/primitive/Scope/PopScopeAnimation';
// import { Node, NodeMeta } from '../../Node';
// import { Transpiler } from '../../Transpiler';
// import ForStatementIteration from './ForStatementIteration';

// export class ForStatement extends Node {
//     iterations: ForStatementIteration[];
//     decl: any;

//     constructor(ast: ESTree.ForStatement, meta: NodeMeta) {
//         super(ast, meta);

//         // Iterations of this for loop
//         this.iterations = [];
//         this.decl = Transpiler.transpile(ast.init, meta);
//     }

//     add(node: Node, path: number[]) {
//         if (node instanceof ForStatementIteration && path.length == 0) {
//             this.iterations.push(node);
//         } else {
//             this.iterations[this.iterations.length - 1].add(node, path.slice(1));
//         }
//     }

//     animation(context: AnimationContext): AnimationGraph {
//         const graph = createAnimationGraph(this);

//         addVertex(graph, new CreateScopeAnimation(), this);

//         const decl = this.decl.animation(context);
//         addVertex(graph, decl, this.decl);

//         for (let i = 0; i < this.iterations.length; i++) {
//             // if (this.iterations[i].test != null) {
//             //     const test = this.iterations[i].test.animation(context);
//             //     addVertex(graph, test, this.iterations[i].test);
//             // }

//             // const test = this.iterations[i].test.animation(context);
//             // addVertex(graph, test, this.iterations[i].test);

//             // if (this.iterations[i].block != null) {
//             const animation = this.iterations[i].animation(context);
//             addVertex(graph, animation, this.iterations[i]);
//             // }

//             if (this.iterations[i].incr != null) {
//                 const incr = this.iterations[i].incr.animation(context);
//                 addVertex(graph, incr, this.iterations[i].incr);
//             }
//         }

//         addVertex(graph, new PopScopeAnimation(), this);

//         return graph;
//     }
// }
