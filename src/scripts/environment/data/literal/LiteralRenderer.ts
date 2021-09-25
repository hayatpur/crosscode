import { lerp, sigmoid } from '../../../utilities/math';
import { DataRenderer } from '../DataRenderer';
import { DataState, getZPane } from '../DataState';

export class LiteralRenderer extends DataRenderer {
    setState(data: DataState) {
        this.element.classList.add('literal');

        const zPane = getZPane(data.transform.z);
        const elevation =
            data.transform.z < 0.3
                ? ElevationSize.ExtraSmall
                : data.transform.z < 0.7
                ? ElevationSize.Small
                : data.transform.z < 1.5
                ? ElevationSize.Medium
                : ElevationSize.Large;

        if (data.value != undefined) {
            this.element.style.boxShadow = getCSSElevation(elevation, zPane >= 0.7);
        }

        // Apply transform
        this.element.style.width = `${data.transform.width}px`;
        this.element.style.height = `${data.transform.height}px`;

        // Smooth transition
        const oldTop = parseInt(this.element.style.top);
        const oldLeft = parseInt(this.element.style.left);

        const top = data.transform.y - 5 * data.transform.z;
        const left = data.transform.x + 5 * data.transform.z;

        // if (isNaN(oldTop) || isNaN(oldLeft)) {
        this.element.style.top = `${top}px`;
        this.element.style.left = `${left}px`;
        // } else {
        //     this.element.style.top = `${lerp(oldTop, top, 0.01)}px`;
        //     this.element.style.left = `${lerp(oldLeft, left, 0.01)}px`;
        // }

        // Set value
        this.element.innerText = data.value?.toString();

        this.element.style.opacity = `${
            data.transform.opacity * sigmoid(-5 * (data.transform.z - 2))
        }`;

        if (typeof data.value == 'boolean') {
            this.element.innerHTML = data.value
                ? `<i class="gg-check"></i>`
                : `<i class="gg-close"></i>`;
        } else if (data.value == undefined) {
            this.element.innerHTML = ``;
        } else {
            this.element.innerHTML = `${data.value}`;
        }

        if (data.value == undefined) {
            this.element.classList.add('undefined');
        } else {
            this.element.classList.remove('undefined');
        }

        if (getZPane(data.transform.z) > 0.7) {
            this.element.classList.add('floating');
        } else {
            this.element.classList.remove('floating');
        }
    }
}

export enum ElevationSize {
    ExtraSmall = 'extra-small',
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

export function getCSSElevation(size: ElevationSize, floating = false) {
    const color = floating ? '--floating-shadow-color' : '--shadow-color';
    const opacityMultiplier = floating ? 0.5 : 1;
    const ELEVATIONS = {
        extraSmall: `
          0.2px 0.5px 0.5px hsl(var(${color}) / ${0.8 * opacityMultiplier})
        `,
        small: `
          0.5px 1px 1px hsl(var(${color}) / ${0.7 * opacityMultiplier})
        `,
        medium: `
          1px 2px 2px hsl(var(${color}) / ${0.333 * opacityMultiplier}),
          2px 4px 4px hsl(var(${color}) / ${0.333 * opacityMultiplier}),
          3px 6px 6px hsl(var(${color}) / ${0.333 * opacityMultiplier})
        `,
        large: `
          1px 2px 2px hsl(var(${color}) / ${0.2 * opacityMultiplier}),
          2px 4px 4px hsl(var(${color}) / ${0.2 * opacityMultiplier}),
          4px 8px 8px hsl(var(${color}) / ${0.2 * opacityMultiplier}),
          8px 16px 16px hsl(var(${color}) / ${0.2 * opacityMultiplier}),
          16px 32px 32px hsl(var(${color}) / ${0.2 * opacityMultiplier})
        `,
    };

    switch (size) {
        case ElevationSize.ExtraSmall:
            return ELEVATIONS.extraSmall;
        case ElevationSize.Small:
            return ELEVATIONS.small;
        case ElevationSize.Medium:
            return ELEVATIONS.medium;
        case ElevationSize.Large:
            return ELEVATIONS.large;
    }
}
