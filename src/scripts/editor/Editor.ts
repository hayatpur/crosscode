import * as monaco from 'monaco-editor';

export class Editor {
    // Singleton
    static instance: Editor;

    monaco: monaco.editor.IStandaloneCodeEditor;
    onSelectionUpdate: Set<() => void>;
    onChangeContent: Set<() => void>;
    spacings: WeakMap<object, any>;
    parent: HTMLElement;
    dragSelections: HTMLDivElement[] = [];

    constructor() {
        // Singleton
        Editor.instance = this;

        // @ts-ignore
        monaco.editor.defineTheme('atom', getDarkTheme());
        // @ts-ignore
        monaco.editor.defineTheme('github', getLightTheme());

        Editor.instance = this;

        this.parent = document.getElementById(`editor`);

        this.monaco = monaco.editor.create(this.parent, {
            value: '',
            language: 'javascript',
            minimap: {
                enabled: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
                vertical: 'hidden',
            },
            overviewRulerBorder: false,
            fontSize: 21,
            contextmenu: false,
            mouseWheelScrollSensitivity: 0,
            lineHeight: 35,
            selectOnLineNumbers: false,
            letterSpacing: -0.5,
            codeLens: false,
            dragAndDrop: false,
            theme: 'github',
            fontFamily: 'Ubuntu Mono',
            quickSuggestions: {
                other: false,
                comments: false,
                strings: false,
            },
            parameterHints: {
                enabled: false,
            },
            wordBasedSuggestions: false,
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
        });

        const editor = this;

        // Callbacks
        this.onSelectionUpdate = new Set();
        this.onChangeContent = new Set();

        // Editor spacings
        this.spacings = new WeakMap();

        // document.fonts.ready.then(() => monaco.editor.remeasureFonts());

        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                monaco.editor.remeasureFonts();
            }, 2000);
        });

        // Fetch default text
        fetch(`./src/scripts/editor/files/default.js`)
            .then((response) => response.text())
            .then((data) => {
                editor.monaco.getModel().setValue(data);

                editor.monaco.getModel().onDidChangeContent((event) => {
                    editor.onChangeContent.forEach((callback) => callback());
                });

                editor.onChangeContent.forEach((callback) => callback());
                monaco.editor.remeasureFonts();
            });
    }

    getValue() {
        return this.monaco.getValue();
    }

    getSelection() {
        return this.monaco.getSelection();
    }

    getSelectedText() {
        return this.monaco.getModel().getValueInRange(this.monaco.getSelection());
    }

    getSelectedTextBoundingBox() {
        const selection = document.getElementsByClassName('cslr selected-text');
        return selection.length > 0 ? selection[0].getBoundingClientRect() : null;
    }

    computeBoundingBox(ln: number) {
        const lines = document.body.getElementsByClassName('view-lines')[0];
        const line = lines.children[ln - 1];

        return line?.children[0].getBoundingClientRect();
    }

    computeCharWidth(ln = 1) {
        const lines = document.body.getElementsByClassName('view-lines')[0];
        const line = lines.children[ln - 1]?.children[0];

        // @ts-ignore
        return line.getBoundingClientRect().width / line.innerText.length;
    }

    updateDragSelection(selection: { x: number; y: number; x2: number; y2: number }) {
        this.dragSelections.forEach((sel) => sel.remove());
        this.dragSelections = [];

        const lines = document.body.getElementsByClassName('view-lines')[0].children;

        const min_y = Math.min(selection.y, selection.y2);
        const max_y = Math.max(selection.y, selection.y2);

        for (let i = 0; i < lines.length; i++) {
            const bbox = lines[i].children[0].getBoundingClientRect();
            if (bbox.width < 5 && bbox.height < 5) continue;

            if (bbox.y > min_y && bbox.y + bbox.height < max_y) {
                const sel = document.createElement('div');
                sel.classList.add('editor-selection');
                document.body.append(sel);

                sel.style.left = `${bbox.x - 5}px`;
                sel.style.top = `${bbox.y - 5}px`;
                sel.style.width = `${bbox.width + 10}px`;
                sel.style.height = `${bbox.height + 10}px`;

                sel.setAttribute('_index', i.toString());

                this.dragSelections.push(sel);
            }
        }
    }

    setSpacingAtLine(line: number, spacing: number, origin: object) {
        if (!this.spacings.has(origin)) {
            this.spacings.set(origin, {});
        }

        if (this.spacings.get(origin)[line] != null && this.spacings.get(origin)[line].spacing == spacing) {
            return;
        }

        const editor = this;

        this.monaco.changeViewZones(function (changeAccessor) {
            const domElement = document.createElement('div');
            domElement.classList.add('section-spacing');

            // let space = 0;

            // for (const [origin, spaces] of Object.entries(editor.spacings)) {
            //     if (spaces[line] != null) {
            //         space += spaces[line];
            //     }
            // }

            if (editor.spacings.get(origin)[line] != null) {
                changeAccessor.removeZone(editor.spacings.get(origin)[line].id);
            }

            const id = changeAccessor.addZone({
                afterLineNumber: line,
                heightInPx: spacing,
                domNode: domElement,
                suppressMouseDown: true,
            });

            editor.spacings.get(origin)[line] = { id, spacing };
        });
    }

    getLineDom(ln: number) {
        const lines = document.body.getElementsByClassName('view-lines')[0];
        return lines.children[ln - 1];
    }

    static dispose() {
        const editor = Editor.instance;

        for (const { id } of Object.values(editor.spacings)) {
            editor.monaco.changeViewZones(function (changeAccessor) {
                changeAccessor.removeZone(id);
            });
        }
    }
}

