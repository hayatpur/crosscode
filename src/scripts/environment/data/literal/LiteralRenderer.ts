import { DataRenderer } from '../DataRenderer'
import { PrototypicalDataState, TransformStyles } from '../DataState'

export class LiteralRenderer extends DataRenderer {
    prevRenderStyles: TransformStyles

    constructor() {
        super()
        this.element.classList.add('data-literal')
    }

    setState(data: PrototypicalDataState) {
        this.element.innerText = data.value?.toString() ?? 'null'

        if (typeof data.value == 'string') {
            this.element.classList.add('data-literal-string')
            this.element.innerText = `'${data.value.toString()}'`
        } else {
            this.element.classList.remove('data-literal-string')
        }
    }
}
