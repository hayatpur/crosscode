import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { getNumericalValueOfStyle } from '../../utilities/math'
import { createView, CreateViewOptions } from '../../utilities/view'
import { Cursor } from '../Cursor/Cursor'
import { CodeQuery } from '../Query/CodeQuery/CodeQuery'
import {
    CodeQueryGroup,
    CodeQueryGroupState,
    ViewSelection,
} from '../Query/CodeQuery/CodeQueryGroup'
import { View } from '../View'
import { PanningArea } from './PanningArea'
import { RootViewSeparator } from './RootViewSeparator'

export class RootView {
    // Rendering
    views: View[] = []
    viewLookup: { [key: string]: View } = {}
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
    currentDepth = 0
    separatorPosition: number

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

        this.separatorPosition = getNumericalValueOfStyle(this.separator.element.style.left, 0)
        this.codeQueryContainer.style.left = `${
            this.separatorPosition - this.codeQueryContainer.getBoundingClientRect().width / 2
        }px`

        this.panningArea.element.style.left = `${this.separatorPosition}px`
        // this.panningArea.element.style.top = `${0}px`

        // Render timeline
        // this.rootTimeline.tick(dt)
    }

    createView(animation: ExecutionNode | ExecutionGraph, options: CreateViewOptions) {
        const view = createView(animation, options)
        this.views.push(view)

        if (options.isRoot) {
            this.parentView = view
            this.panningArea.addView(view)
            view.state.transform.position.x = 100
            view.state.transform.position.y = 100
        }

        this.viewLookup[view.id] = view
        this.currentDepth = this.parentView?.getDepth()
        return view
    }

    createCodeQueryGroup(state: CodeQueryGroupState) {
        const queryGroup = new CodeQueryGroup(state)
        this.codeQueryGroups.push(queryGroup)
        return queryGroup
    }

    createCodeQuery(selectedView: ViewSelection, isTemporary: boolean = false) {
        const query = new CodeQuery(selectedView, isTemporary)
        this.codeQueries.push(query)
        return query
    }

    removeView(view: View) {
        const index = this.views.indexOf(view)
        if (index === -1) return
        this.views.splice(index, 1)

        // TODO: go through each view and set depth to highest

        delete this.viewLookup[view.id]
    }

    removeQueryGroup(queryGroup: CodeQueryGroup) {
        const index = this.codeQueryGroups.indexOf(queryGroup)
        if (index === -1) return
        this.codeQueryGroups.splice(index, 1)
    }

    removeQuery(query: CodeQuery) {
        const index = this.codeQueries.indexOf(query)
        if (index === -1) return
        this.codeQueries.splice(index, 1)
    }

    destroy() {
        // views: View[] = []
        // viewLookup: { [key: string]: View } = {}
        // cursor: Cursor = new Cursor()
        // separator: RootViewSeparator = new RootViewSeparator()

        // panningArea: PanningArea

        // // Queries
        // codeQueryContainer: HTMLElement
        // codeQueryGroups: CodeQueryGroup[] = []
        // codeQueries: CodeQuery[] = []

        for (const view of this.views) {
            view.destroy()
        }

        this.cursor.destroy()
        this.separator.destroy()

        for (const group of this.codeQueryGroups) {
            group.destroy()
        }

        for (const query of this.codeQueries) {
            query.destroy()
        }

        this.codeQueryContainer.remove()
    }
}
