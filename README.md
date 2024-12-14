# Online Code Editor

A simple online code editor with Python and Go support.

## Functionality

- Code editor with syntax highlighting
- Python and Go support
- Code execution on simulated server
- Results display

## Application Extension Options

### Editor Functionality
- Adding support for other programming languages (JavaScript, Java, C++)
- Code completion
- Code formatting
- Real-time error highlighting
- Saving code change history

### Code Execution
- Adding support for loops and conditional operators
- Implementation of functions and classes
- Basic module import support
- Adding interactive data input
- Results visualization (graphs, tables)

### Interface
- Adding dark/light theme
- Font size and other editor parameter settings
- Adding split mode for simultaneous work with multiple files
- Adding a panel with code examples
- Integration with snippet saving system

### Collaboration
- Adding code sharing via URL
- Implementation of collaborative editing mode
- Adding code comments
- Version control system

### Security
- Adding authentication system
- Code execution time limits
- Resource usage control
- Protection against malicious code

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```
3. Start the project:
```bash
npm start
```

## Technologies

- React
- Monaco Editor

## Functionality Limitations

### Python
- Only basic output through print() is supported
- Works only with simple data types (strings and numbers)
- Supported operations:
  - Variable assignment
  - String multiplication by number (string * n)
- Not supported:
  - Loops and conditional operators
  - Functions and classes
  - Module imports
  - File operations

### Go
- Only basic output through fmt.Println() is supported
- Works only with simple data types (strings and numbers)
- Supported operations:
  - Variable assignment using :=
  - String multiplication using strings.Repeat()
- Not supported:
  - Loops and conditional operators
  - Functions (except main)
  - Package imports (except fmt and strings)
  - Working with goroutines and channels
