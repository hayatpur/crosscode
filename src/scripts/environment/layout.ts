import { Editor } from '../editor/Editor'
import { beginConcretePath, ConcretePath, createConcretePath, endConcretePath, seekConcretePath } from '../path/path'
import { getPathFromEnvironmentRepresentation } from '../representation/representation'
import { reflow } from '../utilities/dom'
import { getRelativeLocation, lerp } from '../utilities/math'
import { clone } from '../utilities/objects'
import { getFlattenedChildren } from '../view/view'
import { instanceOfLeafView, LeafViewState, RootViewState } from '../view/ViewState'
import { createConcreteData } from './data/data'
import { ConcreteDataState, DataType, instanceOfConcreteData, PrototypicalDataState, Transform } from './data/DataState'
import {
    createConcreteEnvironment,
    createConcreteIdentifier,
    flattenedConcreteEnvironmentMemory,
    resolvePath,
} from './environment'
import {
    Accessor,
    ConcreteEnvironmentState,
    ConcreteIdentifierState,
    ConcreteScope,
    instanceOfConcreteEnvironment,
    PrototypicalScope,
} from './EnvironmentState'

export function getChildren(
    concrete: any,
    options: { getBindings: boolean } = { getBindings: false }
): null | { transform: Transform }[] {
    if (instanceOfConcreteData(concrete)) {
        if (concrete.prototype.type == DataType.Array) {
            return concrete.value as ConcreteDataState[]
        } else {
            return null
        }
    } else if (instanceOfConcreteEnvironment(concrete) && !options.getBindings) {
        return concrete.memory.filter(
            (item) => item != null && (item.prototype.type == DataType.Array || item.prototype.type == DataType.Literal)
        )
    } else if (instanceOfConcreteEnvironment(concrete) && options.getBindings) {
        let bindings: ConcreteIdentifierState[] = []
        for (let scope of concrete.scope) {
            bindings = [...bindings, ...Object.values(scope)]
        }
        return bindings
    } else if ('children' in concrete) {
        return concrete.children
    } else if (instanceOfLeafView(concrete)) {
        return [concrete._environment]
    }

    return null
}

export function updateRootViewLayout(root: RootViewState) {
    // Propagate environment, now all the concrete entities have the correct prototype
    propagateRoot(root)

    // Get old coordinates
    let oldCoords = document.querySelector('.root-view-container')?.getBoundingClientRect()
    // console.log(oldCoords)

    // Clear current temporary layout
    document.getElementById('temporary-layout').innerHTML = ''

    // Create root view container
    const rootViewContainer = document.createElement('div')
    rootViewContainer.classList.add('root-view-container')
    document.getElementById('temporary-layout').append(rootViewContainer)

    const bbox = Editor.instance.computeBoundingBoxForLoc(root.cursor.location)

    if (bbox.x != 0 && bbox.y != 0) {
        if (oldCoords != null) {
            // const x = lerp(oldCoords.x, bbox.x + bbox.width, 0.1)
            const y = lerp(oldCoords.y, bbox.y, 0.1)

            // rootViewContainer.style.left = `${x}px`
            rootViewContainer.style.top = `${y}px`
        } else {
            // rootViewContainer.style.left = `${bbox.x + bbox.width}px`
            rootViewContainer.style.top = `${bbox.y}px`
        }
    }

    // Update the view's layout
    updateLayout(root, rootViewContainer)
}

/**
 * @param entity object to update the layout of
 * @param pivot current pivot point for rendering
 * @returns updated pivot
 */
export function updateLayout(concrete: { transform: Transform }, parent: HTMLDivElement) {
    // Get initial CSS layout
    const el = document.createElement('div')

    if (instanceOfConcreteData(concrete) && concrete.transform.styles.position == 'absolute') {
        el.classList.add('floating-i')
    }

    // Append to parent
    parent.appendChild(el)

    // Assign appropriate class
    el.classList.add(...concrete.transform.classList)

    // Apply styles
    for (const style of Object.keys(concrete.transform.styles)) {
        el.style[style] = concrete.transform.styles[style]
    }

    // Reflow
    reflow(el)
    reflow(parent)

    const children = getChildren(concrete)

    if (instanceOfConcreteEnvironment(concrete)) {
        // Redirect to an environment container
        const container = document.createElement('div')
        container.classList.add('environment-i-container')
        el.appendChild(container)

        for (const child of children ?? []) {
            updateLayout(child, container)
        }
    } else {
        for (const child of children ?? []) {
            updateLayout(child, el)
        }
    }

    // Reflow
    reflow(el)
    reflow(parent)

    // Update transform
    const bbox = el.getBoundingClientRect()
    concrete.transform.rendered.x = bbox.x
    concrete.transform.rendered.y = bbox.y
    concrete.transform.rendered.width = bbox.width
    concrete.transform.rendered.height = bbox.height

    // Update bindings
    if (instanceOfConcreteEnvironment(concrete)) {
        const bindings = getChildren(concrete, { getBindings: true }) as ConcreteIdentifierState[]
        const flattenedMemory = flattenedConcreteEnvironmentMemory(concrete)
        for (const binding of bindings) {
            const itemPrototype = resolvePath(
                concrete.prototype,
                binding.prototype.location,
                null
            ) as PrototypicalDataState
            const item = flattenedMemory.find((item) => item.prototype.id == itemPrototype.id)

            const location = getRelativeLocation(item.transform.rendered, concrete.transform.rendered)
            binding.transform.styles.top = `${location.y - 25}px`
            binding.transform.styles.left = `${location.x}px`
            updateLayout(binding, el)
        }
    }
}

