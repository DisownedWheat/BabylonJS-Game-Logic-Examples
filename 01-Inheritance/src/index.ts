import * as BABYLON from 'babylonjs';

class Game {

	engine: BABYLON.Engine;
	scene: BABYLON.Scene;

	constructor() {

		// Set up Babylon
		this.engine = new BABYLON.Engine(document.getElementById('app') as HTMLCanvasElement);
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.debugLayer.show();

	}

	setup() {

		// Create the default camera and light
		this.scene.createDefaultCameraOrLight(true, true, true);

		// Set up a simple ground
		let ground = BABYLON.MeshBuilder.CreatePlane('ground', { size: 5 });
		ground.rotate(new BABYLON.Vector3(1, 0, 0), BABYLON.Tools.ToRadians(90));
		ground.position.y -= 1;

		// Create the sphere mesh that will be the "player"
		let sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1 });
		let playerSphere = new CustomMesh('player-sphere', this.scene, null, sphere);

		// Dispose of the original mesh otherwise we will have a double
		sphere.dispose();
	}

	run() {
		this.engine.runRenderLoop(() => {

			// Get the delta time (default to 0 as it can be NaN on first render)
			let dt = (this.scene.deltaTime / 1000) || 0;

			// Loop through all meshes in the scene
			for (let mesh of this.scene.meshes) {

				// If it is an instance of our custom mesh we can call the update method on it
				if (mesh instanceof CustomMesh) {
					mesh.update(dt);
				}
			}

			// Now render the scene
			this.scene.render();
		});
	}

}

// Basic class that extends the Babylon Mesh class and adds an update method
// This is very basic but shows the rough idea of how it could be done
class CustomMesh extends BABYLON.Mesh {
	goingLeft = false;
	update(delta: number) {
		if (this.goingLeft) {
			this.position.x -= delta;
		} else {
			this.position.x += delta
		}
		if (this.position.x > 2) {
			this.goingLeft = true;
		} else if (this.position.x < -2) {
			this.goingLeft = false;
		}
	}
}

// Instantiate the game class and attach it to the window
// (This is purely for example purposes, do not actually do this except for testing)
let w = window as Window & typeof globalThis & { game: Game };
w.game = new Game();
w.game.setup();
w.game.run();
