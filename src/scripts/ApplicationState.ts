import { Editor } from './editor/Editor'
import { AbyssState } from './renderer/Action/Abyss'
import { ActionState } from './renderer/Action/Action'
import { CodeQueryState } from './visualization/query/CodeSelectionQuery'
import { VisualizationState } from './visualization/Visualization'

export class ApplicationState {
    // Visualization
    static visualization: VisualizationState
    static editor: Editor

    // Interaction
    static currentQuery: CodeQueryState

    // Constants
    static proxyHeightMultiplier = 0.4
    static proxyWidthMultiplier = 0.25

    // Collections
    static actions: { [id: string]: ActionState } = {}
    static abysses: { [id: string]: AbyssState } = {}
}
