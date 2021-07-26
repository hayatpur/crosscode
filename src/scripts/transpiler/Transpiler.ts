//@ts-check

import * as ESTree from 'estree';
import { ArrayExpression } from './Expressions/Array/ArrayExpression';
import { ArrayExpressionItem } from './Expressions/Array/ArrayExpressionItem';
import { Identifier } from './Identifier';
import { Literal } from './Literal';
import { Node, NodeMeta } from './Node';
import { MemberExpression } from './Statements/BinaryOperations/MemberExpression';
import { BlockStatement } from './Statements/BlockStatement';
import { Program } from './Statements/Program';
import { VariableDeclaration } from './Statements/VariableDeclaration';
import { VariableDeclarator } from './Statements/VariableDeclarator';

export class Transpiler {
    static transpile(ast: ESTree.Node, meta: NodeMeta): Node {
        const mapping = {
            // Declarations
            VariableDeclarator,
            // Binary Operations
            // AssignmentExpression,
            // Expressions
            ArrayExpression,
            ArrayExpressionItem,
            MemberExpression,
            // ExpressionStatement,
            VariableDeclaration,
            // Identifier
            Identifier,
            // Literal
            Literal,
            // Programs,
            Program,
            // Statements
            BlockStatement,
        };

        if (mapping[`${ast.type}`] == null) {
            console.warn(`Unknown type ${ast.type}`);
            return;
        }

        return new mapping[`${ast.type}`](ast, meta, parent);
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

        return root;
    }
}
