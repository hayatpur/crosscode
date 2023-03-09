import * as PerfectArrows from 'perfect-arrows'

export function reflow(el: HTMLElement) {
    void el?.offsetHeight
}

export function getBoundingBoxOfStartAndEnd(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): { x: number; y: number; width: number; height: number } {
    const x = Math.min(x1, x2)
    const y = Math.min(y1, y2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)

    return { x, y, width, height }
}

/**
 *
 * @param connection
 * @param a Canvas space
 * @param b Canvas space
 * @param offset
 */
export function setSVGPath(
    connection: { svg: SVGElement; path: SVGPathElement },
    a: [x: number, y: number],
    b: [x: number, y: number],
    type: 'straight' | 'curved' = 'straight'
) {
    const parentBbox = connection.svg.getBoundingClientRect()

    const factor = 1 // 1 / Executor.instance.visualization.camera.panzoom.getScale()

    const target = getBoundingBoxOfStartAndEnd(
        a[0] - parentBbox.x,
        a[1] - parentBbox.y,
        b[0] - parentBbox.x,
        b[1] - parentBbox.y
    )
    connection.svg.style.left = `${factor * (target.x - 2.5)}px`
    connection.svg.style.top = `${factor * (target.y - 2.5)}px`

    const bbox = connection.svg.getBoundingClientRect()

    // TODO: Scaling

    // Will be set to start of SVG
    const p1 = [factor * (a[0] - bbox.x), factor * (a[1] - bbox.y)]
    const p2 = [factor * (b[0] - bbox.x), factor * (b[1] - bbox.y)]

    const c1 = [...p1]
    const c2 = [...p2]

    if (type == 'curved') {
        c1[1] += (p2[1] - p1[1]) / 2
        c2[1] -= (p2[1] - p1[1]) / 2
    }

    connection.path.setAttribute('d', `M ${p1[0]} ${p1[1]} C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]}  ${p2[0]} ${p2[1]}`)

    const pathBbox = connection.path.getBoundingClientRect()
    connection.svg.style.width = `${pathBbox.width + 5}px`
    connection.svg.style.height = `${pathBbox.height + 5}px`
}

export function flipAnimate(element: HTMLElement, first: DOMRect, last: DOMRect, duration: number = 300) {
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

export function getPerfectArrow(x0: number, y0: number, x1: number, y1: number): [string, number, number, number] {
    const [sx, sy, cx, cy, ex, ey, ae, as, sc] = PerfectArrows.getArrow(x0, y0, x1, y1, {
        padEnd: 0,
        padStart: 0,
        flip: x0 > x1,
        // bow: 0.1,
        // stretch: 0.1,
        straights: false,
    })

    return [`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`, ex, ey, ae * (180 / Math.PI)]
}

export function createElement(tag: string, classes: string[] | string = [], parent?: Element) {
    const el = document.createElement(tag)

    if (Array.isArray(classes)) {
        el.classList.add(...classes)
    } else {
        el.classList.add(classes)
    }

    if (parent != undefined) {
        parent.appendChild(el)
    }

    return el
}

export function createSVGElement(classes: string[] | string = [], parent?: Element) {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    if (Array.isArray(classes)) {
        svgEl.classList.add(...classes)
    } else {
        svgEl.classList.add(classes)
    }

    if (parent != undefined) {
        parent.appendChild(svgEl)
    }

    return svgEl
}

export function createPathElement(classes: string[] | string = [], parent?: Element): SVGPathElement {
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    if (Array.isArray(classes)) {
        pathEl.classList.add(...classes)
    } else {
        pathEl.classList.add(classes)
    }

    if (parent != undefined) {
        parent.appendChild(pathEl)
    }

    return pathEl
}
