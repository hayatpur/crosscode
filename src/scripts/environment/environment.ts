import {
    DataState,
    DataType,
    instanceOfData,
    instanceOfObjectData,
    instanceOfPrimitiveData,
    PrimitiveDataState,
} from '../renderer/View/Environment/data/DataState'
import { ScopeType } from '../transpiler/Statements/BlockStatement'
import { clone } from '../utilities/objects'
import { createPrimitiveData } from './data'
import {
    Accessor,
    AccessorType,
    EnvironmentState,
    IdentifierState,
    instanceOfEnvironment,
    Scope,
} from './EnvironmentState'

let CUR_ENV_ID = 0

export function createEnvironment(): EnvironmentState {
    return {
        _type: 'EnvironmentState',
        scope: [
            {
                bindings: {
                    // Math: {
                    //     name: 'Math',
                    //     location: [{ type: AccessorType.ID, value: 'Math' }],
                    // },
                },

                type: ScopeType.Default,
            },
        ],
        memory: {
            // MathREF: createObjectData(
            //     {
            //         PI: createPrimitiveData(DataType.Literal, Math.PI, 'Math.PI', -1, true),
            //         cos: createPrimitiveData(DataType.Function, Math.cos, 'Math.cos', -1, true),
            //     },
            //     'Math',
            //     -1,
            //     true
            // ),
        },
        residuals: [],
        registers: {},
        id: `Env(${++CUR_ENV_ID})`,
        timestamps: {},
    }
}

export function createIdentifier(name: string, location: Accessor[]): IdentifierState {
    return { name, location }
}

/**
 * Push an empty scope into the environment.
 * @param environment
 */
export function createScope(environment: EnvironmentState, scopeType: ScopeType = ScopeType.Default) {
    environment.scope.push({ bindings: {}, type: scopeType })
}

/**
 * Pop the latest scope of environment.
 * @param environment
 * @returns the latest scope
 */
export function popScope(environment: EnvironmentState): Scope {
    const frame = environment.scope.length

    for (const k of Object.keys(environment.memory)) {
        // TODO: Nested structures
        if (environment.memory[k].frame == frame) {
            delete environment.memory[k]
        }
    }

    if (environment.scope.length == 0) {
        throw new Error('Cannot pop the last scope')
    }

    return environment.scope.pop() as Scope
}

/**
 * Declares a new variable in the most recent scope (TODO: global flag), and updates the layout of the environment.
 * @param environment
 * @param name name of the variable to declare
 * @param location location of where its stored
 * @param shouldBeGlobal whether it should be declared in the global scope (TODO)
 */
export function declareVariable(environment: EnvironmentState, name: string, location: Accessor[]) {
    environment.scope[environment.scope.length - 1].bindings[name] = createIdentifier(name, location)
}

/**
 * Find corresponding location for a variable name.
 * @param environment
 * @param name name of variable
 * @returns location of stored in the variable
 */
export function lookupVariable(environment: EnvironmentState, name: string): Accessor[] | null {
    for (let i = environment.scope.length - 1; i >= 0; i--) {
        const scope = environment.scope[i]

        if (name in scope.bindings) {
            return scope.bindings[name].location
        }

        if (scope.type === ScopeType.Hard) {
            // skip to the global scope
            i = 1
        }
    }

    return null
}

/**
 * @param environment
 * @returns Returns a deep clone of the environment
 */
export function cloneEnvironment(environment: EnvironmentState, assignNewId = false): EnvironmentState {
    return {
        _type: 'EnvironmentState',
        scope: clone(environment.scope),
        memory: clone(environment.memory),
        registers: clone(environment.registers),
        id: assignNewId ? `Env(${++CUR_ENV_ID})` : environment.id,
        residuals: clone(environment.residuals),
        timestamps: clone(environment.timestamps),
    }
}

/**
 * Replaces the current environment with a new one.
 * @param current
 * @param newEnv
 */
