import { Model } from "./Model";
import { AnimationClip, AnimationMixer, Clock, Mesh, PerspectiveCamera, Scene } from "three";
import { Loader } from "../utils/Loader";
import { Vars } from "../../Vars";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { Experience, Sizes } from "../Experience";
import TWEEN from "@tweenjs/tween.js";

export class GameBox extends Model {

	private clips: AnimationClip[] = [];
	private animationMixer!: AnimationMixer;

	private box!: Mesh;

	private infoPoint!: Mesh;
	private infoButton!: HTMLElement;

	private viewPoint!: Mesh;

	private frustum = new THREE.Frustum();

	public init(): void {
	}

	public load(scene: Scene): Promise<void> {
		return new Promise((resolve, reject) => {
			Loader.loadGLTF(Vars.PATH.GAME_BOX.MODEL, (gltf: GLTF) => {
				scene.add(gltf.scene);

				this.clips = gltf.animations;

				const bakedMaterial = Loader.loadBakedImageTexture(Vars.PATH.GAME_BOX.TEXTURE);
				const bakedContentMaterial = Loader.loadBakedImageTexture(Vars.PATH.GAME_BOX.CONTENT_TEXTURE);

				gltf.scene.traverse((child) => {
					const mesh: Mesh = child as unknown as Mesh;
					const name = mesh.name;

					if (name.startsWith("front") || name.startsWith("back") || name.startsWith("left") || name.startsWith("right")) {
						this.box = mesh;
						mesh.material = bakedMaterial;
					} else if (name === "LightbulbGlass") {
						mesh.material = new THREE.MeshBasicMaterial({
							opacity: 0.16,
							color: "#2c2b2b",
							transparent: true,
							side: THREE.DoubleSide,
							depthWrite: false
						});
					} else if (name === "InfoPoint") {
						this.infoPoint = mesh;
						this.buildInfoButton();
					} else if (name === "ViewPoint") {
						this.viewPoint = mesh;
					} else {
						mesh.material = bakedContentMaterial;
					}

					this.autoSetMeshShadow(mesh);
				});

				resolve();
			}, undefined, () => reject());
		});
	}

	private buildInfoButton(): void {
		this.infoButton = document.createElement("span");
		this.infoButton.classList.add("point-wrapper");
		this.infoButton.classList.add("pulse");

		const button = document.createElement("img");
		button.src = "images/info.svg";
		button.classList.add("point");
		button.classList.add("info-point");

		this.infoButton.appendChild(button);

		this.infoButton.addEventListener("click", () => {
			document.body.removeChild(this.infoButton);
			Experience.get().getCameraManager().moveToGameBox(this.viewPoint, this.infoPoint, () => this.openTheBox());
		});

		document.body.appendChild(this.infoButton);
	}

	public update(clock: Clock, camera: PerspectiveCamera, sizes: Sizes): void {
		this.animationMixer?.update(clock.getDelta());
		this.updateInfoButtonPosition(camera, sizes);
	}

	private updateInfoButtonPosition(camera: PerspectiveCamera, sizes: Sizes): void {
		if (!this.infoPoint || !this.infoButton) {
			return;
		}

		const offset = new THREE.Vector3(0.025, 0.015, 0);
		const position = new THREE.Vector3(
			this.infoPoint.position.x + offset.x,
			this.infoPoint.position.y + offset.y,
			this.infoPoint.position.z + offset.z
		);

		const screenPosition = position.clone();
		screenPosition.project(camera);

		const translateX = screenPosition.x * sizes.w * 0.5;
		const translateY = -screenPosition.y * sizes.h * 0.5;

		this.infoButton.style.transform = `translateX(${ translateX }px) translateY(${ translateY }px)`;
		this.frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
		this.infoButton.style.display = (this.frustum.containsPoint(position) && position.distanceTo(camera.position) > 0) ? "block" : "none";
	}

	private openTheBox(): void {
		this.animationMixer = new THREE.AnimationMixer(this.box);

		const openingClip = THREE.AnimationClip.findByName(this.clips, "Opening");
		const openedClip = THREE.AnimationClip.findByName(this.clips, "Opened");

		const openingAction = this.animationMixer.clipAction(openingClip);
		openingAction.loop = THREE.LoopOnce;
		openingAction.clampWhenFinished = true;

		const openedAction = this.animationMixer.clipAction(openedClip);
		openedAction.loop = THREE.LoopOnce;
		openedAction.clampWhenFinished = true;

		openingAction.reset();
		openingAction.play();

		this.animationMixer.addEventListener("finished", () => {
			Experience.get().getModelManager().getGameBoyModel().subscribeToEventListeners();
		});
	}

}