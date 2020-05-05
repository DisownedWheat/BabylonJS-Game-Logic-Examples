import * as BABYLON from 'babylonjs';

class Game {

	engine: BABYLON.Engine;
	scene: BABYLON.Scene;

	constructor() {
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

		// Create a sphere that will be our stand in for a player
		let sphere = BABYLON.MeshBuilder.CreateSphere('PlayerSphere', { diameter: 1 });

		// Here we attach our custom behavior to the "player" mesh
		sphere.addBehavior(new PlayerBehavior());
	}

	run() {

		// Here we have a very simplified render loop, Babylon is kindly handling it all for us
		this.engine.runRenderLoop(() => this.scene.render())
	}
}

// Here we define our custom behaviour. I've named it PlayerBehavior for clarity
// even though the player object doesn't act on any input.
class PlayerBehavior implements BABYLON.Behavior<BABYLON.Mesh> {

	// We require the name to implement the Behavior interface
	readonly name = 'PlayerBehavior';

	// Here we add a couple of extra attributes, the target is the mesh
	// that this behavior will be attached to (for easy access). The observer
	// will be the function that is called every frame and will handle our logic.
	// Finally we have the scene for ease of access.
	private target: BABYLON.Mesh;
	private scene: BABYLON.Scene;
	private observer: BABYLON.Observer<BABYLON.Scene>;

	// Here we can add any attributes we like, for now I'll just add a counter
	private count = 0;
	private goingLeft = true;

	// Add any initialisation logic here, not really necessary in our case (can also be added in the constructor)
	init(): void {
	}

	// This is called when a behavior is attached to something, it could be anything that implements the
	// IBehaviorAware interface but in this case it is a mesh
	attach(target: BABYLON.Mesh): void {

		console.log('Attaching');

		// Set the target and the scene
		this.target = target;
		this.scene = target.getScene();

		// Now here we add our function that handles this mesh's logic. It will be run before each render of our scene
		this.observer = this.scene.onBeforeRenderObservable.add(this.update);

		// Here we set the scope of the observer so "this" refers to the behavior and not something else
		// You can skip this step if your update method uses fat arrow syntax (e.g. update = (x, y) => {})
		this.observer.scope = this;
	}

	// This is called when we remove the behavior from our mesh. You can do any sort of clean up in here.
	// In this case we will unregister our observer and null out all our references
	detach(): void {
		console.log('Detaching');
		this.observer.unregisterOnNextCall = true;
		this.target = null;
		this.scene = null;
	}

	// Here is our method that handles our logic
	update(evtData: BABYLON.Scene, evtState: BABYLON.EventState) {

		// Get the delta time in ms (personal preference) (default to 0)
		let dt = (evtData.deltaTime / 1000 || 0);

		// Update our mesh's position
		if (this.goingLeft) {
			this.target.position.x -= dt;
		} else {
			this.target.position.x += dt
		}
		if (this.target.position.x > 2) {
			this.goingLeft = true;
		} else if (this.target.position.x < -2) {
			this.goingLeft = false;
		}

		// Add the scene delta time to our count attribute
		this.count += dt;

		// If it's been more than ten seconds then we remove this behavior from the target mesh
		// Notice that you pass in a reference to the object itself to remove it
		if (this.count > 10) {
			this.target.removeBehavior(this);
		}
	}

}

// Instantiate the game class and attach it to the window
// (This is purely for example purposes, do not actually do this except for testing)
let w = window as Window & typeof globalThis & { game: Game };
w.game = new Game();
w.game.setup();
w.game.run();
