//@ts-check

import * as ESTree from 'estree';
import { ArrayExpression } from './Expressions/Array/ArrayExpression';
import { ArrayExpressionItem } from './Expressions/Array/ArrayExpressionItem';
import { AssignmentExpression } from './Expressions/BinaryOperations/AssigmentExpression';
import BinaryExpression from './Expressions/BinaryOperations/BinaryExpression/BinaryExpression';
import { MemberExpression } from './Expressions/BinaryOperations/MemberExpression';
import { CallExpression } from './Expressions/CallExpression';
import { FloatingExpressionStatement } from './Expressions/FloatingExpressionStatement';
import { UpdateExpression } from './Expressions/UpdateExpression';
import { FunctionStatement } from './Functions/FunctionStatement';
import { ReturnStatement } from './Functions/ReturnStatement';
import { Identifier } from './Identifier';
import { Literal } from './Literal';
import { Node, NodeMeta } from './Node';
import { BlockStatement } from './Statements/BlockStatement';
import IfStatement from './Statements/Choice/IfStatement';
import { ExpressionStatement } from './Statements/ExpressionStatement';
import ForStatement from './Statements/Loops/ForStatement';
import ForStatementIncrement from './Statements/Loops/ForStatementIncrement';
import ForStatementIteration from './Statements/Loops/ForStatementIteration';
import { Program } from './Statements/Program';
import { VariableDeclaration } from './Statements/VariableDeclaration';
import { VariableDeclarator } from './Statements/VariableDeclarator';

export class Transpiler {
    static blocks: BlockStatement[] = [];

    static transpile(ast: ESTree.Node, meta: NodeMeta): Node {
        const mapping = {
            // Declarations
            VariableDeclarator,
            // Binary Operations
            BinaryExpression,
            UpdateExpression,
            // Expressions
            ArrayExpression,
            ArrayExpressionItem,
            MemberExpression,
            ExpressionStatement,
            VariableDeclaration,
            AssignmentExpression,
            // Identifier
            Identifier,
            // Literal
            Literal,
            // Programs,
            Program,
            // Statements
            BlockStatement,
            ForStatementIteration,
            ForStatement,
            ForStatementIncrement,

            IfStatement,
            FloatingExpressionStatement,
            FunctionStatement,
            CallExpression,
            ReturnStatement,
        };

        if (mapping[`${ast.type}`] == null) {
            console.warn(`Unknown type ${ast.type}`);
            return;
        }

        const node = new mapping[`${ast.type}`](ast, meta, parent);

        if (node instanceof BlockStatement) {
            Transpiler.blocks.push(node);
        }

        return node;
    }

    static transpileFromStorage(storage: any[]): Program {
        const root = new Program(storage[0].ast);

        for (let i = 1; i < storage.length; i++) {
            const message = storage[i];
            const { ast, state, line, path } = message;
            const states = {
                current: state,
                prev: storage[i - 1]?.state ?? {},
                next: storage[i + 1]?.state ?? state,
            };
            const node = Transpiler.transpile(ast, { index: i, states, line, path });
            root.add(node, path);
        }

        root.statements = root.statements.filter((stmt) => !(stmt instanceof FunctionStatement));

        // For each block statement
        for (const block of Transpiler.blocks) {
            block.statements = block.statements.filter((stmt) => !(stmt instanceof FunctionStatement));
        }

        return root;
    }
}
