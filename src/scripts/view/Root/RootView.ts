import { AnimationGraph } from '../../animation/graph/AnimationGraph'
import { AnimationNode } from '../../animation/primitive/AnimationNode'
import { getNumericalValueOfStyle } from '../../utilities/math'
import { createView, CreateViewOptions } from '../../utilities/view'
import { Cursor } from '../Cursor/Cursor'
import {
    CodeQueryGroup,
    CodeQueryGroupState,
} from '../Query/CodeQuery/CodeQueryGroup'
import { View } from '../View'
import { PanningArea } from './PanningArea'
import { RootViewSeparator } from './RootViewSeparator'

export class RootView {
    // Rendering
    views: View[] = []
    cursor: Cursor = new Cursor()
    separator: RootViewSeparator = new RootViewSeparator()

    panningArea: PanningArea

    // Queries
    codeQueryContainer: HTMLElement
    codeQueryGroups: CodeQueryGroup[] = []
    // rootTimeline: Timeline

    // Parent animation
    parentView: View = null

    constructor() {
        // this.rootTimeline = new Timeline()
        // this.rootTimeline.transform.position.x = 600
        // this.rootTimeline.transform.position.y = 100
        // document.body.appendChild(this.rootTimeline.element)

        this.codeQueryContainer = document.createElement('div')
        this.codeQueryContainer.classList.add('code-query-container')
        document.body.appendChild(this.codeQueryContainer)

        this.panningArea = new PanningArea()
    }

    tick(dt: number) {
        // Render views
        for (const child of this.views) {
            child.tick(dt)
        }

        // Render cursor
        this.cursor.tick()

        // Render separator
        this.separator.tick(dt)

        // Render code queries
        for (const query of this.codeQueryGroups) {
            query.tick(dt)
        }

        const separatorPosition = getNumericalValueOfStyle(
            this.separator.element.style.left,
            0
        )
        this.codeQueryContainer.style.left = `${
            separatorPosition -
            this.codeQueryContainer.getBoundingClientRect().width / 2
        }px`

        this.panningArea.element.style.left = `${separatorPosition}px`

        // Render timeline
        // this.rootTimeline.tick(dt)
    }

    createView(
        animation: AnimationNode | AnimationGraph,
        options: CreateViewOptions
    ) {
        const view = createView(animation, options)
        this.views.push(view)

        if (options.isRoot) {
            this.parentView = view
            this.panningArea.element.appendChild(view.renderer.element)
            this.panningArea.view = view
            view.state.transform.position.x = 100
            view.state.transform.position.y = 100
        }

        return view
    }

    createCodeQueryGroup(state: CodeQueryGroupState) {
        const queryGroup = new CodeQueryGroup(state)
        this.codeQueryGroups.push(queryGroup)
        return queryGroup
    }

    addView(view: View) {
        this.views.push(view)
    }

    removeView(view: View) {
        const index = this.views.indexOf(view)
        if (index === -1) return
        this.views.splice(index, 1)
    }

    removeQueryGroup(queryGroup: CodeQueryGroup) {
        const index = this.codeQueryGroups.indexOf(queryGroup)
        if (index === -1) return
        this.codeQueryGroups.splice(index, 1)
    }
}
