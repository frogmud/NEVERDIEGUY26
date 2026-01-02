declare module 'zdog' {
  interface Vector {
    x: number;
    y: number;
    z: number;
  }

  interface AnchorOptions {
    addTo?: Anchor;
    translate?: Partial<Vector>;
    rotate?: Partial<Vector>;
    scale?: number | Partial<Vector>;
  }

  interface ShapeOptions extends AnchorOptions {
    path?: Array<Partial<Vector> | { arc: Partial<Vector>[] }>;
    color?: string;
    stroke?: number | boolean;
    fill?: boolean;
    closed?: boolean;
    visible?: boolean;
    backface?: string | boolean;
    front?: Partial<Vector>;
  }

  interface RectOptions extends AnchorOptions {
    width?: number;
    height?: number;
    color?: string;
    stroke?: number | boolean;
    fill?: boolean;
    backface?: string | boolean;
  }

  interface IllustrationOptions {
    element?: HTMLCanvasElement | SVGSVGElement | string;
    centered?: boolean;
    zoom?: number;
    dragRotate?: boolean | Anchor;
    resize?: boolean;
    onDragStart?: () => void;
    onDragMove?: () => void;
    onDragEnd?: () => void;
    onResize?: (width: number, height: number) => void;
  }

  class Anchor {
    constructor(options?: AnchorOptions);
    addTo?: Anchor;
    translate: Vector;
    rotate: Vector;
    scale: Vector;
    children: Anchor[];
    addChild(child: Anchor): void;
    remove(): void;
    copy(options?: AnchorOptions): Anchor;
    copyGraph(options?: AnchorOptions): Anchor;
    updateGraph(): void;
    renderGraphCanvas(ctx: CanvasRenderingContext2D): void;
    renderGraphSvg(svg: SVGSVGElement): void;
  }

  class Shape extends Anchor {
    constructor(options?: ShapeOptions);
    path: Array<Partial<Vector>>;
    color: string;
    stroke: number | boolean;
    fill: boolean;
    closed: boolean;
    visible: boolean;
    backface: string | boolean;
    front: Vector;
  }

  class Rect extends Shape {
    constructor(options?: RectOptions);
    width: number;
    height: number;
  }

  class Illustration extends Anchor {
    constructor(options?: IllustrationOptions);
    element: HTMLCanvasElement | SVGSVGElement;
    centered: boolean;
    zoom: number;
    dragRotate: boolean | Anchor;
    resize: boolean;
    updateRenderGraph(): void;
    setSize(width: number, height: number): void;
  }

  const TAU: number;

  export { Anchor, Shape, Rect, Illustration, TAU, Vector, AnchorOptions, ShapeOptions, RectOptions, IllustrationOptions };
  export default { Anchor, Shape, Rect, Illustration, TAU };
}
