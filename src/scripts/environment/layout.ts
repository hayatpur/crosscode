import { clone } from '../utilities/objects';
import { ArrayRenderer } from './data/array/ArrayRenderer';
import { DataRenderer } from './data/DataRenderer';
import { DataState, DataType, getZPane, PositionType, Transform } from './data/DataState';
import { EnvironmentState } from './EnvironmentState';

export interface Layout {
    transform: Transform;
    children: any[];
}

export function environmentStateToMemoryLayout(environment: EnvironmentState): Layout {
    return {
        transform: environment.transform,
        children: environment.memory,
    };
}

export function updateLayout(layout: Layout): Transform {
    if (layout == null) return;
}

// Pivot transform for a single z pane
export interface PivotTransform extends Transform {
    floating: boolean;
}

export interface Offset {
    z: number;
}

/**
 * @returns Starting pivot at the top left corner.
 */
export function getStartPivot(): PivotTransform {
    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        floating: false,
        positionType: PositionType.Relative,
    };
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
export function updateArrayLayout(array: DataState, pivots: PivotTransform[], offset: Offset): PivotTransform[] {
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

        if (i < items.length - 1) correctPivot(pivots, array.transform.z + offset.z).x += ArrayRenderer.ElementGap;
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
