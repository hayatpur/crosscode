// https://www.npmjs.com/package/keystroke-visualizer
const DEFAULT_OPTIONS = {
    fontSize: 16,
    keyStrokeDelay: 200, // Time before the line breaks
    lingerDelay: 1000, // Time before the text fades away
    fadeDuration: 1000,
    bezelColor: '#000',
    textColor: '#fff',
    unmodifiedKey: true, // If pressing Alt+e show e, instead of €
    showSymbol: true, // Convert ArrowLeft on ->
    appendModifiers: { Meta: true, Alt: true, Shift: false }, // Append modifier to key all the time
    position: 'bottom-left', // bottom-left, bottom-right, top-left, top-right
};

export class KeystrokeVisualizer {
    initialized: boolean;
    container: any;
    style: any;
    keyStrokeTimeout: any;
    options: any;
    currentChunk: any;

    constructor() {
        this.initialized = false;
        this.container = null;
        this.style = null;
        this.keyStrokeTimeout = null;
        this.options = {};
        this.currentChunk = null;
        this.keydown = this.keydown.bind(this);
        this.keyup = this.keyup.bind(this);
    }
    cleanUp() {
        function removeNode(node) {
            if (node) {
                node.parentNode.removeChild(node);
            }
        }
        removeNode(this.container);
        removeNode(this.style);
        clearTimeout(this.keyStrokeTimeout);
        this.currentChunk = null;
        this.container = this.style = null;
        window.removeEventListener('keydown', this.keydown);
        window.removeEventListener('keyup', this.keyup);
    }
    injectComponents() {
        this.container = document.createElement('ul');
        document.body.appendChild(this.container);
        this.container.className = 'keystrokes';
        const positions = {
            'bottom-left': 'bottom: 0; left: 0;',
            'bottom-right': 'bottom: 0; right: 0;',
            'top-left': 'top: 0; left: 0;',
            'top-right': 'top: 0; right: 0;',
        };
        if (!positions[this.options.position]) {
            console.warn(
                `Invalid position '${this.options.position}', using default 'bottom-left'. Valid positions: `,
                Object.keys(positions)
            );
            this.options.position = 'bottom-left';
        }
        this.style = document.createElement('style');
        this.style.innerHTML = `
      ul.keystrokes {
        padding-left: 10px;
        position: fixed;
        ${positions[this.options.position]}
      }
      
      ul.keystrokes li {
        font-family: Arial;
        background-color: ${this.options.bezelColor};
        opacity: 0.9;
        color: ${this.options.textColor};
        padding: 5px 10px;
        margin-bottom: 5px;
        border-radius: 10px;
        opacity: 1;
        font-size: ${this.options.fontSize}px;
        display: table;
        -webkit-transition: opacity ${this.options.fadeDuration}ms linear;
        transition: opacity ${this.options.fadeDuration}ms linear;
      }`;
        document.body.appendChild(this.style);
    }
    convertKeyToSymbol(key) {
        const conversionCommon = {
            ArrowRight: '→',
            ArrowLeft: '←',
            ArrowUp: '↑',
            ArrowDown: '↓',
            ' ': '␣',
            Enter: '↩',
            Shift: '⇧',
            ShiftRight: '⇧',
            ShiftLeft: '⇧',
            Control: '⌃',
            Tab: '↹',
            CapsLock: '⇪',
        };
        const conversionMac = {
            Alt: '⌥',
            AltLeft: '⌥',
            AltRight: '⌥',
            Delete: '⌦',
            Escape: '⎋',
            Backspace: '⌫',
            Meta: '⌘',
            Tab: '⇥',
            PageDown: '⇟',
            PageUp: '⇞',
            Home: '↖',
            End: '↘',
        };
        return (navigator.platform === 'MacIntel' ? conversionMac[key] : null) || conversionCommon[key] || key;
    }
    keydown(e) {
        if (!this.currentChunk) {
            this.currentChunk = document.createElement('li');
            this.container.appendChild(this.currentChunk);
        }
        var key = e.key;
        if (this.options.unmodifiedKey) {
            if (e.code.indexOf('Key') !== -1) {
                key = e.code.replace('Key', '');
                if (!e.shiftKey) {
                    key = key.toLowerCase();
                }
            }
        }
        var modifier = '';
        if (this.options.appendModifiers.Meta && e.metaKey && e.key !== 'Meta') {
            modifier += this.convertKeyToSymbol('Meta');
        }
        if (this.options.appendModifiers.Alt && e.altKey && e.key !== 'Alt') {
            modifier += this.convertKeyToSymbol('Alt');
        }
        if (this.options.appendModifiers.Shift && e.shiftKey && e.key !== 'Shift') {
            modifier += this.convertKeyToSymbol('Shift');
        }
        this.currentChunk.textContent += modifier + (this.options.showSymbol ? this.convertKeyToSymbol(key) : key);
    }
    keyup(e) {
        if (!this.currentChunk) return;
        var options = this.options;
        clearTimeout(this.keyStrokeTimeout);
        this.keyStrokeTimeout = setTimeout(() => {
            (function (previousChunk) {
                setTimeout(() => {
                    previousChunk.style.opacity = 0;
                    setTimeout(() => {
                        previousChunk.parentNode.removeChild(previousChunk);
                    }, options.fadeDuration);
                }, options.lingerDelay);
            })(this.currentChunk);
            this.currentChunk = null;
        }, options.keyStrokeDelay);
    }
    enable(options = {}) {
        this.cleanUp();
        this.options = Object.assign({}, DEFAULT_OPTIONS, options || this.options);
        this.injectComponents();
        window.addEventListener('keydown', this.keydown);
        window.addEventListener('keyup', this.keyup);
    }
    disable() {
        this.cleanUp();
    }
}
