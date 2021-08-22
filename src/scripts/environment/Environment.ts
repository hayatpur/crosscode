import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import { Accessor, AccessorType, Data, DataType } from './Data';

export class Environment {
    bindingFrames: { [name: string]: Accessor[] }[];
    memory: (Data | null)[];
    registers: { [name: string]: Data };
    _temps: any = {};

    // Registers
    // registerA: (Data | null)[] = []

    validIds: Set<string> = new Set();

    constructor() {
        this.bindingFrames = [
            {
                _ArrayExpression: [{ type: AccessorType.Index, value: 0 }],
                _LatestExpression: [{ type: AccessorType.Index, value: 1 }],
                _LatestDeclaration: [{ type: AccessorType.Index, value: 2 }],
            },
        ];

        this.memory = [
            new Data({ type: DataType.ID }),
            new Data({ type: DataType.ID }),
            new Data({ type: DataType.ID }),
        ];

        this.registers = {};

        // this.registerA = []
    }

    createScope() {
        this.bindingFrames.push({});
    }

    popScope() {
        const frame = this.bindingFrames.length;
        for (let i = this.memory.length - 1; i >= 0; i--) {
            if (this.memory[i] == null) continue;
            // TODO: Nested structures
            if (this.memory[i].frame == frame) {
                this.memory[i] = null;
            }
        }
        return this.bindingFrames.pop();
    }

    /**
     * Bind new variable
     */
    declare(name: string, location: Accessor[]) {
        this.bindingFrames[this.bindingFrames.length - 1][name] = location;
        this.updateLayout();
    }

    /**
     * Re-assign existing variable
     */
    redeclare(name: string, location: Accessor[]) {
        for (let i = this.bindingFrames.length - 1; i >= 0; i--) {
            let scope = this.bindingFrames[i];

            if (name in scope) {
                scope[name] = location;
                return;
            }
        }
        this.updateLayout();
    }

    /**
     * Lookup existing variable
     */
    lookup(name: string) {
        for (let i = this.bindingFrames.length - 1; i >= 0; i--) {
            let scope = this.bindingFrames[i];
            if (name in scope) {
                return scope[name];
            }
        }
    }

    copy() {
        const copy = new Environment();
        copy.bindingFrames = JSON.parse(JSON.stringify(this.bindingFrames));
        copy.memory = this.memory.map((data) => (data != null ? data.copy() : null));
        copy._temps = JSON.parse(JSON.stringify(this._temps));
        copy.validIds = new Set(this.validIds);

        return copy;
    }

    removeAt(location: Accessor[]) {
        const parentPath = location.slice(0, -1);
        const parent = this.resolvePath(parentPath);

        const index = location[location.length - 1];

        if (parent instanceof Data) {
            parent.value[index.value] = null;
        } else {
            parent.memory[index.value] = null;
        }
    }

    isValid(animation: AnimationGraph | AnimationNode): boolean {
        // console.log(
        //     `If this [${animation.id}] node:`,
        //     this.validIds,
        //     ` is valid for this [${animation.id}] animation:`,
        //     animation.parentIds
        // );
        return [...this.validIds].filter((x) => animation.parentIds.has(x)).length > 0;
    }

    log() {
        console.table(this.bindingFrames);
        console.table(this.memory);
    }

    flattenedMemory(): Data[] {
        const search = [...this.memory];
        const flattened: Data[] = [];

        while (search.length > 0) {
            const data = search.shift();
            if (data == null) continue;
            flattened.push(data);

            if (data.type == DataType.Array) search.push(...(data.value as Data[]));
        }

        return flattened;
    }

    updateLayout(
        position: { x: number; y: number } = { x: 0, y: 20 },
        parent?: Data,
        options?: { isArrayElement: boolean }
    ): { x: number; y: number } {
        let search: Data[] = [];

        if (parent != null && parent.type == DataType.Array && parent.frame >= 0) {
            search = parent.value as Data[];
        }

        if (parent == null) {
            search = this.memory;
        }

        for (let i = 0; i < search.length; i++) {
            if (search[i] == null) continue;
            if (search[i].transform.floating) continue;

            search[i].transform.x = position.x;
            search[i].transform.y = position.y;

            // for (const [name, path] of Object.entries(this.bindings)) {
            //     if (name.startsWith('_')) continue;
            //     const data = this.resolvePath(path) as Data;
            //     if (data.id == search[i].id && search[i].transform.y == 0) {
            //         search[i].transform.y = 20;
            //     }
            // }

            if (search[i].type == DataType.Array && search[i].frame >= 0) {
                position.x = this.updateLayout({ x: search[i].transform.x, y: search[i].transform.y }, search[i], {
                    isArrayElement: true,
                }).x;
                position.x += 30;
            } else if (search[i].type == DataType.Literal) {
                position.x += search[i].transform.width + (options?.isArrayElement ? 0 : 30);
            }
        }

        return position;
    }

