const PAGE_SCALE = 1.2;

function buildSVG(viewport, textContent) {
  // Building SVG with size of the viewport (for simplicity)
  const svg = document.createElementNS(SVG_NS, "svg:svg");
  svg.setAttribute("width", viewport.width + "px");
  svg.setAttribute("height", viewport.height + "px");
  // items are transformed to have 1px font size
  svg.setAttribute("font-size", 1);

  // processing all items
  textContent.items.forEach(function (textItem) {
    // we have to take in account viewport transform, which includes scale,
    // rotation and Y-axis flip, and not forgetting to flip text.
    const tx = pdfjsLib.Util.transform(
      pdfjsLib.Util.transform(viewport.transform, textItem.transform),
      [1, 0, 0, -1, 0, 0]
    );
    const style = textContent.styles[textItem.fontName];
    // adding text element
    const text = document.createElementNS(SVG_NS, "svg:text");
    text.setAttribute("transform", "matrix(" + tx.join(" ") + ")");
    text.setAttribute("font-family", style.fontFamily);
    let searchword = nlp(textItem.str).out('tags')[0]?.[textItem.str.toLocaleLowerCase().trim().replace(',','')]?.[0] ?? null
    console.log(searchword)
    text.setAttribute("fill",searchword != null ? stringToColour(searchword): "black");
    text.textContent = textItem.str;
    svg.append(text);
  });
  return svg;
}
let pdfDocument = null;
async function loadPdf(pdf_path) {
  const loadingTask = pdfjsLib.getDocument({ url: pdf_path });
  pdfDocument = await loadingTask.promise;
  document.getElementById("slider").setAttribute("max", pdfDocument.numPages);
}
async function loadPage(PAGE_NUMBER) {
  // Loading document and page text content
  const page = await pdfDocument.getPage(PAGE_NUMBER);
  const viewport = page.getViewport({ scale: PAGE_SCALE });
  const textContent = await page.getTextContent();
  // building SVG and adding that to the DOM
  const svg = buildSVG(viewport, textContent);
  document.getElementById("container").innerHTML = "";
  document.getElementById("container").append(svg);
  // Release page resources.
  page.cleanup();
}

const stringToColour = (str) => {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}