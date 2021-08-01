import { Accessor, AccessorType } from '../../environment/Data';
import { Node } from '../../transpiler/Node';
import CopyDataAnimation from '../primitive/Data/CopyDataAnimation';
import MoveAnimation from '../primitive/Data/MoveAnimation';
import PlaceAnimation from '../primitive/Data/PlaceAnimation';
import AnimationSequence from './AnimationSequence';

export class CopyMoveSequence extends AnimationSequence {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];

    constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[], node: Node, options = {}) {
        super(node, options);

        this.inputSpecifier = inputSpecifier;
        this.outputSpecifier = outputSpecifier;
        this.vertices = this.generateSequence();
        this.postGenerateSequence();
    }

    generateSequence() {
        const copy = new CopyDataAnimation(this.inputSpecifier);

        const move = new MoveAnimation(
            [{ type: AccessorType.Symbol, value: `_CopyDataAnimation` }],
            this.outputSpecifier
        );

        const place = new PlaceAnimation(
            [{ type: AccessorType.Symbol, value: `_CopyDataAnimation` }],
            this.outputSpecifier
        );

        return [copy, move, place];
    }
}
