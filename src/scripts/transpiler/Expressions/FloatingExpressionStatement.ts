import * as ESTree from 'estree'
import { FunctionStatement } from '../Functions/FunctionStatement'
import { Node, NodeMeta } from '../Node'
import { Transpiler } from '../Transpiler'

export class FloatingExpressionStatement extends Node {
    static statements: FloatingExpressionStatement[] = []

    arguments: Node[]
    callee: Node
    body: FunctionStatement
    taken: boolean

    constructor(ast: ESTree.CallExpression, meta: NodeMeta) {
        super(ast, meta)

        this.arguments = ast.arguments.map((el) => Transpiler.transpile(el, meta))
        this.callee = Transpiler.transpile(ast.callee, meta)

        this.body = null
        this.taken = false

        FloatingExpressionStatement.statements.push(this)
    }
}
