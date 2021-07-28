import { Editor } from '../editor/Editor';
import { lerp } from '../utilities/math';
import { Ticker } from '../utilities/Ticker';
import { View } from './View';

export class ViewController {
    cursor: HTMLDivElement;
    selection: HTMLDivElement;
    cursorState: {
        tx: number;
        ty: number;
        show: boolean;
        pressed: boolean;
        dragging: boolean;
        selection: { x: number; y: number; x2: number; y2: number };
    } = {
        tx: 0,
        ty: 0,
        show: false,
        pressed: false,
        dragging: false,
        selection: { x: 0, y: 0, x2: 0, y2: 0 },
    };

    constructor() {
        // Create cursor
        this.cursor = document.createElement('div');
        this.cursor.classList.add('view-controller-cursor');
        // this.cursor.innerText = '+';
        document.body.append(this.cursor);

        this.selection = document.createElement('div');
        this.selection.classList.add('view-controller-selection');
        document.body.append(this.selection);

        this.cursor.style.left = `${0}px`;
        this.cursor.style.top = `${0}px`;

        // Setup controls for cursor
        document.addEventListener('mousemove', (e) => {
            this.cursorState.tx = e.x;
            this.cursorState.ty = e.y;

            if (this.cursorState.dragging) {
                this.cursorState.selection.x2 = e.x;
                this.cursorState.selection.y2 = e.y;

                Editor.instance.updateDragSelection(this.cursorState.selection);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                this.cursorState.show = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key == 'Control') {
                this.cursorState.show = false;
            }
        });

        document.body.addEventListener('mousedown', (e) => {
            this.cursorState.pressed = true;

            if (this.cursorState.show) {
                // Start dragging
                this.cursorState.dragging = true;

                this.cursorState.selection.x = e.x;
                this.cursorState.selection.y = e.y;
                this.cursorState.selection.x2 = e.x;
                this.cursorState.selection.y2 = e.y;
            }
        });

        document.body.addEventListener('mouseup', (e) => {
            if (this.cursorState.dragging) {
                const lines = Editor.instance.dragSelections.map((sel) => parseInt(sel.getAttribute('_index')));
                const validLines = { min: Math.min(...lines) + 1, max: Math.max(...lines) + 1 };
                const mid_y = (this.cursorState.selection.y + this.cursorState.selection.y2) / 2;
                const x = Math.max(this.cursorState.selection.x, this.cursorState.selection.x2) + 50;
                View.create({ position: { x: x, y: mid_y }, validLines });
            }

            this.cursorState.pressed = false;
            this.cursorState.dragging = false;

            this.cursorState.selection.x = 0;
            this.cursorState.selection.y = 0;
            this.cursorState.selection.x2 = 0;
            this.cursorState.selection.y2 = 0;

            this.selection.style.left = `${0}px`;
            this.selection.style.top = `${0}px`;
            this.selection.style.width = `${0}px`;
            this.selection.style.height = `${0}px`;

            // Editor.instance.updateDragSelection(this.cursorState.selection);
        });

        Ticker.instance.registerTick(() => {
            const px = parseInt(this.cursor.style.left);
            const py = parseInt(this.cursor.style.top);

            // Position
            this.cursor.style.left = `${lerp(px, this.cursorState.tx, 0.1)}px`;
            this.cursor.style.top = `${lerp(py, this.cursorState.ty, 0.1)}px`;

            // Show
            if (this.cursorState.show && !this.cursor.classList.contains('view-controller-cursor-visible')) {
                this.cursor.classList.add('view-controller-cursor-visible');
            }

            if (!this.cursorState.show && this.cursor.classList.contains('view-controller-cursor-visible')) {
                this.cursor.classList.remove('view-controller-cursor-visible');
            }

            if (this.cursorState.pressed && this.cursorState.show) {
                if (!this.cursor.classList.contains('view-controller-cursor-pressed')) {
                    this.cursor.classList.add('view-controller-cursor-pressed');
                }
            } else if (this.cursor.classList.contains('view-controller-cursor-pressed')) {
                this.cursor.classList.remove('view-controller-cursor-pressed');
            }

            // Drag
            if (this.cursorState.dragging) {
                if (this.selection.classList.contains('hidden')) this.selection.classList.remove('hidden');

                const min_x = Math.min(this.cursorState.selection.x, this.cursorState.selection.x2);
                const min_y = Math.min(this.cursorState.selection.y, this.cursorState.selection.y2);
                const width = Math.abs(this.cursorState.selection.x - this.cursorState.selection.x2);
                const height = Math.abs(this.cursorState.selection.y - this.cursorState.selection.y2);

                this.selection.style.left = `${min_x}px`;
                this.selection.style.top = `${min_y}px`;
                this.selection.style.width = `${width}px`;
                this.selection.style.height = `${height}px`;
            } else if (!this.selection.classList.contains('hidden')) {
                this.selection.classList.add('hidden');
            }
        });
    }
}
