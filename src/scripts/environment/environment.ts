import { ScopeType } from '../transpiler/Statements/BlockStatement'
import { clone } from '../utilities/objects'
import { createData, createTransform } from './data/data'
import { DataType, instanceOfPrototypicalData, PrototypicalDataState } from './data/DataState'
import {
    Accessor,
    AccessorType,
    ConcreteIdentifierState,
    instanceOfPrototypicalEnvironment,
    PrototypicalEnvironmentState,
    PrototypicalIdentifierState,
    PrototypicalScope,
} from './EnvironmentState'

let CUR_ENV_ID = 0

export function createPrototypicalEnvironment(): PrototypicalEnvironmentState {
    return {
        _type: 'PrototypicalEnvironmentState',
        scope: [{ bindings: {}, type: ScopeType.Default }],
        memory: {},
        registers: {},
        paths: {},
        id: `Env(${++CUR_ENV_ID})`,
    }
}

export function createIdentifier(name: string, location: Accessor[]): PrototypicalIdentifierState {
    return { name, location }
}

export function createConcreteIdentifier(
    prototype: PrototypicalIdentifierState = null
): ConcreteIdentifierState {
    return {
        prototype,
        transform: { ...createTransform(), classList: ['identifier-i'] },
    }
}

/**
 * Push an empty scope into the environment.
 * @param environment
 */
export function createScope(
    environment: PrototypicalEnvironmentState,
    scopeType: ScopeType = ScopeType.Default
) {
    environment.scope.push({ bindings: {}, type: scopeType })
}

/**
 * Pop the latest scope of environment.
 * @param environment
 * @returns the latest scope
 */
export function popScope(environment: PrototypicalEnvironmentState): PrototypicalScope {
    const frame = environment.scope.length

    for (const k of Object.keys(environment.memory)) {
        // TODO: Nested structures
        if (environment.memory[k].frame == frame) {
            delete environment.memory[k]
        }
    }

    return environment.scope.pop()
}

/**
 * Declares a new variable in the most recent scope (TODO: global flag), and updates the layout of the environment.
 * @param environment
 * @param name name of the variable to declare
 * @param location location of where its stored
 * @param shouldBeGlobal whether it should be declared in the global scope (TODO)
 */
export function declareVariable(
    environment: PrototypicalEnvironmentState,
    name: string,
    location: Accessor[],
    shouldBeGlobal = false
) {
    environment.scope[environment.scope.length - 1].bindings[name] = createIdentifier(
        name,
        location
    )
    // updateLayout(environment);
}

/**
 * Find corresponding location for a variable name.
 * @param environment
 * @param name name of variable
 * @returns location of stored in the variable
 */
export function lookupVariable(
    environment: PrototypicalEnvironmentState,
    name: string
): Accessor[] {
    for (let i = environment.scope.length - 1; i >= 0; i--) {
        let scope = environment.scope[i]

        if (name in scope.bindings) {
            return scope.bindings[name].location
        }

        if (scope.type === ScopeType.Hard) {
            // skip to the global scope
            i = 1
        }
    }
}

/**
 * @param environment
 * @returns Returns a deep clone of the environment
 */
export function cloneEnvironment(
    environment: PrototypicalEnvironmentState,
    assignNewId: boolean = false
): PrototypicalEnvironmentState {
    return {
        _type: 'PrototypicalEnvironmentState',
        scope: clone(environment.scope),
        memory: clone(environment.memory),
        registers: clone(environment.registers),
        paths: clone(environment.paths),
        id: assignNewId ? `Env(${++CUR_ENV_ID})` : environment.id,
    }
}

/**
 * Replaces the current environment with a new one.
 * @param current
 * @param newEnv
 */
export function replaceEnvironmentWith(
    current: PrototypicalEnvironmentState,
    newEnv: PrototypicalEnvironmentState
) {
    const clone = cloneEnvironment(newEnv)
    current.scope = clone.scope
    current.memory = clone.memory
    current.registers = clone.registers
}

/**
 * Removes data at a given location.
 * @param environment
 * @param location
 */
