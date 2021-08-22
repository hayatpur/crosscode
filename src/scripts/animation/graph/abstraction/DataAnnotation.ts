export enum DataAnnotationType {
    Index = 'Index',
    Height = 'Height',
}

export interface DataAnnotationConfig {
    Variable: string;
    Encoding: DataAnnotationType;
}
