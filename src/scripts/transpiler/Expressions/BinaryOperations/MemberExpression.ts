import * as ESTree from 'estree'
import { apply } from '../../../animation/animation'
import { AnimationGraph, createAnimationGraph } from '../../../animation/graph/AnimationGraph'
import { addVertex } from '../../../animation/graph/graph'
import { AnimationContext } from '../../../animation/primitive/AnimationNode'
import { findMember } from '../../../animation/primitive/Data/FindMember'
import { getMember } from '../../../animation/primitive/Data/GetMember'
import { convertIdentifierToLiteral } from '../../../environment/data/data'
import { AccessorType } from '../../../environment/EnvironmentState'
import { RootViewState } from '../../../view/ViewState'
import { Compiler, getNodeData } from '../../Compiler'

/**
 *
 * @param ast
 * @param view
 * @param context
 * @returns
 */
export function MemberExpression(ast: ESTree.MemberExpression, view: RootViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    // Create a register which'll *point* to the location of object
    const objectRegister = [{ type: AccessorType.Register, value: `${graph.id}_Object` }]
    const object = Compiler.compile(ast.object, view, {
        ...context,
        feed: false,
        outputRegister: objectRegister,
    })
    addVertex(graph, object, { nodeData: getNodeData(ast.object) })

    // Create a register that'll point to the location of computed property
    const propertyRegister = [{ type: AccessorType.Register, value: `${graph.id}_Property` }]

    // Something like obj[i], or obj['x']
    const property = Compiler.compile(
        ast.computed ? ast.property : convertIdentifierToLiteral(ast.property as ESTree.Identifier),
        view,
        {
            ...context,
            outputRegister: propertyRegister,
            feed: false,
        }
    )
    addVertex(graph, property, { nodeData: getNodeData(ast.property) })

    // Compute the result
    if (context.feed) {
        const find = findMember(objectRegister, propertyRegister, context.outputRegister)
        addVertex(graph, find, { nodeData: getNodeData(ast) })
        apply(find, view)
    } else {
        const member = getMember(objectRegister, propertyRegister, context.outputRegister)
        addVertex(graph, member, { nodeData: getNodeData(ast) })
        apply(member, view)
    }

    return graph
}

// export class MemberExpression extends Node {
//     object: Node;
//     property: Node;
//     computed: boolean;
//     object_string: string;
//     property_string: string;

//     constructor(ast: ESTree.MemberExpression, meta: NodeMeta) {
//         super(ast, meta);

//         this.object = Transpiler.transpile(ast.object, meta);
//         this.computed = ast.computed;

//         this.object_string = astring.generate(ast.object);

//         if (this.computed) {
//             // Something like obj[i], or obj['x']
//             this.property = Transpiler.transpile(ast.property, meta);
//             this.property_string = astring.generate(ast.property);
//         } else {
//             // Something like obj.length, or obj.x
//             const value = Evaluator.evaluate(astring.generate(ast), meta.states.current).data;

//             this.property = Transpiler.transpile(
//                 { type: 'Literal', value, raw: value.toString(), loc: ast.property.loc },
//                 meta
//             );
//         }
//     }

//     getSpecifier() {
//         return [
//             { type: AccessorType.Symbol, value: this.object_string },
//             {
//                 type: AccessorType.Index,
//                 value: Evaluator.evaluate(this.property_string, this.meta.states.current).data,
//             },
//         ];
//     }

//     animation(context: AnimationContext) {
//         const graph = createAnimationGraph(this);

//         if (this.computed) {
//             const anim = new CopyDataAnimation(this.getSpecifier(), context.outputRegister);
//             addVertex(graph, anim, this);
//         } else {
//             // TODO
//             const anim = this.property.animation(context);
//             addVertex(graph, anim, this);
//         }

//         return graph;
//     }
// }
