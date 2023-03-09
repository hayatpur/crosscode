import * as ESTree from 'estree'
import * as monaco from 'monaco-editor'
import { getDarkTheme, getDawnTheme, getLightTheme } from './EditorThemes'

export type EditorState = {
    parent: HTMLElement
    monacoEditor: monaco.editor.IStandaloneCodeEditor

    // Callbacks
    onSelectionUpdate: Set<(e: monaco.editor.ICursorSelectionChangedEvent) => void>
    onChangeContent: Set<() => void>
}

export class EditorInstance {
    static instance: EditorState
}

export namespace Editor {
    /**
     * Create an editor instance with Monaco.
     * @returns EditorState
     */
    export async function createEditor(): Promise<EditorState> {
        monaco.editor.defineTheme('atom', getDarkTheme() as monaco.editor.IStandaloneThemeData)
        monaco.editor.defineTheme('github', getLightTheme() as monaco.editor.IStandaloneThemeData)
        monaco.editor.defineTheme('dawn', getDawnTheme() as monaco.editor.IStandaloneThemeData)

        const parent = document.getElementById(`editor`) as HTMLElement

        const monacoEditor = monaco.editor.create(parent, {
            value: '',
            language: 'javascript',
            minimap: {
                enabled: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
                vertical: 'hidden',
                alwaysConsumeMouseWheel: false,
                handleMouseWheel: false,
            },
            overviewRulerBorder: false,
            fontSize: 24,
            contextmenu: false,
            mouseWheelScrollSensitivity: 0,
            lineHeight: 36,
            selectOnLineNumbers: false,
            dragAndDrop: false,
            theme: 'dawn',
            fontFamily: window.getComputedStyle(document.documentElement).getPropertyValue('--code-font-family'),
            fontLigatures: true,
            smoothScrolling: true,
        })

        // Callbacks
        const onSelectionUpdate: Set<(e: monaco.editor.ICursorSelectionChangedEvent) => void> = new Set()
        const onChangeContent: Set<() => void> = new Set()

        // const defaultUrl = new URL('/default.js', import.meta.url).href

        const defaultUrl = new URL('/default.js', import.meta.url).href
        const defaultText = await fetch(defaultUrl).then((response) => response.text())

        monacoEditor.getModel()!.setValue(defaultText)

        monacoEditor.getModel()!.onDidChangeContent(() => {
            onChangeContent.forEach((callback) => callback())
            monacoEditor.updateOptions({ codeLens: false })
            monacoEditor.updateOptions({ codeLens: true })
        })

        monacoEditor.onDidChangeCursorSelection((e) => {
            onSelectionUpdate.forEach((callback) => callback(e))
        })

        onChangeContent.forEach((callback) => callback())
        monaco.editor.remeasureFonts()

        const editorState = {
            parent,
            monacoEditor,

            // Callbacks
            onSelectionUpdate,
            onChangeContent,
        }

        EditorInstance.instance = editorState

        setTimeout(() => monaco.editor.remeasureFonts(), 800)

        return editorState
    }

    /**
     * Marks errors on the editor at the given line.
     * @param editor
     * @param errors
     */
    export function markError(editor: EditorState, errors: { message: string; line: number }[]) {
        const model = editor.monacoEditor.getModel() as monaco.editor.ITextModel

        for (const error of errors) {
            monaco.editor.setModelMarkers(model, 'javascript', [
                {
                    startLineNumber: error.line + 1,
                    endLineNumber: error.line + 1,
                    startColumn: 0,
                    endColumn: 1,

                    message: error.message,
                    severity: monaco.MarkerSeverity.Error,
                },
            ])
        }
    }

    /**
     * @param editor
     * @returns Editor text
     */
    export function getValue(editor: EditorState) {
        return editor.monacoEditor.getValue()
    }

    /**
     * @param editor
     * @param range
     * @returns Editor text at given range
     */
    export function getValueAt(editor: EditorState, range: ESTree.SourceLocation) {
        const model = editor.monacoEditor.getModel()!

        return model.getValueInRange({
            startLineNumber: range.start.line,
            startColumn: range.start.column + 1,
            endLineNumber: range.end.line,
            endColumn: range.end.column + 1,
        })
    }