export function replaceEnvironmentWith(current: EnvironmentState, newEnv: EnvironmentState) {
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
    environment: EnvironmentState,
    location: Accessor[],
    options?: { noResolvingId?: boolean; noResolvingReference?: boolean }
) {
    const parentPath = location.slice(0, -1)
    const parent = resolvePath(environment, parentPath, null, null, options)

    const index = location[location.length - 1]

    if (instanceOfData(parent) && instanceOfObjectData(parent)) {
        delete (parent.value as { [id: string | number]: DataState })[index.value]
    } else if (instanceOfEnvironment(parent)) {
        delete parent.memory[index.value]
    } else {
        console.error('Unknown parent type', parent)
    }
}

/**
 * Logs the current state of the environment.
 * @param environment
 */
export function logEnvironment(environment: EnvironmentState) {
    console.table(environment.scope)
    console.table(environment.memory)
}

/**
 * Returns flattened array of all data in the environment.
 * @param environment
 * @returns
 */
export function flattenedEnvironmentMemory(environment: EnvironmentState): DataState[] {
    const search = [...Object.values(environment.memory)]
    const flattened: DataState[] = []

    while (search.length > 0) {
        const data = search.shift()
        if (data == null) continue
        flattened.push(data)

        if (instanceOfObjectData(data)) {
            if (Array.isArray(data.value)) {
                search.push(...(data.value as DataState[]))
            } else if (data.constructor == Object) {
                search.push(...Object.values(data.value as DataState[]))
            }
        }
    }

    return flattened
}

export function resolve(
    root: EnvironmentState,
    accessor: Accessor,
    srcId: string,
    parent: DataState | EnvironmentState | null = null,
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = {}
): DataState | EnvironmentState | null {
    // By default, make focus the overall environment if none is specified
    if (parent == null) {
        parent = root
    }

    // If parent is the environment
    if (accessor.type == AccessorType.Register) {
        // Registers are always located in the root
        if (root.registers[accessor.value] == null) {
            root.registers[accessor.value] = createPrimitiveData(DataType.Register, null, srcId)
        }

        const registerData = root.registers[accessor.value] as PrimitiveDataState

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
            console.error('Invalid register type, has to be either ID or Register', registerData.type)
        }
    } else if (accessor.type == AccessorType.ID) {
        const search = [...(instanceOfData(parent) ? (parent.value as DataState[]) : Object.values(parent.memory))]

        while (search.length > 0) {
            const data = search.shift()
            if (data == null) continue

            if (data.id == accessor.value) {
                return resolvePath(
                    root,
                    getMemoryLocation(root, data).foundLocation as Accessor[],
                    srcId,
                    null,
                    options
                )
            } else if (instanceOfObjectData(data)) {
                if (Array.isArray(data.value)) {
                    search.push(...(data.value as DataState[]))
                } else if (data.constructor == Object) {
                    search.push(...Object.values(data.value as DataState[]))
                }
            }
        }

        return null
    } else if (accessor.type == AccessorType.Symbol) {
        // Symbols are located in the root
        const accessors = lookupVariable(root, accessor.value as string)
        return resolvePath(root, accessors as Accessor[], srcId, null, options)
    } else if (accessor.type == AccessorType.Index) {
        if (instanceOfObjectData(parent)) {
            if (Array.isArray(parent.value)) {
                const value = parent.value as DataState[]
                if (parseInt(accessor.value) >= value.length) {
                    value[parseInt(accessor.value)] = createPrimitiveData(DataType.Literal, null, srcId)
                    value[parseInt(accessor.value)].frame = parent.frame
                }
            } else if (parent.constructor == Object) {
                const value = parent.value as { [key: string]: DataState }
                if (value[accessor.value] == null) {
                    value[accessor.value] = createPrimitiveData(DataType.Literal, null, srcId)
                    value[accessor.value].frame = parent.frame
                }
            }
        }

        let data = null

        if (instanceOfData(parent) && instanceOfObjectData(parent)) {
            data = (parent.value as { [key: string | number]: DataState })[accessor.value]
        } else if (instanceOfEnvironment(parent)) {
            data = parent.memory[accessor.value]
        }

        if (data == null) {
            return root
        }

        if (instanceOfPrimitiveData(data) && data.type == DataType.ID) {
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
        } else if (instanceOfPrimitiveData(data) && data.type == DataType.Reference) {
            if (options.noResolvingReference) {
                return data
            } else {
                return resolvePath(root, data.value as Accessor[], srcId, null, options)
            }
        }

        return data
    }

    return null
}

