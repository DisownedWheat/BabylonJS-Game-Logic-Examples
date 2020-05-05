import * as BABYLON from 'babylonjs';
import { Engine, Entity, System, QueryBuilder, Query, IterativeSystem } from 'tick-knock';

class Game {

	engine: BABYLON.Engine;
	scene: BABYLON.Scene;
	ecs: Engine; // See tick-knock import

	constructor() {

		// Set up Babylon
		this.engine = new BABYLON.Engine(document.getElementById('app') as HTMLCanvasElement);
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.debugLayer.show();

		this.ecs = new Engine();
	}

	setup() {


		// Create the default camera and light
		this.scene.createDefaultCameraOrLight(true, true, true);

		// Set up a simple ground
		let ground = BABYLON.MeshBuilder.CreatePlane('ground', { size: 5 });
		ground.rotate(new BABYLON.Vector3(1, 0, 0), BABYLON.Tools.ToRadians(90));
		ground.position.y -= 1;

		// Create the player entity and attach the mesh component
		let player = new Entity();
		player
			.add(new PlayerMeshComponent(BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1 })))
			.add(new MovingComponent());

		// Add our system to the ECS engine
		this.ecs.addSystem(new MovementSystem());

		// Add out player entity
		this.ecs.addEntity(player);
	}

	run() {

		// Run the engine render loop, update the ECS engine before the scene renders
		this.engine.runRenderLoop(() => {
			let dt = (this.scene.deltaTime / 1000) || 0;
			this.ecs.update(dt);
			this.scene.render();
		});
	}
}

// Create a simple system that extends an iterative base class
// The iterative system class simply iterates over all entities it finds
// that matches its query.
class MovementSystem extends IterativeSystem {
	constructor() {

		// Create a query that will capture out player entity (has to have a mesh component and a moving component)
		super(new QueryBuilder().contains(PlayerMeshComponent).contains(MovingComponent).build())
	}

	protected updateEntity(entity: Entity, dt: number): void {

		// Get the movement component
		let moveComponent = entity.get(MovingComponent);

		// Get the mesh component
		let meshComponent = entity.get(PlayerMeshComponent);

		// Unpack the position from the mesh component
		let position = meshComponent.mesh.position.x

		// Move left or right
		if (moveComponent.goingLeft) {
			meshComponent.mesh.position.x -= dt;
		} else {
			meshComponent.mesh.position.x += dt;
		}
		if (position > 2) {
			moveComponent.goingLeft = true;
		}
		else if (position < -2) {
			moveComponent.goingLeft = false;
		}
	}
}

/* 	Components
	In reality these components could be combined but I've broken them out into two
	to show how multiple components can be included in a system query
*/

// Player mesh component, notice there is no logic in here
class PlayerMeshComponent {
	mesh: BABYLON.Mesh;
	constructor(mesh: BABYLON.Mesh) {
		this.mesh = mesh;
	}
}

// Same with the Moving component. Components should just be data, never logic
class MovingComponent {
	goingLeft = true;
}

// Instantiate the game class and attach it to the window
// (This is purely for example purposes, do not actually do this except for testing)
let w = window as Window & typeof globalThis & { game: Game };
w.game = new Game();
w.game.setup();
w.game.run();
