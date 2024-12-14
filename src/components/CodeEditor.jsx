import React, { useState } from 'react';
import Editor from "@monaco-editor/react";

const CodeEditor = () => {
    const defaultCode = {
        python: '# Enter your Python code here\nprint("Hello, World!")',
        go: `// Enter your Go code here
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`
    };

    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(defaultCode['python']);
    const [output, setOutput] = useState('');

    const validatePythonCode = (code) => {
        if (!code.trim()) {
            throw new Error('Empty code');
        }

        if (code.includes('print(') && !code.includes(')')) {
            throw new Error('Unclosed parenthesis in print()');
        }

        const assignments = code.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*.+$/gm);
        if (assignments) {
            assignments.forEach(assignment => {
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*.+$/.test(assignment.trim())) {
                    throw new Error('Invalid assignment: ' + assignment);
                }
            });
        }
    };

    const validateGoCode = (code) => {
        if (!code.trim()) {
            throw new Error('Empty code');
        }

        if (!code.includes('package main')) {
            throw new Error('Error: missing "package main" declaration');
        }

        if (!code.includes('import')) {
            throw new Error('Error: missing imports');
        }

        if (!code.includes('fmt.Println(')) {
            throw new Error('Code must contain at least one fmt.Println() command');
        }

        if (code.includes('strings.Repeat')) {
            const hasStringsImport = code.includes('import "strings"') ||
                code.includes('import (\n    "strings"') ||
                code.includes('import (\n\t"strings"');
            if (!hasStringsImport) {
                throw new Error(`To use strings.Repeat add import:
import "strings"

or in import block:
import (
    "fmt"
    "strings"
)`);
            }
        }
    };

    const executeCode = (code, language) => {
        if (language === 'python') {
            validatePythonCode(code);
            try {
                let context = {};

                const assignments = code.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*.+$/gm);
                if (assignments) {
                    assignments.forEach(assignment => {
                        const [variable, valueExpr] = assignment.split('=').map(s => s.trim());

                        if (valueExpr.startsWith('"') || valueExpr.startsWith("'")) {
                            context[variable] = valueExpr.slice(1, -1);
                        }
                        else if (!isNaN(valueExpr)) {
                            context[variable] = Number(valueExpr);
                        }
                    });
                }

                let output = '';
                const printStatements = code.match(/print\((.*?)\)/g);
                if (printStatements) {
                    printStatements.forEach(statement => {
                        const expr = statement.match(/print\((.*)\)/)[1].trim();

                        if (expr.includes('*')) {
                            const [strPart, numPart] = expr.split('*').map(s => s.trim());
                            const str = context[strPart] || strPart.replace(/^["'](.*)["']$/, '$1');
                            const num = context[numPart] || parseInt(numPart);
                            output += str.repeat(num) + '\n';
                        }
                        else {
                            if (context.hasOwnProperty(expr)) {
                                output += context[expr] + '\n';
                            } else {
                                output += expr.replace(/^["'](.*)["']$/, '$1') + '\n';
                            }
                        }
                    });
                }
                return output || 'Программа выполнена, но нет вывода';
            } catch (error) {
                throw new Error(`Ошибка выполнения: ${error.message}`);
            }
        }
        else if (language === 'go') {
            validateGoCode(code);
            try {
                let context = {};

                const assignments = code.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:=\s*(.+)$/gm);
                if (assignments) {
                    assignments.forEach(assignment => {
                        const [, variable, valueExpr] = assignment.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:=\s*(.+)/);

                        if (valueExpr.trim().startsWith('"') || valueExpr.trim().startsWith("'")) {
                            context[variable] = valueExpr.trim().slice(1, -1);
                        }
                        else if (!isNaN(valueExpr)) {
                            context[variable] = Number(valueExpr);
                        }
                    });
                }

                let output = '';
                const printStatements = code.match(/fmt\.Println\((.*?)\)/g);
                if (printStatements) {
                    printStatements.forEach(statement => {
                        const expr = statement.match(/fmt\.Println\((.*)\)/)[1].trim();

                        if (expr.includes('strings.Repeat')) {
                            const repeatMatch = expr.match(/strings\.Repeat\("([^"]+)",\s*(\d+)\)/);
                            if (repeatMatch) {
                                const [, str, count] = repeatMatch;
                                output += str.repeat(parseInt(count)) + '\n';
                            }
                        }
                        else if (context.hasOwnProperty(expr)) {
                            output += context[expr] + '\n';
                        }
                        else {
                            output += expr.replace(/^["'](.*)["']$/, '$1') + '\n';
                        }
                    });
                }
                return output || 'Программа выполнена, но нет вывода';
            } catch (error) {
                throw new Error(`Ошибка выполнения: ${error.message}`);
            }
        }
    };

    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        setLanguage(newLang);
        setCode(defaultCode[newLang]);
    };

    const handleEditorChange = (value) => {
        setCode(value);
    };

    const handleRunCode = () => {
        setOutput('Executing...');

        setTimeout(() => {
            try {
                if (!code.trim()) {
                    throw new Error('Error: empty code');
                }

                if (language === 'python' && !code.includes('print(')) {
                    throw new Error('Error: code must contain at least one print() command');
                }

                if (language === 'go' && !code.includes('package main')) {
                    throw new Error('Error: Go code must start with "package main"');
                }

                const result = executeCode(code, language);
                setOutput(`=== Execution Result ===\n${result}\n[Program executed successfully]`);
            } catch (error) {
                setOutput(`❌ EXECUTION ERROR ❌\n\n${error.message}\n\nPlease fix the code and try again.`);
            }
        }, 500);
    };

    return (
        <div className="container">
            <div className="controls">
                <select
                    className="language-select"
                    value={language}
                    onChange={handleLanguageChange}
                >
                    <option value="python">Python</option>
                    <option value="go">Go</option>
                </select>
                <button className="run-button" onClick={handleRunCode}>
                    Run Code
                </button>
            </div>

            <div className="editor-container">
                <Editor
                    height="100%"
                    language={language}
                    value={code || defaultCode[language]}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        automaticLayout: true
                    }}
                />
            </div>

            <div className="output">
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default CodeEditor; 