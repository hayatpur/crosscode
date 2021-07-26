import { Data, DataType } from '../environment/Data';
import { Environment } from '../environment/Environment';

export class ViewRenderer {
    // View's HTML DOM Element
    element: HTMLDivElement;

    dataElements: HTMLDivElement[] = [];
    identifierElements: HTMLDivElement[] = [];

    constructor() {
        // DOM elements
        this.element = document.createElement('div');
        this.element.classList.add('view');
        document.body.append(this.element);
    }

    setState(environment: Environment) {
        // Clear memory

        const memory = environment.flattenedMemory();

        // Make sure there are enough data elements
        for (let i = this.dataElements.length; i <= memory.length; i++) {
            // Create element
            const element = document.createElement('div');
            element.classList.add('view-element');

            this.dataElements.push(element);
            this.element.append(element);
        }

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
        }

        // Setup memory
        for (const data of memory) {
        }

        // Clear identifiers
        // this.identifierElements.forEach((el) => el.remove());
        // this.identifierElements = [];

        // // Setup identifiers
        // for (const identifier of Object.keys(environment.bindings)) {
        //     const location = environment.bindings[identifier];
        //     // const { x, y } = findLocationInMemory(environment.memory, location);
        //     const { x, y } = { x: 0, y: 0 };

        //     // Create element
        //     const element = document.createElement('div');
        //     element.classList.add('view-identifier');
        //     element.innerText = identifier;

        //     element.style.left = `${x}px`;
        //     element.style.top = `${y}px`;

        //     this.identifierElements.push(element);
        //     this.element.append(element);
        // }
    }

    updateState(environment: Environment) {}
}
