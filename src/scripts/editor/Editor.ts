import * as ESTree from 'estree'
import * as monaco from 'monaco-editor'
import { getDarkTheme, getLightTheme } from './EditorThemes'

export class Editor {
    // Singleton
    static instance: Editor
    parent: HTMLElement

    monaco: monaco.editor.IStandaloneCodeEditor

    // Callbacks
    onSelectionUpdate: Set<
        (e: monaco.editor.ICursorSelectionChangedEvent) => void
    >
    onChangeContent: Set<() => void>

    dragSelections: HTMLDivElement[] = []

    constructor() {
        // Singleton
        Editor.instance = this

        monaco.editor.defineTheme(
            'atom',
            getDarkTheme() as monaco.editor.IStandaloneThemeData
        )
        monaco.editor.defineTheme(
            'github',
            getLightTheme() as monaco.editor.IStandaloneThemeData
        )

        Editor.instance = this

        this.parent = document.getElementById(`editor`) as HTMLElement

        this.monaco = monaco.editor.create(this.parent, {
            value: '',
            language: 'javascript',
            minimap: {
                enabled: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
                vertical: 'hidden',
            },
            overviewRulerBorder: false,
            fontSize: 18,
            contextmenu: false,
            mouseWheelScrollSensitivity: 0,
            lineHeight: 34,
            selectOnLineNumbers: false,
            letterSpacing: -0.5,
            // codeLens: false,
            dragAndDrop: false,
            theme: 'atom',
            fontFamily: window
                .getComputedStyle(document.documentElement)
                .getPropertyValue('--code-font-family'),
            fontLigatures: true,
            // quickSuggestions: false,
            // parameterHints: {
            //     enabled: false,
            // },
            // wordBasedSuggestions: true,
            // suggestOnTriggerCharacters: false,
            // acceptSuggestionOnEnter: 'off',
            // tabCompletion: 'off',
        })

        const editor = this

        // Callbacks
        this.onSelectionUpdate = new Set()
        this.onChangeContent = new Set()

        // document.fonts.ready.then(() => monaco.editor.remeasureFonts());

        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                monaco.editor.remeasureFonts()
            }, 2000)
        })

        // Fetch default text
        fetch(`./src/scripts/editor/files/default.js`)
            .then((response) => response.text())
            .then((data) => {
                editor.monaco.getModel()?.setValue(data)

                editor.monaco.getModel()?.onDidChangeContent(() => {
                    editor.onChangeContent.forEach((callback) => callback())
                    editor.monaco.updateOptions({ codeLens: false })
                    editor.monaco.updateOptions({ codeLens: true })
                })

                editor.monaco.onDidChangeCursorSelection((e) => {
                    editor.onSelectionUpdate.forEach((callback) => callback(e))
                })

                editor.onChangeContent.forEach((callback) => callback())
                monaco.editor.remeasureFonts()
            })
    }

    error(errors: { message: string; line: number }[]) {
        const model = this.monaco.getModel() as monaco.editor.ITextModel

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

    getValue() {
        return this.monaco.getValue()
    }

    getValueAt(range: ESTree.SourceLocation) {
        return this.monaco.getModel()?.getValueInRange({
            startLineNumber: range.start.line,
            startColumn: range.start.column + 1,
            endLineNumber: range.end.line,
            endColumn: range.end.column + 1,
        })
    }

    getSelection() {
        return this.monaco.getSelection()
    }

    getSelectedText() {
        const model = this.monaco.getModel() as monaco.editor.ITextModel
        return model.getValueInRange(
            this.monaco.getSelection() as monaco.Selection
        )
    }

    getSelectedTextBoundingBox() {
        const selection = document.getElementsByClassName('cslr selected-text')
        return selection.length > 0
            ? selection[0].getBoundingClientRect()
            : null
    }

    computeBoundingBoxForSection() {
        const selection = document.getElementsByClassName('cslr selected-text')
        return selection.length > 0
            ? selection[0].getBoundingClientRect()
            : null
    }

    computeBoundingBox(ln: number) {
        const lines = Array.from(
            document.body.getElementsByClassName('view-lines')[0].children
        )
        lines.sort(
            (a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y
        )

        const line = lines[ln - 1]

        return line?.children[0].getBoundingClientRect()
    }

    computeBoundingBoxForLoc(location: ESTree.SourceLocation) {
        const start = Editor.instance.computeBoundingBox(location.start.line)
        const end = Editor.instance.computeBoundingBox(location.end.line)

        if (start == null || end == null)
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }

        const charWidth = Editor.instance.computeCharWidth(location.start.line)

        const min_y = Math.min(start.y, end.y)
        const max_y = Math.max(start.y + start.height, end.y + end.height)

        const min_x = Math.min(start.x, end.x)
        const max_x = Math.max(start.x + start.width, end.x + end.width)

        let y = min_y
        let x =
            min_x +
            Math.min(location.start.column, location.end.column) * charWidth

        let height = end.y + end.height - start.y
        let width =
            (Math.max(location.start.column, location.end.column) -
                Math.min(location.start.column, location.end.column)) *
            charWidth

        for (let line = location.start.line; line < location.end.line; line++) {
            const lineBbox = Editor.instance.computeBoundingBox(line)
            width = Math.max(width, lineBbox.width)
        }

        return { x: x, y: y, width: width, height: height }
    }

    computeCharWidth(ln = 1) {
        const lines = document.body.getElementsByClassName('view-lines')[0]
        const line = lines.children[ln - 1]?.children[0] as HTMLElement

        if (line == null) {
            return 0
        }

        return line.getBoundingClientRect().width / line.innerText.length
    }

    getAllTokens() {
        return Array.from(document.querySelectorAll('.view-line > span > span'))
    }

    getContainedTokenElements(
        bbox: { x: number; y: number; width: number; height: number },
        tokens?: Element[]
    ) {
        if (tokens == undefined) {
            tokens = Array.from(
                document.querySelectorAll('.view-line > span > span')
            )
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

    updateDragSelection(selection: {
        x: number
        y: number
        x2: number
        y2: number
    }) {
        this.dragSelections.forEach((sel) => sel.remove())
        this.dragSelections = []

        const lines =
            document.body.getElementsByClassName('view-lines')[0].children

        const min_y = Math.min(selection.y, selection.y2)
        const max_y = Math.max(selection.y, selection.y2)

        for (let i = 0; i < lines.length; i++) {
            const bbox = lines[i].children[0].getBoundingClientRect()
            if (bbox.width < 5 && bbox.height < 5) continue

            if (bbox.y > min_y && bbox.y + bbox.height < max_y) {
                const sel = document.createElement('div')
                sel.classList.add('editor-selection')
                document.body.append(sel)

                sel.style.left = `${bbox.x - 5}px`
                sel.style.top = `${bbox.y - 5}px`
                sel.style.width = `${bbox.width + 10}px`
                sel.style.height = `${bbox.height + 10}px`

                sel.setAttribute('_index', i.toString())

                this.dragSelections.push(sel)
            }
        }
    }

    getLineDom(ln: number) {
        const lines = document.body.getElementsByClassName('view-lines')[0]
        return lines.children[ln - 1]
    }

    getMaxWidth() {
        let maxWidth = 0
        for (const lineEl of Array.from(
            document.querySelectorAll('.view-line')
        )) {
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
