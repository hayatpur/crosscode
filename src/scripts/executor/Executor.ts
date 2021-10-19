import acorn = require('acorn');
import { duration, reset, seek } from '../animation/animation';
import { Cursor } from '../animation/Cursor';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { animationToString } from '../animation/graph/graph';
import { Editor } from '../editor/Editor';
import { Compiler } from '../transpiler/Compiler';
import { Ticker } from '../utilities/Ticker';
import { createView } from '../view/view';
import { ViewRenderer } from '../view/ViewRenderer';
import { ViewState } from '../view/ViewState';
import Timeline from './timeline/Timeline';

export class Executor {
    static instance: Executor = null;

    // Editor component this operates on
    editor: Editor = null;

    // Timeline controls
    time = 0;
    paused = true;

    // Global speed of the animation (higher is faster)
    speed = 1 / 64;

    // Animation
    animation: AnimationGraph;

    // View
    view: ViewState;
    viewRenderer: ViewRenderer;

    timeline: Timeline;

    constructor(editor: Editor) {
        // Singleton
        Executor.instance = this;

        // General
        this.editor = editor;

        this.timeline = new Timeline(this);

        // Update after 0.5s of no keyboard activity
        let typingTimer: number;
        this.editor.onChangeContent.add(() => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(this.compile.bind(this), 500);
        });

        // Bind update
        setTimeout(() => Ticker.instance.registerTick(this.tick.bind(this)), 1000);

        // Play
        document.addEventListener('keypress', (e) => {
            if (e.key == '`') {
                this.paused = false;
                this.time = 0;
            }
        });
    }

    reset() {
        this.time = 0;
        this.view = undefined;
        this.animation = undefined;

        this.viewRenderer?.destroy();
        this.viewRenderer = undefined;
        Cursor.instance?.destroy();
    }

    compile() {
        // console.clear();

        // Reset visualization
        this.reset();

        // Construct AST
        let ast = null;

        try {
            ast = acorn.parse(this.editor.getValue(), { locations: true, ecmaVersion: 2017 });
        } catch (e) {
            console.error(e);
            return;
        }

        // Transpile program
        const tempView = createView({ isRoot: true });

        const _t = performance.now();
        this.animation = Compiler.compile(ast, tempView, { outputRegister: [], locationHint: [] });
        console.log('Compilation time: ' + (performance.now() - _t) + 'ms');
        // logEnvironment(getCurrentEnvironment(tempView));
        console.log(tempView);

        reset(this.animation);

        // Initialize a view of animation
        this.view = createView({ isRoot: true });

        const cursor = new Cursor();

        // Initialize a renderer
        this.viewRenderer = new ViewRenderer(true);

        this.paused = false;

        this.timeline.updateSections();

        console.log('[Executor] Finished compiling...');
        console.log('\tAnimation', this.animation);

        console.log(animationToString(this.animation, 0, { first: false }, true));
    }

    tick(dt: number = 10) {
        if (this.animation == null || (dt > 0 && this.paused)) return;

        if (this.time > duration(this.animation)) {
            // Loop
            this.time = 0;
            this.viewRenderer.destroy();
            this.view = createView();
            this.viewRenderer = new ViewRenderer(true);
            return;
        }

        this.time += dt * this.speed;

        // Apply animation
        seek(this.animation, this.view, this.time);

        // Render
        this.viewRenderer.setState(this.view);

        this.timeline.seek(this.time);

        // logEnvironment(getCurrentEnvironment(this.view));

        // Update renderer
        // this.viewRenderer.setState(this.view);
    }
}
