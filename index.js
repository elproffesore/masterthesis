pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js"
document.addEventListener('mouseup', (event) => {
    let selection = window.getSelection()
    let span = document.createElement('span')
    if(selection.getRangeAt(0).toString().trim() != ""){
        selection.getRangeAt(0).surroundContents(span)
    }
})
async function pageLoaded() {
    // Loading document and page text content
    const loadingTask = pdfjsLib.getDocument({ url: PDF_PATH });
    const pdfDocument = await loadingTask.promise; 
    let fontSet = new Set();
    let fontMap = new Map();
    for (let i = 1; i < pdfDocument._pdfInfo.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        // Loop over the text items and create a set with all text sizes
        textContent.items.forEach(function (textItem) {
            if (textItem.str.trim() != "") {
                fontSet.add(textItem.height)
            }
        })
    }
    // Set an array of fontsizes and create map with according header and text tags 
    fontSet = [...fontSet].sort((a, b) => a < b)
    fontSet.map((size, i) => {
        if (i == fontSet.length - 1) {
            fontMap.set(size, `span`)
        } else {
            fontMap.set(size, i + 1)
        }
    })
    // Loop over text and assign the text to the according markup tags
    for (let i = 1; i < pdfDocument._pdfInfo.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        let container = document.createElement('div')
        container.setAttribute('id', `page-${i}`)
        container.setAttribute('class', 'page')
        document.getElementById("container").append(container)
        let priorLevel = 0
        let stringBuffer = ""
        textContent.items.forEach(function (textItem) {
            if (textItem.str.trim() != "") {
                let level = fontMap.get(textItem.height) 
                if (level != priorLevel) {
                    if (priorLevel <= 3) {
                        container.innerHTML += `<h${priorLevel}>${stringBuffer}</h${priorLevel}>`
                    }
                    stringBuffer = ""
                }
                if(level <= 3){
                    let text = textItem.str.replace('!',' ')
                    stringBuffer += text;
                }else if(level > 3 && level < fontSet.length-3){
                    let text = textItem.str.replace('!',' ')
                    container.innerHTML += text
                }
                priorLevel = level;
            }
        })
        page.cleanup()
    }
}