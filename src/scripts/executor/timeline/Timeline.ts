//@ts-check

import { duration } from '../../animation/animation';
import { AnimationGraph, instanceOfAnimationGraph } from '../../animation/graph/AnimationGraph';
import { AnimationNode, instanceOfAnimationNode } from '../../animation/primitive/AnimationNode';
import { remap } from '../../utilities/math';
import { Executor } from '../Executor';
import TimeSection from './TimeSection';

export default class Timeline {
    executor: Executor;
    scrubber: HTMLDivElement;
    scrubberParent: HTMLDivElement;
    held: boolean;
    sectionsDomElement: HTMLDivElement;
    sections: any[];

    constructor(executor: Executor) {
        this.executor = executor;

        // Scrubber
        this.scrubber = document.getElementById('time-scrubber') as HTMLDivElement;
        this.scrubberParent = this.scrubber.parentElement as HTMLDivElement;

        this.held = false;

        const timeline = this;

        this.scrubberParent.onmousedown = (e) => {
            this.held = true;

            const bbox = this.scrubberParent.getBoundingClientRect();

            // Move scrubber over
            let x = e.x - bbox.x;

            // Clamp
            x = Math.max(0, x);
            x = Math.min(x, bbox.width);

            this.scrubber.style.left = `${x}px`;
            this.scrubber.classList.add('active');

            timeline.updateSections();
            executor.time = remap(x, 0, bbox.width, 0, duration(executor.animation));
            executor.tick();
        };

        document.body.addEventListener('mousemove', (e) => {
            if (!this.held) return;

            const bbox = this.scrubberParent.getBoundingClientRect();

            // Move scrubber over
            let x = e.x - bbox.x;

            // Clamp
            x = Math.max(0, x);
            x = Math.min(x, bbox.width);

            this.scrubber.style.left = `${x}px`;
        });

        document.body.addEventListener('mouseup', () => {
            if (!this.held) return;

            this.held = false;
            this.scrubber.classList.remove('active');
        });

        // Pause binding
        document.getElementById('pause-button').addEventListener('click', (e) => {
            executor.paused = true;
            document.getElementById('pause-button').classList.add('active');
            document.getElementById('play-button').classList.remove('active');
        });

        // Play binding
        document.getElementById('play-button').addEventListener('click', (e) => {
            executor.paused = false;
            document.getElementById('play-button').classList.add('active');
            document.getElementById('pause-button').classList.remove('active');
        });

        // Sections
        this.sectionsDomElement = document.createElement('div');
        this.sectionsDomElement.classList.add('time-sections');

        this.scrubberParent.append(this.sectionsDomElement);

        this.sections = [];
    }

    updateSections() {
        document.querySelectorAll('.time-section').forEach((section) => section.remove());
        this.sections = [];

        const animations = this.executor.animation.vertices;
        const total_duration = duration(this.executor.animation);

        let start = 0;

        for (let i = 0; i < animations.length; i++) {
            const animation = animations[i];
            if (instanceOfAnimationGraph(animation)) {
                for (let j = 0; j < animation.vertices.length; j++) {
                    let child = animation.vertices[j];

                    if (instanceOfAnimationGraph(child)) {
                        for (let k = 0; k < child.vertices.length; k++) {
                            let child2 = child.vertices[k];
                            start = this.updateAnimation(child2, start, total_duration);
                        }
                    } else {
                        start = this.updateAnimation(child, start, total_duration);
                    }
                }
            } else {
                start = this.updateAnimation(animation, start, total_duration);
            }
        }
    }

    updateAnimation(animation: AnimationGraph | AnimationNode, start: number, total_duration: number): number {
        start += animation.delay;

        const section = new TimeSection(
            this.scrubberParent,
            instanceOfAnimationNode(animation) ? animation.name : animation.nodeData.type,
            start,
            duration(animation),
            0,
            total_duration
        );
        this.sections.push(section);

        start += duration(animation);

        return start;
    }

    seek(t) {
        const bbox = this.scrubberParent.getBoundingClientRect();

        // Move scrubber over
        this.scrubber.style.left = `${remap(t, 0, duration(this.executor.animation), 0, bbox.width)}px`;

        for (const section of this.sections) {
            if (t >= section.start && t <= section.start + section.duration) {
                section.highlight();
            } else {
                section.unHighlight();
            }
        }
    }
}
