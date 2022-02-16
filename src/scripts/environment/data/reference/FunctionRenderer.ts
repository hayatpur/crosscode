import { DataRenderer } from '../DataRenderer'
import { PrototypicalDataState, TransformStyles } from '../DataState'

export class FunctionRenderer extends DataRenderer {
    prevRenderStyles: TransformStyles

    constructor() {
        super()
        this.element.classList.add('data-function')
    }

    setState(data: PrototypicalDataState) {
        this.element.innerText = 'function'
    }
}
