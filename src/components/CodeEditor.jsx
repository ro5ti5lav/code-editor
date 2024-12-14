import React, { useState } from 'react';
import Editor from "@monaco-editor/react";

const CodeEditor = () => {
    const defaultCode = {
        python: '# Введите ваш Python код здесь\nprint("Привет, мир!")',
        go: `// Введите ваш Go код здесь
package main

import "fmt"

func main() {
    fmt.Println("Привет, мир!")
}`
    };

    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(defaultCode['python']);
    const [output, setOutput] = useState('');

    const validatePythonCode = (code) => {
        if (!code.trim()) {
            throw new Error('Пустой код');
        }

        if (code.includes('print(') && !code.includes(')')) {
            throw new Error('Незакрытая скобка в print()');
        }

        const assignments = code.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*.+$/gm);
        if (assignments) {
            assignments.forEach(assignment => {
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*.+$/.test(assignment.trim())) {
                    throw new Error('Некорректное присваивание: ' + assignment);
                }
            });
        }
    };

    const validateGoCode = (code) => {
        if (!code.trim()) {
            throw new Error('Пустой код');
        }

        if (!code.includes('package main')) {
            throw new Error('Ошибка: отсутствует объявление "package main"');
        }

        if (!code.includes('import')) {
            throw new Error('Ошибка: отсутствуют импорты');
        }

        if (!code.includes('fmt.Println(')) {
            throw new Error('Код должен содержать хотя бы одну команду fmt.Println()');
        }

        if (code.includes('strings.Repeat')) {
            const hasStringsImport = code.includes('import "strings"') ||
                code.includes('import (\n    "strings"') ||
                code.includes('import (\n\t"strings"');
            if (!hasStringsImport) {
                throw new Error(`Для использования strings.Repeat добавьте импорт:
import "strings"

или в блоке импортов:
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
        setOutput('Выполняется...');

        setTimeout(() => {
            try {
                if (!code.trim()) {
                    throw new Error('Ошибка: пустой код');
                }

                if (language === 'python' && !code.includes('print(')) {
                    throw new Error('Ошибка: код должен содержать хотя бы одну команду print()');
                }

                if (language === 'go' && !code.includes('package main')) {
                    throw new Error('Ошибка: код Go должен начинаться с "package main"');
                }

                const result = executeCode(code, language);
                setOutput(`=== Результат выполнения ===\n${result}\n[Программа выполнена успешно]`);
            } catch (error) {
                setOutput(`❌ ОШИБКА ВЫПОЛНЕНИЯ ❌\n\n${error.message}\n\nПожалуйста, исправьте код и попробуйте снова.`);
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
                    Запустить код
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