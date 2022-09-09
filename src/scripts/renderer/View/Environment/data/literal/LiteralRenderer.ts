import { FrameInfo } from '../../../../../environment/EnvironmentState'
import { clone } from '../../../../../utilities/objects'
import { DataRenderer } from '../DataRenderer'
import { DataState, TransformStyles } from '../DataState'

export class LiteralRenderer extends DataRenderer {
    prevRenderStyles!: TransformStyles

    constructor() {
        super()
        this.element.classList.add('data-literal')
    }

    setState(data: DataState, frame: FrameInfo) {
        this.element.innerText = data.value?.toString() ?? 'null'

        if (typeof data.value == 'string') {
            this.element.classList.add('data-literal-string')
            this.element.classList.remove('data-literal-boolean')
            this.element.classList.remove('true')
            this.element.classList.remove('false')

            this.element.innerText = `'${data.value.toString()}'`
        } else if (typeof data.value == 'boolean') {
            this.element.classList.add('data-literal-boolean')
            this.element.classList.remove('data-literal-string')

            if (data.value) {
                this.element.classList.add('true')
                this.element.classList.remove('false')
            } else {
                this.element.classList.add('false')
                this.element.classList.remove('true')
            }
        } else {
            this.element.classList.remove('data-literal-string')
            this.element.classList.remove('data-literal-boolean')

            this.element.classList.remove('true')
            this.element.classList.remove('false')
        }

        this._cachedState = clone(data)
    }
}
