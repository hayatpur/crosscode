import * as monaco from 'monaco-editor'
import { Editor } from '../../../editor/Editor'
import { Executor } from '../../../executor/Executor'
import { Mouse } from '../../../utilities/Mouse'
import { Ticker } from '../../../utilities/Ticker'
import { CodeQueryGroup, CodeQueryGroupState } from './CodeQueryGroup'

export enum CodeQueryCreatorState {
    Inactive,
    Active,
    Pressed,
}

export class CodeQueryCreator {
    cursor: HTMLDivElement

    state: CodeQueryCreatorState

    selectionBounds: { x1: number; y1: number; x2: number; y2: number } = null
    selectionIndicator: HTMLDivElement
    selectionChunks: Set<string> = new Set()

    tempQuery: CodeQueryGroup = null

    constructor() {
        this.cursor = document.createElement('div')
        this.cursor.classList.add('abstraction-cursor')
        document.body.appendChild(this.cursor)

        this.selectionIndicator = document.createElement('div')
        this.selectionIndicator.classList.add('abstraction-selection')
        document.body.appendChild(this.selectionIndicator)

        this.state = CodeQueryCreatorState.Inactive

        Ticker.instance.registerTick(this.tick.bind(this))

        Editor.instance.onSelectionUpdate.add(this.onSelectionUpdate.bind(this))

        document.addEventListener('keydown', (e) => {
            if (e.key != 'Control') return

            if (this.state == CodeQueryCreatorState.Inactive) {
                this.state = CodeQueryCreatorState.Active
            }
        })

        document.addEventListener('keyup', (e) => {
            if (e.key != 'Control') return

            if (this.state == CodeQueryCreatorState.Active) {
                this.state = CodeQueryCreatorState.Inactive
            }
        })

        document.addEventListener('mousedown', (e) => {
            if (this.state == CodeQueryCreatorState.Active) {
                this.state = CodeQueryCreatorState.Pressed

                this.selectionBounds = {
                    x1: Mouse.instance.position.x,
                    y1: Mouse.instance.position.y,
                    x2: Mouse.instance.position.x,
                    y2: Mouse.instance.position.y,
                }
            }
        })

        document.addEventListener('mouseup', (e) => {
            if (this.state == CodeQueryCreatorState.Pressed) {
                this.createAbstraction()

                this.state = CodeQueryCreatorState.Active

                this.selectionBounds = null
            }
        })

        document.addEventListener('mousemove', (e) => {
            if (this.state == CodeQueryCreatorState.Pressed) {
                this.selectionBounds.x2 = Mouse.instance.position.x
                this.selectionBounds.y2 = Mouse.instance.position.y

                e.preventDefault()

                return false
            } else {
                return true
            }
        })
    }

    onSelectionUpdate(e: monaco.editor.ICursorSelectionChangedEvent) {
        const selectionBbox = Editor.instance.computeBoundingBoxForLoc({
            start: { line: e.selection.startLineNumber, column: e.selection.startColumn },
            end: { line: e.selection.endLineNumber, column: e.selection.endColumn },
        })
        if (selectionBbox == null) {
            return
        }

        const paddingX = 20
        const paddingY = 10

        selectionBbox.x -= paddingX
        selectionBbox.y -= paddingY
        selectionBbox.width += paddingX * 2
        selectionBbox.height += paddingY * 2

        const state: CodeQueryGroupState = {
            selection: selectionBbox,
            executionIds: null,
        }

        this.tempQuery?.destroy()
        this.tempQuery = null

        console.log(Editor.instance.getSelectedText())

        if (Editor.instance.getSelectedText().length > 0) {
            console.log('Creating...')
            this.tempQuery = Executor.instance.rootView.createCodeQueryGroup(state)
        }
    }

    tick(dt: number) {
        // Update cursor position
        this.cursor.style.left = `${Mouse.instance.position.x - 5}px`
        this.cursor.style.top = `${Mouse.instance.position.y - 5}px`

        // Update cursor indicator
        if (this.state == CodeQueryCreatorState.Active) {
            this.cursor.classList.add('active')
        } else {
            this.cursor.classList.remove('active')
        }

        if (this.state == CodeQueryCreatorState.Pressed) {
            this.selectionIndicator.classList.add('active')
            this.cursor.classList.add('pressed')

            const bbox = getBoundingBoxOfStartAndEnd(this.selectionBounds)

            this.selectionIndicator.style.width = `${bbox.width}px`
            this.selectionIndicator.style.height = `${bbox.height}px`
            this.selectionIndicator.style.left = `${bbox.x}px`
            this.selectionIndicator.style.top = `${bbox.y}px`

            // List of base nodes
            // const nodes = queryAllExecutionGraph(Executor.instance.execution, (animation) =>
            //     instanceOfExecutionNode(animation)
            // )
        } else {
            this.selectionIndicator.classList.remove('active')
            this.cursor.classList.remove('pressed')
        }
    }

    createAbstraction() {
        const state: CodeQueryGroupState = {
            selection: getBoundingBoxOfStartAndEnd(this.selectionBounds),
            executionIds: null,
        }
        Executor.instance.rootView.createCodeQueryGroup(state)

        // for (const chunk of chunks) {
        //     Executor.instance.createAbstraction(chunk)
        // }
    }
}

export function getBoundingBoxOfStartAndEnd(selection: {
    x1: number
    y1: number
    x2: number
    y2: number
}): { x: number; y: number; width: number; height: number } {
    const x = Math.min(selection.x1, selection.x2)
    const y = Math.min(selection.y1, selection.y2)
    const width = Math.abs(selection.x2 - selection.x1)
    const height = Math.abs(selection.y2 - selection.y1)

    return { x, y, width, height }
}
