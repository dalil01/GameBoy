import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { CameraManager } from "./managers/CameraManager";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ModelManager } from "./managers/ModelManager";
import TWEEN from "@tweenjs/tween.js";

export type Sizes = {
	w: number;
	h: number;
}

export class Experience {

	private static INSTANCE: Experience;

	private readonly scene: Scene;
	private readonly sizes: Sizes;

	private renderer: WebGLRenderer;

	private readonly cameraManager: CameraManager;
	private camera!: PerspectiveCamera;
	private controls!: OrbitControls;

	private readonly modelManager: ModelManager;

	private readonly clock: Clock;

	private constructor() {
		this.scene = new Scene();

		this.sizes = { w: window.innerWidth, h: window.innerHeight };

		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setSize(this.sizes.w, this.sizes.h);

		this.renderer.domElement.style.background = "#000";

		this.cameraManager = new CameraManager(this.sizes, this.renderer.domElement);
		this.modelManager = new ModelManager();

		this.clock = new Clock();
	}

	public static get(): Experience {
		if (!Experience.INSTANCE) {
			Experience.INSTANCE = new Experience();
		}

		return Experience.INSTANCE;
	}

	public init(): void {
		this.camera = this.cameraManager.getCamera();
		this.controls = this.cameraManager.getControls();

		this.modelManager.loadModels(this.scene).then(() => {
			const loader = document.getElementById("loader");
			if (loader) {
				document.body.removeChild(loader);
			}

			this.scene.add(this.camera);
			document.body.appendChild(this.renderer.domElement);

			this.subscribeToEventListeners();

			this.renderer.setAnimationLoop(() => this.animate());
		});
	}

	public getRendererElement(): HTMLElement {
		return this.renderer.domElement;
	}

	public getCameraManager(): CameraManager {
		return this.cameraManager;
	}

	public getModelManager(): ModelManager {
		return this.modelManager;
	}

	private subscribeToEventListeners(): void {
		window.addEventListener("resize", () => this.onResize());
	}

	private onResize(): void {
		this.sizes.w = window.innerWidth;
		this.sizes.h = window.innerHeight;

		this.camera.aspect = this.sizes.w / this.sizes.h;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.sizes.w, this.sizes.h);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	private animate(): void {
		this.controls.update();
		this.modelManager.getGameBoxModel().update(this.clock, this.camera, this.sizes);
		TWEEN.update();
		this.renderer.render(this.scene, this.camera);
	}

}