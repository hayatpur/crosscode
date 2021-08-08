import { Easing } from 'eaz';
import { Accessor } from '../../environment/Data';
import { Environment } from '../../environment/Environment';
import { Node } from '../../transpiler/Node';

export enum AnimationPlayback {
    Normal = 'Normal',
    WithPrevious = 'WithPrevious',
}

export interface AnimationContext {
    outputSpecifier: Accessor[];
    speedMultiplier?: number;
    directExpression?: boolean;
    xOff: number;
}

export interface AnimationOptions {
    playback?: AnimationPlayback;
    delay?: number;
    duration?: number;
    speedMultiplier?: number;
    xOff?: number;
}

export class AnimationNode {
    playing: boolean = false;
    hasPlayed: boolean = false;

    static id = 0;
    playback: AnimationPlayback;

    base_delay: number;
    base_duration: number;
    statement: Node;

    id: string;
    speedMultiplier: number;
    xOff: number;

    constructor(options: AnimationOptions = {}) {
        this.playback = options.playback;

        this.base_delay = options.delay == null ? 10 : options.delay;
        this.base_duration = options.duration == null ? 20 : options.duration;

        this.statement = null;

        this.id = `AN${AnimationNode.id}`;
        AnimationNode.id += 1;

        this.speedMultiplier = 1;
        this.xOff = options.xOff ?? 0;
    }

    get delay() {
        return this.base_delay;
    }

    get duration() {
        return this.base_duration * (1 / this.speedMultiplier);
    }

    ease(t: number) {
        return Easing.sinusoidal.inOut(t);
    }

    dispose() {
        // console.warn("[AnimationNode] Dispose method missing for ", this);
    }

    begin(environment: Environment) {}

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}

    undoBegin() {
        console.warn('[AnimationNode] undoBegin method missing for ', this);
    }

    undoEnd() {
        console.warn('[AnimationNode] undoStart method missing for ', this);
    }

    reset(options = { baking: false }) {
        this.playing = false;
        this.hasPlayed = false;
    }
}
