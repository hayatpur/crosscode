import * as ESTree from 'estree';
import { apply } from '../../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../../animation/graph/AnimationGraph';
import { addVertex } from '../../../animation/graph/graph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { arrayStartAnimation } from '../../../animation/primitive/Container/ArrayStartAnimation';
import { moveAndPlaceAnimation } from '../../../animation/primitive/Data/MoveAndPlaceAnimation';
import { AccessorType } from '../../../environment/EnvironmentState';
import { ViewState } from '../../../view/ViewState';
import { Compiler, getNodeData } from '../../Compiler';

export function ArrayExpression(ast: ESTree.ArrayExpression, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    const start = arrayStartAnimation(context.outputRegister);
    addVertex(graph, start, getNodeData(ast));
    apply(start, view);

    for (let i = 0; i < ast.elements.length; i++) {
        // Create a register that'll point to the RHS
        const register = [{ type: AccessorType.Register, value: `${graph.id}_ArrayExpression_${i}` }];

        const animation = Compiler.compile(ast.elements[i], view, {
            ...context,
            outputRegister: register,
            locationHint: [...context.outputRegister, { type: AccessorType.Index, value: i }],
        });
        addVertex(graph, animation, getNodeData(ast.elements[i]));

        const place = moveAndPlaceAnimation(register, [
            ...context.outputRegister,
            { type: AccessorType.Index, value: i },
        ]);
        addVertex(graph, place, getNodeData(ast.elements[i]));
        apply(place, view);
    }

    return graph;
}

// import * as ESTree from 'estree';
// import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
// import { AnimationContext } from '../../../animation/primitive/AnimationNode';
// import { ArrayStartAnimation } from '../../../animation/primitive/Container/ArrayStartAnimation';
// import { AccessorType, Data } from '../../../environment/data/data';
// import { Node, NodeMeta } from '../../Node';
// import { ArrayExpressionItem, ArrayExpressionItemAST } from './ArrayExpressionItem';

// export class ArrayExpression extends Node {
//     elements: ArrayExpressionItem[];
//     data: Data;

//     constructor(ast: ESTree.ArrayExpression, meta: NodeMeta) {
//         super(ast, meta);

//         // Compile each element of the list
//         this.elements = ast.elements.map((el, i) => {
//             const index = { type: 'Literal', value: i, raw: i.toString(), loc: el.loc } as ESTree.Literal;
//             const ast = { type: 'ArrayExpressionItem', item: el, index: index, loc: el.loc } as ArrayExpressionItemAST;
//             return new ArrayExpressionItem(ast, meta);
//         });
//     }

//     animation(context: AnimationContext): AnimationGraph {
//         const graph = createAnimationGraph(this);

//         addVertex(graph, new ArrayStartAnimation(context.outputRegister), this);

//         for (let i = 0; i < this.elements.length; i++) {
//             const animation = this.elements[i].animation({
//                 ...context,
//                 outputRegister: [...context.outputRegister, { type: AccessorType.Index, value: i }],
//                 locationHint: [...context.outputRegister, { type: AccessorType.Index, value: i }],
//             });
//             addVertex(graph, animation, this);
//         }

//         // graph.computeEdges();

//         // // Add sequential dependencies between array elements
//         // for (let i = 0; i < this.elements.length; i++) {
//         //     graph.addEdge(new FlowEdge(0, i + 1, this.getData.bind(this)));
//         // }

//         return graph;
//     }
// }