function getLightTheme() {
    return {
        base: 'vs',
        inherit: true,
        rules: [
            {
                background: 'FFFFFF',
                token: '',
            },
            {
                foreground: '919191',
                token: 'comment',
            },
            {
                foreground: '00a33f',
                token: 'string',
            },
            {
                foreground: '004cc2',
                token: 'constant.language',
            },
            {
                foreground: 'd6352d',
                token: 'keyword',
            },
            {
                foreground: 'db9d63',
                token: 'constant.numeric',
            },
            {
                foreground: 'ff5600',
                token: 'storage',
            },
            {
                foreground: '21439c',
                token: 'entity.name.type',
            },
            {
                foreground: '21439c',
                token: 'entity.name.function',
            },
            {
                foreground: 'a535ae',
                token: 'support.function',
            },
            {
                foreground: 'a535ae',
                token: 'support.constant',
            },
            {
                foreground: 'a535ae',
                token: 'support.type',
            },
            {
                foreground: 'a535ae',
                token: 'support.class',
            },
            {
                foreground: 'a535ae',
                token: 'support.variable',
            },
            {
                foreground: 'ffffff',
                background: '990000',
                token: 'invalid',
            },
            {
                foreground: '990000',
                token: 'constant.other.placeholder.py',
            },
        ],
        colors: {
            'editor.foreground': '#000000',
            'editor.background': '#FFFFFF',
            'editor.selectionBackground': '#BAD6FD',
            'editor.lineHighlightBackground': '#00000012',
            'editorCursor.foreground': '#000000',
            'editorWhitespace.foreground': '#BFBFBF',
        },
    };
}

