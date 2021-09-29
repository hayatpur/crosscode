import { clone } from '../utilities/objects';
import { createData } from './data/data';
import { DataState, DataTransform, DataType, instanceOfData, PositionType } from './data/DataState';
import {
    Accessor,
    AccessorType,
    EnvironmentState,
    instanceOfEnvironment,
    Scope,
} from './EnvironmentState';
import { updateEnvironmentLayout } from './layout';

export function createEnvironment(): EnvironmentState {
    this.id = 0;
    return {
        scope: [
            {
                // _ArrayExpression: [{ type: AccessorType.Index, value: 0 }],
            },
        ],
        memory: [],
        registers: {},
        _temps: {},
        id: `Env(${++this.id})`,
        transform: { x: 0, y: 0, width: 0, height: 0, positionType: PositionType.Absolute },
    };
}

/**
 * Push an empty scope into the environment.
 * @param environment
 */
export function createScope(environment: EnvironmentState) {
    environment.scope.push({});
}

/**
 * Pop the latest scope of environment.
 * @param environment
 * @returns the latest scope
 */
export function popScope(environment: EnvironmentState): Scope {
    const frame = environment.scope.length;
    for (let i = environment.memory.length - 1; i >= 0; i--) {
        if (environment.memory[i] == null) continue;
        // TODO: Nested structures
        if (environment.memory[i].frame == frame) {
            environment.memory[i] = null;
        }
    }
    return environment.scope.pop();
}

/**
 * Declares a new variable in the most recent scope (TODO: global flag), and updates the layout of the environment.
 * @param environment
 * @param name name of the variable to declare
 * @param location location of where its stored
 * @param shouldBeGlobal whether it should be declared in the global scope (TODO)
 */
export function declareVariable(
    environment: EnvironmentState,
    name: string,
    location: Accessor[],
    shouldBeGlobal = false
) {
    environment.scope[environment.scope.length - 1][name] = location;
    updateEnvironmentLayout(environment);
}

/**
 * Re-assign existing variable, and updates the layout of the environment.
 * @param environment
 * @param name name of the variable to reassign
 * @param location location of new storage
 */
export function redeclareVariable(
    environment: EnvironmentState,
    name: string,
    location: Accessor[]
) {
    for (let i = environment.scope.length - 1; i >= 0; i--) {
        let scope = environment.scope[i];

        if (name in scope) {
            scope[name] = location;
            return;
        }
    }
    updateEnvironmentLayout(environment);
}

/**
 * Find corresponding location for a variable name.
 * @param environment
 * @param name name of variable
 * @returns location of stored in the variable
 */
export function lookupVariable(environment: EnvironmentState, name: string): Accessor[] {
    for (let i = environment.scope.length - 1; i >= 0; i--) {
        let scope = environment.scope[i];
        if (name in scope) {
            return scope[name];
        }
    }
}

/**
 * @param environment
 * @returns Returns a deep clone of the environment
 */
export function cloneEnvironment(environment: EnvironmentState): EnvironmentState {
    return {
        scope: clone(environment.scope),
        memory: clone(environment.memory),
        registers: clone(environment.registers),
        _temps: clone(environment._temps),
        id: environment.id,
        transform: clone(environment.transform),
    };
}

/**
 * Replaces the current environment with a new one.
 * @param current
 * @param newEnv
 */
export function replaceEnvironmentWith(current: EnvironmentState, newEnv: EnvironmentState) {
    const clone = cloneEnvironment(newEnv);
    current.scope = clone.scope;
    current.memory = clone.memory;
    current._temps = clone._temps;
    current.registers = clone.registers;
}

/**
 * Removes data at a given location.
 * @param environment
 * @param location
 */
export function removeAt(
    environment: EnvironmentState,
    location: Accessor[],
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = null
) {
    const parentPath = location.slice(0, -1);
    const parent = resolvePath(environment, parentPath, null, null, options);

    const index = location[location.length - 1];

    if (instanceOfData(parent)) {
        parent.value[index.value] = null;
    } else if (instanceOfEnvironment(parent)) {
        parent.memory[index.value] = null;
    } else {
        console.error('Unknown parent type', parent);
    }
}

/**
 * Logs the current state of the environment.
 * @param environment
 */
export function logEnvironment(environment: EnvironmentState) {
    console.table(environment.scope);
    console.table(environment.memory);
}

/**
 * Returns flattened array of all data in the environment.
 * @param environment
 * @returns
 */
export function flattenedEnvironmentMemory(environment: EnvironmentState): DataState[] {
    const search = [...environment.memory];
    const flattened: DataState[] = [];

    while (search.length > 0) {
        const data = search.shift();
        if (data == null) continue;
        flattened.push(data);

        if (data.type == DataType.Array) search.push(...(data.value as DataState[]));
    }

    return flattened;
}

