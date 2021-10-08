import { clone } from '../utilities/objects';
import { ArrayRenderer } from './data/array/ArrayRenderer';
import { DataRenderer } from './data/DataRenderer';
import { DataState, DataType, getZPane, PositionType, Transform } from './data/DataState';
import { EnvironmentState } from './EnvironmentState';

export enum LayoutType {
    Horizontal = 'Horizontal',
    Vertical = 'Vertical',
    Grid = 'Grid',
    Tree = 'Tree',
}

export interface Layout {
    type: LayoutType;
    padding: number;
}

export interface LayoutEntity {
    transform: Transform;
    children: any[];
    layout: Layout;
}

export interface PivotTransform {
    // Properties of the parent transform
    x: number;
    y: number;
    width: number;
    height: number;

    // Properties of the current pivot transform
    dx: number;
    dy: number;
    dwidth: number;
    dheight: number;

    positionType: PositionType;
}

export function environmentStateToMemoryLayout(environment: EnvironmentState): LayoutEntity {
    return {
        transform: environment.transform,
        children: environment.memory,
        layout: { type: LayoutType.Horizontal, padding: DataRenderer.Padding },
    };
}

/**(x, y)____________
 * |OOOOOO|         |   O = occupied space
 * |OOOOOO|         |
 * |-------(dx, dy) |
 * |________________|
 *
 * @param entity object to update the layout of
 * @param pivot current pivot point for rendering
 * @returns updated pivot
 */
export function updateLayout(entity: LayoutEntity, pivot: PivotTransform): PivotTransform {
    if (entity == null) return pivot;

    let newPivot = clone(pivot);

    // Update self by positioning correctly based on position type
    switch (entity.transform.positionType) {
        case PositionType.Absolute:
            newPivot.dx = 0;
            newPivot.dy = 0;
            break;
        case PositionType.Relative:
            break;
    }

    entity.transform.x = newPivot.x + newPivot.dx;
    entity.transform.y = newPivot.y + newPivot.dy;

    // Either self has children (and therefore is a container) or is a standalone entity
    if (entity.children != null) {
        // Update children by routing to the correct layout algorithm
        switch (entity.layout.type) {
            case LayoutType.Horizontal:
                newPivot = updateHorizontalLayout(entity, clone(newPivot));
            // case LayoutType.Vertical:
            //     return updateVerticalLayout(entity, clone(pivot));
            // case LayoutType.Grid:
            //     return updateGridLayout(entity, clone(pivot));
            // case LayoutType.Tree:
            //     return updateTreeLayout(entity, clone(pivot));
        }

        newPivot.width = Math.max(newPivot.width, newPivot.dx);
        newPivot.height = Math.max(newPivot.height, newPivot.dy);
    } else {
        newPivot.width = entity.transform.width;
        newPivot.height = entity.transform.height;
    }
}

export function updateHorizontalLayout(
    entity: LayoutEntity,
    pivot: PivotTransform
): PivotTransform {
    const children = entity.children;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const newPivot = updateLayout(child, clone(pivot));

        // Update according to the new draw call
        const padding = i < children.length - 1 ? entity.layout.padding : 0;
        pivot.dx = newPivot.dx + padding;
        pivot.width = newPivot.width + padding;
        pivot.height = newPivot.height;
    }

    return pivot;
}

/**
 * Updates the layout of all data in environment.
 * @param environment
 * @returns - Final pivot transforms.
 */
export function updateEnvironmentLayout(environment: EnvironmentState): PivotTransform[] {
    // TODO: Support more than two z planes
    let pivots: PivotTransform[] = [getStartPivot(), getStartPivot()];

    const search = environment.memory.filter(
        (d) => d != null && (d.type === DataType.Literal || d.type === DataType.Array)
    );

    // Update memory layout
    for (let i = 0; i < search.length; i++) {
        const item = search[i];
        if (item == null) continue;

        pivots = updateDataLayout(item, pivots);

        // Add space between items in the base layer
        if (i != search.length - 1 && pivots[0].width > 0) {
            pivots[0].x += DataRenderer.Padding;
        }

        pivots[0].width = 0;
    }

    // Width is the maximum x of the base layer
    environment.transform.width = pivots[0].x;

    return pivots;
}

