import { getNumericalValueOfStyle, lerp } from '../../../utilities/math'
import { clone } from '../../../utilities/objects'
import { DataRenderer } from '../DataRenderer'
import { ConcreteDataState, TransformStyles } from '../DataState'

export class LiteralRenderer extends DataRenderer {
    prevRenderStyles: TransformStyles

    setState(data: ConcreteDataState) {
        this.element.classList.add('data-literal')

        const z = data.transform.styles.elevation ?? 0

        // Apply transform
        this.element.style.width = `${data.transform.rendered.width}px`
        this.element.style.height = `${data.transform.rendered.height}px`

        const top = data.transform.rendered.y - 5 * z + (data.transform.styles.yoffset ?? 0)
        const left = data.transform.rendered.x + 5 * z + (data.transform.styles.xoffset ?? 0)

        this.element.style.top = `${lerp(getNumericalValueOfStyle(this.element.style.top, top), top, 1)}px`
        this.element.style.left = `${lerp(getNumericalValueOfStyle(this.element.style.left, left), left, 1)}px`

        this.element.style.opacity = `${parseFloat(data.transform.styles.opacity?.toString() || '1')}`

        // Offset
        // this.element.style.transform = `translate(${data.transform.styles.xoffset ?? 0}px, ${
        //     data.transform.styles.yoffset ?? 0
        // }px)`

        this.element.style.boxShadow = `-0.5px 1px 0px 0.5px ${
            z > 0.5 ? '#a8bec8' : 'var(--color-2)'
        }, ${getCSSElevation(z)}`
        this.element.style.background = z > 0.5 ? `var(--s-color-0)` : `var(--color-1)`

        // Set value
        if (typeof data.value == 'boolean') {
            this.element.innerHTML = data.value ? `<i class="gg-check"></i>` : `<i class="gg-close"></i>`
        } else if (data.value == undefined) {
            this.element.innerHTML = ``
        } else {
            this.element.innerHTML = `${data.value}`
        }

        if (data.value == undefined) {
            this.element.classList.add('data-undefined')
        } else {
            this.element.classList.remove('data-undefined')
        }

        if (data.transform.styles.position == 'absolute') {
            this.element.classList.add('floating')
        } else {
            this.element.classList.remove('floating')
        }

        // Apply render only styles
        for (const style of Object.keys(data.transform.renderOnlyStyles)) {
            this.element.style[style] = data.transform.renderOnlyStyles[style]
        }

        if (this.prevRenderStyles != null) {
            for (const style of Object.keys(this.prevRenderStyles)) {
                if (!(style in data.transform.renderOnlyStyles)) {
                    this.element.style[style] = null
                }
            }
        }

        this.prevRenderStyles = clone(data.transform.renderOnlyStyles)
    }
}

export function getCSSElevation(depth: number, floating = false) {
    const color = floating ? '--floating-shadow-color' : '--color-shadow'
    const opacityMultiplier = floating ? 1 : 1
    const ELEVATIONS = {
        extraSmall: `
          -0.4px 0.8px 0.8px hsl(var(${color}) / ${0 * opacityMultiplier})
        `,
        small: `
          -0.5px 1px 1px hsl(var(${color}) / ${0.7 * opacityMultiplier})
        `,
        medium: `
          -1px 2px 2px hsl(var(${color}) / ${0.333 * opacityMultiplier}),
          -2px 4px 4px hsl(var(${color}) / ${0.333 * opacityMultiplier}),
          -3px 6px 6px hsl(var(${color}) / ${0.333 * opacityMultiplier})
        `,
        large: `
          -1px 2px 2px hsl(var(${color}) / ${0.2 * opacityMultiplier}),
          -2px 4px 4px hsl(var(${color}) / ${0.2 * opacityMultiplier}),
          -4px 8px 8px hsl(var(${color}) / ${0.2 * opacityMultiplier}),
          -8px 16px 16px hsl(var(${color}) / ${0.2 * opacityMultiplier}),
          -16px 32px 32px hsl(var(${color}) / ${0.2 * opacityMultiplier})
        `,
    }

    if (depth < 0.1) {
        return ELEVATIONS.extraSmall
    } else if (depth < 0.2) {
        return ELEVATIONS.small
    } else if (depth < 0.6) {
        return ELEVATIONS.medium
    } else {
        return ELEVATIONS.large
    }
}
