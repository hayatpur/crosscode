import * as acorn from "acorn";
import * as walk from "acorn-walk";
import * as ESTree from "estree";

export class Compiler {
    /**
     * Inject the code to send the program state back to the main thread after every line.
     */
    static compile(code) {
        // Construct AST
        let ast = null;

        try {
            ast = acorn.parse(code, { locations: true, ecmaVersion: 2017 });
        } catch (e) {
            return { status: "error", data: e };
        }

        // Get variable names
        const variables = Compiler.variables(ast);

        // Figure out places to inject the code
        const injections = Compiler.injections(ast, variables);

        // Augment the code with those injections
        let lines = code.split("\n");
        for (const injection of injections) {
            lines = injection(lines);
        }

        code = lines.join("\n");

        let main = `
        let __memoryMap = new WeakMap();
        let __objectCount = 0;
        let __sectionId = 0;

        
        function __objectId(object, name) {
            if (!__memoryMap.has(object)) __memoryMap.set(object, ++__objectCount);
            return __memoryMap.get(object);
        }
        function __valueReferences(value, name) {
            let type = typeof value;
            if (type == "object" && Array.isArray(value)) type = "array";
            if (type == "array") {
                return {value: value.map((item, i) => __valueReferences(item, name + "[" + i.toString() + "]")), reference: __objectId(value)};
            } else if (type == "function") {
                return {value: value.toString().split(')')[0] + ')', reference: __objectId(value)};
            }
            else {
                return { value };
            }
        }
        let __state = {};
        let __path = [];
        let __funcPath = [];

        function main() {
            ${code}
            return;
        }
        try {
            main();
        } catch (e) {
            postMessage(JSON.stringify({type: 'error', data: e.toString()}))
        }
        postMessage(JSON.stringify({type: 'finished'}));
        `;

        code = `
        (() => {
            // Rebind console log to send data instead
            console.stdlog = console.log.bind(console);
            console.logs = [];
            console.log = function () {
              console.stdlog.apply(console, arguments);
              const msg = JSON.stringify({type: 'log', text: arguments});
              postMessage(msg);
            };
            onmessage = () => {
                ${main}
            };
        })();`;

        return {
            status: "success",
            data: { code },
        };
    }

    static variables(ast: acorn.Node) {
        let variables = [];

        walk.simple(ast, {
            VariableDeclarator(node) {
                const variable = <ESTree.VariableDeclarator>(<any>node);
                const id = <ESTree.Identifier>variable.id;
                variables.push({
                    name: id.name,
                    start: id.loc.start,
                    end: id.loc.end,
                });
            },
            FunctionDeclaration(node) {
                const func = <ESTree.FunctionDeclaration>(<any>node);
                const id = <ESTree.Identifier>func.id;

                variables.push(
                    ...func.params.map((param: ESTree.Identifier) => ({
                        name: param.name,
                        start: param.loc.start,
                        end: param.loc.end,
                    }))
                );

                variables.push({
                    name: id.name,
                    start: id.loc.start,
                    end: id.loc.end,
                });
            },
        });

        return variables;
    }

