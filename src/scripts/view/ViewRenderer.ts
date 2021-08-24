import { Accessor, Data, DataType } from "../environment/Data";
import { Environment } from "../environment/Environment";
import { sigmoid } from "../utilities/math";

export class ViewRenderer {
  // View's HTML DOM Element
  element: HTMLDivElement;

  dataElements: { [id: string]: HTMLDivElement } = {};
  identifierElements: { [id: string]: HTMLDivElement } = {};

  position: { x: number; y: number };
  draggable: boolean = false;

  constructor() {
    // DOM elements
    this.element = document.createElement("div");
    this.element.classList.add("view-renderer");

    // this.position = options.position ?? { x: 0, y: 0 };

    // this.element.style.top = `${this.position.y}px`;
    // this.element.style.left = `${this.position.x}px`;
  }

  setState(environment: Environment) {
    // Clear memory
    let memory = environment.flattenedMemory();
    memory = memory.filter((data) => data && data.type == DataType.Literal);
    memory.reverse();

    let ids = new Set([...memory.map((data) => data.id)]);

    // Add any missing elements
    for (const data of memory) {
      if (this.dataElements[data.id] == null) {
        // Create element
        const el = document.createElement("div");
        el.classList.add("view-renderer-element");
        this.element.append(el);

        this.dataElements[data.id] = el;
      }
    }

    // Remove any un-needed elements
    for (const [id, el] of Object.entries(this.dataElements)) {
      if (!ids.has(id)) {
        el.remove();
        delete this.dataElements[id];
      }
    }

    for (const data of memory) {
      const element = this.dataElements[data.id];

      if (data.type != DataType.Literal) {
        continue;
      }

      const transform = data.transform;
      const value = data.value;

      element.style.marginLeft = `${transform.x + 5 * transform.z}px`;
      element.style.marginTop = `${transform.y - 5 * transform.z}px`;
      element.style.opacity = `${
        transform.opacity * sigmoid(-5 * (transform.z - 2))
      }`;

      if (typeof value == "boolean") {
        element.innerHTML = value
          ? `<i class="gg-check"></i>`
          : `<i class="gg-close"></i>`;
      } else {
        element.innerHTML = `${value == undefined ? "" : value}`;
      }

      element.style.width = `${transform.width}px`;
      element.style.height = `${transform.height}px`;
      // element.style.transform = `translateZ(${transform.z}px)`

      if (data.transform.step != null) {
        element.innerHTML += `<step>${data.transform.step}</step>`;
      }

      if (value == undefined) {
        element.classList.add("undefined");
      } else {
        element.classList.remove("undefined");
      }

      if (transform.floating) {
        element.classList.add("floating");
      } else {
        element.classList.remove("floating");
      }
    }

    let bindings: [string, Accessor[]][] = [];
    for (const scope of environment.bindingFrames) {
      for (const binding of Object.entries(scope)) {
        bindings.push(binding);
      }
    }
    bindings = bindings.filter((item) => !item[0].startsWith("_"));
    let names = new Set(bindings.map((pair) => pair[0]));

    // Add any missing elements
    for (const [identifier, path] of bindings) {
      if (this.identifierElements[identifier] == null) {
        // Create element
        const el = document.createElement("div");
        el.classList.add("view-renderer-identifier");
        this.element.append(el);

        this.identifierElements[identifier] = el;
      }
    }

    // Remove any un-needed elements
    for (const [name, el] of Object.entries(this.identifierElements)) {
      if (!names.has(name)) {
        el.remove();
        delete this.identifierElements[name];
      }
    }

    const positionMap = {};

    // Setup identifiers
    for (const [identifier, path] of bindings) {
      const element = this.identifierElements[identifier];

      const data = environment.resolvePath(path) as Data;
      const { x, y } = data.transform;

      if (positionMap[x] == null) {
        positionMap[x] = 0;
      }

      element.innerText = `${positionMap[x] != 0 ? ", " : ""}${identifier}`;

      element.style.left = `${x + positionMap[x] * 10}px`;
      element.style.top = `${y - 25}px`;

      positionMap[x]++;
    }
  }

  reset() {
    Object.values(this.identifierElements).forEach((el) => el.remove());
    this.identifierElements = {};

    Object.values(this.dataElements).forEach((el) => el.remove());
    this.dataElements = {};
  }

  destroy() {
    this.reset();
    this.element.remove();
  }
}
