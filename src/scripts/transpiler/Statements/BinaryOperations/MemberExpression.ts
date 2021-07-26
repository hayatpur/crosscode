import * as astring from 'astring';
import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { Evaluator } from '../../../executor/Evaluator';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';

export class MemberExpression extends Node {
    object: Node;
    property: Node;
    computed: boolean;

    constructor(ast: ESTree.MemberExpression, meta: NodeMeta) {
        super(ast, meta);

        this.object = Transpiler.transpile(ast.object, meta);
        this.computed = ast.computed;

        if (this.computed) {
            // Something like obj[i], or obj['x']
            this.property = Transpiler.transpile(ast.property, meta);
        } else {
            // Something like obj.length, or obj.x
            const value = Evaluator.evaluate(astring.generate(ast), meta.states.current).data;

            this.property = Transpiler.transpile({ type: 'Literal', value, raw: value.toString() }, meta);
        }
    }

    animation(context: AnimationContext) {
        const graph = new AnimationGraph(this, { shouldDissolve: true });

        if (this.computed) {
            // const anim = new CopyMoveSequence(this.getData.bind(this), context.getOutputData, context.getSectionData, {
            //     node: this,
            // });
            // graph.addVertex(anim, context.statement);
        } else {
            const anim = this.property.animation(context);
            graph.addVertex(anim);
        }

        return graph;
    }
}
