import { colors } from "$lib/utils";
import { writable } from "svelte/store";


export let text = writable("");
export let textModels = writable([]);
export let relations = writable([]);

// Styling Variables
export let connectionsOpacity = writable(0.5);
export let markingColor = writable(colors[0]);

// Visibilities of the modals
export let connectionsVisibility = writable(true);
export let timelineVisibility = writable(false);
export let nodesVisibility = writable(true);