export function removeAt(
    environment: PrototypicalEnvironmentState,
    location: Accessor[],
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = null
) {
    const parentPath = location.slice(0, -1)
    const parent = resolvePath(environment, parentPath, null, null, options)

    const index = location[location.length - 1]

    if (instanceOfPrototypicalData(parent)) {
        delete parent.value[index.value]
    } else if (instanceOfPrototypicalEnvironment(parent)) {
        delete parent.memory[index.value]
    } else {
        console.error('Unknown parent type', parent)
    }
}

/**
 * Logs the current state of the environment.
 * @param environment
 */
export function logEnvironment(environment: PrototypicalEnvironmentState) {
    console.table(environment.scope)
    console.table(environment.memory)
}

/**
 * Returns flattened array of all data in the environment.
 * @param environment
 * @returns
 */
export function flattenedEnvironmentMemory(
    environment: PrototypicalEnvironmentState
): PrototypicalDataState[] {
    const search = [...Object.values(environment.memory)]
    const flattened: PrototypicalDataState[] = []

    while (search.length > 0) {
        const data = search.shift()
        if (data == null) continue
        flattened.push(data)

        if (data.type == DataType.Array) {
            search.push(...(data.value as PrototypicalDataState[]))
        }
    }

    return flattened
}

export function resolve(
    root: PrototypicalEnvironmentState,
    accessor: Accessor,
    srcId: string,
    parent: PrototypicalDataState | PrototypicalEnvironmentState | null = null,
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = {}
): PrototypicalDataState | PrototypicalEnvironmentState {
    // By default, make focus the overall environment if none is specified
    if (parent == null) {
        parent = root
    }

    // If parent is the environment
    if (accessor.type == AccessorType.Register) {
        // Registers are always located in the root
        if (root.registers[accessor.value] == null) {
            root.registers[accessor.value] = createData(DataType.Register, null, srcId)
        }

        const registerData = root.registers[accessor.value]

        if (registerData.type == DataType.ID) {
            return resolvePath(
                root,
                [
                    {
                        type: AccessorType.ID,
                        value: registerData.value as string,
                    },
                ],
                srcId,
                null,
                options
            )
        } else if (registerData.type == DataType.Register) {
            return registerData
        } else {
            console.error(
                'Invalid register type, has to be either ID or Register',
                registerData.type
            )
        }
    } else if (accessor.type == AccessorType.ID) {
        const search = [
            ...(instanceOfPrototypicalData(parent)
                ? (parent.value as PrototypicalDataState[])
                : Object.values(parent.memory)),
        ]

        while (search.length > 0) {
            const data = search.shift()
            if (data == null) continue

            if (data.id == accessor.value) {
                return resolvePath(
                    root,
                    getMemoryLocation(root, data).foundLocation,
                    srcId,
                    null,
                    options
                )
            } else if (data.type == DataType.Array) {
                search.push(...(data.value as PrototypicalDataState[]))
            }
        }

        return null
    } else if (accessor.type == AccessorType.Symbol) {
        // Symbols are located in the root
        const accessors = lookupVariable(root, accessor.value as string)
        return resolvePath(root, accessors, srcId, null, options)
    } else if (accessor.type == AccessorType.Index) {
        if (instanceOfPrototypicalData(parent) && parent.type == DataType.Array) {
            const value = parent.value as PrototypicalDataState[]
            if (parseInt(accessor.value) >= value.length) {
                value[accessor.value] = createData(DataType.Literal, null, srcId)
                value[accessor.value].frame = parent.frame
            }
        }

        let data = (
            instanceOfPrototypicalData(parent)
                ? (parent.value as PrototypicalDataState[])
                : parent.memory
        )[accessor.value]

        if (data.type == DataType.ID) {
            if (options.noResolvingId) {
                return data
            } else {
                return resolve(
                    root,
                    {
                        type: AccessorType.ID,
                        value: data.value as string,
                    },
                    srcId,
                    null,
                    options
                )
            }
        } else if (data.type == DataType.Reference) {
            if (options.noResolvingReference) {
                return data
            } else {
                return resolvePath(root, data.value as Accessor[], srcId, null, options)
            }
        }

        return data
    }
}