    /**
     * @param editor
     * @returns Selected text in editor
     */
    export function getSelectedText(editor: EditorState) {
        const model = editor.monacoEditor.getModel() as monaco.editor.ITextModel
        return model.getValueInRange(editor.monacoEditor.getSelection() as monaco.Selection)
    }

    /**
     * @param editor
     * @param ln
     * @returns Bounding box of a line in editor
     */
    export function computeBoundingBoxForLine(editor: EditorState, ln: number) {
        const lines = Array.from(editor.parent.getElementsByClassName('view-lines')[0].children)
        lines.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)

        const line = lines[ln - 1]

        return line?.children[0].getBoundingClientRect()
    }

    /**
     * @param editor
     * @param location
     * @returns Bounding box of a location in editor
     */
    export function computeBoundingBoxForLoc(editor: EditorState, location: ESTree.SourceLocation) {
        const start = computeBoundingBoxForLine(editor, location.start.line)
        const end = computeBoundingBoxForLine(editor, location.end.line)

        if (start == null || end == null) {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }
        }

        const charWidth = computeCharWidth(editor, location.start.line)

        const min_y = Math.min(start.y, end.y)
        const min_x = Math.min(start.x, end.x)

        let y = min_y
        let x = min_x + Math.min(location.start.column, location.end.column) * charWidth

        let height = end.y + end.height - start.y
        let width =
            (Math.max(location.start.column, location.end.column) -
                Math.min(location.start.column, location.end.column)) *
            charWidth

        for (let line = location.start.line; line < location.end.line; line++) {
            const lineBbox = computeBoundingBoxForLine(editor, line)
            width = Math.max(width, lineBbox.width)
        }

        return { x: x, y: y, width: width, height: height }
    }

    /**
     * @param editor
     * @param ln
     * @returns Compute width of a character
     */
    export function computeCharWidth(editor: EditorState, ln = 1) {
        const lines = editor.parent.getElementsByClassName('view-lines')[0]
        const line = lines.children[ln - 1]?.children[0] as HTMLElement

        if (line == null) {
            return 0
        }

        return line.getBoundingClientRect().width / line.innerText.length
    }

    /**
     * @param editor
     * @returns Get all HTML text tokens in editor
     */
    export function getAllTokens(editor: EditorState) {
        return Array.from(editor.parent.querySelectorAll('.view-line > span > span'))
    }

    /**
     * @param editor
     * @param bbox
     * @param tokens
     * @returns Get all HTML text tokens in editor that are contained in the given bounding box
     */
    export function getContainedTokenElements(
        editor: EditorState,
        bbox: { x: number; y: number; width: number; height: number },
        tokens?: Element[]
    ) {
        if (tokens == undefined) {
            tokens = Array.from(editor.parent.querySelectorAll('.view-line > span > span'))
        }

        return tokens.filter((token) => {
            const tokenBbox = token.getBoundingClientRect()
            return (
                tokenBbox.x >= bbox.x &&
                tokenBbox.y >= bbox.y &&
                tokenBbox.x + tokenBbox.width <= bbox.x + bbox.width &&
                tokenBbox.y + tokenBbox.height <= bbox.y + bbox.height
            )
        })
    }

    /**
     * @param editor
     * @param ln
     * @returns Get HTML element of a line in editor
     */
    export function getLineElement(editor: EditorState, ln: number) {
        const lines = editor.parent.getElementsByClassName('view-lines')[0]
        return lines.children[ln - 1]
    }

    /**
     * @param editor
     * @returns Get maximum width overall all lines in editor
     */
    export function getMaxWidth(editor: EditorState) {
        let maxWidth = 0
        for (const lineEl of Array.from(editor.parent.querySelectorAll('.view-line'))) {
            const tokens = lineEl.children[0].children
            if (tokens.length > 0) {
                const last = tokens[tokens.length - 1]
                const bbox = last.getBoundingClientRect()
                maxWidth = Math.max(maxWidth, bbox.right)
            } else {
                const bbox = lineEl.getBoundingClientRect()
                maxWidth = Math.max(maxWidth, bbox.left)
            }
        }
        return maxWidth
    }
}
