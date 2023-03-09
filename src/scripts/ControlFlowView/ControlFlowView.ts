import { ExecutionGraph } from '../Analysis/execution/graph/ExecutionGraph'
import { Editor, EditorState } from '../Editor/Editor'
import { compileCode, instanceOfCompileError } from '../Utilities/executor'
import { postCreateStep } from './Dynamic/PostCreateStep'
import { Step, Steps } from './Step'
import { TimeMarker, TimeMarkerState } from './TimeMarker'

export type CFVState = {
    execution: ExecutionGraph | undefined

    rootStepId: string | undefined
    timeMarkers: TimeMarkerState[]
}

export class CFVInstance {
    static instance: CFVState
}

export namespace CFV {
    /**
     * @param editor
     * @returns Control flow view state
     */
    export function createCFV(editor: EditorState): CFVState {
        // // HTML elements
        // const container = createElement('div', 'control-flow-view', visContainer)
        // const svgCanvas = createSVGElement('control-flow-view-svg', container)

        const cfv: CFVState = {
            execution: undefined,

            actions: {},
            rootStepId: undefined,

            abbreviations: {},
            timeMarkers: [],
        } as CFVState

        CFVInstance.instance = cfv

        // Compile user's code
        const execution = compileCode(Editor.getValue(editor))

        // Return early if there is a compile error
        if (instanceOfCompileError(execution)) {
            console.error('Error while compiling code', execution)
            return cfv
        }

        cfv.execution = execution

        // Create default time marker
        cfv.timeMarkers = [TimeMarker.createTimeMarker(true)]

        // Create steps
        const rootStep = Step.createStepState(execution)
        cfv.rootStepId = rootStep.id
        postCreateStep(rootStep.id)

        return cfv
    }

    export function destroyCFV(cfv: CFVState) {
        if (cfv.rootStepId !== undefined) {
            Step.destroyStep(cfv.rootStepId)
        }

        for (const timeMarker of cfv.timeMarkers) {
            TimeMarker.destroyTimeMarker(timeMarker)
        }

        for (const id of Object.keys(Steps.steps)) {
            Step.destroyStep(id)
        }

        // for (const [id, abbreviation] of Object.entries(CFV.abbreviations)) {
        //     destroyAbyssCleanup(abbreviation)
        // }
        // CFV.abbreviations = {}

        cfv.execution = undefined
        cfv.rootStepId = undefined
    }
}
