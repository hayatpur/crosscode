import { Editor } from './editor/Editor'
import { ActionState } from './renderer/Action/Action'
import { VisualizationState } from './visualization/Visualization'

export class ApplicationState {
    static visualization: VisualizationState
    static editor: Editor

    // Constants
    static proxyHeightMultiplier = 0.8
    static proxyWidthMultiplier = 0.4

    // Collections
    static actions: { [id: string]: ActionState } = {}
}
