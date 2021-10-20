import { reflow } from '../utilities/dom';
import { DataState, DataType, instanceOfData, Transform } from './data/DataState';
import { instanceOfEnvironment } from './EnvironmentState';

export function getChildren(obj: any): { transform: Transform }[] {
    if (instanceOfData(obj)) {
        if (obj.type == DataType.Array) {
            return obj.value as DataState[];
        } else {
            return null;
        }
    } else if (instanceOfEnvironment(obj)) {
        return obj.memory.filter(
            (item) => item != null && (item.type == DataType.Array || item.type == DataType.Literal)
        );
    }
    return null;
}

/**
 * @param entity object to update the layout of
 * @param pivot current pivot point for rendering
 * @returns updated pivot
 */
export function updateLayout(entity: { transform: Transform }, parent?: HTMLDivElement) {
    // Get initial CSS layout
    const el = document.createElement('div');

    if (parent != null) {
        parent.appendChild(el);
    } else {
        document.getElementById('temporary-layout').append(el);
    }

    // Apply styles
    for (const style of entity.transform.styles) {
        el.style[style] = entity.transform.styles[style];
    }

    // Reflow
    reflow(el);
    reflow(parent);

    // Add children
    const children = getChildren(entity);
    for (const child of children ?? []) {
        updateLayout(child, el);
    }

    // Update transform
    const bbox = el.getBoundingClientRect();
    entity.transform.rendered = { ...bbox };

    // Remove element
    el.remove();
}
