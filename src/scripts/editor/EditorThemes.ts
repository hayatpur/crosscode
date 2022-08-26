export function getLightTheme() {
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
    }
}

export function getDarkTheme() {
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
                foreground: '6b6b6b',
                token: 'comment',
            },
            {
                foreground: '6b6b6b',
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
                foreground: 'f97583',
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
                foreground: 'f97583',
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
                foreground: 'f97583',
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
                foreground: 'f97583',
                token: 'markup.italic',
            },
            {
                foreground: 'f97583',
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
                foreground: 'f97583',
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
                foreground: 'f97583',
                token: 'text.html.laravel-blade                        source.php.embedded.line.html                     entity.name.tag.laravel-blade',
            },
            {
                foreground: 'f97583',
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
                foreground: 'f97583',
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
                foreground: 'f97583',
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
                foreground: 'f97583',
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
    }
}

export function getDawnTheme() {
    return {
        base: 'vs',
        inherit: true,
        rules: [
            {
                background: 'FFFFFF',
                token: '',
            },
            {
                background: 'e2e9ff5e',
                token: 'text.html source.active4d',
            },
            {
                foreground: '000000',
                token: 'text.xml',
            },
            {
                foreground: 'af82d4',
                token: 'comment.line',
            },
            {
                foreground: 'af82d4',
                token: 'comment.block',
            },
            {
                foreground: '666666',
                token: 'string',
            },
            {
                foreground: '66ccff',
                fontStyle: 'bold',
                token: 'string.interpolated variable',
            },
            {
                foreground: 'a8017e',
                token: 'constant.numeric',
            },
            {
                foreground: '66ccff',
                fontStyle: 'bold',
                token: 'constant.other.date',
            },
            {
                foreground: '66ccff',
                fontStyle: 'bold',
                token: 'constant.other.time',
            },
            {
                foreground: 'a535ae',
                token: 'constant.language',
            },
            {
                foreground: '6392ff',
                fontStyle: 'bold',
                token: 'variable.other.local',
            },
            {
                foreground: '0053ff',
                fontStyle: 'bold',
                token: 'variable',
            },
            {
                foreground: '6988ae',
                token: 'variable.other.table-field',
            },
            {
                foreground: '006699',
                fontStyle: 'bold',
                token: 'keyword',
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
                foreground: '7a7a7a',
                token: 'meta.tag',
            },
            {
                foreground: '016cff',
                token: 'entity.name.tag',
            },
            {
                foreground: '963dff',
                token: 'entity.other.attribute-name',
            },
            {
                foreground: '45ae34',
                fontStyle: 'bold',
                token: 'support.function',
            },
            {
                foreground: 'b7734c',
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
                foreground: 'ffffff',
                background: '656565',
                token: 'meta.diff',
            },
            {
                foreground: 'ffffff',
                background: '1b63ff',
                token: 'meta.diff.range',
            },
            {
                foreground: '000000',
                background: 'ff7880',
                token: 'markup.deleted.diff',
            },
            {
                foreground: '000000',
                background: '98ff9a',
                token: 'markup.inserted.diff',
            },
            {
                foreground: '5e5e5e',
                token: 'source.diff',
            },
        ],
        colors: {
            'editor.foreground': '#3B3B3B',
            'editor.background': '#FFFFFF',
            'editor.selectionBackground': '#BAD6FD',
            'editor.lineHighlightBackground': '#00000012',
            'editorCursor.foreground': '#000000',
            'editorWhitespace.foreground': '#BFBFBF',
        },
    }
}
