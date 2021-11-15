//@ts-check

import * as ESTree from 'estree'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationContext, NodeData } from '../animation/primitive/AnimationNode'
import { RootViewState } from '../view/ViewState'
import { ArrayExpression } from './Expressions/Array/ArrayExpression'
import { AssignmentExpression } from './Expressions/BinaryOperations/AssigmentExpression'
import { BinaryExpression } from './Expressions/BinaryOperations/BinaryExpression/BinaryExpression'
import { LogicalExpression } from './Expressions/BinaryOperations/LogicalExpression'
import { MemberExpression } from './Expressions/BinaryOperations/MemberExpression'
import { CallExpression } from './Expressions/CallExpression'
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

export function getNodeData(node: ESTree.Node): NodeData {
    return { location: node.loc, type: node.type }
}

export class Compiler {
    static compile(ast: ESTree.Node, view: RootViewState, context: AnimationContext): AnimationGraph {
        const mapping = {
            VariableDeclarator,

            BinaryExpression,
            ArrayExpression,
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
        }

        if (mapping[`${ast.type}`] == null) {
            console.warn(`Unknown type ${ast.type}`)
            return
        }

        const node = new mapping[`${ast.type}`](ast, view, context)
        return node
    }
}