function getDarkTheme() {
    return {
        base: 'vs-dark',
        inherit: true,
        rules: [
            {
                foreground: 'abb2bf',
                token: 'text',
            },
            {
                foreground: 'abb2bf',
                token: 'source',
            },
            {
                foreground: 'adb7c9',
                token: 'variable.parameter.function',
            },
            {
                foreground: '5f697a',
                fontStyle: ' italic',
                token: 'comment',
            },
            {
                foreground: '5f697a',
                fontStyle: ' italic',
                token: 'punctuation.definition.comment',
            },
            {
                foreground: 'adb7c9',
                token: 'none',
            },
            {
                foreground: 'adb7c9',
                token: 'keyword.operator',
            },
            {
                foreground: 'cd74e8',
                token: 'keyword',
            },
            {
                foreground: 'eb6772',
                token: 'variable',
            },
            {
                foreground: '5cb3fa',
                token: 'entity.name.function',
            },
            {
                foreground: '5cb3fa',
                token: 'meta.require',
            },
            {
                foreground: '5cb3fa',
                token: 'support.function.any-method',
            },
            {
                foreground: 'f0c678',
                token: 'support.class',
            },
            {
                foreground: 'f0c678',
                token: 'entity.name.class',
            },
            {
                foreground: 'f0c678',
                token: 'entity.name.type.class',
            },
            {
                foreground: 'adb7c9',
                token: 'meta.class',
            },
            {
                foreground: '5cb3fa',
                token: 'keyword.other.special-method',
            },
            {
                foreground: 'cd74e8',
                token: 'storage',
            },
            {
                foreground: '5ebfcc',
                token: 'support.function',
            },
            {
                foreground: '9acc76',
                token: 'string',
            },
            {
                foreground: '9acc76',
                token: 'constant.other.symbol',
            },
            {
                foreground: '9acc76',
                token: 'entity.other.inherited-class',
            },
            {
                foreground: 'db9d63',
                token: 'constant.numeric',
            },
            {
                foreground: 'db9d63',
                token: 'none',
            },
            {
                foreground: 'db9d63',
                token: 'none',
            },
            {
                foreground: 'db9d63',
                token: 'constant',
            },
            {
                foreground: 'eb6772',
                token: 'entity.name.tag',
            },
            {
                foreground: 'db9d63',
                token: 'entity.other.attribute-name',
            },
            {
                foreground: 'db9d63',
                token: 'entity.other.attribute-name.id',
            },
            {
                foreground: 'db9d63',
                token: 'punctuation.definition.entity',
            },
            {
                foreground: 'cd74e8',
                token: 'meta.selector',
            },
            {
                foreground: 'db9d63',
                token: 'none',
            },
            {
                foreground: '5cb3fa',
                token: 'markup.heading punctuation.definition.heading',
            },
            {
                foreground: '5cb3fa',
                token: 'entity.name.section',
            },
            {
                foreground: 'db9d63',
                token: 'keyword.other.unit',
            },
            {
                foreground: 'f0c678',
                token: 'markup.bold',
            },
            {
                foreground: 'f0c678',
                token: 'punctuation.definition.bold',
            },
            {
                foreground: 'cd74e8',
                token: 'markup.italic',
            },
            {
                foreground: 'cd74e8',
                token: 'punctuation.definition.italic',
            },
            {
                foreground: '9acc76',
                token: 'markup.raw.inline',
            },
            {
                foreground: 'eb6772',
                token: 'string.other.link',
            },
            {
                foreground: 'eb6772',
                token: 'punctuation.definition.string.end.markdown',
            },
            {
                foreground: 'db9d63',
                token: 'meta.link',
            },
            {
                foreground: 'eb6772',
                token: 'markup.list',
            },
            {
                foreground: 'db9d63',
                token: 'markup.quote',
            },
            {
                foreground: 'adb7c9',
                background: '515151',
                token: 'meta.separator',
            },
            {
                foreground: '9acc76',
                token: 'markup.inserted',
            },
            {
                foreground: 'eb6772',
                token: 'markup.deleted',
            },
            {
                foreground: 'cd74e8',
                token: 'markup.changed',
            },
            {
                foreground: '5ebfcc',
                token: 'constant.other.color',
            },
            {
                foreground: '5ebfcc',
                token: 'string.regexp',
            },
            {
                foreground: '5ebfcc',
                token: 'constant.character.escape',
            },
            {
                foreground: 'c94e42',
                token: 'punctuation.section.embedded',
            },
            {
                foreground: 'c94e42',
                token: 'variable.interpolation',
            },
            {
                foreground: 'ffffff',
                background: 'e05252',
                token: 'invalid.illegal',
            },
            {
                foreground: '2d2d2d',
                background: 'f99157',
                token: 'invalid.broken',
            },
            {
                foreground: '2c323d',
                background: 'd27b53',
                token: 'invalid.deprecated',
            },
            {
                foreground: '2c323d',
                background: '747369',
                token: 'invalid.unimplemented',
            },
            {
                foreground: 'eb6772',
                token: 'source.json                           meta.structure.dictionary.json                              string.quoted.double.json',
            },
            {
                foreground: '9acc76',
                token: 'source.json                       meta.structure.dictionary.json                           meta.structure.dictionary.value.json                       string.quoted.double.json',
            },
            {
                foreground: 'eb6772',
                token: 'source.json                           meta.structure.dictionary.json                          meta.structure.dictionary.value.json                        meta.structure.dictionary.json                      string.quoted.double.json',
            },
            {
                foreground: '9acc76',
                token: 'source.json                       meta.structure.dictionary.json                        meta.structure.dictionary.value.json                       meta.structure.dictionary.json                          meta.structure.dictionary.value.json                            string.quoted.double.json',
            },
            {
                foreground: 'cd74e8',
                token: 'text.html.laravel-blade                        source.php.embedded.line.html                     entity.name.tag.laravel-blade',
            },
            {
                foreground: 'cd74e8',
                token: 'text.html.laravel-blade                         source.php.embedded.line.html                    support.constant.laravel-blade',
            },
            {
                foreground: 'db9d63',
                token: 'source.python meta.function.python meta.function.parameters.python variable.parameter.function.python',
            },
            {
                foreground: '5ebfcc',
                token: 'source.python meta.function-call.python support.type.python',
            },
            {
                foreground: 'cd74e8',
                token: 'source.python keyword.operator.logical.python',
            },
            {
                foreground: 'f0c678',
                token: 'source.python meta.class.python punctuation.definition.inheritance.begin.python',
            },
            {
                foreground: 'f0c678',
                token: 'source.python meta.class.python punctuation.definition.inheritance.end.python',
            },
            {
                foreground: 'db9d63',
                token: 'source.python meta.function-call.python meta.function-call.arguments.python variable.parameter.function.python',
            },
            {
                foreground: 'db9d63',
                token: 'text.html.basic                   source.php.embedded.block.html                             support.constant.std.php',
            },
            {
                foreground: 'f0c678',
                token: 'text.html.basic                              source.php.embedded.block.html                               meta.namespace.php                              entity.name.type.namespace.php',
            },
            {
                foreground: 'db9d63',
                token: 'source.js                              meta.function.js                       support.constant.js',
            },
            {
                foreground: 'cd74e8',
                token: 'text.html.basic`                               source.php.embedded.block.html                        constant.other.php',
            },
            {
                foreground: 'db9d63',
                token: 'text.html.basic                              source.php.embedded.block.html                               support.other.namespace.php',
            },
            {
                foreground: 'adb7c9',
                token: 'text.tex.latex                               meta.function.environment.math.latex                               string.other.math.block.environment.latex                               meta.definition.label.latex                               variable.parameter.definition.label.latex',
            },
            {
                foreground: 'cd74e8',
                fontStyle: ' italic',
                token: 'text.tex.latex                           meta.function.emph.latex                              markup.italic.emph.latex',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                          variable.other.readwrite.js',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                         meta.function-call.with-arguments.js                        variable.function.js',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                            meta.group.braces.round                           meta.group.braces.curly                             meta.function-call.method.without-arguments.js                    variable.function.js',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                            meta.group.braces.round                            meta.group.braces.curly                            variable.other.object.js',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                             meta.group.braces.round                           meta.group.braces.curly                            constant.other.object.key.js                            string.unquoted.label.js',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                       meta.group.braces.round                            meta.group.braces.curly                           constant.other.object.key.js                         punctuation.separator.key-value.js',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                            meta.group.braces.round                           meta.group.braces.curly                           meta.function-call.method.with-arguments.js                 variable.function.js',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                            meta.function-call.method.with-arguments.js                        variable.function.js',
            },
            {
                foreground: 'adb7c9',
                token: 'source.js                       meta.function-call.method.without-arguments.js                       variable.function.js',
            },
        ],
        colors: {
            'editor.foreground': '#6c7079',
            'editor.background': '#2B303B',
            'editor.selectionBackground': '#bbccf51b',
            'editor.inactiveSelectionBackground': '#bbccf51b',
            'editor.lineHighlightBackground': '#8cc2fc0b',
            'editorCursor.foreground': '#528bff',
            'editorWhitespace.foreground': '#747369',
            'editorIndentGuide.background': '#464c55',
            'editorIndentGuide.activeBackground': '#464c55',
            'editor.selectionHighlightBorder': '#bbccf51b',
        },
    };
}
