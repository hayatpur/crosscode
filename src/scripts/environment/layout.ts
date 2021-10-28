import { reflow } from '../utilities/dom';
import { getRelativeLocation } from '../utilities/math';
import { ViewState } from '../view/ViewState';
import { DataState, DataType, instanceOfData, Transform } from './data/DataState';
import { resolvePath } from './environment';
import { IdentifierState, instanceOfEnvironment } from './EnvironmentState';

export function getChildren(
    obj: any,
    options: { getBindings: boolean } = { getBindings: false }
): null | { transform: Transform }[] {
    if (instanceOfData(obj)) {
        if (obj.type == DataType.Array) {
            return obj.value as DataState[];
        } else {
            return null;
        }
    } else if (instanceOfEnvironment(obj) && !options.getBindings) {
        return obj.memory.filter(
            (item) => item != null && (item.type == DataType.Array || item.type == DataType.Literal)
        );
    } else if (instanceOfEnvironment(obj) && options.getBindings) {
        let bindings: IdentifierState[] = [];
        for (let scope of obj.scope) {
            bindings = [...bindings, ...Object.values(scope)];
        }
        return bindings;
    } else if ('children' in obj) {
        return obj.children;
    }

    return null;
}

export function updateRootViewLayout(view: ViewState) {
    if (!view.isRoot) {
        console.warn('Update root layout of a non-root view', view);
        console.trace();
    }

    // Clear current temporary layout
    document.getElementById('temporary-layout').innerHTML = '';

    // Create root view container
    const rootViewContainer = document.createElement('div');
    rootViewContainer.classList.add('root-view-container');
    document.getElementById('temporary-layout').append(rootViewContainer);

    // Update the view's layout
    updateLayout(view, rootViewContainer);
}

/**
 * @param entity object to update the layout of
 * @param pivot current pivot point for rendering
 * @returns updated pivot
 */
export function updateLayout(entity: { transform: Transform }, parent: HTMLDivElement) {
    // Get initial CSS layout
    const el = document.createElement('div');

    if (instanceOfData(entity) && entity.transform.styles.position == 'absolute') {
        el.classList.add('floating-i');
    }

    // Append to parent
    parent.appendChild(el);

    // Assign appropriate class
    el.classList.add(...entity.transform.classList);

    // Apply styles
    for (const style of Object.keys(entity.transform.styles)) {
        el.style[style] = entity.transform.styles[style];
    }

    // Reflow
    reflow(el);
    reflow(parent);

    const children = getChildren(entity);

    for (const child of children ?? []) {
        updateLayout(child, el);
    }

    // Reflow
    reflow(el);
    reflow(parent);

    // Update bindings
    if (instanceOfEnvironment(entity)) {
        const bindings = getChildren(entity, { getBindings: true }) as IdentifierState[];
        for (const binding of bindings) {
            const item = resolvePath(entity, binding.location, null);
            const location = getRelativeLocation(item.transform.rendered, entity.transform.rendered);
            binding.transform.styles.top = `${location.y - 30}px`;
            binding.transform.styles.left = `${location.x}px`;
            updateLayout(binding, el);
        }
    }

    // Update transform
    const bbox = el.getBoundingClientRect();
    entity.transform.rendered.x = bbox.x;
    entity.transform.rendered.y = bbox.y;
    entity.transform.rendered.width = bbox.width;
    entity.transform.rendered.height = bbox.height;
}
