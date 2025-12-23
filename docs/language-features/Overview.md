# Language Features

Core features of the Luma programming language.

## Contents

- [Variables and Mutability](language-features/variables.md) - Declaration and modification
- [Functions](language-features/functions.md) - Function definitions and calls
- [Control Flow](language-features/control-flow.md) - Conditionals and loops
- [Switch Statements](language-features/switch.md) - Pattern matching
- [Module System](language-features/modules.md) - Code organization

## Overview

Luma provides a clean set of language features designed for clarity and safety:

### Declaration System
- `const` for top-level bindings (immutable)
- `let` for local variables (mutable)
- `pub` for public visibility

### Control Structures
- `if`/`elif`/`else` for branching
- `loop` for iteration
- `switch` for pattern matching
- `break`/`continue` for loop control

### Module Organization
- `@module` to declare modules
- `@use` to import modules
- `::` for static/compile-time access
- `.` for runtime member access
