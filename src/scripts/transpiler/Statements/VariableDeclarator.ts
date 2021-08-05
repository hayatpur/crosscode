import * as ESTree from 'estree'
import { AnimationGraph } from '../../animation/graph/AnimationGraph'
import { AnimationContext } from '../../animation/primitive/AnimationNode'
import { BindAnimation } from '../../animation/primitive/Binding/BindAnimation'
import PlaceAnimation from '../../animation/primitive/Data/PlaceAnimation'
import { AccessorType } from '../../environment/Data'
import { Identifier } from '../Identifier'
import { Node, NodeMeta } from '../Node'
import { Transpiler } from '../Transpiler'

export class VariableDeclarator extends Node {
    init?: Node
    id: Identifier

    constructor(ast: ESTree.VariableDeclarator, meta: NodeMeta) {
        super(ast, meta)

        // Compile RHS of expression (i.e. initial value assigned to this variable)
        if (ast.init != null) {
            this.init = Transpiler.transpile(ast.init, meta)
        } else {
            const value = { type: 'Literal', value: undefined, raw: 'undefined', loc: ast.loc } as ESTree.Literal
            this.init = Transpiler.transpile(value, meta)
        }

        // Compile LHS of expression (i.e. the symbol)
        this.id = new Identifier(ast.id as ESTree.Identifier, meta)
    }

    animation(context: AnimationContext) {
        // Return an animation graph that is composed of our two animations - 'bind' and 'init',
        // the graph should dissolve into the parent graph

        const graph: AnimationGraph = new AnimationGraph(this)

        // if (this.init instanceof Identifier && this.meta.states.current[this.init.name].reference != null) {
        //     // Potential for binding to existing memory, no need to allocate
        //     graph.addVertex(new ReferenceAssignAnimation([{ type: AccessorType.Symbol, value: this.init.name }]), this)
        // } else {

        // Copy / create and float it up
        graph.addVertex(this.init.animation(context), this)
        // }

        const bind = new BindAnimation(this.id.name)
        graph.addVertex(bind, this)

        // Place data into correct location
        const place = new PlaceAnimation([
            { type: AccessorType.ID, value: '_Floating' },
            { type: index, value: -1 },
        ])

        return graph
    }
}