export function resolvePath(
    root: EnvironmentState,
    path: Accessor[],
    srcId: string | null,
    parent: DataState | EnvironmentState | null = null,
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = {}
): DataState | EnvironmentState {
    if (path.length == 0) {
        return parent ?? root
    }

    const resolution = resolve(root, path[0], srcId ?? 'NULL', parent, options)
    const ret = resolvePath(root, path.slice(1), srcId, resolution, options)

    return ret
}

export function resolveFullPath(
    root: EnvironmentState,
    path: Accessor[],
    srcId: string,
    parent: DataState | EnvironmentState | null = null,
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = {}
): (DataState | EnvironmentState)[] {
    if (path.length == 0) {
        return [parent ?? root]
    }

    const resolution = resolve(root, path[0], srcId, parent, options)
    const ret = resolveFullPath(root, path.slice(1), srcId, resolution, options)

    return [parent ?? root, ...ret]
}

export function addDataAt(
    root: EnvironmentState,
    data: DataState,
    path: Accessor[],
    srcId: string,
    origin: DataState | EnvironmentState | null = null
): Accessor[] | null {
    // By default, make focus the overall environment if none is specified
    if (origin == null) {
        origin = root
    }

    if (instanceOfData(origin)) {
        if (!instanceOfObjectData(origin)) throw new Error('[Data] Invalid addAt, trying to add to a non-addable type')

        // No path specified, push it into memory
        if (path.length == 0) {
            if (Array.isArray(origin.value)) {
                origin.value.push(data)
            } else {
                throw new Error('[Data] Invalid addAt with no path')
            }
            return null
        }

        const parentPath = path.slice(0, -1)
        const parent = resolvePath(root, parentPath, srcId, origin)

        if (parent == origin) {
            const index = path[path.length - 1]
            ;(parent.value as { [key: string | number]: DataState })[index.value] = data
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
    root: EnvironmentState,
    data: DataState,
    location: Accessor[] = [],
    parent: DataState | EnvironmentState | null = null
): { found: boolean; foundLocation: Accessor[] | null } {
    let search: { [id: string]: DataState } | { [id: number]: DataState } = {}

    const isArray = parent != null && instanceOfObjectData(parent) && Array.isArray(parent.value) && parent.frame >= 0
    const isObject = parent != null && instanceOfObjectData(parent) && parent.frame >= 0

    if (isArray) {
        // Array
        search = (parent as DataState).value as DataState[]
    } else if (isObject) {
        // Object
        search = (parent as DataState).value as { [key: string]: DataState }
    } else if (parent == null) {
        // Whole memory
        search = root.memory
    }

    search = search as { [id: string]: DataState }

    for (const k of Object.keys(search)) {
        // Check if this item is the data
        const searchItem = isArray
            ? (search as { [id: number]: DataState })[parseInt(k)]
            : (search as { [id: string]: DataState })[k]

        if (searchItem.id == data.id) {
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
            searchItem
        )

        if (found) {
            return { found: true, foundLocation }
        }
    }

    return { found: false, foundLocation: null }
}

// Converts register IDs to memory counter-parts
export function getTrueId(environment: EnvironmentState, id: string): string | null {
    const register = environment.registers[id]
    if (register == null || instanceOfObjectData(register)) return id

    if (register.type == DataType.ID) {
        return getTrueId(environment, register.value as string)
    }

    return null
}

export function cleanUpRegister(environment: EnvironmentState, registerName: string) {
    delete environment.registers[registerName]
}
