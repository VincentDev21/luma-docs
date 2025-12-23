# Type System

Luma provides a straightforward type system with both primitive and compound types.

## Contents

- [Primitive Types](type-system/primitives.md) - Basic built-in types
- [Enumerations](type-system/enums.md) - Type-safe constants
- [Structures](type-system/structs.md) - Grouping related data
- [Generics](type-system/generics.md) - Type parameters and templates

## Overview

Luma's type system is designed to be:

- **Strong**: No implicit conversions that lose information
- **Static**: All types known at compile time
- **Explicit**: Clear type annotations required
- **Safe**: Compile-time checks prevent common errors

## Type Categories

### Primitive Types
- Integers: `int`, `uint`
- Floating-point: `float`, `double`
- Boolean: `bool`
- Character: `byte`
- String: `str`

### Compound Types
- **Enums**: Named constants with type safety
- **Structs**: Grouped data with methods
- **Pointers**: References to memory locations
- **Arrays**: Fixed-size collections

### Generic Types
- Type parameters: `<T>`, `<T, U>`
- Monomorphization: Zero-cost generic instantiation
