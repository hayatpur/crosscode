import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { getNumericalValueOfStyle } from '../../utilities/math'
import { createView, CreateViewOptions } from '../../utilities/view'
import { Cursor } from '../Cursor/Cursor'
import { CodeQuery } from '../Query/CodeQuery/CodeQuery'
import { CodeQueryGroup, CodeQueryGroupState } from '../Query/CodeQuery/CodeQueryGroup'
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
    codeQueries: CodeQuery[] = []
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
        for (const group of this.codeQueryGroups) {
            group.tick(dt)
        }

        for (const query of this.codeQueries) {
            query.tick(dt)
        }

        const separatorPosition = getNumericalValueOfStyle(this.separator.element.style.left, 0)
        this.codeQueryContainer.style.left = `${
            separatorPosition - this.codeQueryContainer.getBoundingClientRect().width / 2
        }px`

        this.panningArea.element.style.left = `${separatorPosition}px`

        // Render timeline
        // this.rootTimeline.tick(dt)
    }

    createView(animation: ExecutionNode | ExecutionGraph, options: CreateViewOptions) {
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

    createCodeQuery(selectedView: View) {
        const query = new CodeQuery(selectedView)
        this.codeQueries.push(query)
        return query
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
