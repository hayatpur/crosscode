import {
  AbstractionType,
  applyAbstraction,
} from "../animation/graph/abstraction/AbstractionController";
import { AnimationGraph } from "../animation/graph/AnimationGraph";
import { AnimationNode } from "../animation/primitive/AnimationNode";
import { Executor } from "../executor/Executor";
import { View } from "../view/View";
import { ViewRenderer } from "../view/ViewRenderer";

export function createCodeSection(group: AnimationGraph) {
  const codeSection = document.createElement("div");
  codeSection.classList.add("code-section");
  document.body.append(codeSection);

  setTimeout(() => {
    const { bbox, startRow, endRow } = getLocation(group);
    if (bbox == null) return;

    // Add padding
    const padding = 10;
    bbox.x -= padding;
    bbox.y -= padding;
    bbox.width += 2 * padding;
    bbox.height += 2 * padding;
    codeSection.style.left = `${bbox.left}px`;
    codeSection.style.top = `${bbox.top}px`;
    codeSection.style.width = `${bbox.width}px`;
    codeSection.style.height = `${bbox.height}px`;
  }, 1000);

  return codeSection;
}

export function getLocation(animation: AnimationGraph) {
  const lines = document.body.getElementsByClassName("view-lines")[0];

  let bbox = null;

  let startRow = Math.min(
    ...animation.vertices.map((v) => {
      const loc = v instanceof AnimationGraph ? v.node.loc : v.statement.loc;
      return loc.start.line;
    })
  );

  let endRow = Math.max(
    ...animation.vertices.map((v) => {
      const loc = v instanceof AnimationGraph ? v.node.loc : v.statement.loc;
      return loc.end.line;
    })
  );

  for (let row = startRow; row <= endRow; row++) {
    const line_bbox =
      lines.children[row - 1]?.children[0].getBoundingClientRect();
    if (line_bbox == null) continue;

    if (bbox == null) {
      bbox = line_bbox;
      continue;
    }

    // Expand it
    bbox.width = Math.max(bbox.width, line_bbox.width);
    bbox.height = Math.max(
      bbox.height,
      line_bbox.y + line_bbox.height - bbox.y
    );
  }

  if (bbox == null) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Column
  // const char = Editor.instance.computeCharWidth();
  // bbox.x += char * view.location.startCol;
  // bbox.width -= char * view.location.startCol;
  // bbox.width = Math.max((view.location.endCol - view.location.startCol) * char, bbox.width);

  return { bbox, startRow, endRow };
}

export function createViewControls(view: View, labelEl: HTMLDivElement) {
  if (view.animation instanceof AnimationNode) return;

  const controls = document.createElement("div");
  controls.classList.add("view-controls");

  // Toggle expand button
  const expand = document.createElement("div");
  expand.classList.add("view-controls-button");
  expand.innerHTML = `<ion-icon name="${
    view.animation.showing ? "add" : "remove"
  }"></ion-icon>`;
  expand.addEventListener("click", () => {
    if (view.animation.showing) {
      splitView(view);
    } else {
      collapseView(view);
    }

    expand.innerHTML = `<ion-icon name="${
      view.animation.showing ? "add" : "remove"
    }"></ion-icon>`;
  });
  labelEl.prepend(expand);

  const abstract = document.createElement("div");
  abstract.classList.add(
    "view-controls-button",
    "view-controls-button-abstract"
  );
  abstract.innerHTML = `<ion-icon name="brush"></ion-icon>`;
  abstract.addEventListener("click", () => {
    abstract.classList.toggle("clicked");

    if (abstract.classList.contains("clicked")) {
      // Show abstraction menu
      view.abstractionMenu = createAbstractionMenu(view);
    } else {
      destroyAbstractionMenu(view);
    }
  });
  labelEl.append(abstract);

  view.element.append(controls);
}

export function destroyAbstractionMenu(view: View) {
  view.abstractionMenu?.remove();
  view.abstractionMenu = undefined;
}

