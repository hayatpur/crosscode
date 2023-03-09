import { FrameInfo } from '../../../../../transpiler/EnvironmentState'
import { clone } from '../../../../../utilities/objects'
import { DataRenderer } from '../DataRenderer'
import { DataState, TransformStyles } from '../DataState'

export class ReferenceRenderer extends DataRenderer {
    prevRenderStyles!: TransformStyles

    constructor() {
        super()
        this.element.classList.add('data-function')
    }

    setState(data: DataState, frame: FrameInfo) {
        this.element.innerText = 'Ref'
        this._cachedState = clone(data)
    }
}
