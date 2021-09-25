import { DataRenderer } from '../DataRenderer';
import { DataState, getZPane } from '../DataState';

export class ArrayRenderer extends DataRenderer {
    static BracePadding = 15;
    static MinHeight = 35;
    static MinWidth = 40;

    constructor() {
        super();

        // Opening brace
        const openingBrace = document.createElement('div');
        openingBrace.classList.add('brace', 'opening');
        openingBrace.innerText = '[';

        // Closing brace
        const closingBrace = document.createElement('div');
        closingBrace.classList.add('brace', 'closing');
        closingBrace.innerText = ']';

        this.element.append(openingBrace, closingBrace);
    }

    setState(data: DataState) {
        this.element.classList.add('array');

        // Apply transform
        this.element.style.top = `${data.transform.y - 5 * data.transform.z}px`;
        this.element.style.left = `${data.transform.x + 5 * data.transform.z}px`;

        this.element.style.width = `${data.transform.width}px`;
        this.element.style.height = `${data.transform.height}px`;

        if (getZPane(data.transform.z) > 0) {
            this.element.classList.add('floating');
        } else {
            this.element.classList.remove('floating');
        }
    }
}