export function propagateRoot(root: RootViewState) {
    const children = getFlattenedChildren(root).filter((child) => instanceOfLeafView(child)) as LeafViewState[]

    // Assign environment prototype to each concrete view
    for (const child of children) {
        if (!child.isActive) continue

        if (child._environment == null) {
            child._environment = createConcreteEnvironment(root.environment)
        } else {
            child._environment.prototype = clone(root.environment)
        }

        propagateEnvironment(child._environment)
    }
}

// environment has the updated prototype, but it's children don't.
export function propagateEnvironment(environment: ConcreteEnvironmentState) {
    // 1. Synchronize the environment memory with the prototype memory
    propagateEnvironmentMemory(environment)

    // 2. Synchronize the environment scope with the prototype scope
    propagateEnvironmentScopes(environment)

    // 3. Synchronize the environment paths with the prototype paths
    propagateEnvironmentPaths(environment)
}

export function propagateEnvironmentPaths(environment: ConcreteEnvironmentState) {
    // Hit test
    const hits = new Set()

    for (const id of Object.keys(environment.prototype.paths)) {
        const prototype = environment.prototype.paths[id]
        let concrete = environment.paths[id]

        if (concrete == null) {
            // Need to create a path in the concrete environment
            concrete = createConcretePath(prototype)
            environment.paths[id] = concrete
        }

        hits.add(id)

        concrete.prototype = clone(prototype) // Kind of redundant but easier for refactoring
        propagatePath(concrete, environment)
    }

    // Remove paths that are no longer in the view
    for (const id in Object.keys(environment.paths)) {
        if (!hits.has(id)) {
            delete environment.paths[id]
        }
    }
}

export function propagatePath(path: ConcretePath, environment: ConcreteEnvironmentState) {
    Object.assign(path, getPathFromEnvironmentRepresentation(environment.representation, path.prototype))

    // Sync the timings of prototype path and concrete path
    if (!path.meta.isPlaying && path.prototype.meta.isPlaying) {
        beginConcretePath(path, environment)
    }

    if (!path.meta.hasPlayed && path.prototype.meta.hasPlayed) {
        endConcretePath(path, environment)
    }

    if (path.prototype.meta.isPlaying) {
        seekConcretePath(path, environment, path.prototype.meta.t)
    }
}

export function propagateEnvironmentScopes(environment: ConcreteEnvironmentState) {
    while (environment.scope.length < environment.prototype.scope.length) {
        environment.scope.push({})
    }

    while (environment.scope.length > environment.prototype.scope.length) {
        environment.scope.pop()
    }

    for (let i = 0; i < environment.prototype.scope.length; i++) {
        const prototype = environment.prototype.scope[i]
        const scope = environment.scope[i]
        propagateEnvironmentScope(scope, prototype)
    }
}

// Synchronize the environment memory with the prototype memory
export function propagateEnvironmentMemory(environment: ConcreteEnvironmentState) {
    // Hit test
    const hits = new Set()

    // Update data
    for (const prototype of environment.prototype.memory) {
        if (prototype == null) continue

        let item = environment.memory.find((item) => item.prototype.id == prototype.id)

        if (item == null) {
            // Need to create an item in the concrete environment
            item = createConcreteData(prototype)
            environment.memory.push(item)
        }

        hits.add(prototype.id)

        item.prototype = clone(prototype)
        propagateData(item)
    }

    // Remove data that are no longer in the view
    for (let i = environment.memory.length - 1; i >= 0; i--) {
        const item = environment.memory[i]
        if (!hits.has(item.prototype.id)) {
            environment.memory.splice(i, 1)
        }
    }
}

// Synchronize the environment scope with the prototype scope
export function propagateEnvironmentScope(scope: ConcreteScope, prototype: PrototypicalScope) {
    // Hit test
    const hits = new Set()

    for (const prototypeName of Object.keys(prototype)) {
        let item = scope[prototypeName]

        if (item == null) {
            // Need to create an identifier in the concrete environment
            item = createConcreteIdentifier(prototype[prototypeName])
            scope[prototypeName] = item
        }

        item.prototype = clone(prototype[prototypeName])
        hits.add(prototypeName)
    }

    // Remove identifiers that are no longer in the view
    for (const name in Object.keys(scope)) {
        if (!hits.has(name)) {
            delete scope[name]
        }
    }
}

export function propagateData(data: ConcreteDataState) {
    // Synchronize the data value with the prototype value
    if (data.prototype.type == DataType.Array) {
        const prototypeItems = data.prototype.value as PrototypicalDataState[]

        if (data.prototype.value == null) {
            data.value = null
            return
        }

        if (data.value == null) {
            data.value = []
        }

        const items = data.value as ConcreteDataState[]

        while (items.length < prototypeItems.length) {
            items.push(createConcreteData(prototypeItems[items.length]))
        }

        while (items.length > prototypeItems.length) {
            items.pop()
        }

        for (let i = 0; i < prototypeItems.length; i++) {
            const item = items[i]
            item.prototype = clone(prototypeItems[i])
            propagateData(item)
        }
    } else {
        data.value = data.prototype.value as string | number | boolean | Accessor[]
    }
}
