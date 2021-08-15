import * as astring from 'astring';
import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import CopyDataAnimation from '../../../animation/primitive/Data/CopyDataAnimation';
import { AccessorType } from '../../../environment/Data';
import { Evaluator } from '../../../executor/Evaluator';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';

export class MemberExpression extends Node {
    object: Node;
    property: Node;
    computed: boolean;
    object_string: string;
    property_string: string;

    constructor(ast: ESTree.MemberExpression, meta: NodeMeta) {
        super(ast, meta);

        this.object = Transpiler.transpile(ast.object, meta);
        this.computed = ast.computed;

        this.object_string = astring.generate(ast.object);

        if (this.computed) {
            // Something like obj[i], or obj['x']
            this.property = Transpiler.transpile(ast.property, meta);
            this.property_string = astring.generate(ast.property);
        } else {
            // Something like obj.length, or obj.x
            const value = Evaluator.evaluate(astring.generate(ast), meta.states.current).data;

            this.property = Transpiler.transpile(
                { type: 'Literal', value, raw: value.toString(), loc: ast.property.loc },
                meta
            );
        }
    }

    getSpecifier() {
        return [
            { type: AccessorType.Symbol, value: this.object_string },
            {
                type: AccessorType.Index,
                value: Evaluator.evaluate(this.property_string, this.meta.states.current).data,
            },
        ];
    }

    animation(context: AnimationContext) {
        const graph = new AnimationGraph(this);

        if (this.computed) {
            const anim = new CopyDataAnimation(this.getSpecifier(), context.outputRegister);
            graph.addVertex(anim, this);
        } else {
            // TODO
            const anim = this.property.animation(context);
            graph.addVertex(anim, this);
        }

        return graph;
    }
}
