// Type declarations for three.js
declare module 'three' {
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
  }

  export class Box3 {
    constructor();
    setFromObject(object: Object3D): this;
    getSize(target: Vector3): Vector3;
    getCenter(target: Vector3): Vector3;
  }

  export class Object3D {
    clone(): this;
  }

  export class Mesh extends Object3D {
    geometry: any;
    material: any;
  }

  export class PerspectiveCamera {
    fov: number;
    position: Vector3;
    lookAt(target: Vector3): void;
    updateProjectionMatrix(): void;
  }
}

// React Three Fiber JSX intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        intensity?: number;
      };
      directionalLight: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        position?: [number, number, number];
        intensity?: number;
        castShadow?: boolean;
      };
      primitive: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        object?: unknown;
      };
      mesh: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.Ref<any>;
        scale?: number | [number, number, number];
      };
      sphereGeometry: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        args?: [number, number, number];
      };
      meshStandardMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        color?: string;
        flatShading?: boolean;
        roughness?: number;
        metalness?: number;
      };
    }
  }
}
