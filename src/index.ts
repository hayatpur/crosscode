import { Editor } from './scripts/editor/Editor'
import { compileExecutor, Executor } from './scripts/executor/Executor'
import './styles/main.scss'
import './styles/themes/dark.scss'

function main() {
    const editor = new Editor()
    const executor = new Executor()

    /* --- Live programming: update after 0.5s of activity -- */
    let typingTimer: any
    let firstCompilation = true
    editor.onChangeContent.add(() => {
        clearTimeout(typingTimer)

        const delay = firstCompilation ? 500 : 50 // Stagger on first execution to allow time for monaco to load
        typingTimer = setTimeout(() => {
            compileExecutor(executor, editor.getValue())
        }, delay)

        firstCompilation = false
    })
}

main()
