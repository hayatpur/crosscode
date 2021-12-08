import * as ESTree from 'estree'

export interface CursorState {
    location: ESTree.SourceLocation
    label: string
}

export function createCursorState(): CursorState {
    return {
        location: {
            start: {
                line: 0,
                column: 0,
            },
            end: {
                line: 0,
                column: 0,
            },
        },
        label: 'Test',
    }
}
