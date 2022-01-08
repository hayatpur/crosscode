// export default class TimeSection {
//     parent: HTMLDivElement
//     name: string
//     start: number
//     duration: number
//     delay: number
//     yOffset: number
//     domElement: HTMLDivElement

//     constructor(
//         parent: HTMLDivElement,
//         name: string,
//         start: number,
//         duration: number,
//         delay: number,
//         total: number,
//         yOffset: number
//     ) {
//         this.parent = parent
//         this.name = name

//         this.start = start
//         this.duration = duration
//         this.delay = delay
//         this.yOffset = yOffset

//         const bbox = parent.getBoundingClientRect()
//         const multiplier = bbox.width / total

//         let n_start = start * multiplier
//         let n_duration = duration * multiplier

//         const domElement = document.createElement('div')
//         domElement.classList.add('time-section')

//         domElement.style.left = `${n_start}px`
//         domElement.style.width = `${n_duration}px`

//         const label = document.createElement('div')
//         label.classList.add('time-section-label')
//         domElement.append(label)
//         label.innerText = name

//         parent.append(domElement)

//         // if (this.yOffset > 0) {
//         //     label.style.display = 'none'
//         // }

//         this.domElement = domElement
//     }

//     highlight() {
//         this.domElement.classList.add('active')
//         // this.domElement.style.transform = `translate(0px, ${Math.round(50 * (this.yOffset - 0.5))}px)`
//     }

//     unHighlight() {
//         this.domElement.classList.remove('active')
//         // this.domElement.style.transform = `translate(0px, 0px)`
//     }

//     static dispose() {
//         document.querySelectorAll('.time-section-label').forEach((el) => el.remove())
//         document.querySelectorAll('.time-section').forEach((el) => el.remove())
//         document.querySelectorAll('.time-sections').forEach((el) => el.remove())
//     }
// }
