import { BlockStatement } from './BlockStatement';

export class Program extends BlockStatement {
    constructor(ast: any) {
        // A program is a block statement that starts at the beginning
        super(ast, { index: 0, states: { prev: [], current: [], next: [] }, line: 0, path: [] });
    }

    animation() {
        return super.animation({ outputSpecifier: [] });
    }
}
