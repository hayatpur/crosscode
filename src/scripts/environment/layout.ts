import { clone } from '../utilities/objects';
import { DataState, DataType, instanceOfData, LayoutType, PositionType, Transform } from './data/DataState';
import { instanceOfEnvironment } from './EnvironmentState';

export interface PivotTransform {
    // Properties of the parent transform
    x: number;
    y: number;
    width: number;
    height: number;

    // Properties of the current pivot transform
    dx: number;
    dy: number;
    dWidth: number;
    dHeight: number;
}

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
export function updateLayout(entity: { transform: Transform }, pivot: PivotTransform = null): PivotTransform {
    if (entity == null) return pivot;
    if (pivot == null) pivot = getDefaultPivot(entity);

    let newPivot = clone(pivot) as PivotTransform;

    // Update self by positioning correctly based on position type
    switch (entity.transform.positionType) {
        case PositionType.Absolute:
            newPivot.dx = 0;
            newPivot.dy = 0;
            break;
        case PositionType.Relative:
            break;
    }

    entity.transform._x = newPivot.x + newPivot.dx + entity.transform.left;
    entity.transform._y = newPivot.y + newPivot.dy + entity.transform.top;

    const children = getChildren(entity);

    // Either self has children (and therefore is a container) or is a standalone entity
    if (children != null) {
        // Update children by routing to the correct layout algorithm
        switch (entity.transform.layout.type) {
            case LayoutType.Horizontal:
                newPivot = updateHorizontalLayout(entity, {
                    ...clone(newPivot),
                    x: entity.transform._x + entity.transform.layout.outerPadding,
                    y: entity.transform._y + entity.transform.layout.outerPadding,
                    dx: 0,
                    dy: 0,
                });
            // case LayoutType.Vertical:
            //     return updateVerticalLayout(entity, clone(pivot));
            // case LayoutType.Grid:
            //     return updateGridLayout(entity, clone(pivot));
            // case LayoutType.Tree:
            //     return updateTreeLayout(entity, clone(pivot));
        }

        entity.transform.width = newPivot.dWidth + entity.transform.layout.outerPadding * 2;
        entity.transform.height = newPivot.dHeight + entity.transform.layout.outerPadding * 2;

        newPivot.dx += entity.transform.width;
        newPivot.dy += entity.transform.height;
    } else {
        if (entity.transform.positionType == PositionType.Relative) {
            newPivot.dx += entity.transform.width;
            newPivot.dy += entity.transform.height;
        }
    }

    newPivot.dWidth = entity.transform.width;
    newPivot.dHeight = entity.transform.height;

    return newPivot;
}

export function updateHorizontalLayout(entity: { transform: Transform }, pivot: PivotTransform): PivotTransform {
    const children = getChildren(entity);

    let width: number, height: number;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const newPivot = updateLayout(child, clone(pivot));

        // Update according to the new draw call
        const padding = i < children.length - 1 ? entity.transform.layout.innerPadding : 0;

        if (child.transform.positionType != PositionType.Absolute) {
            pivot.dx = newPivot.dx + padding;
            width = pivot.dx;
            height = newPivot.dHeight;
        }
    }

    if (instanceOfData(entity) && entity.type == DataType.Array) {
        console.log(width, height);
    }

    pivot.dWidth = width;
    pivot.dHeight = height;

    return pivot;
}

export function getDefaultPivot(entity: { transform: Transform }) {
    return {
        x: entity.transform._x,
        y: entity.transform._y,
        width: 0,
        height: 0,
        dx: 0,
        dy: 0,
        dWidth: 0,
        dHeight: 0,
    };
}
