import { ApplicationState } from './scripts/ApplicationState'
import { Editor } from './scripts/editor/Editor'
import { Ticker } from './scripts/utilities/Ticker'
import {
    compileVisualization,
    createVisualization,
    setupTweakpane,
    tickVisualization,
} from './scripts/visualization/Visualization'
import './styles/main.scss'
import './styles/themes/dark.scss'

function main() {
    ApplicationState.editor = new Editor()
    ApplicationState.visualization = createVisualization()

    setupTweakpane(ApplicationState.visualization)

    /* --- Live programming: update after 0.5s of activity -- */
    let typingTimer: any
    let firstCompilation = true
    ApplicationState.editor.onChangeContent.add(() => {
        clearTimeout(typingTimer)

        const delay = firstCompilation ? 500 : 50 // Stagger on first execution to allow time for monaco to load
        typingTimer = setTimeout(() => {
            compileVisualization(
                ApplicationState.visualization,
                ApplicationState.editor.getValue()
            )
        }, delay)

        firstCompilation = false
    })

    /* ------------------------ Ticks ----------------------- */
    Ticker.instance.registerTick(tick)
}

function tick(dt: number) {
    tickVisualization(ApplicationState.visualization, dt)
}

main()
