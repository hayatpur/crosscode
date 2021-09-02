// import * as ESTree from 'estree';
// import { AnimationGraph } from '../../animation/graph/AnimationGraph';
// import { AnimationContext } from '../../animation/primitive/AnimationNode';
// import { Identifier } from '../Identifier';
// import { Node, NodeMeta } from '../Node';
// import { Transpiler } from '../Transpiler';

// export class FunctionStatement extends Node {
//     params: Node[];
//     identifier: Identifier;
//     block: Node;
//     declarations: any;

//     constructor(ast: ESTree.FunctionDeclaration, meta: NodeMeta) {
//         super(ast, meta);

//         this.params = ast.params.map((el) => Transpiler.transpile(el, meta));
//         this.identifier = new Identifier(ast.id, meta);
//     }

//     add(node: Node, path: number[]) {
//         // Base-case, there are no more paths to find (i.e. is a block node)
//         if (path.length == 0) {
//             this.block = node;
//             return;
//         }

//         // Slot in to the latest block node
//         this.block.add(node, path.slice(1));
//     }

//     animation(context: AnimationContext): AnimationGraph {
//         const animation = createAnimationGraph(this);

//         const block_anim = this.block.animation(context);
//         addVertex(animation, block_anim, this.block);

//         return animation;
//     }
// }
