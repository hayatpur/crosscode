export enum LayoutType {
    Tree = 'Tree',
    Table = 'Table',
    Grid = 'Grid',
    List = 'List',
}

export interface LayoutConfig {
    Type: LayoutType;
}
