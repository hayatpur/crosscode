// import * as ESTree from 'estree';
// import { AnimationGraph } from '../../animation/graph/AnimationGraph';
// import { AnimationContext } from '../../animation/primitive/AnimationNode';
// import { ReturnStatementAnimation } from '../../animation/primitive/Functions/ReturnStatementAnimation';
// import { AccessorType } from '../../environment/data/data';
// import { Node, NodeMeta } from '../Node';
// import { Transpiler } from '../Transpiler';

// export class ReturnStatement extends Node {
//     argument: Node;

//     constructor(ast: ESTree.ReturnStatement, meta: NodeMeta) {
//         super(ast, meta);

//         this.argument = Transpiler.transpile(ast.argument, meta);
//     }

//     animation(context: AnimationContext): AnimationGraph {
//         const animation = createAnimationGraph(this);

//         const anim = this.argument.animation(context);
//         addVertex(animation, anim, this.argument);

//         const ret = new ReturnStatementAnimation([
//             { type: AccessorType.Symbol, value: '_FloatingStack' },
//             { type: AccessorType.Index, value: -1 },
//         ]);
//         addVertex(animation, ret, this.argument);

//         return animation;
//     }
// }
