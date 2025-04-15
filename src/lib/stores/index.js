import { colors } from "$lib/utils";
import { writable } from "svelte/store";

export let filePath = writable("");

// Global Variables holding Text
export let text = writable("");
export let textModels = writable([]);
export let relations = writable([]);
export let words = writable([]);
export let paths = writable([]);

// Graph Variables
export let wordRelations = writable([]);

// Styling Variables
export let connectionsOpacity = writable(0.3);
export let markingColor = writable(colors[0]);
export let markingType = writable("highlight");
export let textCollapse = writable(false);
export let docHeight = writable(0);
export let linkOpacity = writable(1);

// Visibilities of the modals
export let connectionsVisibility = writable(true);
export let timelineVisibility = writable(false);
export let nodesVisibility = writable(true);
export let graphVisibility = writable(false);
export let drawingVisibility = writable(false);
export let canvasVisibility = writable(true);
export let drawingFixedVisibility = writable(false);



