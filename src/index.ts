import { CFVRenderer, CFVRendererState } from './scripts/ControlFlowView/CFVRenderer'
import { CFV, CFVState } from './scripts/ControlFlowView/ControlFlowView'
import { Editor, EditorState } from './scripts/Editor/Editor'
import './styles/main.scss'

let editor: EditorState = null!
let visContainer: HTMLElement = null!

let cfv: CFVState = null!
let cfvRenderer: CFVRendererState = null!

async function main() {
    // Initialize editor and populate it with default code
    editor = await Editor.createEditor()

    // Timeout for 1s to give time for monaco to load
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Initialize the control flow view, based on the current code
    cfv = CFV.createCFV(editor)

    // Initialize the renderer for the control flow view
    visContainer = document.getElementById('visualization-container')!
    cfvRenderer = CFVRenderer.createCFVRenderer(visContainer)

    // const dataView = DataView.createDataView(controlFlowView)

    /* --- Live programming: update after 0.5s of activity -- */
    // let timer: NodeJS.Timeout,
    //     first = true
    // ApplicationState.editor.onChangeContent.add(() => {
    //     clearTimeout(timer)

    //     // Stagger on first execution to give time for monaco to load
    //     const delay = first ? 500 : 50
    //     timer = setTimeout(() => {
    //         compileVisualization(ApplicationState.visualization, Editor.getValue(ApplicationState.editor))
    //     }, delay)

    //     first = false
    // })

    // createCodeQuerySelector()
}

main()
