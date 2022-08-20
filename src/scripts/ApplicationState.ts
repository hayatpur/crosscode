import { Editor } from './editor/Editor'
import { ActionState } from './renderer/Action/Action'
import { VisualizationState } from './visualization/Visualization'

export class ApplicationState {
    static visualization: VisualizationState
    static editor: Editor

    // Constants
    static proxyHeightMultiplier = 0.4
    static proxyWidthMultiplier = 0.25

    // Collections
    static actions: { [id: string]: ActionState } = {}
}
