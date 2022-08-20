import * as acorn from 'acorn'
import * as ESTree from 'estree'

export function getAST(code: string): {
    ast: ESTree.Node | null
    errors: string[]
} {
    // Compile AST
    let ast: ESTree.Node

    try {
        ast = acorn.parse(code, {
            locations: true,
            ecmaVersion: 2017,
        }) as ESTree.Node
    } catch (e: any) {
        return { ast: null, errors: [e.toString()] }
    }

    return { ast, errors: [] }
    // Check for runtime errors
}
