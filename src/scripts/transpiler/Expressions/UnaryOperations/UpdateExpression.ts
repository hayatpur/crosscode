import * as ESTree from 'estree';
import { apply } from '../../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../../animation/graph/AnimationGraph';
import { addVertex } from '../../../animation/graph/graph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { updateAnimation } from '../../../animation/primitive/Data/UpdateAnimation';
import { AccessorType } from '../../../environment/EnvironmentState';
import { ViewState } from '../../../view/ViewState';
import { Compiler, getNodeData } from '../../Compiler';

export function UpdateExpression(ast: ESTree.UpdateExpression, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    const argRegister = [{ type: AccessorType.Register, value: `${graph.id}_UpdateExpr` }];

    // Put the *location* of argument in a register
    const argument = Compiler.compile(ast.argument, view, {
        ...context,
        outputRegister: argRegister,
        feed: true,
    });
    addVertex(graph, argument, { nodeData: getNodeData(ast.argument) });

    // Apply the operation
    const update = updateAnimation(argRegister, ast.operator);
    apply(update, view);
    addVertex(graph, update, { nodeData: getNodeData(ast.argument) });

    return graph;
}

// import * as astring from 'astring';
// import * as ESTree from 'estree';
// import { AnimationContext } from '../../animation/primitive/AnimationNode';
// import MoveAndPlaceAnimation from '../../animation/primitive/Data/MoveAndPlaceAnimation';
// import UpdateAnimation from '../../animation/primitive/Data/UpdateAnimation';
// import { AccessorType } from '../../environment/data/data';
// import { Evaluator } from '../../executor/Evaluator';
// import { Identifier } from '../Identifier';
// import { Node, NodeMeta } from '../Node';
// import { Transpiler } from '../Transpiler';
// import { MemberExpression } from './BinaryOperations/MemberExpression';

// export class UpdateExpression extends Node {
//     argument: Node;
//     operator: string;
//     newValue: any;

//     constructor(ast: ESTree.UpdateExpression, meta: NodeMeta) {
//         super(ast, meta);

//         this.argument = Transpiler.transpile(ast.argument, meta);
//         this.operator = ast.operator;

//         this.newValue = Evaluator.evaluate(
//             `(${astring.generate(ast)}, ${astring.generate(ast.argument)})`,
//             meta.states.prev
//         ).data;
//     }

//     animation(context: AnimationContext) {
//         const graph = createAnimationGraph(this);

//         const register = [{ type: AccessorType.Register, value: `${this.id}__UpdateExpression` }];
//         const specifier =
//             this.argument instanceof MemberExpression
//                 ? this.argument.getSpecifier()
//                 : (this.argument as Identifier).getSpecifier();

//         // Lift up LHS
//         const copy = this.argument.animation({ ...context, locationHint: specifier, outputRegister: register });
//         addVertex(graph, copy, this.argument);

//         // Apply the operation
//         const update = new UpdateAnimation(register, `${this.operator}`, this.newValue);
//         addVertex(graph, update, this.argument);

//         const move = new MoveAndPlaceAnimation(register, specifier, true);
//         addVertex(graph, move, this);

//         return graph;
//     }
// }
