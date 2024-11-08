interface GridOptions {
    rows?: number;
    initialColumnWidths?: number[];
    initialRowHeights?: number[];
}
export declare class ResizableGrid {
    private readonly container;
    private readonly options;
    private readonly defaultOptions;
    canvasContainer: HTMLElement;
    onStart?: () => void;
    onEnd?: () => void;
    constructor(root: HTMLElement, canvas: HTMLCanvasElement, options?: GridOptions);
    private createHandle;
    private createCell;
    private createColumn;
    private startColumnResize;
    private startRowResize;
    private handleResize;
    private init;
}
export {};
