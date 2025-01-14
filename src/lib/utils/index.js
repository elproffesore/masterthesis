
export const colors = [
    'rgba(255,0,255,1)',
    'rgba(0, 255, 0,1)',
    'rgba(255, 255, 0,1)',
]
export function nameShortener(string){
    if(string.length>20){
        return string.substring(0,20)+"...";
    }
    return string;
}
export function getMostRightNode(nodes) {
    let mostRightNode = nodes[0];
    let maxRight = nodes[0].getBoundingClientRect().right;

    nodes.forEach((node) => {
        let right = node.getBoundingClientRect().right;
        if (right > maxRight) {
            maxRight = right;
            mostRightNode = node;
        }
    });

    return mostRightNode;
}
export function getMostLeftNode(nodes) {
    let mostLeftNode = nodes[0];
    let maxLeft = nodes[0].getBoundingClientRect().left;

    nodes.forEach((node) => {
        let left = node.getBoundingClientRect().left;
        if (left < maxLeft) {
            maxLeft = left;
            mostLeftNode = node;
        }
    });

    return mostLeftNode;
}

export const opacityRegex = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9]*\.?[0-9]+)\s*\)/;

export function findSpanParentRecursive(node, level = 0) {
    // Stop recursion if the node is a space or the correct node
    if (node.nodeName == 'SPAN'){ 
        return node;
    }  
    // Stop recursion after 3 levels
    if (level == 3){ 
        return null;
    } 
    // Recursively get the parent node and check if it is a span
    return findSpanParentRecursive(node.parentNode, level + 1); 
}