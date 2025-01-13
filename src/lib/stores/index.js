import { colors } from "$lib/utils";
import { writable } from "svelte/store";


export let text = writable("");
export let textModels = writable([]);
export let models = writable({});
export let relations = writable([]);
export let simulation = writable(null);

// Styling Variables
export let connectionsOpacity = writable(0.5);
export let markingColor = writable(colors[0]);

// Visibilities of the modals
export let connectionsVisibility = writable(true);
export let timelineVisibility = writable(false);
export let graphVisibility = writable(false);


