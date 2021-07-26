/** A container / visual for a variable diagram */
export class Container {
    /** DOM element */
    element: HTMLElement;

    /** Label DOM element */
    labelElement: HTMLDivElement;
    label: string;

    /** Child containers */
    containers: Container[] = [];

    /** If true then it's freeform (i.e absolute positioned), otherwise it is contained in a parent layout */
    floating: boolean = false;

    /** Current scope that contains this container */
    currentScope: any = null;

    constructor() {
        // Dom element
        this.element = document.createElement("div");
        this.element.classList.add("container");
    }

    clear() {
        for (const container of this.containers) {
            container.element.remove();
        }

        this.containers = [];
    }

    duplicate() {
        const duplicate = new Container();
        duplicate.setLabel(this.label);

        for (const container of this.containers) {
            const copy = container.duplicate();
            duplicate.addContainer(copy);
        }

        return duplicate;
    }

    setLabel(label: string) {
        this.label = label;
        this.labelElement?.remove();

        this.labelElement = document.createElement("div");
        this.labelElement.classList.add("container-label");
        this.labelElement.innerHTML = `${label}`;

        return this.labelElement;
    }

    addContainer(container: Container) {
        this.element.append(container.element);
        this.containers.push(container);
    }

    removeContainer(container: Container) {
        const index = this.containers.indexOf(container);

        this.containers[index].element.remove();
        this.containers.splice(index, 1);
    }

    removeContainerAt(index: number) {
        this.containers[index].element.remove();
        this.containers.splice(index, 1);
    }

    addContainerAt(container: Container, index: number) {
        this.element.insertBefore(container.element, this.element.children[index]);
        this.containers.splice(index, 0, container);
    }

    getKey(container: Container) {
        return this.containers.indexOf(container);
    }

    float() {
        this.element.style.position = "absolute";
        this.floating = true;
    }

    fix() {
        this.element.style.position = "relative";
        this.setPosition({ x: 0, y: 0 });
        this.floating = false;
    }

    addToDocument() {
        document.body.append(this.element);
    }

    /**
     * Note: only for floating containers
     * @param { {x: number, y: number} } position absolute position of container on canvas
     */
    setPosition(position: { x: number; y: number }) {
        if (!this.floating) console.warn("Setting position of non-floating container");

        this.element.style.left = `${position.x}px`;
        this.element.style.top = `${position.y}px`;
    }

    setScale(scale: number) {
        this.element.style.transform = `scale(${scale})`;
    }

    bbox() {
        return this.element.getBoundingClientRect();
    }

    center() {
        const bbox = this.bbox();
        return { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
    }

    isEmpty() {
        return this.containers.length == 0;
    }

    remove(replace?: HTMLElement) {
        if (replace != undefined && this.element.parentElement != null) {
            this.element.parentElement.replaceChild(replace, this.element);
            return;
        }

        this.element.remove();
    }

    floatUp(t: number) {
        this.element.style.boxShadow = `box-shadow: ${t * 2}px ${
            t * 2
        }px 0px 0px #7c7c7c, 0px 0px 0px 0.5px #7c7c7c inset`;
        this.element.style.transform = `translate(-${t * 2}px, -${t * 2}px)`;

        if (t >= 0.5) {
            this.element.style.zIndex = "5";
        } else {
            this.element.style.zIndex = "1";
        }
    }

    static dispose() {
        document.querySelectorAll(".container").forEach(el => el.remove());
        document.querySelectorAll(".history-visual").forEach(el => el.remove());
    }
}
