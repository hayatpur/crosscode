import { Environment } from '../environment/Environment';
import { ViewRenderer } from './ViewRenderer';

export interface ViewOptions {
    position?: { x: number; y: number };
    anchor?: {};
    environment?: Environment;
    renderer?: ViewRenderer;
    validLines?: { min: number; max: number };
}

export class View {
    environment: Environment;
    renderer: ViewRenderer;

    static views: View[] = [];
    validLines: { min: number; max: number };

    history: Environment[] = [];
    historyShown: boolean = false;

    historyEl: HTMLDivElement;
    historyViews: ViewRenderer[] = [];
    position: { x: number; y: number };

    constructor(options: ViewOptions = {}) {
        this.environment = options.environment ?? new Environment();
        this.validLines = options.validLines;

        this.historyEl = document.createElement('div');
        this.historyEl.classList.add('view-history');
        document.body.append(this.historyEl);

        this.environment.validLines = options.validLines;
        this.renderer = options.renderer ?? new ViewRenderer({ position: options.position });

        this.validLines = options.validLines;

        // Specify the related animation blocks

        document.addEventListener('keypress', (e) => {
            console.log(e.key);
            if (e.key == '-') {
                if (this.historyShown) {
                    this.hideHistory();
                } else {
                    this.showHistory();
                }
            }

            if (e.key == '=') {
                if (this.historyShown) {
                    this.hideHistory();
                } else {
                    this.showHistory(true);
                }
            }
        });
    }

    showHistory(skip = false) {
        // console.log('Showing history...');
        // console.log(this.history);

        const width = this.renderer.element.getBoundingClientRect().width + 10;

        if (skip) {
            // First one
            const first_renderer = new ViewRenderer({
                position: { x: this.renderer.position.x + (0 + 1) * width, y: this.renderer.position.y },
            });
            this.historyViews.push(first_renderer);
            first_renderer.setState(this.history[0]);

            let j = 0;
            for (let i = 5; i < this.history.length; i += 5) {
                const renderer = new ViewRenderer({
                    position: { x: this.renderer.position.x + (j + 1) * width, y: this.renderer.position.y },
                });
                this.historyViews.push(renderer);
                renderer.setState(this.history[i]);
                j++;
            }

            // Last one
            const last_renderer = new ViewRenderer({
                position: { x: this.renderer.position.x + (j + 1) * width, y: this.renderer.position.y },
            });
            this.historyViews.push(last_renderer);
            last_renderer.setState(this.history[this.history.length - 1]);
        } else {
            for (let i = 0; i < this.history.length; i++) {
                const renderer = new ViewRenderer({
                    position: { x: this.renderer.position.x + (i + 1) * width, y: this.renderer.position.y },
                });
                this.historyViews.push(renderer);
                renderer.setState(this.history[i]);
            }
        }

        this.historyShown = true;
    }

    hideHistory() {
        this.historyShown = false;
        this.historyViews.forEach((renderer) => renderer.destroy());
        this.historyViews = [];
    }

    update() {
        // this.history.push(this.environment.copy());
        this.renderer.setState(this.environment);
    }

    static create(options: ViewOptions) {
        const view = new View(options);
        View.views.push(view);
    }

    reset() {
        this.environment = new Environment();
        this.environment.validLines = this.validLines;
        this.renderer.reset();
    }
}
