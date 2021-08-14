import { Easing } from 'eaz';
import { Accessor } from '../../environment/Data';
import { Environment } from '../../environment/Environment';
import { Node } from '../../transpiler/Node';
import { AnimationData } from '../graph/AnimationGraph';

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

    parentIds: Set<string> = new Set();
    showing = false;

    precondition?: Environment;

    // Read and writes are computed during baking
    _reads: AnimationData[] = null;
    _writes: AnimationData[] = null;

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

    begin(environment: Environment, options = { baking: false }) {
        if (options.baking) {
            this.precondition = environment.copy();
        }
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment, options = { baking: false }) {}

    computeReads(environment: Environment): void {}

    computeWrites(environment: Environment): void {}

    getName() {
        return `${this.constructor.name}`;
    }

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

    reads() {
        if (this._reads == null) {
            console.error(`[${this.constructor.name}] Attempting to get reads from an AnimationNode before baking`);
        }

        return this._reads;
    }

    writes() {
        if (this._writes == null) {
            console.error(`[${this.constructor.name}] Attempting to get writes from an AnimationNode before baking`);
        }

        return this._writes;
    }

    computeReadAndWrites(...args: any) {
        this._reads = [];
        this._writes = [];
    }
}
