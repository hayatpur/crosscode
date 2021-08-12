import * as ESTree from 'estree';
import { Accessor, AccessorType, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { DataMovementPath } from '../../../utilities/DataMovementPath';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class BinaryExpressionAnimation extends AnimationNode {
    leftSpecifier: Accessor[];
    rightSpecifier: Accessor[];
    operator: ESTree.BinaryOperator;

    constructor(
        leftSpecifier: Accessor[],
        rightSpecifier: Accessor[],
        operator: ESTree.BinaryOperator,
        options: AnimationOptions = {}
    ) {
        super(options);

        this.leftSpecifier = leftSpecifier;
        this.rightSpecifier = rightSpecifier;

        this.operator = operator;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);
        let left = environment.resolvePath(this.leftSpecifier) as Data;
        if (left.type == DataType.ID) {
            left = environment.resolve({
                type: AccessorType.ID,
                value: left.value as string,
            }) as Data;
        }

        let right = environment.resolvePath(this.rightSpecifier) as Data;
        if (right.type == DataType.ID) {
            right = environment.resolve({
                type: AccessorType.ID,
                value: right.value as string,
            }) as Data;
        }

        const targetTransform = {
            ...left.transform,
            x: (left.transform.x + right.transform.x) / 2,
            y: (left.transform.y + right.transform.y) / 2 - 5,
            z: 1,
        };

        const leftPath = new DataMovementPath(left.transform, targetTransform);
        leftPath.seek(0);

        const rightPath = new DataMovementPath(right.transform, targetTransform);
        rightPath.seek(0);

        environment._temps['leftPath'] = leftPath;
        environment._temps['rightPath'] = rightPath;
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);
        let left = environment.resolvePath(this.leftSpecifier) as Data;
        if (left.type == DataType.ID) {
            left = environment.resolve({
                type: AccessorType.ID,
                value: left.value as string,
            }) as Data;
        }

        let right = environment.resolvePath(this.rightSpecifier) as Data;
        if (right.type == DataType.ID) {
            right = environment.resolve({
                type: AccessorType.ID,
                value: right.value as string,
            }) as Data;
        }

        // Move left
        const leftPath = environment._temps['leftPath'];
        leftPath.seek(t);
        let position = leftPath.getPosition(t);
        left.transform.x = position.x;
        left.transform.y = position.y;

        // Move right
        const rightPath = environment._temps['rightPath'];
        rightPath.seek(t);
        position = rightPath.getPosition(t);
        right.transform.x = position.x;
        right.transform.y = position.y;
    }

    end(environment: Environment) {
        let left = environment.resolvePath(this.leftSpecifier) as Data;
        if (left.type == DataType.ID) {
            left = environment.resolve({
                type: AccessorType.ID,
                value: left.value as string,
            }) as Data;
        }

        let right = environment.resolvePath(this.rightSpecifier) as Data;
        if (right.type == DataType.ID) {
            right = environment.resolve({
                type: AccessorType.ID,
                value: right.value as string,
            }) as Data;
        }

        const data = new Data({
            type: DataType.Literal,
            value: eval(`${left.value}${this.operator}${right.value}`),
        });
        data.transform.floating = true;
        environment.addDataAt([], data);

        data.transform.x = (left.transform.x + right.transform.x) / 2;
        data.transform.y = (left.transform.y + right.transform.y) / 2 - 5;
        data.transform.z = 1;

        const FloatingStack = environment.resolvePath([{ type: AccessorType.Symbol, value: '_FloatingStack' }], {
            noResolvingId: true,
        }) as Data;

        // Pop them from stack
        environment.removeAt(environment.getMemoryLocation(left).foundLocation);
        environment.removeAt(environment.getMemoryLocation(right).foundLocation);

        (FloatingStack.value as Data[]).pop();
        (FloatingStack.value as Data[]).pop();

        // Put it in the floating stack
        FloatingStack.addDataAt([], new Data({ type: DataType.ID, value: data.id }));
    }
}
