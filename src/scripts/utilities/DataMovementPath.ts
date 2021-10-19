export interface DataMovementLocation {
    x: number;
    y: number;
}

export class DataMovementPath {
    start: DataMovementLocation;
    end: DataMovementLocation;
    movement: SVGPathElement;
    visual: SVGPathElement;

    constructor(start: DataMovementLocation, end: DataMovementLocation) {
        this.start = start;
        this.end = end;

        // Create DOM elements
        this.create();

        this.seek(0);
        this.getPosition(0);
    }

    create() {
        // The movement path
        this.movement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.movement.classList.add('movement-path');
        this.movement.style.opacity = '0';

        // Add them to global svg canvas
        const svg = document.getElementById('svg-canvas');
        svg.append(this.movement);
        svg.append(this.visual);
    }

    seek(t: number) {
        let start = { x: this.start.x, y: this.start.y };
        let end = { x: this.end.x, y: this.end.y };
        let mid = { x: (this.start.x + this.end.x) / 2, y: (this.start.y + this.end.y) / 2 };

        // Convex
        let convex = start.x < end.x;
        mid.y += (convex ? 1 : -1) * Math.abs(end.x - start.x) * 0.5;

        this.movement.style['stroke-dasharray'] = this.movement.getTotalLength();
        this.movement.style['stroke-dashoffset'] = this.movement.getTotalLength() * (1 - t);
        this.movement.setAttribute('d', `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`);
    }

    getPosition(t: number) {
        const { x, y } = this.movement.getPointAtLength(t * this.movement.getTotalLength());
        return { x, y };
    }

    destroy() {}
}
