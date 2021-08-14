import { Cursor } from '../animation/Cursor';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { Editor } from '../editor/Editor';
import { Environment } from '../environment/Environment';
import { Program } from '../transpiler/Statements/Program';
import { Transpiler } from '../transpiler/Transpiler';
import { computeAllGraphEdges, computeParentIds, logAnimation } from '../utilities/graph';
import { Ticker } from '../utilities/Ticker';
import { View } from '../view/View';
import { Compiler } from './Compiler';
import { ProgramWorker } from './worker/ProgramWorker';

export class Executor {
    static instance: Executor = null;

    // Editor component this operates on
    editor: Editor = null;

    // Timeline controls
    time = 0;
    paused = true;

    // Web worker to enable parallel execution
    worker: ProgramWorker = null;

    // Global speed of the animation (higher is faster)
    speed = 1 / 16;

    // Animation
    root: Program;
    animation: AnimationGraph;

    view: View;
    cursor: Cursor;

    constructor(editor: Editor) {
        // Singleton
        Executor.instance = this;

        // General
        this.editor = editor;

        // Highlight cursor
        this.cursor = new Cursor();

        // Update after 0.5s of no keyboard activity
        let typingTimer: number;
        this.editor.onChangeContent.add(() => {
            this.paused = true;
            document.body.querySelector(`.view-element.root`)?.classList.add('changing-content');
            document.body.querySelector(`.highlight-cursor`)?.classList.add('changing-content');
            clearTimeout(typingTimer);
            typingTimer = setTimeout(this.execute.bind(this), 500);
        });

        // Execution
        this.worker = new ProgramWorker();
        this.worker.registerOnFinish(this.onWorkerFinish.bind(this));

        // Bind update
        Ticker.instance.registerTick(this.tick.bind(this));

        // Play
        document.addEventListener('keypress', (e) => {
            if (e.key == '`') {
                this.paused = false;
                this.view.reset();
                this.animation.reset();

                this.time = 0;
            }
        });
    }

    reset() {
        this.time = 0;

        this.view?.destroy();
        this.view = undefined;
    }

    execute() {
        // Compile user code
        const text = this.editor.getValue();
        const compiled = Compiler.compile(text);

        if (compiled.status == 'error') {
            return;
        }

        const { code } = compiled.data;

        // Execute compiled code
        this.worker.setup(code);
    }

    onWorkerFinish() {
        const { storage, errors, logs } = this.worker.data;

        // Reset visualization
        this.reset();

        // Handle errors
        if (errors.length > 0) {
            Editor.instance.error(errors.map((err) => err.data));
            return;
        }

        // Transpile program
        this.root = Transpiler.transpileFromStorage(storage);

        // Animation
        this.animation = this.root.animation();

        // Post-animation baking
        this.animation.seek([new Environment()], this.animation.duration, { baking: true, indent: 0 });
        this.animation.reset({ baking: true });
        computeParentIds(this.animation);
        computeAllGraphEdges(this.animation);

        // View of animation
        this.view = new View(this.animation);

        console.log('[Executor] Finished compiling...');
        console.log('\tStorage', storage);
        console.log('\tRoot', this.root);
        console.log('\tAnimation', this.animation);

        console.log(this.animation.reads());

        const testSubject = this.animation.vertices[1] as AnimationGraph;
        // dissolveAnimation(testSubject);

        console.log(logAnimation(testSubject));

        document.body.querySelector(`.view-element.root`)?.classList.remove('changing-content');
        document.body.querySelector(`.highlight-cursor`)?.classList.remove('changing-content');

        this.paused = false;
    }

    tick(dt: number = 0) {
        if (this.animation == null || (dt > 0 && this.paused) || this.time > this.animation.duration) return;

        this.time += dt * this.speed;

        this.view.update();

        // Apply animations
        const environments = [...View.shownViews].map((view) => view.environment);
        this.animation?.seek(environments, this.time);
    }
}
