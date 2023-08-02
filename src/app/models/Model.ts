import { Mesh, Scene } from "three";

export abstract class Model {

	protected model!: Mesh;

	public constructor() {
	}

	protected autoSetMeshShadow(mesh: Mesh): void {
		mesh.castShadow = true;
		mesh.receiveShadow = true;
	}

	public getModel(): Mesh {
		return this.model;
	}

	public abstract init(): void;

	public abstract load(scene: Scene): Promise<void>;

}