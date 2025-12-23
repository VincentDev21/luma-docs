# Variables and Mutability

Luma has a clear distinction between top-level constants and local variables.

## Top-Level Bindings with `const`

Use `const` for all top-level declarations:

```luma
const NUM: int = 42;                                  // Immutable variable
const Direction -> enum { North, South, East, West };  // Enum definition
const Point -> struct { x: int, y: int };              // Struct definition
const add -> fn (a: int, b: int) int {                 // Function definition
    return a + b; 
};
```

### Why `const` for Everything?

**Unified syntax**: One parsing rule handles all top-level declarations, simplifying both the compiler and developer experience.

**Semantic clarity**: The binding itself is immutable—you cannot reassign or shadow a top-level `const`.

**Compiler optimization**: Immutable bindings enable better optimization opportunities.

### Important Notes

```luma
const x: int = 5;
x = 10; // Error: `x` is immutable

const add -> fn (a: int, b: int) int { return a + b; };
add = something_else; // Error: cannot reassign function binding
```

## Local Variables with `let`

Inside functions, use `let` to declare local variables:

```luma
const main -> fn () int {
    let x: int = 10;        // Mutable local variable
    x = 20;                 // Can be reassigned
    
    let y: int = 5;
    y = y + 1;              // Can be modified
    
    let counter: int = 0;
    loop (counter < 10) {
        counter = counter + 1;  // Mutating in loop
    }
    
    return 0;
}
```

## Type Annotations

Type annotations are required for clarity:

```luma
let x: int = 42;              // Explicit type
let message: *byte = "Hello"; // String type
let pi: float = 3.14159;      // Float type
let is_valid: bool = true;    // Boolean type
```

## Variable Initialization

Variables can be declared without immediate initialization:

```luma
const main -> fn () int {
    let x: int;           // Declared but not initialized
    x = 10;               // Later initialization
    
    let result: int;
    if (some_condition) {
        result = 100;
    } else {
        result = 200;
    }
    
    outputln(result);
    return 0;
}
```

## Scope and Lifetime

Variables are scoped to their containing block:

```luma
const main -> fn () int {
    let x: int = 10;
    
    {
        let y: int = 20;
        outputln(x + y);  // Both x and y visible
    }
    
    // outputln(y);  // Error: y not in scope
    
    return 0;
}
```

## Key Differences

| Feature | `const` (Top-Level) | `let` (Local) |
|---------|-------------------|---------------|
| **Location** | Module/file level | Inside functions |
| **Mutability** | Immutable binding | Mutable variable |
| **Reassignment** | ❌ Not allowed | ✅ Allowed |
| **Scope** | Module-wide | Block-scoped |
| **Use Case** | Functions, types, constants | Local computation |

---

Next: [Functions](functions.md)
