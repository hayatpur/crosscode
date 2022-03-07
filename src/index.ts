import { Editor } from './scripts/editor/Editor'
import { Executor } from './scripts/executor/Executor'
import './styles/main.scss'
import './styles/themes/dark.scss'

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
            return './json.worker.bundle.js'
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './css.worker.bundle.js'
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './html.worker.bundle.js'
        }
        if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.bundle.js'
        }
        return './editor.worker.bundle.js'
    },
}

function main() {
    const editor = new Editor()
    const executor = new Executor(editor)
}

main()
