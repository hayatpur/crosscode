import { bake, duration, seek } from '../animation/animation';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { Editor } from '../editor/Editor';
import { Program } from '../transpiler/Statements/Program';
import { Transpiler } from '../transpiler/Transpiler';
import { createView } from '../view/view';
import { ViewRenderer } from '../view/ViewRenderer';
import { ViewState } from '../view/ViewState';
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

    // View
    view: ViewState;
    viewRenderer: ViewRenderer;

    constructor(editor: Editor) {
        // Singleton
        Executor.instance = this;

        // General
        this.editor = editor;

        // Update after 0.5s of no keyboard activity
        let typingTimer: number;
        this.editor.onChangeContent.add(() => {
            this.paused = true;
            document.body.querySelector(`.view-element.root`)?.classList.add('changing-content');
            Editor.instance.clearLenses();
            document.body.querySelector(`.highlight-cursor`)?.classList.add('changing-content');
            clearTimeout(typingTimer);
            typingTimer = setTimeout(this.execute.bind(this), 500);
        });

        // Execution
        this.worker = new ProgramWorker();
        this.worker.registerOnFinish(this.onWorkerFinish.bind(this));

        // Bind update
        setInterval(this.tick.bind(this), 50);
        // Ticker.instance.registerTick(this.tick.bind(this));

        // Play
        document.addEventListener('keypress', (e) => {
            if (e.key == '`') {
                this.paused = false;
                // this.view.reset();
                // this.animation.reset();

                this.time = 0;
            }
        });
    }

    reset() {
        this.time = 0;

        // this.view?.destroy();
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

        // Compile program into an animation
        this.animation = this.root.animation();

        // Bake the animation
        bake(this.animation);

        // Initialize a view of animation
        this.view = createView();

        // applyAbstraction(this.animation.vertices[0] as AnimationGraph, {
        //     type: AbstractionType.Aggregation,
        //     value: { Depth: 0 },
        // });

        // applyAbstraction(this.animation.vertices[1] as AnimationGraph, {
        //     type: AbstractionType.Transition,
        //     value: {},
        // });

        // console.log(this.view.children[1]);
        // console.log(this.animation.vertices[1]);

        // applyAbstraction(this.animation.vertices[1] as AnimationGraph, {
        //     type: AbstractionType.Aggregation,
        //     value: { Depth: 0 },
        // });

        console.log('[Executor] Finished compiling...');
        console.log('\tStorage', storage);
        console.log('\tRoot', this.root);
        console.log('\tAnimation', this.animation);

        // document.body.querySelector(`.view-element.root`)?.classList.remove('changing-content');
        // document.body.querySelector(`.highlight-cursor`)?.classList.remove('changing-content');

        this.paused = false;
    }

    tick(dt: number = 10) {
        if (this.animation == null || (dt > 0 && this.paused) || this.time > duration(this.animation)) return;
        // console.log('Seeking...');

        this.time += dt * this.speed;

        // Apply animation
        seek(this.animation, this.view, this.time);

        // logEnvironment(getCurrentEnvironment(this.view));

        // Update renderer
        // this.viewRenderer.setState(this.view);
    }
}
