# Quick Reference

A condensed syntax reference for Luma.

## Keywords

```luma
const      let        if         elif       else
loop       break      continue   return     defer
struct     enum       pub        priv       cast
sizeof     alloc      free       switch     fn
```

## Operators

### Arithmetic
```luma
+   -   *   /   %       // Binary operators
++  --                  // Increment/decrement
```

### Comparison
```luma
==  !=  <  >  <=  >=
```

### Logical
```luma
&&  ||  !
```

### Bitwise
```luma
&   |   ^   ~   <<  >>
```

### Assignment & Access
```luma
=                       // Assignment
.                       // Runtime member access
::                      // Static/compile-time access
[]                      // Array indexing
*                       // Dereference
&                       // Address-of
```

## Primitive Types

```luma
int        // 64-bit signed integer
uint       // 64-bit unsigned integer
float      // 32-bit floating point
double     // 64-bit floating point
bool       // Boolean (true/false)
byte       // 8-bit character
str        // String (alias for *byte)
void       // No value
```

## Compound Types

### Pointers
```luma
*T                      // Pointer to type T
*void                   // Generic pointer
```

### Arrays
```luma
[T; N]                  // Fixed-size array of N elements of type T
```

## Declarations

### Constants
```luma
const NUM: int = 42;
const PI: double = 3.14159;
```

### Variables
```luma
let x: int = 10;
let message: *byte = "Hello";
```

### Functions
```luma
const add -> fn (a: int, b: int) int {
    return a + b;
};

pub const main -> fn () int {
    return 0;
}
```

### Enums
```luma
const Status -> enum {
    Active,
    Inactive,
    Pending,
};
```

### Structs
```luma
const Point -> struct {
    x: int,
    y: int
};

const Player -> struct {
pub:
    name: *byte,
    score: int,
priv:
    id: int
};
```

### Generics (Planned)
```luma
const Box -> struct<T> {
    value: T
};

const max = fn<T>(a: T, b: T) T {
    if (a > b) { return a; }
    return b;
};
```

## Control Flow

### If-Elif-Else
```luma
if (condition) {
    // ...
} elif (other_condition) {
    // ...
} else {
    // ...
}
```

### Loops
```luma
// For-style loop
loop [i: int = 0](i < 10) : (++i) {
    // ...
}

// While-style loop
loop (condition) {
    // ...
}

// Infinite loop
loop {
    if (done) { break; }
}
```

### Switch
```luma
switch (value) {
    case1, case2 => action1();
    case3 => action2();
    _ => default_action();
}
```

## Modules

### Declaration
```luma
@module "modulename"
```

### Import
```luma
@use "math" as math
@use "string" as str
```

### Access
```luma
math::sqrt(25.0)        // Static access
point.x                 // Runtime access
```

## Memory Management

### Allocation
```luma
let ptr: *int = cast<*int>(alloc(sizeof<int>));
```

### Deallocation
```luma
free(ptr);
```

### Defer
```luma
defer free(ptr);        // Executes at scope end
defer {
    cleanup();
    close_file();
}
```

### Ownership Attributes
```luma
#returns_ownership
const create -> fn () *int {
    return cast<*int>(alloc(sizeof<int>));
}

#takes_ownership
const consume -> fn (ptr: *int) void {
    free(ptr);
}
```

## Built-in Functions

```luma
output(...)             // Print without newline
outputln(...)           // Print with newline
input<T>(prompt)        // Read typed input
system(command)         // Execute shell command
sizeof<T>               // Get type size
alloc(size)             // Allocate memory
free(ptr)               // Free memory
cast<T>(value)          // Type conversion
```

## Common Patterns

### Basic Program
```luma
@module "main"

pub const main -> fn () int {
    outputln("Hello, World!");
    return 0;
}
```

### Memory Allocation
```luma
let ptr: *T = cast<*T>(alloc(sizeof<T>));
defer free(ptr);
```

### Array Iteration
```luma
loop [i: int = 0](i < size) : (++i) {
    array[i] = value;
}
```

### Error Checking
```luma
if (ptr == cast<*T>(0)) {
    return ERROR_CODE;
}
```

### String from Int
```luma
@use "string" as string

let s: *byte = string::from_int(42);
defer free(s);
```

### File Pattern
```luma
const process -> fn () int {
    let file: *File = open("data.txt");
    defer close(file);
    
    let buffer: *byte = cast<*byte>(alloc(1024));
    defer free(buffer);
    
    // Process...
    
    return 0;
}
```

## Type Casting Examples

```luma
// Numeric
let i: int = 42;
let f: float = cast<float>(i);

// Pointer
let raw: *void = alloc(100);
let typed: *int = cast<*int>(raw);

// Pointer to int
let addr: int = cast<int>(ptr);
let ptr2: *T = cast<*T>(addr + offset);
```

## String Operations

```luma
@use "string" as string

let len: int = string::strlen("hello");
let num: *byte = string::from_int(42);
let ch: *byte = string::from_byte('X');
```

## Terminal Colors

```luma
@use "termfx" as fx

output(fx::RED, "Error", fx::RESET, "\n");
output(fx::GREEN, fx::BOLD, "Success", fx::RESET, "\n");
```

## Operator Precedence

From highest to lowest:
1. `()` `[]` `.` `::`
2. `!` `~` `*` (dereference) `&` (address-of) `++` `--`
3. `*` `/` `%`
4. `+` `-`
5. `<<` `>>`
6. `<` `<=` `>` `>=`
7. `==` `!=`
8. `&` (bitwise AND)
9. `^`
10. `|`
11. `&&`
12. `||`
13. `=`

---

[Back to Documentation](../README.md)
