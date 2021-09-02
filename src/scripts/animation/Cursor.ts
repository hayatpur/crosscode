// import { Editor } from '../editor/Editor';
// import { AnimationGraph } from './graph/AnimationGraph';
// import { AnimationNode } from './primitive/AnimationNode';

// export class Cursor {
//     static instance: Cursor;
//     element: HTMLDivElement;

//     constructor() {
//         Cursor.instance = this;

//         this.element = document.createElement('div');
//         this.element.classList.add('highlight-cursor');
//         document.body.append(this.element);
//     }

//     reset() {
//         this.element.style.width = `${0}px`;
//         this.element.style.height = `${0}px`;
//     }

//     destroy() {
//         this.element.remove();
//     }

//     highlight(animation: AnimationGraph | AnimationNode) {
//         let loc = animation instanceof AnimationNode ? animation.statement.loc : animation.node.loc;

//         const start = Editor.instance.computeBoundingBox(loc.start.line);
//         let charWidth = Editor.instance.computeCharWidth(loc.start.line);

//         start.y -= 5;
//         start.height += 10;
//         start.x += charWidth * loc.start.column;
//         start.width = charWidth * (loc.end.column - loc.start.column);

//         this.element.style.width = `${start.width}px`;
//         this.element.style.height = `${start.height}px`;
//         this.element.style.left = `${start.left}px`;
//         this.element.style.top = `${start.top}px`;
//     }
// }