/**
 * Updates the layout of data, returns the new pivots.
 * @param entity
 * @param pivots
 * @returns
 */
export function updateDataLayout(
    entity: DataState,
    pivots: PivotTransform[],
    offset: Offset = { z: 0 }
): PivotTransform[] {
    const mapping = {
        [DataType.Literal]: updateLiteralLayout,
        [DataType.Array]: updateArrayLayout,
    };

    if (!(entity.type in mapping)) {
        return { ...pivots };
    }

    return mapping[entity.type](entity, pivots, offset);
}

export function correctPivot(pivots: PivotTransform[], z: number) {
    const zPane = getZPane(z);
    const valid = pivots.filter((p, i) => i <= zPane);

    const x = Math.max(...valid.map((p) => p.x));
    const y = Math.max(...valid.map((p) => p.y));

    pivots[zPane].x = x;
    pivots[zPane].y = y;

    return pivots[zPane];
}

/**
 * Updates layout of a literal data, returns the new pivots.
 * @param literal
 * @param pivots
 * @returns
 */
export function updateLiteralLayout(
    literal: DataState,
    pivots: PivotTransform[],
    offset: Offset = { z: 0 }
): PivotTransform[] {
    const pivot = correctPivot(pivots, literal.transform.z + offset.z);

    if (literal.transform.positionType == PositionType.Relative) {
        literal.transform.x = pivot.x;
        literal.transform.y = pivot.y;

        pivot.x += literal.transform.width;
        pivot.height = literal.transform.height;
        pivot.width = literal.transform.width;
    } else if (literal.transform.positionType == PositionType.Absolute) {
        pivot.height = 0;
        pivot.width = 0;
    }

    return pivots;
}

/**
 * Updates layout of array data.
 * @param array
 * @param pivots
 * @returns
 */
export function updateArrayLayout(
    array: DataState,
    pivots: PivotTransform[],
    offset: Offset
): PivotTransform[] {
    // if (array.transform.floating) return { ...position, width: 0, height: 0 };
    const initial = clone(pivots);

    let pivot = correctPivot(pivots, array.transform.z + offset.z);

    if (array.transform.positionType == PositionType.Relative) {
        array.transform.x = pivot.x;
        array.transform.y = pivot.y;
    } else if (array.transform.positionType == PositionType.Absolute) {
        pivot.x = array.transform.x;
        pivot.y = array.transform.y;
    } else {
        console.warn('Unknown position type', array.transform.positionType);
    }

    // Space for opening brace '['
    pivot.x += ArrayRenderer.BracePadding;

    // Minimum height
    array.transform.height = ArrayRenderer.MinHeight;

    // Update layout of each item
    const items = array.value as DataState[];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        pivots = updateDataLayout(item, pivots, { z: array.transform.z });

        if (i < items.length - 1)
            correctPivot(pivots, array.transform.z + offset.z).x += ArrayRenderer.ElementGap;
    }

    pivot = correctPivot(pivots, array.transform.z + offset.z);

    // Space for closing brace ']'
    pivot.x += ArrayRenderer.BracePadding;

    array.transform.width = pivot.x - array.transform.x;

    if (array.transform.positionType == PositionType.Absolute) {
        return initial;
    }

    return pivots;
}

/*
if (search[i].type == DataType.Array && search[i].frame >= 0) {
            position.x = updateEnvironmentLayout(
                environment,
                { x: search[i].transform.x, y: search[i].transform.y },
                search[i],
                {
                    isArrayElement: true,
                }
            ).x;
            position.x += 30;
        } else */
