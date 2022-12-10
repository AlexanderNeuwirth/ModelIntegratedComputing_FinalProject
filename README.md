# Petri Net Design Studio - Mini Project

A Petri net is a mathematical modeling language for the description of distributed systems. It is a graphical formalism that can be used to represent the concurrent and asynchronous behaviors of a system. Petri nets consist of places, which represent the state of a system, and transitions, which represent the events that can change the state of the system. The interactions between places and transitions are represented by directed arcs. 

Petri nets are used in a variety of fields, including computer science, biology, and engineering, to model and analyze the behavior of complex systems.

## Example Use Cases
* In biology, Petri nets can be used to model and analyze the behavior of biological systems, such as metabolic networks, regulatory networks, and gene expression networks.
* In engineering, Petri nets can be used to model and analyze the behavior of manufacturing systems, such as assembly lines, supply chain networks, and logistics systems.
* In transportation, Petri nets can be used to model and analyze the behavior of transportation systems, such as traffic networks, public transit systems, and air traffic control systems.

## Installation
First, install the Petri Net Design Studio following:
- [NodeJS](https://nodejs.org/en/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/)

Second, start mongodb locally by running the `mongod` executable in your mongodb installation (you may need to create a `data` directory or set `--dbpath`).

Then, run `webgme start` from the project root to start . Finally, navigate to `http://localhost:8888` to start using Petri Net Design Studio!

## Building a Network
1. Open the Petri Net Design Studio. The Design Studio works best in Firefox.

2. Drag and drop the "Place" icon from the toolbar onto the workspace. This will create a new place on the Petri net diagram. You can adjust the position of the transition by dragging it around the screen.

3. Drag and drop the "transition" icon from the toolbar onto the workspace. This will create a new transition on the Petri net diagram. You can adjust the position of the transition by dragging it around the screen.

4. To create an arc between a place and a transition, click on the place and then click on the transition. This will create a directed arc from the place to the transition. You can adjust the position and curvature of the arc by dragging its control points.

5. To label a place or transition, double-click on it and enter the desired label in the "Name" property field. Likewise, you can set the number of markings in each place using the "Markings" property field.

6. To add additional places, transitions, and arcs, repeat steps 2-5 as needed.

When you are finished creating your Petri net, you can interact with it using the design studio tools.

## Visualizer

The visualizer can be accessed in the left sidebar, and allows you to simulate the runtime of the Petri net.
* Active transitions are marked on the screen.
* Click on an active transition to fire it, which will progress the simulation to the next stage.
* You can reset the simulation at any time to start over from the beginning.
* In the event of a deadlock state, the screen will alert you that no further transitions are possible.

## Interpreter

Triggering the interpreter feature (accessible in the top left of the screen) will classify whether the active network fits into each of the four categories defined below:
* Free-choice petri net - if the intersection of the inplaces sets of two transitions are not
empty, then the two transitions should be the same (or in short, each transition has its
own unique set if inplaces)
* State machine - a petri net is a state machine if every transition has exactly one inplace
and one outplace.
* Marked graph - a petri net is a marked graph if every place has exactly one out transition
and one in transition.
* Workflow net - a petri net is a workflow net if it has exactly one source place s where *s
= ∅, one sink place o where o* = ∅, and every x ∈ P ∪ T is on a path from s to o.
