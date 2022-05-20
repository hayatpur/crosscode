import { clone } from '../../../../../utilities/objects'
import { DataRenderer } from '../DataRenderer'
import { DataState, TransformStyles } from '../DataState'

export class LiteralRenderer extends DataRenderer {
    prevRenderStyles: TransformStyles

    constructor() {
        super()
        this.element.classList.add('data-literal')
    }

    setState(data: DataState) {
        this.element.innerText = data.value?.toString() ?? 'null'

        if (typeof data.value == 'string') {
            this.element.classList.add('data-literal-string')
            this.element.innerText = `'${data.value.toString()}'`
        } else {
            this.element.classList.remove('data-literal-string')
        }

        this._cachedState = clone(data)
    }
}
