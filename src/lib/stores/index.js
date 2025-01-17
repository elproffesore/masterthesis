import { colors } from "$lib/utils";
import { writable } from "svelte/store";


export let text = writable("");
export let textModels = writable([]);
export let relations = writable([]);
export let words = writable([]);
export let wordRelations = writable([]);

// Styling Variables
export let connectionsOpacity = writable(0.3);
export let markingColor = writable(colors[0]);
export let markingType = writable("highlight");
export let textCollapse = writable(false);

// Visibilities of the modals
export let connectionsVisibility = writable(true);
export let timelineVisibility = writable(false);
export let nodesVisibility = writable(true);
export let graphVisibility = writable(false);


