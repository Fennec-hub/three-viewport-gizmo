interface GridOptions {
  rows?: number;
  initialColumnWidths?: number[];
  initialRowHeights?: number[];
}

interface DragState {
  initialX: number;
  initialY: number;
  element: HTMLElement;
  columnIndex?: number;
  rowIndex?: number;
  initialSizes: number[];
}

export class ResizableGrid {
  private readonly container: HTMLElement;
  private readonly options: Required<GridOptions>;
  private readonly defaultOptions: Required<GridOptions> = {
    rows: 3,
    initialColumnWidths: [0.333, 0.334, 0.333],
    initialRowHeights: [0.2, 0.6, 0.2],
  };

  canvasContainer!: HTMLElement;
  onStart?: () => void;
  onEnd?: () => void;

  constructor(
    root: HTMLElement,
    canvas: HTMLCanvasElement,
    options: GridOptions = {}
  ) {
    this.options = { ...this.defaultOptions, ...options };
    this.container = root;
    this.init(canvas);
  }

  private createHandle(isHorizontal: boolean): HTMLElement {
    const handle = document.createElement("div");
    handle.className = isHorizontal ? "resize-handle-x" : "resize-handle-y";
    handle.addEventListener("mousedown", (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isHorizontal) {
        this.startColumnResize(e);
      } else {
        this.startRowResize(e);
      }

      return false;
    });
    return handle;
  }

  private createCell(
    text: string = "",
    needsResizeHandle: boolean = false
  ): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "cell";
    if (text) cell.textContent = text;
    if (needsResizeHandle) {
      cell.appendChild(this.createHandle(false));
    }
    return cell;
  }

  private createColumn(id: string, isMiddle: boolean = false): HTMLElement {
    const column = document.createElement("div");
    column.className = isMiddle ? "column middle-column" : "column";
    column.id = id;
    return column;
  }

  private startColumnResize(e: MouseEvent): void {
    e.preventDefault();
    const handle = e.target as HTMLElement;
    const column = handle.parentElement as HTMLElement;
    const gridContainer = column.parentElement as HTMLElement;
    const columnIndex = Array.from(gridContainer.children).indexOf(column);
    const initialColumnWidths = Array.from(gridContainer.children).map(
      (col) => col.getBoundingClientRect().width
    );

    const dragState: DragState = {
      initialX: e.clientX,
      initialY: e.clientY,
      element: gridContainer,
      columnIndex,
      initialSizes: initialColumnWidths,
    };

    this.handleResize(dragState, true);
  }

  private startRowResize(e: MouseEvent): void {
    e.preventDefault();
    const handle = e.target as HTMLElement;
    const cell = handle.parentElement as HTMLElement;
    const column = cell.parentElement as HTMLElement;
    const rowIndex = Array.from(column.children).indexOf(cell);
    const cells = Array.from(column.children).filter((el) =>
      el.classList.contains("cell")
    );
    const initialRowHeights = cells.map(
      (row) => row.getBoundingClientRect().height
    );

    const dragState: DragState = {
      initialX: e.clientX,
      initialY: e.clientY,
      element: column,
      rowIndex,
      initialSizes: initialRowHeights,
    };

    this.handleResize(dragState, false);
  }

  private handleResize(dragState: DragState, isHorizontal: boolean): void {
    const onMouseMove = (e: MouseEvent): void => {
      const delta = isHorizontal
        ? e.clientX - dragState.initialX
        : e.clientY - dragState.initialY;
      const newSizes = [...dragState.initialSizes];
      const index = isHorizontal ? dragState.columnIndex : dragState.rowIndex;

      if (typeof index === "number" && index < newSizes.length - 1) {
        newSizes[index] += delta;
        newSizes[index + 1] -= delta;

        const totalSize = newSizes.reduce((acc, size) => acc + size, 0);
        const fractions = newSizes.map((size) => {
          const fraction = size / totalSize;
          return Math.max(0.1, Math.min(0.9, fraction));
        });

        // Normalize fractions to sum to 1
        const sum = fractions.reduce((acc, val) => acc + val, 0);
        const normalizedFractions = fractions.map((fr) => fr / sum);

        const property = isHorizontal
          ? "gridTemplateColumns"
          : "gridTemplateRows";
        dragState.element.style[property] = normalizedFractions
          .map((fr) => `${fr.toFixed(3)}fr`)
          .join(" ");
      }
      this.onStart?.();
    };

    const onMouseUp = (): void => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      this.onEnd?.();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  private init(canvas: HTMLCanvasElement): void {
    const gridContainer = document.createElement("div");
    gridContainer.id = "grid";

    // First column
    const firstColumn = this.createColumn("col1");
    firstColumn.appendChild(this.createCell("Column 1"));
    firstColumn.appendChild(this.createHandle(true));
    gridContainer.appendChild(firstColumn);

    // Middle column
    const middleColumn = this.createColumn("col2", true);
    for (let i = 1; i <= this.options.rows; i++) {
      const isLastRow = i === this.options.rows;
      const isCanvasRow = i === 2;
      const row = this.createCell(!isCanvasRow ? `Row ${i}` : "", !isLastRow);
      if (isCanvasRow) {
        this.canvasContainer = row;
        row.id = "canvas_container";
        row.appendChild(canvas);
      }
      middleColumn.appendChild(row);
    }
    middleColumn.appendChild(this.createHandle(true));
    gridContainer.appendChild(middleColumn);

    // Last column
    const lastColumn = this.createColumn("col3");
    lastColumn.appendChild(this.createCell("Column 3"));
    gridContainer.appendChild(lastColumn);

    this.container.appendChild(gridContainer);
  }
}
