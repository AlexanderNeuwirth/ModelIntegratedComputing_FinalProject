"""
This is where the implementation of the plugin code goes.
The ClassifyPetriNet-class is imported from both run_plugin.py and run_debug.py
"""
import sys
import logging
from webgme_bindings import PluginBase

# Setup a logger
logger = logging.getLogger('ClassifyPetriNet')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class ClassifyPetriNet(PluginBase):
    def main(self):
        core = self.core
        root_node = self.root_node
        META = self.META
        active_node = self.active_node # we assume the active node is the state machine node

        visited = set()
        places = set()
        transitions = set()
        in_nodes = {}
        out_nodes = {}

        nodes = core.load_children(active_node)
        for node in nodes:
            if core.is_type_of(node, META['Place']):
                places.add(core.get_path(node))
            if core.is_type_of(node, META['Transition']):
                transitions.add(core.get_path(node))
        for node in nodes:
            if core.is_type_of(node, META['PlaceToTransitionArc']) or core.is_type_of(node, META['TransitionToPlaceArc']):
                in_node = core.get_pointer_path(node, 'src')
                out_node = core.get_pointer_path(node, 'dst')
                if in_node in out_nodes:
                    out_nodes[in_node].append(out_node)
                else:
                    out_nodes[in_node] = [out_node]
                if out_node in in_nodes:
                    in_nodes[out_node].append(in_node)
                else:
                    in_nodes[out_node] = [in_node]
        for place in places:
            if place not in out_nodes:
                out_nodes[place] = []
            if place not in in_nodes:
                in_nodes[place] = []

        for transition in transitions:
            if transition not in out_nodes:
                out_nodes[transition] = []
            if transition not in in_nodes:
                in_nodes[transition] = []


        def classify_free_choice_net():
            visited_inplaces = set()
            for transition in transitions:
                inplaces = in_nodes[transition]
                for inplace in inplaces:
                    if inplace in visited_inplaces:
                        # A node has appeared as an inplace multiple times - not free choice
                        return False
                    visited_inplaces.add(inplace)
            return True
        
        self.send_notification(f'Is free choice net: {classify_free_choice_net()}')

        def classify_state_machine():
            for transition in transitions:
                inplaces = in_nodes[transition]
                outplaces = out_nodes[transition]
                if (len(inplaces) != 1) or (len(outplaces) != 1):
                    # Every transition must have exactly one inplace and outplace
                    return False
            return True

        self.send_notification(f'Is state machine: {classify_state_machine()}')

        def classify_marked_graph():
            for place in places:
                intransitions = in_nodes[place]
                outtransitions = out_nodes[place]
                if (len(intransitions) != 1) or (len(outtransitions) != 1):
                    # Every place must have exactly one intransition and outtransition
                    return False
            return True

        self.send_notification(f'Is marked graph: {classify_marked_graph()}')

        def classify_workflow_net():
            source_place = None
            sink_place = None
            for place in places:
                if len(in_nodes[place]) == 0:
                    if source_place is not None:
                        # Multiple source places - not a workflow net
                        return False
                    source_place = place
                if len(out_nodes[place]) == 0:
                    if sink_place is not None:
                        # Multiple sink places - not a workflow net
                        return False
                    sink_place = place

            if (source_place is None) or (sink_place is None):
                # Both sink and source places must be defined
                return False

            def ends_in_sink(place, visited=set()):
                if place == sink_place:
                    return True
                options = set(out_nodes[place]) - visited
                if len(options) == 0:
                    return False
                visited = options.union(visited)
                return all([ends_in_sink(option, visited) for option in options])

            def begins_in_source(place, visited=set()):
                if place == source_place:
                    return True
                options = set(in_nodes[place]) - visited
                if len(options) == 0:
                    return False
                visited = options.union(visited)
                return all([begins_in_source(option, visited) for option in options])
            
            return all([begins_in_source(place) and ends_in_sink(place) for place in places])

        self.send_notification(f'Is workflow net: {classify_workflow_net()}')


