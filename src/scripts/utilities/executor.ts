import * as acorn from 'acorn'
import * as ESTree from 'estree'
import { ExecutionGraph } from '../Analysis/execution/graph/ExecutionGraph'
import { Compiler } from '../Analysis/transpiler/Compiler'
import { createEnvironment } from '../Analysis/transpiler/environment'
import { EnvironmentState } from '../Analysis/transpiler/EnvironmentState'

export type CompileError = {
    message: string
    line: number
}

export function instanceOfCompileError(data: any): data is CompileError {
    return data != null && data['message'] != null && data['line'] != null
}

export function getAST(code: string): ESTree.Node | CompileError {
    // Compile AST
    let ast: ESTree.Node

    try {
        ast = acorn.parse(code, {
            locations: true,
            ecmaVersion: 2017,
        }) as ESTree.Node
    } catch (e: any) {
        return { message: e.toString(), line: 0 }
    }

    return ast
}

/**
 * Compiles user code into an execution graph.
 * @param visualization Visualization state
 * @param code User code
 */
export function compileCode(code: string): CompileError | ExecutionGraph {
    // Construct static AST
    let ast = getAST(code)
    if (instanceOfCompileError(ast)) {
        return ast
    }

    // Construct dynamic AST
    let env: EnvironmentState
    let execution: ExecutionGraph
    try {
        env = createEnvironment()
        execution = Compiler.compile(ast, env, {
            outputRegister: [],
            locationHint: [],
        })
    } catch (e: any) {
        return { message: e.toString(), line: 0 }
    }

    console.log('[Executor] Finished compiling ...')
    console.log('\tAnimation', execution)
    console.log('\tEnvironment', env)

    return execution
}