export function resolve(
    root: EnvironmentState,
    accessor: Accessor,
    srcId: string,
    parent: DataState | EnvironmentState | null = null,
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = {}
): DataState | EnvironmentState {
    // By default, make focus the overall environment if none is specified
    if (parent == null) {
        parent = root;
    }

    // If parent is the environment
    if (accessor.type == AccessorType.Register) {
        // Registers are always located in the root
        if (root.registers[accessor.value] == null) {
            root.registers[accessor.value] = createData(DataType.Register, null, srcId);
        }

        const registerData = root.registers[accessor.value];

        if (registerData.type == DataType.ID) {
            return resolvePath(
                root,
                [{ type: AccessorType.ID, value: registerData.value as string }],
                srcId,
                null,
                options
            );
        } else if (registerData.type == DataType.Register) {
            return registerData;
        } else {
            console.error(
                'Invalid register type, has to be either ID or Register',
                registerData.type
            );
        }
    } else if (accessor.type == AccessorType.ID) {
        const search = [
            ...(instanceOfData(parent) ? (parent.value as DataState[]) : parent.memory),
        ];

        while (search.length > 0) {
            const data = search.shift();
            if (data == null) continue;

            if (data.id == accessor.value) {
                return resolvePath(
                    root,
                    getMemoryLocation(root, data).foundLocation,
                    srcId,
                    null,
                    options
                );
            } else if (data.type == DataType.Array) {
                search.push(...(data.value as DataState[]));
            }
        }

        return null;
    } else if (accessor.type == AccessorType.Symbol) {
        // Symbols are located in the root
        const accessors = lookupVariable(root, accessor.value as string);
        return resolvePath(root, accessors, srcId, null, options);
    } else if (accessor.type == AccessorType.Index) {
        if (instanceOfData(parent) && parent.type == DataType.Array) {
            const value = parent.value as DataState[];
            if (accessor.value >= value.length) {
                value[accessor.value] = createData(DataType.Literal, null, srcId);
                value[accessor.value].frame = parent.frame;
            }
        }

        let data = (instanceOfData(parent) ? (parent.value as DataState[]) : parent.memory)[
            accessor.value
        ];

        if (data.type == DataType.ID) {
            if (options.noResolvingId) {
                return data;
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
                );
            }
        } else if (data.type == DataType.Reference) {
            if (options.noResolvingReference) {
                return data;
            } else {
                return resolvePath(root, data.value as Accessor[], srcId, null, options);
            }
        }

        return data;
    }
}

export function resolvePath(
    root: EnvironmentState,
    path: Accessor[],
    srcId: string,
    parent: DataState | EnvironmentState | null = null,
    options: { noResolvingId?: boolean; noResolvingReference?: boolean } = {}
): DataState | EnvironmentState {
    if (path.length == 0) {
        return parent ?? root;
    }

    let resolution = resolve(root, path[0], srcId, parent, options);
    let ret = resolvePath(root, path.slice(1), srcId, resolution, options);

    // if (instanceOfData(ret) && ret.type == DataType.ID && !options.noResolvingId) {
    //     ret = resolve(
    //         root,
    //         {
    //             type: AccessorType.ID,
    //             value: ret.value as string,
    //         },
    //         srcId
    //     ) as DataState;
    // }

    return ret;
}

export function addDataAt(
    root: EnvironmentState,
    data: DataState,
    path: Accessor[],
    srcId: string,
    origin: DataState | EnvironmentState | null = null
): Accessor[] {
    // By default, make focus the overall environment if none is specified
    if (origin == null) {
        origin = root;
    }

    if (instanceOfData(origin)) {
        if (origin.type != DataType.Array)
            console.error('[Data] Invalid addAt, trying to add to a non-addable type');

        // No path specified, push it into memory
        if (path.length == 0) {
            (origin.value as DataState[]).push(data);
            return;
        }

        const parentPath = path.slice(0, -1);
        const parent = resolvePath(root, parentPath, srcId, origin);

        if (parent == origin) {
            const index = path[path.length - 1];
            parent.value[index.value] = data;
            data.frame = origin.frame;
        } else {
            addDataAt(root, data, path.slice(-2, -1), srcId, parent);
        }

        return path;
    } else {
        data.frame = origin.scope.length;

        // No path specified, push it into memory
        if (path.length == 0) {
            origin.memory.push(data);
            updateEnvironmentLayout(origin);
            return [{ value: origin.memory.length - 1, type: AccessorType.Index }];
        }

        const parentPath = path.slice(0, -1);
        const parent = resolvePath(root, parentPath, srcId, origin);

        if (parent == origin) {
            const index = path[path.length - 1];
            origin.memory[index.value] = data;
        } else {
            addDataAt(root, data, path.slice(-1), srcId, parent);
        }

        return path;
    }
}

export function getMemoryLocation(
    root: EnvironmentState,
    data: DataState,
    location: Accessor[] = [],
    parent: DataState | EnvironmentState | null = null
): { found: boolean; foundLocation: Accessor[] } {
    let search: DataState[] = [];

    if (
        parent != null &&
        instanceOfData(parent) &&
        parent.type == DataType.Array &&
        parent.frame >= 0
    ) {
        search = parent.value as DataState[];
    } else if (parent == null) {
        search = root.memory;
    }

    for (let i = 0; i < search.length; i++) {
        if (search[i] == null) continue;

        // Check if this item is the data
        if (search[i].id == data.id) {
            return {
                found: true,
                foundLocation: [...location, { type: AccessorType.Index, value: i }],
            };
        }

        // Check if this item contains data
        const { found, foundLocation } = getMemoryLocation(
            root,
            data,
            [...location, { type: AccessorType.Index, value: i }],
            search[i]
        );

        if (found) {
            return { found: true, foundLocation };
        }
    }

    return { found: false, foundLocation: undefined };
}
