import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Vars } from "../../Vars";
import * as THREE from "three";
import { Material, VideoTexture } from "three";

export class Loader {

	public static loadBakedImageTexture(url: string): Material {
		const textureLoader = new THREE.TextureLoader();
		const texture = textureLoader.load(url);

		texture.flipY = false;
		// @ts-ignore
		texture.colorSpace = THREE.SRGBColorSpace;

		return new THREE.MeshBasicMaterial({ map: texture });
	}

	public static loadVideoTexture(video: HTMLVideoElement): VideoTexture {
		const texture = new THREE.VideoTexture(video);

		texture.repeat.set(1, 1);
		texture.offset.set(0, 0);
		texture.center.set(0.5, 0.5);
		texture.flipY = false;
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;

		return texture;
	}

	public static loadGLTF(url: string, onLoad: (gltf: GLTF) => void, onProgress?: ((event: ProgressEvent) => void) | undefined, onError?: ((event: ErrorEvent) => void) | undefined): void {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath(Vars.PATH.DRACO);

		const gltfLoader = new GLTFLoader();
		gltfLoader.setDRACOLoader(dracoLoader);

		gltfLoader.load(url, onLoad, onProgress, onError);
	}

}