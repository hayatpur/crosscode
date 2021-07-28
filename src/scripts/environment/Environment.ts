import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationNode } from '../animation/primitive/AnimationNode';
import { Accessor, AccessorType, Data, DataType } from './Data';

export class Environment {
    bindings: { [name: string]: Accessor[] };
    memory: Data[];
    _temps: any = {};
    validLines: { max: number; min: number };

    constructor() {
        this.bindings = {
            _ArrayExpression: [{ type: AccessorType.Index, value: 0 }],
            _LatestExpression: [{ type: AccessorType.Index, value: 1 }],
        };

        this.memory = [new Data({ type: DataType.ID }), new Data({ type: DataType.ID })];
    }

    copy() {
        const copy = new Environment();
        copy.bindings = JSON.parse(JSON.stringify(this.bindings));
        copy.memory = this.memory.map((data) => (data ? data.copy() : null));
        copy._temps = JSON.parse(JSON.stringify(this._temps));
        copy.validLines = JSON.parse(JSON.stringify(this.validLines));

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
        // return false;
        if (this.validLines == null) {
            return true;
        }

        if (animation instanceof AnimationGraph && animation.node != null) {
            const line = animation.node.meta.line;
            return line >= this.validLines.min && line <= this.validLines.max;
        } else if (animation instanceof AnimationNode && animation.statement != null) {
            const line = animation.statement.meta.line;
            return line >= this.validLines.min && line <= this.validLines.max;
        }
        // return true;

        return true;
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

        if (parent != null && parent.type == DataType.Array) {
            search = parent.value as Data[];
        }

        if (parent == null) {
            search = this.memory;
        }

        for (let i = 0; i < search.length; i++) {
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

            if (search[i].type == DataType.Array) {
                position.x = this.updateLayout({ x: search[i].transform.x, y: search[i].transform.y }, search[i], {
                    isArrayElement: true,
                }).x;
                position.x += 30;
            } else if (search[i].type == DataType.Number) {
                position.x += search[i].transform.width + (options?.isArrayElement ? 0 : 30);
            }
        }

        return position;
    }

    resolve(accessor: Accessor, _options: { noResolvingId?: boolean } = {}): Data | Environment {
        // console.log('resolve', accessor);

        // If parent is the environment
        if (accessor.type == AccessorType.ID) {
            const search = [...this.memory];

            while (search.length > 0) {
                const data = search.shift();

                if (data.id == accessor.value) {
                    return data;
                } else if (data.type == DataType.Array) {
                    search.push(...(data.value as Data[]));
                }
            }

            return null;
        } else if (accessor.type == AccessorType.Symbol) {
            const accessors = this.bindings[accessor.value];
            return this.resolvePath(accessors, _options);
        } else if (accessor.type == AccessorType.Index) {
            let data: Data = this.memory[accessor.value];

            if (data.type == DataType.ID) {
                if (_options.noResolvingId) {
                    return data;
                } else {
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

        // console.log('resolvePath', path);

        let resolution = this.resolve(path[0], _options);

        if (resolution == null) {
            return null;
        }

        return resolution.resolvePath(path.slice(1));
    }

    addDataAt(path: Accessor[], data: Data): Accessor[] {
        console.log('Adding data at', JSON.parse(JSON.stringify(path)), JSON.parse(JSON.stringify(data)));

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

    bindVariable(identifier: string, specifier: Accessor[]) {
        this.bindings[identifier] = specifier;
        this.updateLayout();
    }

    getMemoryLocation(
        data: Data,
        location: Accessor[] = [],
        parent?: Data
    ): { found: boolean; foundLocation: Accessor[] } {
        let search: Data[] = [];

        if (parent != null && parent.type == DataType.Array) {
            search = parent.value as Data[];
        }

        if (parent == null) {
            search = this.memory;
        }

        for (let i = 0; i < search.length; i++) {
            // Check if this item is the data
            if (search[i].id == data.id) {
                return { found: true, foundLocation: [...location, { type: AccessorType.Index, value: i }] };
            }

            // Check if this item contains data
            const { found, foundLocation } = this.getMemoryLocation(data, location, search[i]);

            if (found) {
                return { found: true, foundLocation };
            }
        }

        return { found: false, foundLocation: undefined };
    }
}
