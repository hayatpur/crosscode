export enum DataType {
    Literal = 'Literal',
    Array = 'Array',
    ID = 'ID',
}

export enum AccessorType {
    ID = 'ID',
    Symbol = 'Symbol',
    Index = 'Index',
}

export interface Accessor {
    type: AccessorType
    value: number | string
}

export interface Transform {
    x: number
    y: number
    z: number
    width: number
    height: number
    floating: boolean
    opacity: number
}

export interface DataParams {
    type: DataType
    transform?: Transform // Spatial location, i.e. a => [0], a[0] => [0, 0]
    value?: Data[] | Number | string | boolean
}

export class Data {
    // ID
    id: string
    static id: number = 0

    // Type
    type: DataType

    // Location
    transform: Transform

    // Value
    value: string | boolean | Number | Data[]

    // Binding frame
    frame: number = -1

    // Automatically assigns props as attribute to data
    constructor(props: DataParams) {
        this.type = props.type
        this.transform = props.transform ?? { x: 0, y: 0, z: 0, width: 0, height: 0, floating: false, opacity: 1 }
        this.value = props.value

        if (this.type == DataType.Literal) {
            this.transform.width = 35
            this.transform.height = 35
        }

        // Set ID
        this.id = `#${Data.id}`
        Data.id += 1
    }

    copy() {
        let value = this.value
        if (this.type == DataType.Array) {
            value = (value as Data[]).map((value) => value.copy())
        }
        const copy = new Data({ type: this.type, transform: { ...this.transform }, value: value })
        copy.frame = this.frame
        return copy
    }

    replaceWith(data: Data, mask: { id?: boolean; frame?: boolean } = {}) {
        if (!mask.id) this.id = data.id
        if (!mask.frame) this.frame = data.frame

        this.value = data.value
        this.type = data.type
        this.transform = data.transform
    }

    resolve(accessor: Accessor) {
        if (this.type != DataType.Array) console.error('[Data] Invalid addAt, trying to add to a non-addable type')

        this.value = this.value as Data[]

        if (accessor.type == AccessorType.Index) {
            if (accessor.value >= this.value.length) {
                this.value[accessor.value] = new Data({ type: DataType.Literal })
                this.value[accessor.value].frame = this.frame
            }

            if (accessor.value < 0) {
                return this.value[this.value.length + (accessor.value as number)]
            }

            return this.value[accessor.value]
        } else {
            console.error('[Data] resolve does not accept non-index types.')
        }
    }

    resolvePath(path: Accessor[]) {
        if (path.length == 0) {
            return this
        }

        let resolution = this.resolve(path[0])
        return resolution.resolvePath(path.slice(1))
    }

    addDataAt(path: Accessor[], data: Data) {
        // console.log('Adding data to data at', JSON.parse(JSON.stringify(path)), JSON.parse(JSON.stringify(data)));

        if (this.type != DataType.Array) console.error('[Data] Invalid addAt, trying to add to a non-addable type')

        // No path specified, push it into memory
        if (path.length == 0) {
            ;(this.value as Data[]).push(data)
            return
        }

        const parentPath = path.slice(0, -1)
        const parent = this.resolvePath(parentPath)

        if (parent == this) {
            const index = path[path.length - 1]
            parent.value[index.value] = data
            data.frame = this.frame
            // data.spatialLocation = [this.memory.length - 1];
            // data.memorySpecifier = [
            //     ...this.memorySpecifier,
            //     { type: AccessorType.Index, value: index.value },
            // ];
        } else {
            parent.addDataAt(path.slice(-2, -1), data)
        }
    }
}
