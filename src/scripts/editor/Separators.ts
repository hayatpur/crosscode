// import { Ticker } from '../utilities/Ticker';
// import { View } from '../view/ViewRenderer';

// export class Separators {
//     static instance: Separators;
//     separatorElements: {
//         [viewID: string]: {
//             top: SVGPathElement;
//             bottom: SVGPathElement;
//             separator: SVGPathElement;
//             label: HTMLDivElement;
//         };
//     } = {};

//     constructor() {
//         Separators.instance = this;
//         Ticker.instance.registerTick(this.tick.bind(this));
//     }

//     addSeparator(view: View) {
//         // The movement paths
//         const top = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//         top.classList.add('separator-path');

//         const bottom = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//         bottom.classList.add('separator-path');

//         // const separator = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//         // separator.classList.add('separator-path');

//         // Add them to global svg canvas
//         const svg = document.getElementById('svg-canvas');

//         svg.append(top);
//         svg.append(bottom);
//         // svg.append(separator);

//         // Store them in the separatorElements object
//         // this.separatorElements[view.animation.id] = { top: top, bottom: bottom, separator: separator, label: null };
//     }

//     tick() {
//         for (const id of Object.keys(this.separatorElements)) {
//             this.updatePath(id);
//         }
//     }

//     updatePath(id: string) {
//         const view = View.views[id];
//         if (view.codeSection == null || (!view.animation.playing && !view.animation.hasPlayed)) return;

//         const code_bbox = view.codeSection.getBoundingClientRect();
//         const bbox = view.element.getBoundingClientRect();

//         const top = this.separatorElements[id].top;
//         const bottom = this.separatorElements[id].bottom;
//         const separator = this.separatorElements[id].separator;

//         const x1 = code_bbox.right + 10;
//         const x2 = x1 + 50;

//         const y2 = bbox.top - 10;

//         // Update top points
//         // this.updatePoints(top, x1, code_bbox.top, x2, y2);
//         // this.updatePoints(bottom, x1, code_bbox.bottom, x2, y2);

//         separator.setAttribute('d', `M ${x2} ${y2} Q ${x2} ${y2} ${x2 + 1000} ${y2}`);

//         // if (this.separatorElements[id].label == null) {
//         //     // Set label
//         //     const labelEl = document.createElement('div');
//         //     labelEl.classList.add('view-label');
//         //     labelEl.innerHTML = `<span class="view-label-name">[${view.animation.id}] ${camelCaseToSentence(
//         //         view.animation.getName()
//         //     )}</span>`;
//         //     createViewControls(labelEl);

//         //     document.body.append(labelEl);
//         //     this.separatorElements[id].label = labelEl;
//         // } else {
//         //     const label = this.separatorElements[id].label;
//         //     const label_bbox = label.getBoundingClientRect();
//         //     label.style.left = `${x2 + bbox.width / 2 - label_bbox.width / 2}px`;
//         //     label.style.top = `${y2 - label_bbox.height / 2}px`;
//         // }

//         // let x1 = code_bbox.right;
//         // let y1 = code_bbox.top;
//         // let x2 = bbox.left;
//         // let y2 = bbox.top + bbox.height / 2;
//         // let mx = (x1 + x2) / 2;
//         // let my = (y1 + y2) / 2;
//         // my += (y1 < y2 ? 20 : -20);
//     }

//     updatePoints(path: SVGPathElement, x1: number, y1: number, x2: number, y2: number) {
//         let mx = (x1 + x2) / 2;
//         let my = (y1 + y2) / 2;
//         // my += y1 < y2 ? 20 : -20;
//         path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${y1} ${mx} ${my} Q ${mx} ${y2} ${x2} ${y2}`);
//     }
// }
