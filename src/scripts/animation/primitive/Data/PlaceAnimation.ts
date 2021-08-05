import { Accessor, AccessorType, Data } from '../../../environment/Data'
import { Environment } from '../../../environment/Environment'
import { AnimationNode, AnimationOptions } from '../AnimationNode'

export default class PlaceAnimation extends AnimationNode {
    inputSpecifier: Accessor[]
    outputSpecifier: Accessor[]

    constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options)
        this.inputSpecifier = inputSpecifier
        this.outputSpecifier = outputSpecifier
    }

    begin(environment: Environment) {
        const input = environment.resolvePath(this.inputSpecifier) as Data
        const to = environment.resolvePath(this.outputSpecifier) as Data

        let loc: Accessor[]

        const LatestExpression = environment.resolvePath([{ type: AccessorType.Symbol, value: '_LatestExpression' }], {
            noResolvingId: true,
        }) as Data

        if (to instanceof Environment) {
            environment.removeAt(environment.getMemoryLocation(input).foundLocation)
            loc = environment.addDataAt([], input)
            LatestExpression.value = input.id
        } else {
            // Remove the copy
            environment.removeAt(environment.getMemoryLocation(input).foundLocation)
            loc = environment.getMemoryLocation(to).foundLocation
            to.replaceWith(input, { frame: true })
            LatestExpression.value = to.id
        }

        input.transform.floating = false
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}
}
