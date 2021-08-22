import * as ESTree from 'estree';
import { AnimationGraph } from '../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import CreateScopeAnimation from '../../animation/primitive/Scope/CreateScopeAnimation';
import PopScopeAnimation from '../../animation/primitive/Scope/PopScopeAnimation';
import { FunctionStatement } from '../Functions/FunctionStatement';
import { Identifier } from '../Identifier';
import { Node, NodeMeta } from '../Node';
import { VariableDeclaration } from '../Statements/VariableDeclaration';
import { Transpiler } from '../Transpiler';
import { MemberExpression } from './BinaryOperations/MemberExpression';
import { FloatingExpressionStatement } from './FloatingExpressionStatement';

export class CallExpression extends Node {
    callee: Node;
    arguments: Node[];
    ast: any;
    body: FunctionStatement;
    declaration: VariableDeclaration;

    constructor(ast: ESTree.CallExpression, meta: NodeMeta) {
        super(ast, meta);

        this.callee = Transpiler.transpile(ast.callee, meta);
        this.arguments = ast.arguments.map((el) => Transpiler.transpile(el, meta));

        if (this.callee instanceof MemberExpression) {
            // Method call TODO
        }

        // Try to grab the floating call expr that belongs to it
        for (const floating of FloatingExpressionStatement.statements) {
            if (floating.taken) continue;
            console.log(floating);
            let sameCallee = false;
            if (floating.callee instanceof MemberExpression && this.callee instanceof MemberExpression) {
                // TODO
            } else if (floating.callee instanceof Identifier && this.callee instanceof Identifier) {
                sameCallee = floating.callee.name == this.callee.name;
            }

            // TODO: be more specific
            if (sameCallee && floating.loc.start.line == this.loc.start.line) {
                this.body = floating.body;
                floating.taken = true;
                console.log('Success');
                break;
            }
        }

        let declarationAST = {
            type: 'VariableDeclaration',
            declarations: [],
            kind: 'let',
            loc: ast.loc,
        } as ESTree.VariableDeclaration;

        for (let i = 0; i < this.body.params.length; i++) {
            const param = this.body.params[i];

            if (param instanceof Identifier) {
                const paramAST = {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: param.name, loc: param.loc } as ESTree.Identifier,
                    init: ast.arguments[i],
                    loc: ast.arguments[i].loc,
                } as ESTree.VariableDeclarator;

                declarationAST.declarations.push(paramAST);
            }
        }

        this.declaration = new VariableDeclaration(declarationAST, meta);
    }

    animation(context: AnimationContext) {
        const graph = new AnimationGraph(this);
        graph.addVertex(new CreateScopeAnimation(), this);

        // Argument bindings
        graph.addVertex(this.declaration.animation(context), this.body);

        // Body
        graph.addVertex(this.body.animation(context), this.body);

        graph.addVertex(new PopScopeAnimation(), this);

        return graph;
    }
}
