import { Model } from "./Model";
import { Loader } from "../utils/Loader";
import { Vars } from "../../Vars";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Material, Mesh, Scene, VideoTexture } from "three";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { Experience } from "../Experience";

export class GameBoy extends Model {

	private screen!: Mesh;
	private screenVideoElement!: HTMLVideoElement;
	private screenVideoTexture!: VideoTexture;

	private readonly onMouseMoveBound: (evt: MouseEvent) => void;
	private readonly onPointerDownBound: (evt: PointerEvent) => void;

	private onMouseOverMaterial = new THREE.MeshBasicMaterial({
		color: 0x00ff00,
		transparent: true,
		opacity: 0.5,
		depthWrite: false,
	});

	public constructor() {
		super();
		this.onMouseMoveBound = this.onMouseMove.bind(this);
		this.onPointerDownBound = this.onPointerDown.bind(this);
	}

	public init(): void {
	}

	public load(scene: Scene): Promise<void> {
		return new Promise((resolve, reject) => {
			Loader.loadGLTF(Vars.PATH.GAME_BOY.MODEL, (gltf: GLTF) => {
				scene.add(gltf.scene);

				const bakedMaterial = Loader.loadBakedImageTexture(Vars.PATH.GAME_BOY.TEXTURE);
				gltf.scene.traverse((child) => {
					const mesh: Mesh = child as unknown as Mesh;
					mesh.material = bakedMaterial;

					const name = mesh.name;
					if (name === "GameBoy") {
						this.model = mesh;
						this.model.material = bakedMaterial;
						this.model.userData.originalMaterial = this.model.material.clone();
					} else if (name === "Screen") {
						this.screen = mesh;
						if (this.screen.material instanceof Material) {
							this.screen.userData.originalMaterial = this.screen.material.clone();
						}
					}

					this.autoSetMeshShadow(mesh);
				});

				this.model.add(this.screen);

				this.screenVideoElement = document.createElement("video");
				this.screenVideoElement.src = Vars.PATH.GAME_BOY.SCREEN_VIDEO;
				this.screenVideoElement.muted = true;
				this.screenVideoElement.playsInline = true;
				this.screenVideoElement.autoplay = true;
				this.screenVideoElement.loop = true;

				this.screenVideoTexture = Loader.loadVideoTexture(this.screenVideoElement);

				resolve();
			}, undefined, () => reject);
		});
	}

	public subscribeToEventListeners(): void {
		document.body.addEventListener("mousemove", this.onMouseMoveBound);
		document.body.addEventListener("pointerdown", this.onPointerDownBound);
	}

	public unSubscribeToEventListeners(): void {
		document.body.removeEventListener("mousemove", this.onMouseMoveBound);
		document.body.removeEventListener("pointerdown", this.onPointerDownBound);
	}

	public onMouseMove(event) {
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, Experience.get().getCameraManager().getCamera());

		const intersects = raycaster.intersectObject(this.model, true);

		if (intersects.length > 0) {
			this.autoSetOnMouseOverMaterial();
		} else {
			this.autoSetDefaultModelMaterial();
		}
	}

	private autoSetOnMouseOverMaterial(): void {
		document.body.style.cursor = "pointer";
		this.model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.material = this.onMouseOverMaterial;
			}
		});
	}

	private autoSetDefaultModelMaterial(): void {
		document.body.style.cursor = "auto";
		this.model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.material = child.userData.originalMaterial;
			}
		});
	}

	public onPointerDown(event): void {
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, Experience.get().getCameraManager().getCamera());

		const intersects = raycaster.intersectObject(this.model, true);

		if (intersects.length > 0) {
			this.autoSetDefaultModelMaterial();
			this.unSubscribeToEventListeners();
			this.placeGameBoyInFrontOfCamera();
		}
	}

	private placeGameBoyInFrontOfCamera() {
		// TODO
		const gameboyPosition = this.model.position.clone();
		const cameraDirection = new THREE.Vector3(-.8, -.6, -6);

		const distanceFromCamera = .7;

		cameraDirection.applyQuaternion(Experience.get().getCameraManager().getCamera().quaternion).normalize();

		const projectedCameraPosition = gameboyPosition.clone().add(cameraDirection.multiplyScalar(-distanceFromCamera));

		const tweenGameBoyPosition = new TWEEN.Tween(gameboyPosition)
			.to(projectedCameraPosition, 2000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(() => {
				this.model.position.copy(gameboyPosition);
			});

		tweenGameBoyPosition.start();


		const targetRotation = new THREE.Quaternion();
		const targetEuler = new THREE.Euler(THREE.MathUtils.degToRad(100), 0, THREE.MathUtils.degToRad(100), 'XYZ');
		targetRotation.setFromEuler(targetEuler);

		const duration = 2000;

		// Tween pour animer la rotation de l'objet gameboy
		const tweenRotation = new TWEEN.Tween(this.model.rotation)
			.to({ x: targetRotation.x, y: targetRotation.y, z: targetRotation.z, w: targetRotation.w }, duration)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(() => {
				//this.model.rotation.set(this.model.rotation.x, this.model.rotation.y, this.model.rotation.z, this.model.rotation.w);
			});

		tweenRotation.start();
	}

}