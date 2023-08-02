
const MODELS_DIR = "models/";
const ATTIC_DIR = MODELS_DIR + "Attic/";
const GAME_BOX_DIR = MODELS_DIR + "GameBox/";
const GAME_BOY_DIR = MODELS_DIR + "GameBoy/";

export class Vars {

	public static PATH = {
		DRACO: "draco/",
		ATTIC: {
			MODEL: ATTIC_DIR + "Attic.glb",
			TEXTURE: ATTIC_DIR + "Attic.jpg"
		},
		GAME_BOX: {
			MODEL: GAME_BOX_DIR + "GameBox.glb",
			TEXTURE: GAME_BOX_DIR + "GameBox.jpg",
			CONTENT_TEXTURE: GAME_BOX_DIR + "GameBoxContent.jpg"
		},
		GAME_BOY: {
			MODEL: GAME_BOY_DIR + "GameBoy.glb",
			TEXTURE: GAME_BOY_DIR + "GameBoy.jpg",
			SCREEN_VIDEO: GAME_BOY_DIR + "GlitchNoiseStatic.mp4"
		}
	};


}