export function resolvePath(
    root: PrototypicalEnvironmentState,
    path: Accessor[],
    srcId: string,
    parent: PrototypicalDataState | PrototypicalEnvironmentState | null = null,
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = {}
): PrototypicalDataState | PrototypicalEnvironmentState {
    if (path.length == 0) {
        return parent ?? root
    }

    let resolution = resolve(root, path[0], srcId, parent, options)
    let ret = resolvePath(root, path.slice(1), srcId, resolution, options)

    return ret
}

export function addDataAt(
    root: PrototypicalEnvironmentState,
    data: PrototypicalDataState,
    path: Accessor[],
    srcId: string,
    origin: PrototypicalDataState | PrototypicalEnvironmentState | null = null
): Accessor[] {
    // By default, make focus the overall environment if none is specified
    if (origin == null) {
        origin = root
    }

    if (instanceOfPrototypicalData(origin)) {
        if (origin.type != DataType.Array)
            console.error('[Data] Invalid addAt, trying to add to a non-addable type')

        // No path specified, push it into memory
        if (path.length == 0) {
            ;(origin.value as PrototypicalDataState[]).push(data)
            return
        }

        const parentPath = path.slice(0, -1)
        const parent = resolvePath(root, parentPath, srcId, origin)

        if (parent == origin) {
            const index = path[path.length - 1]
            parent.value[index.value] = data
            data.frame = origin.frame
        } else {
            addDataAt(root, data, path.slice(-2, -1), srcId, parent)
        }

        return path
    } else {
        data.frame = origin.scope.length

        // No path specified, push it into memory
        if (path.length == 0) {
            origin.memory[data.id] = data
            return [{ value: data.id, type: AccessorType.Index }]
        }

        const parentPath = path.slice(0, -1)
        const parent = resolvePath(root, parentPath, srcId, origin)

        if (parent == origin) {
            const index = path[path.length - 1]
            origin.memory[index.value] = data
        } else {
            addDataAt(root, data, path.slice(-1), srcId, parent)
        }

        return path
    }
}

export function getMemoryLocation(
    root: PrototypicalEnvironmentState,
    data: PrototypicalDataState,
    location: Accessor[] = [],
    parent: PrototypicalDataState | PrototypicalEnvironmentState | null = null
): { found: boolean; foundLocation: Accessor[] } {
    let search: { [id: string]: PrototypicalDataState } | { [id: number]: PrototypicalDataState } =
        {}
    let isArray =
        parent != null &&
        instanceOfPrototypicalData(parent) &&
        parent.type == DataType.Array &&
        parent.frame >= 0

    if (isArray) {
        // Array
        search = (parent as PrototypicalDataState).value as PrototypicalDataState[]
    } else if (parent == null) {
        // Whole memory
        search = root.memory
    }

    for (const k of Object.keys(search)) {
        // Check if this item is the data
        if (search[k].id == data.id) {
            const acc = { type: AccessorType.Index, value: k }

            return {
                found: true,
                foundLocation: [...location, acc],
            }
        }

        // Check if this item contains data
        const { found, foundLocation } = getMemoryLocation(
            root,
            data,
            [...location, { type: AccessorType.Index, value: k }],
            search[k]
        )

        if (found) {
            return { found: true, foundLocation }
        }
    }

    return { found: false, foundLocation: undefined }
}

// Converts register IDs to memory counter-parts
export function getTrueId(environment: PrototypicalEnvironmentState, id: string) {
    const register = environment.registers[id]
    if (register == null) return id

    if (register.type == DataType.ID) {
        return getTrueId(environment, register.value as string)
    }
}

export function cleanUpRegister(environment: PrototypicalEnvironmentState, registerName: string) {
    delete environment.registers[registerName]
}

// export function getEmptyPosition(environment: PrototypicalEnvironmentState, id: string) {
//     // Then it doesn't have a place yet
//     // Find an empty space and put it there
//     const placeholder = createData(DataType.Literal, '', `${id}_Placeholder`)

//     const placeholderLocation = addDataAt(view, placeholder, [], `${id}_Placeholder`)
//

//     const transform = getRelativeLocation(
//         placeholder.transform.rendered,
//         environment.transform.rendered
//     ) as DataMovementLocation

//     removeAt(environment, placeholderLocation)

//     return
// }
