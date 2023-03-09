//@ts-check

import * as ESTree from 'estree'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionContext, NodeData } from '../execution/primitive/ExecutionNode'
import { EnvironmentState } from './EnvironmentState'
import { ArrayExpression } from './Expressions/Array/ArrayExpression'
import { AssignmentExpression } from './Expressions/BinaryOperations/AssigmentExpression'
import { BinaryExpression } from './Expressions/BinaryOperations/BinaryExpression/BinaryExpression'
import { LogicalExpression } from './Expressions/BinaryOperations/LogicalExpression'
import { MemberExpression } from './Expressions/BinaryOperations/MemberExpression'
import { CallExpression } from './Expressions/CallExpression'
import { ObjectExpression } from './Expressions/ObjectExpression'
import { UnaryExpression } from './Expressions/UnaryOperations/UnaryExpression'
import { UpdateExpression } from './Expressions/UnaryOperations/UpdateExpression'
import { FunctionCall } from './Functions/FunctionCall'
import { FunctionDeclaration } from './Functions/FunctionDeclaration'
import { ReturnStatement } from './Functions/ReturnStatement'
import { Identifier } from './Identifier'
import { Literal } from './Literal'
import { BlockStatement } from './Statements/BlockStatement'
import { IfStatement } from './Statements/Choice/IfStatement'
import { ExpressionStatement } from './Statements/ExpressionStatement'
import { ForStatement } from './Statements/Loops/ForStatement'
import { WhileStatement } from './Statements/Loops/WhileStatement'
import { Program } from './Statements/Program'
import { VariableDeclaration } from './Statements/VariableDeclaration'
import { VariableDeclarator } from './Statements/VariableDeclarator'

/* ------------------------------------------------------ */
/*     Compiles an execution graph from an ESTree AST.    */
/* ------------------------------------------------------ */
export class Compiler {
    static compile(ast: ESTree.Node, environment: EnvironmentState, context: ExecutionContext): ExecutionGraph {
        const mapping = {
            VariableDeclarator,

            BinaryExpression,
            ArrayExpression,
            ObjectExpression,
            MemberExpression,
            ExpressionStatement,
            VariableDeclaration,
            AssignmentExpression,
            Identifier,
            Literal,
            Program,
            BlockStatement,
            ForStatement,
            ReturnStatement,

            IfStatement,
            FunctionCall,
            CallExpression,
            LogicalExpression,
            UpdateExpression,

            WhileStatement,
            FunctionDeclaration,

            UnaryExpression,
        }

        let type = `${ast.type}`
        if (!(type in mapping)) {
            throw new Error(`Unknown type ${ast.type}`)
        }

        const node = mapping[type](ast, environment, context)
        return node
    }
}

/* ------------------------------------------------------ */
/*                         Helpers                        */
/* ------------------------------------------------------ */

export function getNodeData(node: ESTree.Node | ESTree.Node[], preLabel?: string, hasLineBreak?: boolean): NodeData {
    if (Array.isArray(node)) {
        return {
            location: getUnionOfLocations(node.map((n) => n.loc as ESTree.SourceLocation)),
            preLabel: preLabel,
            type: preLabel,
            hasLineBreak: hasLineBreak ?? false,
        }
    } else {
        return {
            location: node.loc as ESTree.SourceLocation | undefined,
            type: node.type,
            preLabel,
            hasLineBreak: hasLineBreak ?? false,
        }
    }
}

export function getUnionOfLocations(locs: ESTree.SourceLocation[]): ESTree.SourceLocation {
    let start = locs[0].start
    let end = locs[0].end

    for (const loc of locs) {
        if (loc.start.line < start.line) {
            start = loc.start
        }

        if (loc.end.line > end.line) {
            end = loc.end
        }

        if (loc.start.column < start.column) {
            start = loc.start
        }

        if (loc.end.column > end.column) {
            end = loc.end
        }
    }

    return {
        start,
        end,
    }
}
