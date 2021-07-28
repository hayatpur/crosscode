import * as astring from 'astring';
import * as ESTree from 'estree';
import { AnimationGraph } from '../../animation/graph/AnimationGraph';
import { Evaluator } from '../../executor/Evaluator';
import { Node, NodeMeta } from '../Node';
import { Transpiler } from '../Transpiler';

export class UpdateExpression extends Node {
    argument: Node;
    operator: string;
    value: any;

    constructor(ast: ESTree.UpdateExpression, meta: NodeMeta) {
        super(ast, meta);

        this.argument = Transpiler.transpile(ast.argument, meta);
        this.operator = ast.operator;

        this.value = Evaluator.evaluate(astring.generate(ast), meta.states.prev).data;
    }

    animation(context = {}) {
        const graph = new AnimationGraph(this, { shouldDissolve: true });

        // const animation = new UpdateExpressionSequence(
        //     this.argument.getData.bind(this.argument),
        //     context.getOutputData,
        //     this.getData.bind(this),
        //     context.getSectionData,
        //     this.operator,
        //     () => 'test',
        //     context.input?.context
        // );

        // graph.addVertex(animation, context.statement);

        return graph;
    }
}
