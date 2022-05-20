// /* ------------------------------------------------------ */
// /*        Interprets user selections of source code       */

// import * as monaco from 'monaco-editor'
// import { Editor } from '../../editor/Editor'
// import { Ticker } from '../../utilities/Ticker'
// import { CodeQuery } from './CodeQuery'

// /* ------------------------------------------------------ */
// export class CodeQueryCreator {
//     currentQuery: CodeQuery // Current temporary query

//     private _tickerId: string

//     constructor() {
//         this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))

//         // Update after 0.5s of no keyboard activity
//         let typingTimer: number
//         Editor.instance.onSelectionUpdate.add((e) => {
//             // Remove old query
//             this.currentQuery?.destroy()
//             this.currentQuery = null

//             clearTimeout(typingTimer)
//             typingTimer = setTimeout(() => this.onSelectionUpdate(e), 500)
//         })
//     }

//     onSelectionUpdate(e: monaco.editor.ICursorSelectionChangedEvent) {
//         // Remove old query
//         this.currentQuery?.destroy()
//         this.currentQuery = null

//         const selectionBbox = Editor.instance.computeBoundingBoxForLoc({
//             start: { line: e.selection.startLineNumber, column: e.selection.startColumn },
//             end: { line: e.selection.endLineNumber, column: e.selection.endColumn },
//         })

//         if (selectionBbox == null) {
//             return
//         }

//         const paddingX = 20
//         const paddingY = 10

//         selectionBbox.x -= paddingX
//         selectionBbox.y -= paddingY
//         selectionBbox.width += paddingX * 2
//         selectionBbox.height += paddingY * 2

//         if (Editor.instance.getSelectedText().length > 0) {
//             this.currentQuery = new CodeQuery({
//                 selection: {
//                     start: { line: e.selection.startLineNumber, column: e.selection.startColumn },
//                     end: { line: e.selection.endLineNumber, column: e.selection.endColumn },
//                 },
//             })
//         }
//     }

//     tick(dt: number) {}

//     /* ----------------------- Destroy ---------------------- */
//     destroy() {
//         Ticker.instance.removeTickFrom(this._tickerId)
//     }
// }
