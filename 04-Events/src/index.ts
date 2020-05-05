import * as BABYLON from 'babylonjs';
import { createNanoEvents, Emitter, Unsubscribe } from 'nanoevents';

interface GameEvents {
	tick: (dt: number) => void;
	entityAdded: (entity: Entity) => void;
	entityRemoved: (entity: Entity) => void;
}

class Game {

	engine: BABYLON.Engine;
	scene: BABYLON.Scene;
	entities: Entity[];
	readonly emitter: Emitter<GameEvents>;

	constructor() {
		this.engine = new BABYLON.Engine(document.getElementById('app') as HTMLCanvasElement);
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.debugLayer.show();
		this.emitter = createNanoEvents<GameEvents>();
		this.entities = [];
	}

	addEntity(func: () => Entity) {

		// Create the entity
		let e = func();

		// Add it to the list of entities
		this.entities.push(e);
		this.emitter.emit('entityAdded', e);

		// Add all the entity event subscriptions for global events
		// Notice that we have to bind the methods here, I'm still looking for a
		// way to do without fat arrows (fat arrows prevent calls to super[method])
		e.unbindTick = this.emitter.on('tick', e.tick.bind(e));
		e.unBindEntityAdded = this.emitter.on('entityAdded', e.entityAdded.bind(e));
		e.unBindEntityRemoved = this.emitter.on('entityRemoved', e.entityRemoved.bind(e));


		// Here we add a listener to the entity removed event. We will emit this event
		// when we remove the mesh from the scene tree
		e.emitter.on('removed', (e) => {

			// Unbind all the events the entity listens to
			e.unbindTick();
			e.unBindEntityAdded();
			e.unBindEntityRemoved();
			e.cleanUp();

			// Emit the entity removed event to notify any listeners
			this.emitter.emit('entityRemoved', e);

			// Remove the entity from the list we keep
			this.entities = this.entities.filter(x => x !== e)
		});
	}

	setup() {

		// Create the default camera and light
		this.scene.createDefaultCameraOrLight(true, true, true);

		// Set up a simple ground
		let ground = BABYLON.MeshBuilder.CreatePlane('ground', { size: 5 });
		ground.rotate(new BABYLON.Vector3(1, 0, 0), BABYLON.Tools.ToRadians(90));
		ground.position.y -= 1;

		// Create two entities, one that will be perpetual and one that will be removed
		// after five seconds
		this.addEntity(() => new Entity());
		this.addEntity(() => {
			let entity = new RemoveEntity();
			entity.mesh.position.x = 3;
			return entity;
		});
	}

	run() {

		// Start the Babylon render loop
		this.engine.runRenderLoop(() => {

			// We emit the 'tick' event which will notify all our entities to update
			this.emitter.emit('tick', this.scene.deltaTime / 1000 || 0);

			// Render the actual scene
			this.scene.render();
		});
	}
}

// Define the events that our entities will emit
// You can extend this interface as well as extending the classes
interface EntityEvents {
	removed: (e: Entity) => void;
}


// Define a game entity that will serve as a base object
// I always set the emitter to only use the associated events with a class
// This class can be extended independently of the events interface
class Entity {
	mesh: BABYLON.Mesh;
	readonly emitter: Emitter<EntityEvents>;
	unbindTick: Unsubscribe;
	unBindEntityAdded: Unsubscribe;
	unBindEntityRemoved: Unsubscribe;
	moveLeft = false;

	constructor() {
		// Define a name for the mesh
		let name = `sphere${Math.round(Math.random() * 1000)}`;
		this.mesh = BABYLON.MeshBuilder.CreateSphere(name, { diameter: 1 });
		this.emitter = createNanoEvents<EntityEvents>();
	}


	// Tick method that subscribes to the game class' tick event
	// Called every frame
	tick(dt: number) {

		// Move the mesh position just like the other examples
		if (this.moveLeft) {
			this.mesh.position.x -= dt;
		}
		else {
			this.mesh.position.x += dt;
		}
		if (this.mesh.position.x > 2) {
			this.moveLeft = true;
		} else if (this.mesh.position.x < -2) {
			this.moveLeft = false;
		}
	}

	// Method that listens for the entityAdded event emitted by the game
	entityAdded(e: Entity) {
		console.log(e);
	}

	// Method that listens for the entityRemoved event emitted by the game
	entityRemoved(e: Entity) {
		console.log(e);
	}

	// Add a clean up method here for when entity is removed
	// This will just take care of any housekeeping
	cleanUp() {
		this.mesh.dispose();
	}
}


// Here is just a simple example of extending a class while extending the
// event interface (though you certainly don't have to do this)
// Note that the interface is empty just because this is an example
interface RemoveEntityEvents extends EntityEvents { }

class RemoveEntity extends Entity {
	readonly emitter: Emitter<RemoveEntityEvents>;
	private count = 0;

	constructor() {
		super();
		this.emitter = createNanoEvents<RemoveEntityEvents>();
	}

	tick(dt: number) {

		// Call the parent class tick
		super.tick(dt);

		// Add the delta time to the count
		this.count += dt;

		// If the count is greater than 5 seconds then we will remove the entity
		// to show how the remove event works
		if (this.count > 5) {
			this.emitter.emit('removed', this);
		}
	}
}

// Instantiate the game class and attach it to the window
// (This is purely for example purposes, do not actually do this except for testing)
let w = window as Window & typeof globalThis & { game: Game };
w.game = new Game();
w.game.setup();
w.game.run();
