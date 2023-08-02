import { Mesh, PerspectiveCamera, Vector3 } from "three";
import { Sizes } from "../Experience";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

export class CameraManager {

	private readonly camera: PerspectiveCamera;
	private readonly controls: OrbitControls;

	private defaultControlsSettings: any = {}

	private readonly onMouseChangeBound: (evt: any) => void;

	public constructor(sizes: Sizes, canvas: HTMLElement) {
		this.camera = new PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 80);
		this.camera.position.x = 0.006640298903466361;
		this.camera.position.y = 0.7857970312012988;
		this.camera.position.z = -3.839395644569804;

		this.controls = new OrbitControls(this.camera, canvas);
		this.autoSetDefaultControls();
		this.switchToViewAtticControls();

		this.onMouseChangeBound = this.onChange.bind(this);
		this.controls.addEventListener("change", this.onMouseChangeBound);
	}

	public getCamera(): PerspectiveCamera {
		return this.camera;
	}

	public getControls(): OrbitControls {
		return this.controls;
	}

	public moveToGameBox(viewPoint: Mesh, infoPoint: Mesh, onMoved: Function): void {
		this.controls.removeEventListener("change", this.onMouseChangeBound);
		this.switchToDefaultControls();

		const viewPointPosition = viewPoint.position.clone();
		const boxPosition = infoPoint.position.clone();

		const offsetBackward = new THREE.Vector3(-.2, .3, 0);

		const targetPosition = viewPointPosition.clone().add(offsetBackward);
		const lookAtPosition = new THREE.Vector3(boxPosition.x, boxPosition.y, boxPosition.z);

		const duration = 2000;

		const tweenPosition = new TWEEN.Tween(this.camera.position)
			.to(targetPosition, duration)
			.easing(TWEEN.Easing.Quadratic.InOut);

		const tweenLookAt = new TWEEN.Tween(this.controls.target)
			.to(lookAtPosition, duration)
			.easing(TWEEN.Easing.Quadratic.InOut);

		tweenPosition.start();
		tweenLookAt.start();

		tweenPosition.onComplete(() => {
			if (onMoved) {
				onMoved();
				this.switchToViewBoxControls();
			}
		});
	}

	private autoSetDefaultControls(): void {
		const {
			minDistance,
			maxDistance,
			minPolarAngle,
			maxPolarAngle,
			minAzimuthAngle,
			maxAzimuthAngle,
			enableZoom,
			enableRotate
		} = this.controls;

		this.defaultControlsSettings = {
			enableDamping: true,
			enablePan: true,
			minDistance,
			maxDistance,
			minPolarAngle,
			maxPolarAngle,
			minAzimuthAngle,
			maxAzimuthAngle,
			enableZoom,
			enableRotate
		}
	}

	private switchToDefaultControls(): void {
		Object.assign(this.controls, this.defaultControlsSettings);
	}

	private switchToViewAtticControls(): void {
		this.controls.enableDamping = true;
		this.controls.enablePan = true;
		this.controls.panSpeed = 21
		this.controls.enableZoom = false;
		this.controls.enableRotate = true;
		this.controls.minDistance = 0;
		this.controls.maxDistance = .1;
		this.controls.minPolarAngle = 1.1;
		this.controls.maxPolarAngle = 1.5;
		this.controls.minAzimuthAngle = Math.PI / 1.2;
		this.controls.maxAzimuthAngle = -Math.PI / 1.2;

		this.controls.target.set(0, .7, -3);
	}

	private onChange(): void {
		const minPan = new Vector3(-1, .7, -3);
		const maxPan = new Vector3(1, .7, -3);
		this.autoSetMinMaxPan(minPan, maxPan)
	}

	private switchToViewBoxControls(): void {
		this.controls.enableDamping = true;
		this.controls.enablePan = false;
		this.controls.enableZoom = false;
		this.controls.enableRotate = true;
		this.controls.minPolarAngle = .6;
		this.controls.maxPolarAngle = 1.3;
		this.controls.minAzimuthAngle = Math.PI / .8;
		this.controls.maxAzimuthAngle = -Math.PI / 2;
	}

	private autoSetMinMaxPan(minPan: Vector3, maxPan: Vector3, _v: Vector3 = new Vector3()): void {
		_v.copy(this.controls.target);
		this.controls.target.clamp(minPan, maxPan);
		_v.sub(this.controls.target);
		this.camera.position.sub(_v);
	}

}