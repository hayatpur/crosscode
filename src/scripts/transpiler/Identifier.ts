import * as ESTree from 'estree';
import { Node, NodeMeta } from './Node';

export class Identifier extends Node {
    name: string;
    constructor(ast: ESTree.Identifier, meta: NodeMeta) {
        super(ast, meta);
        this.name = ast.name;
    }
}
