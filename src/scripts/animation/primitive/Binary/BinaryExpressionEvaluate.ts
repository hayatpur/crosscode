import * as ESTree from 'estree';
import { Accessor, AccessorType, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { lerp, remap } from '../../../utilities/math';
import { AnimationData } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class BinaryExpressionSetup extends AnimationNode {
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

        this.base_duration = 50;
        this.operator = operator;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);
        // Find left data
        let left = environment.resolvePath(this.leftSpecifier) as Data;
        environment._temps[`LeftData${this.id}`] = [{ type: AccessorType.ID, value: left.id }];

        // Find right data
        let right = environment.resolvePath(this.rightSpecifier) as Data;
        environment._temps[`RightData${this.id}`] = [{ type: AccessorType.ID, value: right.id }];

        const data = new Data({
            type: DataType.Literal,
            value: eval(`${left.value}${this.operator}${right.value}`),
        });
        data.transform.floating = true;
        environment.addDataAt([], data);

        data.transform.x = (left.transform.x + right.transform.x) / 2;
        data.transform.y = left.transform.y;
        data.transform.z = 1;
        data.transform.opacity = 0;
        environment._temps[`EvaluatedData${this.id}`] = [{ type: AccessorType.ID, value: data.id }];

        // Target left transform
        environment._temps[`LeftTransform${this.id}`] = {
            init_x: left.transform.x,
            init_y: left.transform.y,
            x: data.transform.x - data.transform.width / 4,
            y: data.transform.y,
        };

        // Target right transform
        environment._temps[`RightTransform${this.id}`] = {
            init_x: right.transform.x,
            init_y: right.transform.y,
            x: data.transform.x + data.transform.width / 4,
            y: data.transform.y,
        };

        if (options.baking) {
        }
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);

        const left = environment.resolvePath(environment._temps[`LeftData${this.id}`]) as Data;
        const right = environment.resolvePath(environment._temps[`RightData${this.id}`]) as Data;
        const evaluated = environment.resolvePath(environment._temps[`EvaluatedData${this.id}`]) as Data;

        const leftTransform = environment._temps[`LeftTransform${this.id}`];
        const rightTransform = environment._temps[`RightTransform${this.id}`];

        // Move left
        left.transform.x = lerp(leftTransform.init_x, leftTransform.x, t);
        left.transform.y = lerp(leftTransform.init_y, leftTransform.y, t);

        // Move right
        right.transform.x = lerp(rightTransform.init_x, rightTransform.x, t);
        right.transform.y = lerp(rightTransform.init_y, rightTransform.y, t);

        if (t > 0.5) {
            evaluated.transform.opacity = remap(t, 0.5, 1, 0, 1);
        }

        if (t > 0.9) {
            left.transform.opacity = remap(t, 0.9, 1, 1, 0);
            right.transform.opacity = remap(t, 0.9, 1, 1, 0);
        }
    }

    end(environment: Environment, options = { baking: false }) {
        this.seek(environment, this.duration);

        const left = environment.resolvePath(environment._temps[`LeftData${this.id}`]) as Data;
        const right = environment.resolvePath(environment._temps[`RightData${this.id}`]) as Data;
        const evaluated = environment.resolvePath(environment._temps[`EvaluatedData${this.id}`]) as Data;

        if (options.baking) {
            this.computeReadAndWrites(
                { location: environment.getMemoryLocation(left).foundLocation, id: left.id },
                { location: environment.getMemoryLocation(right).foundLocation, id: right.id },
                { location: environment.getMemoryLocation(evaluated).foundLocation, id: evaluated.id }
            );
        }

        const FloatingStack = environment.resolvePath([{ type: AccessorType.Symbol, value: '_FloatingStack' }], {
            noResolvingId: true,
        }) as Data;

        // Pop them from stack
        environment.removeAt(environment.getMemoryLocation(left).foundLocation);
        environment.removeAt(environment.getMemoryLocation(right).foundLocation);

        (FloatingStack.value as Data[]).pop();
        (FloatingStack.value as Data[]).pop();

        // Put it in the floating stack
        FloatingStack.addDataAt([], new Data({ type: DataType.ID, value: evaluated.id }));
    }

    computeReadAndWrites(leftData: AnimationData, rightData: AnimationData, evaluatedData: AnimationData) {
        this._reads = [leftData, rightData];
        this._writes = [evaluatedData];
    }
}
