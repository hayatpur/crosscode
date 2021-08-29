import { Editor } from './scripts/editor/Editor';
import { Separators } from './scripts/editor/Separators';
import { Executor } from './scripts/executor/Executor';
import { Ticker } from './scripts/utilities/Ticker';
import { ViewController } from './scripts/view/ViewController';
import './styles/main.scss';

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
            return './json.worker.bundle.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './css.worker.bundle.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './html.worker.bundle.js';
        }
        if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.bundle.js';
        }
        return './editor.worker.bundle.js';
    },
};

function main() {
    const ticker = new Ticker();
    const editor = new Editor();
    const separators = new Separators();
    const executor = new Executor(editor);

    // View controller
    const view = new ViewController();

    // const keystrokeVisualizer = new KeystrokeVisualizer();
    // keystrokeVisualizer.enable();

    // Key visualizer

    // Controls
    // document.getElementById('play-button').addEventListener('click', () => {
    //     executor.compile();
    // });
}

main();
