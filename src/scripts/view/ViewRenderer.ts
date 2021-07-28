import { Data, DataType } from '../environment/Data';
import { Environment } from '../environment/Environment';

export interface ViewRendererOptions {
    position?: { x: number; y: number };
}

export class ViewRenderer {
    // View's HTML DOM Element
    element: HTMLDivElement;

    dataElements: HTMLDivElement[] = [];
    dataSeparators: HTMLDivElement[] = [];

    identifierElements: HTMLDivElement[] = [];
    position: { x: number; y: number };
    draggable: boolean = false;

    constructor(options: ViewRendererOptions = {}) {
        // DOM elements
        this.element = document.createElement('div');
        this.element.classList.add('view');
        document.body.append(this.element);

        this.position = options.position ?? { x: 0, y: 0 };

        this.element.style.top = `${this.position.y}px`;
        this.element.style.left = `${this.position.x}px`;

        let px = 0;
        let py = 0;
        let mousedown = false;

        document.addEventListener('keydown', (e) => {
            if (e.shiftKey) {
                this.draggable = true;
                this.element.classList.add('draggable');
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key == 'Shift') {
                this.draggable = false;
                this.element.classList.remove('draggable');
            }
        });

        document.addEventListener('mousedown', (e) => {
            mousedown = true;
        });

        document.addEventListener('mouseup', (e) => {
            mousedown = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.draggable && mousedown) {
                const bbox = this.element.getBoundingClientRect();
                if (e.x >= bbox.left && e.x <= bbox.right && e.y >= bbox.top && e.y <= bbox.bottom) {
                    let dx = e.x - px;
                    let dy = e.y - py;

                    this.position.x += dx;
                    this.position.y += dy;

                    this.element.style.left = `${this.position.x}px`;
                    this.element.style.top = `${this.position.y}px`;
                }
            }

            px = e.x;
            py = e.y;
        });
    }

    setState(environment: Environment) {
        this.dataSeparators.forEach((el) => el.remove());
        this.dataSeparators = [];
        // Clear memory

        let memory = environment.flattenedMemory();
        memory = memory.filter((data) => data && data.type == DataType.Number);
        memory.reverse();

        // Make sure there are enough data elements
        while (this.dataElements.length < memory.length) {
            // Create element
            const element = document.createElement('div');
            element.classList.add('view-element');

            this.dataElements.push(element);
            this.element.append(element);
        }

        // Make sure there are enough data elements
        while (this.dataElements.length > memory.length) {
            // Remove element
            const el = this.dataElements.pop();
            el.remove();
        }

        let prevTransform = null;

        for (let i = 0; i < memory.length; i++) {
            const data = memory[i];
            const element = this.dataElements[i];

            if (data.type != DataType.Number) {
                continue;
            }

            const transform = data.transform;
            const value = data.value;

            element.style.marginLeft = `${transform.x}px`;
            element.style.marginTop = `${transform.y}px`;
            element.style.opacity = `${transform.opacity}`;
            element.innerText = `${value}`;
            element.style.width = `${transform.width}px`;
            element.style.height = `${transform.height}px`;

            if (transform.floating) {
                element.classList.add('floating');
            } else {
                element.classList.remove('floating');
            }

            if (i > 0 && transform.x - (prevTransform.x + prevTransform.width) > 10) {
                const separator = document.createElement('view-separator');

                separator.style.left = `${(prevTransform.x + prevTransform.width + transform.x) / 2}px`;
                separator.style.top = `0px`;
                separator.style.opacity = `1`;
                element.append(separator);
            }

            prevTransform = transform;
        }

        // Clear identifiers
        // this.identifierElements.forEach((el) => el.remove());
        // this.identifierElements = [];

        let bindings = Object.entries(environment.bindings);
        bindings = bindings.filter((item) => !item[0].startsWith('_'));

        // Make sure there are enough identifier elements
        for (let i = this.identifierElements.length; i < bindings.length; i++) {
            // Create element
            const element = document.createElement('div');
            element.classList.add('view-identifier');

            this.identifierElements.push(element);
            this.element.append(element);
        }

        // Setup identifiers
        // console.log(bindings);
        // console.log(environment.bindings);
        for (let i = 0; i < bindings.length; i++) {
            const [identifier, path] = bindings[i];

            const data = environment.resolvePath(path) as Data;
            // const { x, y } = findLocationInMemory(environment.memory, location);
            const { x, y } = data.transform;

            // Create element
            const element = this.identifierElements[i];
            element.innerText = identifier;

            element.style.left = `${x}px`;
            element.style.top = `${y - 25}px`;
        }
    }

    updateState(environment: Environment) {}

    reset() {
        this.identifierElements.forEach((el) => el.remove());
        this.identifierElements = [];

        this.dataElements.forEach((el) => el.remove());
        this.dataElements = [];
    }

    destroy() {
        this.identifierElements.forEach((el) => el.remove());
        this.identifierElements = [];

        this.dataElements.forEach((el) => el.remove());
        this.dataElements = [];

        this.element.remove();
    }
}
