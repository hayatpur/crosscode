import acorn = require('acorn');
import * as ESTree from 'estree';
import { apply } from '../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext, ControlOutput, ControlOutputData } from '../../animation/primitive/AnimationNode';
import { createScopeAnimation } from '../../animation/primitive/Scope/CreateScopeAnimation';
import { popScopeAnimation } from '../../animation/primitive/Scope/PopScopeAnimation';
import { DataState } from '../../environment/data/DataState';
import { resolvePath } from '../../environment/environment';
import { Accessor, AccessorType } from '../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../view/view';
import { ViewState } from '../../view/ViewState';
import { Compiler, getNodeData } from '../Compiler';
import { FunctionCall } from '../Functions/FunctionCall';

export function CallExpression(ast: ESTree.CallExpression, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    // Create a scope @TODO: HARD SCOPE
    const createScope = createScopeAnimation();
    addVertex(graph, createScope, { nodeData: getNodeData(ast) });
    apply(createScope, view);

    // Compile the arguments
    const registers: Accessor[][] = [];
    for (let i = 0; i < ast.arguments.length; i++) {
        registers[i] = [{ type: AccessorType.Register, value: `${graph.id}_CallExpression` }];
        const arg = Compiler.compile(ast.arguments[i], view, {
            ...context,
            outputRegister: registers[i],
        });
        addVertex(graph, arg, { nodeData: getNodeData(ast.arguments[i]) });
    }

    const controlOutput: ControlOutputData = { output: ControlOutput.None };

    if (ast.callee.type === 'Identifier') {
        const funcLocation = [{ type: AccessorType.Symbol, value: ast.callee.name }];
        const environment = getCurrentEnvironment(view);
        const funcData = resolvePath(environment, funcLocation, `${graph.id}_CallExpressionFunc`) as DataState;
        const funcAST: ESTree.FunctionDeclaration = JSON.parse(funcData.value as string);

        const body = FunctionCall(funcAST, view, {
            ...context,
            args: registers,
            outputRegister: [],
            returnData: { register: context.outputRegister, frame: environment.scope.length - 1 },
            controlOutput,
        });
        addVertex(graph, body, { nodeData: getNodeData(ast) });
    }

    // Pop scope
    const popScope = popScopeAnimation();
    addVertex(graph, popScope, { nodeData: getNodeData(ast) });
    apply(popScope, view);

    return graph;
}
