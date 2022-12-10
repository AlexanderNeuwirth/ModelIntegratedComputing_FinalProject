/*globals define, WebGMEGlobal*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Fri Dec 09 2022 17:55:23 GMT-0600 (Central Standard Time).
 */

define(['jointjs', 'css!./styles/PetriNetVisualizerWidget.css'], function (joint) {
    'use strict';

    var WIDGET_CLASS = 'petri-net-visualizer';

    function PetriNetVisualizerWidget(logger, container) {
        this._logger = logger.fork('Widget');

        this._el = container;

        this.nodes = {};
        this._initialize();

        this._logger.debug('ctor finished');
    }

    PetriNetVisualizerWidget.prototype._initialize = function () {
        var width = this._el.width(),
            height = this._el.height(),
            self = this;

        // set widget class
        this._el.addClass(WIDGET_CLASS);

        this._jointSM = new joint.dia.Graph;
        this._jointPaper = new joint.dia.Paper({
            el: this._el,
            width : width,
            height: height,
            model: this._jointSM,
            interactive: false
        });

        // add event calls to elements
        this._jointPaper.on('element:pointerclick', function(elementView) {
            const currentElement = elementView.model;
            const transitionId = self._webgmePN.id2state[currentElement.id];
            if(transitionId && self._activeTransitions.includes(transitionId)) {
                self._fireTransition(self._webgmePN.transitions[transitionId]);
            }
        });

        this._webgmePN = null;
    };

    PetriNetVisualizerWidget.prototype.onWidgetContainerResize = function (width, height) {
        this._logger.debug('Widget is resizing...');
    };

    PetriNetVisualizerWidget.prototype.resetMachine = function () {
        const pn = this._webgmePN;
        Object.keys(pn.places).forEach(placeId => {
            pn.places[placeId].simulatedMarkings = pn.places[placeId].markings;
        })
        this._checkActiveTransitions();
        this._decorateMachine();
    };

    // Adding/Removing/Updating items
    PetriNetVisualizerWidget.prototype.addNode = function (desc) {
    };

    PetriNetVisualizerWidget.prototype.destroyNet = function () {

    };

    PetriNetVisualizerWidget.prototype._drawMarkings = function(place) {
        var startXOffset = 20;
        var xOffset = startXOffset;
        var yOffset = 29;
        if(place.simulatedMarkings > 0) {
            for ( i = 0; ((place.simulatedMarkings < 13) && (i < place.simulatedMarkings)); i += 1){
                let vertex;
                vertex = new joint.shapes.standard.Circle({
                    size: { width: 16, height: 16 },
                    attrs: {
                        label : {
                            text: '',
                            fontWeight: 'bold',
                        },
                        body: {
                            strokeWidth: 2,
                            fill: 'black',
                            cursor: 'pointer'
                        }
                    }
                });
                vertex.position(place.position.x + xOffset, place.position.y + yOffset)
                vertex.addTo(this._jointSM);
                this._markings.push(vertex);
                
                xOffset = xOffset + 20;
                if(xOffset > startXOffset + 60) {
                    xOffset = startXOffset;
                    yOffset += 20;
                }
            }
            if(place.simulatedMarkings > 12) {
                let vertex;
                vertex = new joint.shapes.standard.Circle({
                    size: { width: 10, height: 10 },
                    attrs: {
                        label : {
                            text: place.simulatedMarkings,
                            fontWeight: 'bold',
                            fontSize: 24,
                        },
                        body: {
                            strokeWidth: 2,
                            stroke: 'white',
                            cursor: 'pointer'
                        }
                    }
                });
                vertex.position(place.position.x + 45, place.position.y + 30)
                vertex.addTo(this._jointSM);
                this._markings.push(vertex);
            }
        }
    }

    PetriNetVisualizerWidget.prototype._decorateMachine = function() {
        const pn = this._webgmePN;
        this._markings.forEach(marking => marking.remove());
        Object.keys(pn.transitions).forEach(transitionId => {
            pn.transitions[transitionId].joint.attr('body/stroke', '#333333');
        });
        this._activeTransitions.forEach(transitionId => {
            pn.transitions[transitionId].joint.attr('body/stroke', '#FF3333');
        });
        Object.keys(pn.places).forEach(placeId => {
            this._drawMarkings(pn.places[placeId]);
        });
    };

    PetriNetVisualizerWidget.prototype._fireTransition = function(transition) {
        const pn = this._webgmePN;
        transition.in.forEach(inputPlaceId => {
            pn.places[inputPlaceId].simulatedMarkings -= 1;
        })
        transition.out.forEach(outputPlaceId => {
            pn.places[outputPlaceId].simulatedMarkings += 1;
        })
        this._checkActiveTransitions();
        this._decorateMachine();
    }

    PetriNetVisualizerWidget.prototype._checkActiveTransitions = function() {
        const self = this;
        self._activeTransitions = [];
        const pn = self._webgmePN;
        Object.keys(pn.transitions).forEach(transitionId => {
            const transition = pn.transitions[transitionId];
            let active = true;
            Object.keys(transition.in).forEach(event => {
                if(pn.places[transition.in[event]].simulatedMarkings < 1) {
                    active = false;
                }
            })
            if(active) {
                self._activeTransitions.push(transitionId);
            }
        });
        if (self._activeTransitions.length == 0) {
            alert("No remaining transitions enabled. The Petri net is in deadlock. Click 'Restart' to continue.")
        }

    }

    // State Machine manipulating functions called from the controller
    PetriNetVisualizerWidget.prototype.initNet = function (netDescriptor) {
        const self = this;

        self._webgmePN = netDescriptor;
        self._jointSM.clear();
        self._activeTransitions = [];
        self._markings = [];
        const pn = self._webgmePN;
        pn.id2state = {}; // this dictionary will connect the on-screen id to the state id
        Object.keys(pn.places).forEach(placeId => {
            pn.places[placeId].simulatedMarkings = pn.places[placeId].markings;
        })
        // first add the states
        Object.keys(pn.transitions).forEach(transitionId => {
            let vertex = null;
            vertex = new joint.shapes.standard.Rectangle({
                position: pn.transitions[transitionId].position,
                size: { width: 40, height: 100 },
                attrs: {
                    label : {
                        text: pn.transitions[transitionId].name,
                        //event: 'element:label:pointerdown',
                        fontWeight: 'bold',
                        //cursor: 'text',
                        //style: {
                        //    userSelect: 'text'
                        //}
                    },
                    body: {
                        strokeWidth: 3,
                        cursor: 'pointer'
                    }
                }
            });
            vertex.addTo(self._jointSM);
            pn.transitions[transitionId].joint = vertex;
            pn.id2state[vertex.id] = transitionId;
        });

        Object.keys(pn.places).forEach(placeId => {
            let vertex = null;
            vertex = new joint.shapes.standard.Circle({
                position: pn.places[placeId].position,
                size: { width: 100, height: 100 },
                attrs: {
                    label : {
                        text: pn.places[placeId].name,
                        fontWeight: 'bold',
                    },
                    body: {
                        strokeWidth: 3,
                        cursor: 'pointer'
                    }
                }
            });
            vertex.addTo(self._jointSM);
            pn.places[placeId].joint = vertex;
            pn.id2state[vertex.id] = placeId;
        });

        // then create the links
        Object.keys(pn.transitions).forEach(transitionId => {
            const transition = pn.transitions[transitionId];
            Object.keys(transition.out).forEach(event => {
                transition.jointNext = transition.jointNext || {};
                const link = new joint.shapes.standard.Link({
                    source: {id: transition.joint.id},
                    target: {id: pn.places[transition.out[event]].joint.id},
                    attrs: {
                        line: {
                            strokeWidth: 2
                        },
                        wrapper: {
                            cursor: 'default'
                        }
                    },
                });
                link.addTo(self._jointSM);
                transition.jointNext[event] = link;
            })
            Object.keys(transition.in).forEach(event => {
                transition.jointNext = transition.jointNext || {};
                const link = new joint.shapes.standard.Link({
                    target: {id: transition.joint.id},
                    source: {id: pn.places[transition.in[event]].joint.id},
                    attrs: {
                        line: {
                            strokeWidth: 2
                        },
                        wrapper: {
                            cursor: 'default'
                        }
                    },
                });
                link.addTo(self._jointSM);
                transition.jointNext[event] = link;
            })
        });

        //now refresh the visualization
        self._jointPaper.updateViews();
        self._checkActiveTransitions();
        self._decorateMachine();
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    PetriNetVisualizerWidget.prototype.destroy = function () {
    };

    PetriNetVisualizerWidget.prototype.onActivate = function () {
        this._logger.debug('PetriNetVisualizerWidget has been activated');
    };

    PetriNetVisualizerWidget.prototype.onDeactivate = function () {
        this._logger.debug('PetriNetVisualizerWidget has been deactivated');
    };

    return PetriNetVisualizerWidget;
});