export function collapseView(view: View) {
  if (view.animation instanceof AnimationNode || view.animation.showing) return;

  Executor.instance.paused = true;
  const time = Executor.instance.time;

  view.animation.hasPlayed = false;
  // view.animation.playing = false;
  view.children.forEach((child) => {
    child.animation.hasPlayed = false;
    child.animation.playing = false;
  });

  view.children.forEach((child) => child.destroy());
  view.children = [];
  view.animation.showing = true;

  if (view.animation.showing) {
    view.environment = view.animation.precondition.copy();
    view.environment.validIds = new Set([view.animation.id]);
    view.renderer = new ViewRenderer();
    view.element.append(view.renderer.element);
    View.shownViews.add(view);

    view.element.classList.add("showing-renderer");
  }

  view.codeSection = createCodeSection(view.animation);

  // Apply animations
  Executor.instance.animation.reset();
  Executor.instance.view.reset();

  const environments = [...View.shownViews].map((view) => view.environment);
  Executor.instance.animation?.seek(environments, time);

  Executor.instance.view.update();
  Executor.instance.paused = false;
}

export function splitView(view: View) {
  if (view.animation instanceof AnimationNode || !view.animation.showing)
    return;

  Executor.instance.paused = true;
  const time = Executor.instance.time;

  if (view.animation.showing) {
    view.renderer.destroy();
    view.environment = undefined;
    view.renderer = undefined;
    view.codeSection?.remove();

    view.beforeRenderer?.destroy();
    view.beforeRenderer = undefined;
  }

  for (const vertex of view.animation.vertices) {
    vertex.showing = true;
  }
  view.animation.showing = false;

  view.element.classList.remove("showing-renderer");

  View.shownViews.delete(view);

  for (const child of view.animation.vertices) {
    view.children.push(new View(child, view));
  }

  // Apply animations
  Executor.instance.animation.reset();
  Executor.instance.view.reset();

  const environments = [...View.shownViews].map((view) => view.environment);
  Executor.instance.animation?.seek(environments, time);

  Executor.instance.view.update();
  Executor.instance.paused = false;
}

export function createAbstractionButton(
  view: View,
  labelText: string
): {
  group: HTMLDivElement;
  input: HTMLInputElement;
  label: HTMLLabelElement;
} {
  // Aggregate abstraction menu
  const group = document.createElement("div");
  group.classList.add("group");

  const input = document.createElement("input");
  input.classList.add("inp-cbx");
  input.id = `${view.animation.id}-${labelText}`;
  input.setAttribute("type", "checkbox");
  group.append(input);

  const label = document.createElement("label");
  label.classList.add("cbx", "mb-1");
  label.setAttribute("for", `${view.animation.id}-${labelText}`);
  label.innerHTML = `<span>
             <svg width="12px" height="10px">
                 <use xlink:href="#check"></use>
             </svg>
         </span>
         <span>${labelText}</span>`;
  group.append(label);

  return { group, input, label };
}

export function createAbstractionMenu(view: View) {
  const abstractionMenu = document.createElement("div");
  abstractionMenu.classList.add("view-abstraction-menu");

  // Aggregate button
  const {
    group: aggregateGroup,
    input: aggregateInput,
    label: aggregateLabel,
  } = createAbstractionButton(view, "Aggregate");

  aggregateInput.onclick = () => {
    if (view.animation instanceof AnimationGraph)
      applyAbstraction(view.animation, {
        type: AbstractionType.Aggregation,
        value: { Depth: 0 },
      });
  };

  abstractionMenu.append(aggregateGroup);

  // Transition button
  const {
    group: transitionGroup,
    input: transitionInput,
    label: transitionLabel,
  } = createAbstractionButton(view, "Transition");

  transitionInput.onclick = () => {
    if (view.animation instanceof AnimationGraph)
      applyAbstraction(view.animation, {
        type: AbstractionType.Transition,
        value: {},
      });
  };
  abstractionMenu.append(transitionGroup);

  // Layout button
  const {
    group: layoutGroup,
    input: layoutInput,
    label: layoutLabel,
  } = createAbstractionButton(view, "Layout");

  layoutInput.onclick = () => {};
  abstractionMenu.append(layoutGroup);

  // Annotation button
  const {
    group: annotationGroup,
    input: annotationInput,
    label: annotationLabel,
  } = createAbstractionButton(view, "Annotation");

  annotationInput.onclick = () => {};
  abstractionMenu.append(annotationGroup);

  // Apply button
  const apply = document.createElement("div");
  apply.classList.add("view-abstraction-menu-apply");
  apply.innerText = "Apply";
  apply.addEventListener("click", () => {});

  abstractionMenu.append(apply);

  const view_bbox = view.element.getBoundingClientRect();
  const bbox = abstractionMenu.getBoundingClientRect();

  abstractionMenu.style.left = `${view_bbox.right + bbox.width}px`;
  abstractionMenu.style.top = `${view_bbox.y}px`;

  document.body.append(abstractionMenu);

  return abstractionMenu;
}
