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

  export class PerspectiveCamera {
    fov: number;
    position: Vector3;
    lookAt(target: Vector3): void;
    updateProjectionMatrix(): void;
  }
}
