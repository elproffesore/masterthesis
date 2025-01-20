import * as d3 from 'd3';
import { semanticalyRelativeWordsInText, semanticalySimilarWords } from './api';
export { semanticalyRelativeWordsInText, semanticalySimilarWords };
export const colors = ['rgba(255,0,255,1)', 'rgba(0, 255, 0,1)', 'rgba(255, 255, 0,1)'];
export function nameShortener(string) {
    if (string.length > 20) {
        return string.substring(0, 20) + '...';
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
    if (node.nodeName == 'SPAN') {
        return node;
    }
    // Stop recursion after 3 levels
    if (level == 3) {
        return null;
    }
    // Recursively get the parent node and check if it is a span
    return findSpanParentRecursive(node.parentNode, level + 1);
}

export function powScale(value, pow) {
    return d3.scalePow().domain([0,0.7]).range([0,1]).exponent(pow)(value);
}
export function createRelation(){

}
export function createSetFromArrays(arrays) {
    const set = new Set();
    arrays.forEach(array => {
        array.forEach(obj => {
            set.add(JSON.stringify(obj));
        });
    });
    return Array.from(set).map(item => JSON.parse(item));
}
export function removeDuplicateObjects(array) {
    const uniqueObjects = new Set();
    return array.filter(obj => {
        const objString = JSON.stringify(obj);
        if (uniqueObjects.has(obj.word)) {
            return false;
        } else {
            uniqueObjects.add(obj.word);
            return true;
        }
    });
}
const average = (a, b) => (a + b) / 2

export function getSvgPathFromStroke(points, closed = true) {
  const len = points.length

  if (len < 4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `
  }

  if (closed) {
    result += 'Z'
  }

  return result
}
export function interpolatePosition(points, singlePosition, scrollY) {
    // Find the closest points before and after the single position
    console.log(points)

    let closestBefore = null;
    let closestAfter = null;
    points = points.sort((a, b) => a.scroll - b.scroll);
    
    for (let i = 0; i < points.length; i++) {
        if (points[i].scroll >= scrollY) {
            closestAfter = points[i];
            if (i > 0) {
                closestBefore = points[i - 1];
            }
            break;
        }
    }
    
    // If closestBefore or closestAfter is not found, return null (or handle accordingly)
    if (closestBefore && !closestAfter) {
        return { x: closestBefore.x, y: closestBefore.y };
    }
    console.log(closestBefore, closestAfter)
    
    // Calculate the scroll progress between closestBefore and closestAfter
    const totalDistance = closestAfter.scroll - closestBefore.scroll;
    const scrollDistance = scrollY - closestBefore.scroll;
    let scrollProgress = 1
    if(scrollDistance > 0){
        scrollProgress = scrollDistance / totalDistance;
    }

    // Interpolate the x and y coordinates of singlePosition
    const interpolatedX = closestBefore.x + scrollProgress * (closestAfter.x - closestBefore.x);
    const interpolatedY = closestBefore.y + scrollProgress * (closestAfter.y - closestBefore.y);
    
    // Return the interpolated position
    return { x: interpolatedX, y: interpolatedY };
}
