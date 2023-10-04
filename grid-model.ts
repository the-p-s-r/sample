export type TGeneric = {
    [key: string]: any;
};

export interface IGridColumn {
    dbColumn: string;
    label?: string;
    sortable?: boolean;
    clickable?: boolean;
    renderer? (value: any, index?: number, entity?: TGeneric): JSX.Element
};

export interface IGridAction {
    menu: string;
    onClick? (entity: TGeneric, index: number): void;
};
