import acorn = require('acorn');
import { duration, seek } from '../animation/animation';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { animationToString } from '../animation/graph/graph';
import { Editor } from '../editor/Editor';
import { Compiler } from '../transpiler/Compiler';
import { createView } from '../view/view';
import { ViewRenderer } from '../view/ViewRenderer';
import { ViewState } from '../view/ViewState';

export class Executor {
    static instance: Executor = null;

    // Editor component this operates on
    editor: Editor = null;

    // Timeline controls
    time = 0;
    paused = true;

    // Global speed of the animation (higher is faster)
    speed = 1 / 16;

    // Animation
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
            clearTimeout(typingTimer);
            typingTimer = setTimeout(this.compile.bind(this), 500);
        });

        // Bind update
        // setInterval(this.tick.bind(this), 50);

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
    }

    compile() {
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
        this.animation = Compiler.compile(ast, createView(), { outputRegister: [], locationHint: [] });

        // Initialize a view of animation
        this.view = createView();

        console.log('[Executor] Finished compiling...');
        console.log('\tAnimation', this.animation);

        console.log(animationToString(this.animation));
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
