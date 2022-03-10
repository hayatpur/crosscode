import { getArrow } from 'curved-arrows'

export function reflow(el: HTMLElement) {
    void el?.offsetHeight
}

export function flipAnimate(
    element: HTMLElement,
    first: DOMRect,
    last: DOMRect,
    duration: number = 300
) {
    // Invert: determine the delta between the
    // first and last bounds to invert the element
    const deltaX = first.left - last.left
    const deltaY = first.top - last.top
    const deltaW = first.width / last.width
    const deltaH = first.height / last.height

    // Play: animate the final element from its first bounds
    // to its last bounds (which is no transform)
    element.animate(
        [
            {
                transformOrigin: 'top left',
                transform: `
    translate(${deltaX}px, ${deltaY}px)
    scale(${deltaW}, ${deltaH})
  `,
            },
            {
                transformOrigin: 'top left',
                transform: 'none',
            },
        ],
        {
            duration: duration,
            easing: 'ease-in-out',
            fill: 'both',
        }
    )
}

export function getCurvedArrow(x0: number, y0: number, x1: number, y1: number) {
    const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getArrow(x0, y0, x1, y1, {
        padEnd: 0,
        padStart: 0,
    })
    return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
}

export function createEl(
    tag: string,
    classes: string[] | string = [],
    parent: HTMLElement | null = null
) {
    const el = document.createElement(tag)
    if (Array.isArray(classes)) {
        el.classList.add(...classes)
    } else {
        el.classList.add(classes)
    }
    if (parent) {
        parent.appendChild(el)
    }
    return el
}

export function createPath(
    classes: string[] | string = [],
    parent: HTMLElement | null = null
): {
    path: SVGPathElement
    svg: SVGElement
} {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    if (Array.isArray(classes)) {
        svg.classList.add(...classes)
    } else {
        svg.classList.add(classes)
    }

    if (parent) {
        parent.appendChild(svg)
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svg.appendChild(path)

    return { path, svg }
}

export function createGlobalPath(
    classes: string[] | string = [],
    layer: 'top' | 'bottom' = 'bottom'
): SVGPathElement {
    // const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    // if (parent) {
    //     parent.appendChild(svg)
    // }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    if (Array.isArray(classes)) {
        path.classList.add(...classes)
    } else {
        path.classList.add(classes)
    }

    const svg =
        layer == 'top'
            ? document.querySelector('.svg-canvas.top')
            : document.querySelector('.svg-canvas.bottom')
    svg.appendChild(path)

    return path
}
