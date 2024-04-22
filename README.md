# BabylonJS Typescript Logic Examples

This repo is a collection of simple examples showing some ways of handling game logic within Babylon JS. This list is in no way exhaustive as Babylon is a very unopinionated framework.

These are also only my personal experiences so don't consider this an authoritative souce but more as an example to get you started on your own ideas.

## Building Examples
- Run `npm install`
- Run `npm buildX`  where `X` is the number of the directory (1 is Inheritance, 2 is Behaviours & Observables, etc.)
- Run `npm buildAll` to build all examples
- Each example will have its output in its own `dist` directory

# Observations

Please do note that these are my personal experiences and should in no way taken as gospel for or against these options.

## Inheritance

### Pros:
- Works well with how the Babylon project is structured
- Requires no external libraries
- Basic OOP makes it easy to learn
- Integrates well with Babylon scene tree
- Easy to debug

### Cons:
- General problems with OOP inheritance model
- Have to write a lot of your own logic to keep references to game objects
- I just don't like it very much

## Behaviours and Observables

### Pros:
- Integrates well with Babylon
- Requires no external libraries
- Very well thought out design
- Very flexible in how to handle your logic
- Easy to extend your own custom behaviours
- Flexible options with how observers are scoped and when they are called
- Very nice to work with in a typed language
- Easy to attach and remove behaviours
- Easy to debug

### Cons:
- Somewhat boilerplate-y
- Querying objects for behaviours relies on strings which isn't quite as nice as querying class references
- Potential performance concerns (not that I've run into any performance issues with it yet but it would be easy to create poor-performing code with lots of closures in a behavior class)

## ECS

### Pros:
- Very intuitive once you've wrapped your head around the pattern
- Apparently very performant
- Forced to organise code reasonably well
- Excellent separation of concerns
- Querying components based on class reference is nice when working with TS (this is particular to the `tick-knock` library)
- Easy to debug

### Cons:
- Very boilerplate-y
- Takes a while to set up (but pays off massively on larger projects)
- Takes some time to adjust how to manage logic when working in a new paradigm
- Does not integrate with Babylon's scene tree very well (feels quite separate)

## Event Based Architecture

### Pros:
- A lot of fun
- Entities are mostly completely separated and only communicate via an event bus which prevents tight coupling
- `nanoevents` library is a joy to use with TS
- Easier to integrate into Babylon's scene tree than ECS but has similar advantages
- Allows very rapid prototyping
- Can integrate cleanly with all other systems on this list

### Cons:
- Harder to debug
- Requires some rethinking of control flow logic
