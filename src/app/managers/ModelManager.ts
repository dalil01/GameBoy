import { GameBoy } from "../models/GameBoy";
import { Scene } from "three";
import { Attic } from "../models/Attic";
import { GameBox } from "../models/GameBox";

export class ModelManager {

	private atticModel: Attic;
	private gameBoxModel: GameBox;
	private gameBoyModel: GameBoy;

	public constructor() {
		this.atticModel = new Attic();
		this.gameBoxModel = new GameBox();
		this.gameBoyModel = new GameBoy();
	}

	public getAtticModel(): Attic {
		return this.atticModel;
	}

	public getGameBoxModel(): GameBox {
		return this.gameBoxModel;
	}

	public getGameBoyModel(): GameBoy {
		return this.gameBoyModel;
	}

	public async loadModels(scene: Scene): Promise<void> {
		await this.atticModel.load(scene);
		await this.gameBoxModel.load(scene);
		await this.gameBoyModel.load(scene);
	}

}