    static injections(node: any, variables: any[]) {
        let injections = [];

        const capturer = (i: number, node: any, popLastPath: boolean = false) =>
            `(() => {
                ${variables
                    .map(
                        v =>
                            `try {
                                let value = __valueReferences(${v.name}, "${v.name}");
                                __state['${v.name}'] = value;
                            } 
                            catch(e) {
                                __state['${v.name}'] = undefined;
                            };`
                    )
                    .join(";")}
                postMessage(JSON.stringify({type: 'meta', line: ${i}, state: __state, path: ${
                popLastPath ? "__path.slice(0,-1)" : "__path"
            }, sectionId: __sectionId, ast: ${JSON.stringify(node)}}));
                return true;
            }) ()`;

        const els = traverse(node);

        const pre_mapping = {
            ReturnStatement: (el, lines) => {
                lines[el.loc.start.line - 1] = `${capturer(el.loc.start.line, el)};__path=[...__funcPath];${
                    lines[el.loc.start.line - 1]
                }`;

                return lines;
            },
        };

        const mapping = {
            Program: (el, lines) => {
                lines[el.loc.start.line - 1] = `;\n${capturer(el.loc.start.line, el)};\n${
                    lines[el.loc.start.line - 1]
                };`;
                return lines;
            },
            VariableDeclaration: (el, lines) => {
                lines[el.loc.start.line - 1] = `;${lines[el.loc.start.line - 1]};\n${capturer(
                    el.loc.start.line,
                    el
                )};\n`;
                return lines;
            },
            ExpressionStatement: (el, lines) => {
                lines[el.loc.start.line - 1] = `;${lines[el.loc.start.line - 1]};\n${capturer(
                    el.loc.start.line,
                    el
                )};\n`;
                return lines;
            },
            // Comment: (el, lines) => {
            //     lines[el.loc.start.line - 1] = `;${lines[el.loc.start.line - 1]};\n${capturer(el.loc.start.line, el)}\n`;
            //     return lines;
            // },
            IfStatement: (el, lines) => {
                const start = el.loc.start.line;
                const end = el.loc.end.line;

                const bracket_i = lines[start - 1].lastIndexOf("(");

                // Update
                lines[start - 1] =
                    lines[start - 1].slice(0, bracket_i + 1) +
                    ` ${capturer(start, el, lines[start - 1].includes("else") ? false : true)} && ` +
                    lines[start - 1].slice(bracket_i + 1);

                if (!lines[start - 1].includes("else")) {
                    lines[start - 1] = `__path.push(${start});${lines[start - 1]};`;
                    lines[end - 1] = `${lines[end - 1]};__path.pop();`;
                }

                return lines;
            },
            BlockStatement: (el, lines) => {
                lines[el.loc.start.line] = `;\n${capturer(el.loc.start.line, el)};__path.push(${el.loc.start.line});\n${
                    lines[el.loc.start.line]
                }`;
                lines[el.loc.end.line - 2] = `${lines[el.loc.end.line - 2]};__path.pop();`;

                return lines;
            },
            WhileStatement: (el, lines) => {
                const start = el.loc.start.line;
                const end = el.loc.end.line;

                const bracket_i = lines[start - 1].indexOf("(");

                // Update
                lines[start - 1] =
                    lines[start - 1].slice(0, bracket_i + 1) +
                    ` ${capturer(start, { ...el, type: "WhileStatementIteration" })} && ` +
                    lines[start - 1].slice(bracket_i + 1);

                lines[start - 1] = `;${capturer(start, el)};__path.push(${start});${
                    lines[start - 1]
                };__path.push(${start});`;
                lines[end - 1] = `;__path.pop();${lines[end - 1]};__path.pop;`;

                return lines;
            },
            ForStatement: (el, lines) => {
                const start = el.loc.start.line;
                const end = el.loc.end.line;

                const openingBracket = lines[start - 1].indexOf("(");
                const closingBracket = lines[start - 1].indexOf(")");
                const forStmts = lines[start - 1].slice(openingBracket + 1, closingBracket).split(";");

                forStmts[1] = `${capturer(start, { ...el, type: "ForStatementIteration" })} && ${forStmts[1]}`;
                forStmts[2] = `(${forStmts[2]}, ${capturer(start, { ...el, type: "ForStatementIncrement" })})`;

                lines[start - 1] = `;for(${forStmts.join(";")}) {`;

                lines[start - 1] = `;${capturer(start, el)};__path.push(${start});${
                    lines[start - 1]
                };__path.push(${start});`;
                lines[end - 1] = `;__path.pop();${lines[end - 1]};__path.pop();`;

                return lines;
            },
            FunctionDeclaration: (el, lines) => {
                const start = el.loc.start.line;
                const end = el.loc.end.line;

                lines[start] = `;\n${capturer(start, {
                    ...el,
                    type: "FunctionStatement",
                })};__funcPath=[...__path];__path.push(${start});\n${lines[start]}`;
                lines[end - 1] = `;__path.pop();${lines[end - 1]};`;

                return lines;
            },
            CallExpression: (el, lines) => {
                const start = el.loc.start.line - 1;

                const funcStart = lines[start].indexOf(`${el.callee.name}(`);

                const funcEnd = funcStart + lines[start].slice(funcStart).indexOf(")");

                const injected = `(${capturer(start, { ...el, type: "FloatingExpressionStatement" })}, ${lines[
                    start
                ].slice(funcStart, funcEnd + 1)})`;

                lines[start] = `${lines[start].slice(0, funcStart)}${injected}${lines[start].slice(funcEnd + 1)}`;

                return lines;
            },
        };

        els.forEach(el => {
            if (el != null && pre_mapping[el.type] != null) {
                injections.push(lines => pre_mapping[el.type](el, lines));
            }
        });

        els.forEach(el => {
            if (el != null && mapping[el.type] != null) {
                injections.push(lines => mapping[el.type](el, lines));
            }
        });

        return injections;
    }

    // static injections(node, injections = []) {
    //     switch (node.type) {
    //         "Program":
    //         ...
    // }
}

function traverse(ast) {
    const list = [ast];
    const els = [];

    while (list.length != 0) {
        const el = list.pop();

        for (const key in el) {
            const child = el[key];
            const iterable = typeof child == "object";
            if (iterable && key != "loc") {
                list.push(child);
            }
        }

        els.push(el);
    }

    return els.reverse();
}
