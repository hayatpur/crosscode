import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { Editor } from '../editor/Editor';
import { Environment } from '../environment/Environment';
import { Program } from '../transpiler/Statements/Program';
import { Transpiler } from '../transpiler/Transpiler';
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
    playing = false;
    paused = true;

    // Web worker to enable parallel execution
    worker: ProgramWorker = null;

    // Timeline visual
    timeControls = null;

    // Global speed of the animation (higher is faster)
    speed = 1 / 2;
    root: Program;
    animation: AnimationGraph;

    _time: number = 0;

    constructor(editor: Editor) {
        // Singleton
        Executor.instance = this;

        this._time = performance.now();
        console.log(`[${this._time.toFixed(4)}ms] Starting executor...`);

        // General
        this.editor = editor;
        this.editor.onChangeContent.add(() => this.execute());

        // Execution
        this.worker = new ProgramWorker();
        this.worker.registerOnFinish(this.onWorkerFinish.bind(this));

        // Bind update
        Ticker.instance.registerTick(this.tick.bind(this));

        // Play
        document.addEventListener('keypress', (e) => {
            if (e.key == '`') {
                console.clear();
                this.paused = false;
                this.playing = true;

                for (const view of View.views) {
                    view.reset();
                }

                this.time = 0;
            }
        });
    }

    reset() {
        // window.reset();
    }

    execute() {
        console.log(`[${(performance.now() - this._time).toFixed(4)}ms] Calling execute()...`);
        this._time = performance.now();

        // Compile user code
        const text = this.editor.getValue();
        const compiled = Compiler.compile(text);

        console.log(`[${(performance.now() - this._time).toFixed(4)}ms] Compiled code...`);
        this._time = performance.now();

        if (compiled.status == 'error') {
            console.error(compiled.data);
            return;
        }

        const { code } = compiled.data;

        // Execute compiled code
        this.worker.setup(code);
    }

    onWorkerFinish() {
        console.log(`[${(performance.now() - this._time).toFixed(4)}ms] Worker finished...`);
        this._time = performance.now();

        const { storage, errors, logs } = this.worker.data;

        // Reset visualization
        this.reset();

        console.log(`[${(performance.now() - this._time).toFixed(4)}ms] Reset visualization...`);
        this._time = performance.now();

        // Handle errors
        if (errors.length > 0) {
            console.error(errors);
            return;
        }

        // console.log(storage);

        // Transpile program
        this.root = Transpiler.transpileFromStorage(storage);

        console.log(`[${(performance.now() - this._time).toFixed(4)}ms] Root tree generated...`);
        this._time = performance.now();

        // console.log(this.root);

        // Animation
        this.animation = this.root.animation();

        console.log(`[${(performance.now() - this._time).toFixed(4)}ms] Root animation generated...`);
        this._time = performance.now();

        // Baking
        this.animation.seek([new Environment()], this.animation.duration, { baking: true, indent: 0 });

        console.log(`[${(performance.now() - this._time).toFixed(4)}ms] Root animation baked...`);
        this._time = performance.now();

        // View.create({
        //     position: { x: 600, y: 150 },
        //     validLines: { min: 0, max: Math.max(...storage.map((item) => item.line)) },
        // });

        // View
        // this.view = new View();

        // console.log(this.view);

        // console.log('Finished compiling...');
        // console.log('\tStorage', this.storage);
        // console.log('\tRoot', this.root);
        // console.log('\tGraph', this.graph);
    }

    tick(dt: number = 0) {
        if (this.animation == null) return;
        if ((dt > 0 && this.paused) || this.time > this.animation.duration) return;

        this.time += dt * this.speed;

        // Apply animations
        const environments = View.views.map((view) => view.environment);
        this.animation?.seek(environments, this.time);

        for (const view of View.views) {
            view.update();
        }

        // this.timeControls.seek(this.time);
    }
}
