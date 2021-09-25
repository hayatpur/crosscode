export default class TimeSection {
    parent: HTMLDivElement;
    name: string;
    start: number;
    duration: number;
    delay: number;
    domElement: HTMLDivElement;

    constructor(
        parent: HTMLDivElement,
        name: string,
        start: number,
        duration: number,
        delay: number,
        total: number
    ) {
        this.parent = parent;
        this.name = name;

        this.start = start;
        this.duration = duration;
        this.delay = delay;

        const bbox = parent.getBoundingClientRect();
        const multiplier = bbox.width / total;

        let n_start = start * multiplier;
        let n_duration = (duration + delay) * multiplier;

        const domElement = document.createElement('div');
        domElement.classList.add('time-section');

        domElement.style.left = `${n_start}px`;
        domElement.style.width = `${n_duration}px`;

        const label = document.createElement('div');
        label.classList.add('time-section-label');
        domElement.append(label);
        label.innerText = name;

        parent.append(domElement);

        this.domElement = domElement;
    }

    highlight() {
        this.domElement.classList.add('active');
    }

    unHighlight() {
        this.domElement.classList.remove('active');
    }

    static dispose() {
        document.querySelectorAll('.time-section-label').forEach((el) => el.remove());
        document.querySelectorAll('.time-section').forEach((el) => el.remove());
        document.querySelectorAll('.time-sections').forEach((el) => el.remove());
    }
}
