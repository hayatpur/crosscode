import { DataRenderer } from '../environment/data/DataRenderer'
import { GroupViewRenderer } from './GroupViewRenderer'
import { RootViewState } from './ViewState'

export class RootViewRenderer extends GroupViewRenderer {
    constructor() {
        super()

        DataRenderer.getStage().append(this.element)
        this.element.classList.add('is-root', 'root')
        this.labelElement.classList.add('is-root')
    }

    setState(state: RootViewState) {
        super.setState(state)
    }
}
