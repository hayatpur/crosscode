import * as ESTree from 'estree';
import { apply } from '../animation/animation';
import { createAnimationGraph } from '../animation/graph/AnimationGraph';
import { addVertex } from '../animation/graph/graph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import { copyDataAnimation } from '../animation/primitive/Data/CopyDataAnimation';
import { copyReferenceAnimation } from '../animation/primitive/Data/CopyReferenceAnimation';
import { findVariableAnimation } from '../animation/primitive/Data/FindVariableAnimation';
import { DataState, DataType } from '../environment/data/DataState';
import { resolvePath } from '../environment/environment';
import { AccessorType } from '../environment/EnvironmentState';
import { getCurrentEnvironment } from '../view/view';
import { ViewState } from '../view/ViewState';
import { getNodeData } from './Compiler';

export function Identifier(ast: ESTree.Identifier, view: ViewState, context: AnimationContext) {
    const graph = createAnimationGraph(getNodeData(ast));

    if (context.feed) {
        // Feeding
        const reference = findVariableAnimation(ast.name, context.outputRegister);
        addVertex(graph, reference, { nodeData: getNodeData(ast) });
        apply(reference, view);
    } else {
        const data = resolvePath(
            getCurrentEnvironment(view),
            [{ type: AccessorType.Symbol, value: ast.name }],
            null
        ) as DataState;

        if (data.type == DataType.Array) {
            // Create a reference to it
            const copyReference = copyReferenceAnimation(
                [{ type: AccessorType.Symbol, value: ast.name }],
                context.outputRegister
            );
            addVertex(graph, copyReference, { nodeData: getNodeData(ast) });
            apply(copyReference, view);
        } else if (data.type == DataType.Literal) {
            // Create a copy of it
            const copy = copyDataAnimation(
                [{ type: AccessorType.Symbol, value: ast.name }],
                context.outputRegister
            );
            addVertex(graph, copy, { nodeData: getNodeData(ast) });
            apply(copy, view);
        }
    }

    return graph;
}
