import { Executor } from '../../executor/Executor'
import { Timeline } from '../Timeline/Timeline'

export enum QueryType {
    CodeQuery = 'CodeQuery',
    DataQuery = 'DataQuery',
    AnimationQuery = 'AnimationQuery',
}

export interface QuerySpecification {
    type: QueryType
    value: any
}

export class Query {
    specification: QuerySpecification
    timeline: Timeline

    prevQuery: Query

    element: HTMLElement

    constructor(specification: QuerySpecification, prevQuery: Query) {
        Executor.instance.view.queries.push(this)

        this.specification = specification
        this.prevQuery = prevQuery

        this.timeline = new Timeline()
    }
}