    resolve(accessor: Accessor, _options: { noResolvingId?: boolean } = {}): Data | Environment {
        // If parent is the environment
        if (accessor.type == AccessorType.Register) {
            if (this.registers[accessor.value] == null) {
                this.registers[accessor.value] = new Data({ type: DataType.Register });
            }

            const registerData = this.registers[accessor.value];

            if (registerData.type == DataType.ID) {
                return this.resolvePath([{ type: AccessorType.ID, value: registerData.value as string }]);
            } else if (registerData.type == DataType.Register) {
                return registerData;
            } else {
                console.error('Invalid register type, has to be either ID or Register', registerData.type);
            }
        } else if (accessor.type == AccessorType.ID) {
            const search = [...this.memory];

            while (search.length > 0) {
                const data = search.shift();
                if (data == null) continue;

                if (data.id == accessor.value) {
                    return this.resolvePath(this.getMemoryLocation(data).foundLocation);
                } else if (data.type == DataType.Array) {
                    search.push(...(data.value as Data[]));
                }
            }

            console.trace('Did not find ID', accessor.value);

            this.log();

            return null;
        } else if (accessor.type == AccessorType.Symbol) {
            const accessors = this.lookup(accessor.value as string);

            return this.resolvePath(accessors, _options);
        } else if (accessor.type == AccessorType.Index) {
            let data: Data;

            if (accessor.value < 0) {
                data = this.memory[this.memory.length + (accessor.value as number)];
            } else {
                data = this.memory[accessor.value];
            }

            if (data.type == DataType.ID) {
                if (_options.noResolvingId) {
                    return data;
                } else {
                    // console.log('Resolving id', data.value)
                    return this.resolve({ type: AccessorType.ID, value: data.value as string });
                }
            }

            return data;
        }
    }

    resolvePath(path: Accessor[], _options: { noResolvingId?: boolean } = {}): Data | Environment {
        if (path.length == 0) {
            return this;
        }

        let resolution = this.resolve(path[0], _options);
        let ret = resolution.resolvePath(path.slice(1));

        if (ret.type == DataType.ID && !_options.noResolvingId) {
            ret = this.resolve({ type: AccessorType.ID, value: ret.value as string }) as Data;
        }

        return ret;
    }

    addDataAt(path: Accessor[], data: Data): Accessor[] {
        // console.log('Adding data at', JSON.parse(JSON.stringify(path)), JSON.parse(JSON.stringify(data)));

        data.frame = this.bindingFrames.length;

        // No path specified, push it into memory
        if (path.length == 0) {
            this.memory.push(data);
            this.updateLayout();
            // data.spatialLocation = [this.memory.length - 1];
            // data.memorySpecifier = [{ type: AccessorType.Index, value: this.memory.length - 1 }];
            return [{ value: this.memory.length - 1, type: AccessorType.Index }];
        }

        const parentPath = path.slice(0, -1);
        const parent = this.resolvePath(parentPath);

        if (parent == this) {
            const index = path[path.length - 1];
            this.memory[index.value] = data;
            // data.spatialLocation = [this.memory.length - 1];
            // data.memorySpecifier = [{ type: AccessorType.Index, value: index.value }];
        } else {
            parent.addDataAt(path.slice(-1), data);
        }

        this.updateLayout();

        return path;
    }

    getMemoryLocation(
        data: Data,
        location: Accessor[] = [],
        parent?: Data
    ): { found: boolean; foundLocation: Accessor[] } {
        let search: Data[] = [];

        if (parent != null && parent.type == DataType.Array && parent.frame >= 0) {
            search = parent.value as Data[];
        }

        if (parent == null) {
            search = this.memory;
        }

        for (let i = 0; i < search.length; i++) {
            if (search[i] == null) continue;

            // Check if this item is the data
            if (search[i].id == data.id) {
                return { found: true, foundLocation: [...location, { type: AccessorType.Index, value: i }] };
            }

            // Check if this item contains data
            const { found, foundLocation } = this.getMemoryLocation(
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
}
