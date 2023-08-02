import { Model } from "./Model";
import { Mesh, Scene } from "three";
import { Loader } from "../utils/Loader";
import { Vars } from "../../Vars";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

export class Attic extends Model {

	public init(): void {
	}

	load(scene: Scene): Promise<void> {
		return new Promise((resolve, reject) => {
			Loader.loadGLTF(Vars.PATH.ATTIC.MODEL, (gltf: GLTF) => {
				scene.add(gltf.scene);

				const bakedMaterial = Loader.loadBakedImageTexture(Vars.PATH.ATTIC.TEXTURE);
				gltf.scene.traverse((child) => {
					const mesh: Mesh = child as unknown as Mesh;
					mesh.material = bakedMaterial;

					const name = mesh.name;
					if (name ===  "WindowGlass") {
						mesh.material = new THREE.MeshBasicMaterial({
							opacity: 0.12,
							color: "#818181",
							transparent: true,
							side: THREE.DoubleSide,
							depthWrite: false
						});
					}

					this.autoSetMeshShadow(mesh);
				});

				resolve();
			}, undefined, () => reject());
		});
	}

}