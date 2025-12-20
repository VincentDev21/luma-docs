# Luma Language Documentation

Luma is a statically typed, compiled programming language designed for systems programming. It combines the low-level control of C with a strong type system and modern safety features that eliminate many common runtime errors.

Luma is built on three core principles:

- **Simplicity**: Minimal syntax with consistent patterns
- **Safety**: Strong typing and memory safety features
- **Performance**: Zero-cost abstractions and predictable performance

---

## Quick Start

Here's a complete Luma program that demonstrates the core language features:

```luma
@module "main"

const Point -> struct {
    x: int,
    y: int,
    
    distance_to -> fn (other: Point) float {
        let dx: int = other.x - x;
        let dy: int = other.y - y;
        return sqrt(cast(dx * dx + dy * dy));
    }
};

const Status -> enum {
    Active,
    Inactive,
    Pending,
};

pub const main -> fn () int {
    let origin: Point = Point { x: 0, y: 0 };
    let destination: Point = Point { x: 3, y: 4 };
    let current_status: Status = Status::Active;
    
    outputln("Distance: ", origin.distance_to(destination));
    
    switch (current_status) {
        Status::Active => outputln("System is running");
        Status::Inactive => outputln("System is stopped");
        Status::Pending => outputln("System is starting");
    }
    
    return 0;
}
```

This example shows:
- Module declaration with `@module`
- Struct definitions with methods
- Enum definitions
- Static access with `::` for enum variants
- Runtime access with `.` for struct members
- Function definitions and calls
- Switch statements with pattern matching

---

## Type System

Luma provides a straightforward type system with both primitive and compound types.

### Primitive Types
```
int      - Signed integer (64-bit)
float    - Floating point (32-bit)
double   - Floating point (64-bit)
bool     - Boolean (1 byte)
byte     - Single byte (1 byte)
*byte    - Character pointer / C-style string
void     - No value (used for function return types and generic pointers)
```

**Note on String Types:**
- String literals like `"hello"` are of type `*byte` (null-terminated character arrays)
- All string operations in the standard library use `*byte`
- There is no separate `str` type in Luma

### Type Modifiers & Operators
```
*T       - Pointer type (declares a pointer to type T)
[T; N]   - Array type (fixed-size array of N elements of type T)
```

**Pointer Operators:**
```
*expr    - Dereference operator (access value pointed to)
&expr    - Address-of operator (get pointer to value)
```

**Example:**
```luma
let x: int = 42;           // x is an int
let ptr: *int = &x;        // ptr is a pointer to int, holds address of x
let value: int = *ptr;     // value is 42 (dereferenced ptr)
```

### Enumerations

Enums provide type-safe constants with underlying integer values:
```luma
const Direction -> enum {
    North,    // = 0
    South,    // = 1
    East,     // = 2
    West      // = 3
};

const current_direction: Direction = Direction::North;

// Can cast to int if needed
let dir_value: int = cast<int>(Direction::North);  // 0
```

### Structures

Structures group related data with optional access control:
```luma
const Point -> struct {
    x: int,
    y: int
};

// With explicit access modifiers and methods
const Player -> struct {
pub:
    name: *byte,
    score: int,
priv:
    internal_id: int,
    
    // Methods can be defined inside structs
    get_info -> fn () void {
        outputln("Player: ", name, " Score: ", score);
    }
};
```

### Using Types
```luma
const origin: Point = Point { x: 0, y: 0 };

const player: Player = Player { 
    name: "Alice", 
    score: 100,
    internal_id: 12345 
};

// Access fields
outputln(origin.x);           // 0
outputln(player.name);        // Alice

// Call methods
player.get_info();            // Player: Alice Score: 100
```

### Type Compatibility
```luma
// Same types
let x: int = 42;
let y: int = x;  // OK

// Different types require explicit cast
let f: float = cast<float>(x);  // OK
let z: int = f;  // ERROR: must use cast<int>(f)

// Pointer type safety
let int_ptr: *int = &x;
let void_ptr: *void = cast<*void>(int_ptr);  // Explicit cast required
```

See [Type Casting System](#type-casting-system) for full details on conversions.

---

---

## Generics (Not yet supported)

Luma supports generic programming through templates, enabling you to write code that works with multiple types while maintaining type safety and zero-cost abstractions.

### Generic Functions

Generic functions are declared with type parameters in angle brackets `<>` after the `fn` keyword:

```luma
const add = fn<T>(a: T, b: T) T { 
    return a + b; 
}

const swap = fn<T>(a: *T, b: *T) void {
    let temp: T = *a;
    *a = *b;
    *b = temp;
}

const max = fn<T>(a: T, b: T) T {
    if (a > b) {
        return a;
    }
    return b;
}
```

### Using Generic Functions

Generic functions require **explicit type arguments** at the call site:

```luma
const main = fn() int {
    // Integer arithmetic
    outputln("add(1, 2) = ", add<int>(1, 2));
    
    // Floating-point arithmetic
    outputln("add(1.5, 2.5) = ", add<float>(1.5, 2.5));

    // Swapping integers
    let x: int = 5; 
    let y: int = 10;
    swap<int>(&x, &y);
    outputln("After swap: x = ", x, ", y = ", y);
    
    // Finding maximum
    let largest: int = max<int>(42, 17);
    outputln("Max: ", largest);
    
    return 0;
}
```

### Generic Structs

Structs can also be generic, allowing you to create container types and data structures that work with any type:

```luma
const Box -> struct<T> {
    value: T,
    
    get = fn() T {
        return value;
    },
    
    set = fn(new_value: T) void {
        value = new_value;
    }
};

const Pair -> struct<T, U> {
    first: T,
    second: U
};

// Usage
const main = fn() int {
    // Box holding an integer
    let int_box: Box<int> = Box { value: 42 };
    outputln("Box contains: ", int_box.get());
    
    // Box holding a float
    let float_box: Box<float> = Box { value: 3.14 };
    
    // Pair with different types
    let pair: Pair<int, str> = Pair { 
        first: 1, 
        second: "hello" 
    };
    outputln("Pair: (", pair.first, ", ", pair.second, ")");
    
    return 0;
}
```

### Monomorphization

Luma uses **monomorphization** for generic code generation. This means:

- The compiler generates **separate machine code** for each concrete type used
- Generic code has **zero runtime overhead** compared to hand-written type-specific code
- Each instantiation (e.g., `add<int>`, `add<float>`) produces its own optimized assembly
- Similar to C++ templates and Rust generics, not Java's type erasure

**Example:**

```luma
const identity = fn<T>(x: T) T {
    return x;
}

// These calls generate separate functions in the compiled binary:
let a: int = identity<int>(42);        // Generates identity_int
let b: float = identity<float>(3.14);  // Generates identity_float
let c: str = identity<str>("hello");   // Generates identity_str
```

---

## Top-Level Bindings with `const`

Luma uses the `const` keyword as a **unified declaration mechanism** for all top-level bindings. Whether you're declaring variables, functions, types, or enums, `const` provides a consistent syntax that enforces immutability at the binding level.

### Basic Syntax

```luma
const NUM: int = 42;                                  // Immutable variable
const Direction -> enum { North, South, East, West };  // Enum definition
const Point -> struct { x: int, y: int };              // Struct definition
const Box -> struct<T> { value: T };                   // Generic struct
const add -> fn (a: int, b: int) int {                 // Function definition
    return a + b; 
};
const max = fn<T>(a: T, b: T) T {                     // Generic function
    if (a > b) { return a; }
    return b;
};
```

### Why This Design?

**Unified syntax**: One parsing rule handles all top-level declarations, simplifying both the compiler and developer experience.

**Semantic clarity**: The binding itself is immutable—you cannot reassign or shadow a top-level `const`. This prevents accidental redefinition bugs.

**Compiler optimization**: Immutable bindings enable better optimization opportunities.

**Future extensibility**: This approach naturally supports compile-time metaprogramming and uniform import behavior.

### Important Notes

```luma
const x: int = 5;
x = 10; // Error: `x` is immutable

const add -> fn (a: int, b: int) int { return a + b; };
add = something_else; // Error: cannot reassign function binding
```

---

## Variables and Mutability

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

**Key difference:**
- `const` at top-level = immutable binding (cannot reassign)
- `let` in functions = mutable variable (can reassign and modify)

---

## Functions

Functions are first-class values in Luma.

### Function Declaration

```luma
// Basic function
const add -> fn (a: int, b: int) int {
    return a + b;
};

// Function with no parameters
const greet -> fn () void {
    outputln("Hello!");
};

// Function with no return value
const print_number -> fn (n: int) void {
    outputln("Number: ", n);
};
```

### Function Calls

```luma
const main -> fn () int {
    let result: int = add(5, 3);
    outputln("5 + 3 = ", result);
    
    greet();
    print_number(42);
    
    return 0;
}
```

### Function Parameters

Parameters are passed by value by default:

```luma
const modify -> fn (x: int) void {
    x = 100;  // Modifies local copy only
};

const main -> fn () int {
    let num: int = 10;
    modify(num);
    outputln(num);  // Still 10
    return 0;
}
```

To modify the caller's variable, use pointers:

```luma
const modify_ptr -> fn (x: *int) void {
    *x = 100;  // Modifies original value
};

const main -> fn () int {
    let num: int = 10;
    modify_ptr(&num);  // Pass address
    outputln(num);     // Now 100
    return 0;
}
```

### Return Values

```luma
// Single return value
const square -> fn (x: int) int {
    return x * x;
};

// Multiple return values via struct
const DivResult -> struct {
    quotient: int,
    remainder: int
};

const divide -> fn (a: int, b: int) DivResult {
    return DivResult {
        quotient: a / b,
        remainder: a % b
    };
};

const main -> fn () int {
    let result: DivResult = divide(17, 5);
    outputln("17 / 5 = ", result.quotient, " R ", result.remainder);
    return 0;
}
```

### Early Returns

```luma
const find_positive -> fn (numbers: *int, size: int) int {
    loop [i: int = 0](i < size) : (++i) {
        if (numbers[i] > 0) {
            return numbers[i];  // Early return
        }
    }
    return -1;  // Not found
};
```

---

## Name Resolution

Luma uses two distinct operators for name resolution to provide semantic clarity:

### Static Access with `::`

The `::` operator is used for **compile-time static access**:

```luma
// Enum variants
const day: WeekDay = WeekDay::Monday;

// Module/namespace access
math::sqrt(16.0)

// Associated functions (if added later)
Point::new(10, 20)
```

### Runtime Member Access with `.`

The `.` operator is used for **runtime member access**:

```luma
// Struct field access
let point: Point = Point { x: 10, y: 20 };
outputln(point.x);  // Access field at runtime

// Method calls on instances
let distance: float = origin.distance_to(destination);

// Generic struct field access
let box: Box<int> = Box { value: 42 };
outputln(box.value);
```

### Benefits of This Distinction

- **Semantic clarity**: `::` means "resolved at compile time", `.` means "accessed at runtime"
- **Easier parsing**: The compiler immediately knows the access type
- **Consistent with systems languages**: Similar to C++ and Rust conventions
- **Future-proof**: Supports advanced features like associated functions

---

## Control Flow

Luma provides clean, flexible control flow constructs that handle most programming patterns without unnecessary complexity.

### Conditional Statements

Use `if`, `elif`, and `else` for branching logic:

```luma
const x: int = 7;

if (x > 10) {
    outputln("Large number");
} elif (x > 5) {
    outputln("Medium number");  // This will execute
} else {
    outputln("Small number");
}
```

### Loop Constructs

The `loop` keyword provides several iteration patterns:

#### For-Style Loops

```luma
// Basic for loop
loop [i: int = 0](i < 10) {
    outputln("Iteration: ", i);
    ++i;
}

// For loop with post-increment
loop [i: int = 0](i < 10) : (++i) {
    outputln("i = ", i);
}

// Multiple loop variables
loop [i: int = 0, j: int = 0](i < 10) : (++i) {
    outputln("i = ", i, ", j = ", j);
    ++j;
}
```

#### While-Style Loops

```luma
// Condition-only loop
let counter: int = 0;
loop (counter < 5) {
    outputln("Count: ", counter);
    counter = counter + 1;
}

// While loop with post-action
let j: int = 0;
loop (j < 10) : (++j) {
    outputln("Processing: ", j);
}
```

#### Infinite Loops

```luma
loop {
    // Runs forever until `break` is encountered
    if (should_exit()) {
        break;
    }
    do_work();
}
```

#### Loop Control

```luma
// Break: exit loop early
loop [i: int = 0](i < 100) : (++i) {
    if (i == 50) {
        break;  // Exit loop
    }
    process(i);
}

// Continue: skip to next iteration
loop [i: int = 0](i < 10) : (++i) {
    if (i % 2 == 0) {
        continue;  // Skip even numbers
    }
    outputln("Odd: ", i);
}
```

---

## Switch Statements

Luma provides powerful pattern matching through `switch` statements that work with enums, integers, and other types. Switch statements must be exhaustive and all cases must be compile-time constants.

### Basic Switch Syntax

```luma
@module "main"

const WeekDay -> enum {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
};

const classify_day -> fn (day: WeekDay) void {
    switch (day) {
        WeekDay::Monday, WeekDay::Tuesday, WeekDay::Wednesday, 
        WeekDay::Thursday, WeekDay::Friday =>
            outputln("Weekday => ", day);
        WeekDay::Saturday, WeekDay::Sunday =>
            outputln("Weekend => ", day);
    }
}

pub const main -> fn () int {
    classify_day(WeekDay::Monday);   // Output: Weekday => 1
    classify_day(WeekDay::Saturday); // Output: Weekend => 6
    return 0;
}
```

### Switch with Default Case

When you need to handle unexpected values or want a catch-all case, use the default wildcard pattern `_`:

```luma
const handle_status_code -> fn (code: int) void {
    switch (code) {
        200 => outputln("OK");
        404 => outputln("Not Found");
        500 => outputln("Internal Server Error");
        _   => outputln("Unknown status code");
    }
};
```

### Switch Features

- **Multiple values per case**: Combine multiple values using commas
- **Exhaustiveness**: All possible values must be covered (or use `_` for default)
- **Compile-time constants**: All case values must be compile-time constants
- **No fallthrough**: Each case is automatically contained (no `break` needed)

---

## Module System

Luma provides a simple module system for code organization and namespace management.

### Module Declaration

Every Luma source file must declare its module name:

```luma
@module "main"

// Your code here...
```

### Importing Modules

Use the `@use` directive to import other modules:

```luma
@module "main"

@use "math" as math
@use "string" as str

const main -> fn () int {
    // Access imported functions with namespace
    let result: double = math::sqrt(25.0);
    let len: int = str::strlen("hello");
    
    outputln("Square root: ", result);
    outputln("Length: ", len);
    return 0;
}
```

### Module Features

- **Explicit imports**: All dependencies must be explicitly declared
- **Namespace isolation**: Imported modules are accessed through their aliases
- **Static resolution**: All module access is resolved at compile time using `::`
- **Clean syntax**: Simple `@use "module" as alias` pattern

---

## Built-in Functions

Luma provides several built-in functions that are always available without imports.

### Output Functions

```luma
output(...)      // Print values without newline
outputln(...)    // Print values with newline
```

Both functions are **variadic** - they accept any number of arguments of any type:

```luma
const main -> fn () int {
    output("Hello", " ", "World");           // Hello World
    outputln("The answer is:", 42);          // The answer is: 42\n
    
    let x: int = 10;
    let y: float = 3.14;
    outputln("x = ", x, ", y = ", y);       // x = 10, y = 3.14\n
    
    return 0;
}
```

### Input Functions

```luma
input<T>(prompt: *byte) -> T    // Read typed input
```

The `input` function is generic and reads a value of the specified type:

```luma
const main -> fn () int {
    let name: *byte = input<*byte>("Enter your name: ");
    let age: int = input<int>("Enter your age: ");
    let height: double = input<double>("Enter height (meters): ");
    
    outputln("Name: ", name);
    outputln("Age: ", age);
    outputln("Height: ", height);
    
    return 0;
}
```

### System Commands

```luma
system(command: *byte) -> int    // Execute system command
```

Execute shell commands from your program:

```luma
const main -> fn () int {
    system("clear");  // Clear terminal (Linux/Mac)
    system("stty -icanon -echo");  // Configure terminal
    return 0;
}
```

### Type Information

```luma
sizeof<T> -> int    // Size of type in bytes
```

Get the size of any type at compile time:

```luma
const main -> fn () int {
    outputln("int: ", sizeof<int>);           // 8
    outputln("byte: ", sizeof<byte>);         // 1
    outputln("double: ", sizeof<double>);     // 8
    
    // Use in allocations
    let buffer: *int = cast<*int>(alloc(100 * sizeof<int>));
    defer free(buffer);
    
    return 0;
}
```

---

## Type Casting System

Luma uses explicit casting with the `cast<T>()` function for all type conversions.

### Basic Syntax

```luma
cast<TargetType>(expression)
```

### Numeric Conversions

```luma
const main -> fn () int {
    // Integer to float
    let i: int = 42;
    let f: float = cast<float>(i);        // 42.0
    
    // Float to integer (truncates)
    let pi: double = 3.14159;
    let rounded: int = cast<int>(pi);     // 3
    
    // Between integer types
    let small: byte = cast<byte>(65);     // 'A'
    let large: int = cast<int>(small);    // 65
    
    return 0;
}
```

### Pointer Casting

```luma
const main -> fn () int {
    // void* to typed pointer
    let raw: *void = alloc(sizeof<int>);
    let typed: *int = cast<*int>(raw);
    *typed = 42;
    free(raw);
    
    // Between pointer types
    let int_ptr: *int = cast<*int>(alloc(sizeof<int>));
    let void_ptr: *void = cast<*void>(int_ptr);
    free(int_ptr);
    
    return 0;
}
```

### Pointer to Integer (and back)

```luma
const main -> fn () int {
    let ptr: *byte = cast<*byte>(alloc(10));
    defer free(ptr);
    
    // Pointer to integer
    let addr: int = cast<int>(ptr);
    
    // Add offset (pointer arithmetic)
    let offset_addr: int = addr + 5;
    
    // Back to pointer
    let offset_ptr: *byte = cast<*byte>(offset_addr);
    
    return 0;
}
```

---

## Array Types

Luma supports fixed-size arrays with compile-time known sizes.

### Array Declaration

```luma
// Syntax: [Type; Size]
let numbers: [int; 10];           // Array of 10 integers
let bytes: [byte; 256];           // Array of 256 byteacters
let buffer: [double; 100];        // Array of 100 doubles

// Constants can be arrays too
const PRIMES: [int; 5] = [2, 3, 5, 7, 11];
```

### Array Initialization

```luma
const main -> fn () int {
    // Uninitialized (contains garbage)
    let data: [int; 5];
    
    // Initialize with literal
    let primes: [int; 5] = [2, 3, 5, 7, 11];
    
    // Initialize element by element
    let scores: [int; 3];
    scores[0] = 95;
    scores[1] = 87;
    scores[2] = 92;
    
    return 0;
}
```

### Array Access

```luma
const main -> fn () int {
    let numbers: [int; 5] = [10, 20, 30, 40, 50];
    
    // Read elements
    let first: int = numbers[0];    // 10
    let last: int = numbers[4];     // 50
    
    // Write elements
    numbers[2] = 99;
    
    // Loop through array
    loop [i: int = 0](i < 5) : (++i) {
        outputln("numbers[", i, "] = ", numbers[i]);
    }
    
    return 0;
}
```

---

## String Literals and String Types

### String Literals

String literals are null-terminated byteacter arrays:

```luma
const main -> fn () int {
    // String literal - type is *byte
    let message: *byte = "Hello, World!";
    outputln(message);
    
    return 0;
}
```

### byteacter Literals

Single byteacters use single quotes:

```luma
const main -> fn () int {
    let letter: byte = 'A';           // byteacter literal
    let newline: byte = '\n';         // Escape sequence
    let tab: byte = '\t';             // Tab byteacter
    
    return 0;
}
```

### Escape Sequences

```luma
'\n'   // Newline
'\r'   // Carriage return
'\t'   // Horizontal tab
'\\'   // Backslash
'\''   // Single quote
'\"'   // Double quote
'\0'   // Null byteacter
'\xHH' // Hexadecimal byte (e.g., '\x1b' for ESC)
```

---

## Pointer Arithmetic

Luma supports pointer arithmetic for low-level memory manipulation.

### Basic Pattern

```luma
const main -> fn () int {
    let arr: *int = cast<*int>(alloc(5 * sizeof<int>));
    defer free(arr);
    
    // Initialize
    loop [i: int = 0](i < 5) : (++i) {
        arr[i] = i * 10;
    }
    
    // Pointer arithmetic: convert to int, add offset, convert back
    let addr: int = cast<int>(arr);
    let new_addr: int = addr + (2 * sizeof<int>);
    let new_ptr: *int = cast<*int>(new_addr);
    
    outputln(*new_ptr);  // arr[2] = 20
    
    return 0;
}
```

---

## Visibility and Access Control

### Public Module Members

Use `pub` to export items from a module:

```luma
@module "math"

// Public - accessible from other modules
pub const PI: double = 3.14159265359;

pub const sqrt -> fn (x: double) double {
    return x;
}

// Private - only within this module
const INTERNAL_CONSTANT: int = 42;
```

### Struct Access Control

```luma
const Person -> struct {
pub:
    name: *byte,
    age: int,
    
priv:
    ssn: *byte,
    internal_id: int
};
```

---

## Memory Management

Luma provides explicit memory management with safety-oriented features.

### Basic Memory Operations

```luma
alloc(size: int) -> *void    // Allocate memory
free(ptr: *void)             // Deallocate memory
sizeof<T> -> int             // Size of type
```

### Example Usage

```luma
const main -> fn () int {
    // Allocate memory
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    
    // Use the memory
    *ptr = 42;
    outputln("Value: ", *ptr);
    
    // Clean up
    free(ptr);
    return 0;
}
```

### The `defer` Statement

Ensure cleanup with `defer` statements that execute when leaving scope:

```luma
const process_data -> fn () void {
    let buffer: *int = cast<*int>(alloc(100 * sizeof<int>));
    defer free(buffer);  // Guaranteed to run when function exits
    
    let file: *File = open_file("data.txt");
    defer close_file(file);  // Will run even if early return
    
    // Complex processing...
    if (error_condition) {
        return; // defer statements still execute
    }
    
    // More processing...
    // defer statements execute here automatically
}
```

Multiple statements can be deferred:

```luma
defer {
    close_file(file);
    cleanup_resources();
    log("Operation completed");
}
```

**Key Benefits:**
- Ensures cleanup code runs regardless of how the function exits
- Keeps allocation and deallocation code close together
- Prevents resource leaks from early returns
- Executes in reverse order (LIFO - Last In, First Out)

### Ownership Transfer Attributes

Luma provides function attributes that document and enforce ownership semantics.

#### `#returns_ownership`

Marks functions that allocate and return pointers:

```luma
#returns_ownership
const create_buffer -> fn (size: int) *int {
    let buffer: *int = cast<*int>(alloc(size * sizeof<int>));
    return buffer;  // Caller now owns this memory
}

const main -> fn () int {
    let data: *int = create_buffer(100);
    defer free(data);  // Caller must free
    return 0;
}
```

#### `#takes_ownership`

Marks functions that take ownership of pointer arguments:

```luma
#takes_ownership
const consume_buffer -> fn (buffer: *int) void {
    outputln("Processing: ", *buffer);
    free(buffer);  // Function owns and frees the buffer
}

const main -> fn () int {
    let data: *int = cast<*int>(alloc(sizeof<int>));
    *data = 42;
    
    consume_buffer(data);  // Ownership transferred
    // Error: data was freed inside consume_buffer
    
    return 0;
}
```

### Static Memory Analysis

Luma's compiler includes a static analyzer that tracks memory at compile time to prevent common memory management errors.

#### What the Analyzer Tracks

**Verified at Compile Time:**
- **Memory Leaks**: Detects `alloc()` calls without corresponding `free()`
- **Double-Free**: Prevents freeing the same pointer twice
- **Use-After-Free**: Catches access to freed memory within the same function
- **Ownership Transfer**: Validates `#returns_ownership` and `#takes_ownership` annotations
- **Defer Statement Cleanup**: Ensures deferred frees execute properly

**How It Works:**

```luma
const good_memory_usage -> fn () void {
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    defer free(ptr);  // Analyzer confirms cleanup
    *ptr = 42;
}  // No leak reported

const bad_memory_usage -> fn () void {
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    *ptr = 42;
    // Compiler error: memory leak - ptr never freed
}

#returns_ownership
const create_buffer -> fn (size: int) *int {
    let buffer: *int = cast<*int>(alloc(size));
    return buffer;  // Ownership transferred to caller
}  // No leak reported - caller is responsible

const main -> fn () int {
    let data: *int = create_buffer(100);
    defer free(data);  // Caller properly handles ownership
    return 0;
}
```

**Ownership Tracking:**

The analyzer understands three ownership patterns:

1. **`#returns_ownership` functions**: Allocations inside are NOT tracked as leaks because ownership transfers to the caller
2. **`#takes_ownership` functions**: Parameters marked with this receive ownership and are responsible for cleanup
3. **`defer` statements**: Deferred cleanup is tracked and validated at function exit

**Transitive Ownership:**

```luma
#returns_ownership
const create_arena_sized -> fn (size: int) Arena {
    let a: Arena;
    a.buf = alloc(size);  // Not tracked - inside #returns_ownership
    return a;
}

const create_arena -> fn () Arena {
    return create_arena_sized(1024);
    // Warning: Should add #returns_ownership annotation
    // for API clarity (ownership is being passed through)
}
```

#### Current Limitations

**Known Edge Cases:**

The analyzer currently has limitations in these areas:

1. **Struct Field Granularity**: When tracking `a.buf = alloc(...)`, the analyzer tracks the entire struct `a`, not the specific field `a.buf`. This works for single-pointer structs but may cause issues with:
   ```luma
   const Container -> struct {
       data1: *int,
       data2: *int
   };
   
   let c: Container;
   c.data1 = alloc(10);  // Tracked as "c"
   c.data2 = alloc(20);  // Also tracked as "c" - potential confusion
   free(c.data1);        // Marks "c" as freed, but c.data2 still allocated
   ```

2. **Conditional Allocations**: The analyzer may report false positives for conditional paths:
   ```luma
   let ptr: *int;
   if (condition) {
       ptr = alloc(sizeof<int>);
   }
   // May warn even if you don't need to free in else branch
   ```

3. **Allocations in Loops**: Each loop iteration's allocations should be independent, but edge cases may exist:
   ```luma
   loop [i: int = 0](i < 10) : (++i) {
       let temp: *int = alloc(4);
       // Use temp...
       free(temp);  // Should work correctly
   }
   ```

4. **Early Returns with Defer**: While generally working, complex control flow with multiple early returns may need testing:
   ```luma
   const process -> fn () int {
       let a: *int = alloc(sizeof<int>);
       defer free(a);
       
       if (error) { return -1; }  // Defer should fire
       if (warning) { return 0; } // Defer should fire
       return 1;                  // Defer should fire
   }
   ```

5. **Stack vs Heap**: The analyzer doesn't currently detect returning pointers to stack variables:
   ```luma
   const dangerous -> fn () *int {
       let local: int = 42;
       return &local;  // NOT DETECTED - returns dangling pointer
   }
   ```

6. **Arrays of Pointers**: Complex allocation patterns may not be fully tracked:
   ```luma
   let arr: [*int; 5];
   loop [i: int = 0](i < 5) : (++i) {
       arr[i] = alloc(sizeof<int>);  // Each needs individual free
   }
   ```

#### Best Practices

To work effectively with the analyzer:

1. **Use ownership annotations consistently**: Mark all functions that allocate and return resources with `#returns_ownership`
2. **Use defer for cleanup**: Always pair allocations with `defer free()` for automatic cleanup
3. **One allocation per variable**: Avoid reassigning pointer variables after allocation without freeing
4. **Clear ownership semantics**: Document which functions own their pointer parameters vs. borrowing them
5. **Test early returns**: Ensure defer statements properly handle all exit paths

The analyzer is conservative - it may report false positives to prevent missed leaks. When in doubt, it will warn about potential issues rather than silently allowing them.

## Performance

Understanding performance is crucial for systems programming.

### Zero-Cost Abstractions

Luma follows the "zero-cost abstraction" principle: abstractions should have no runtime overhead.

**Generics are zero-cost:**
```luma
const add = fn<T>(a: T, b: T) T {
    return a + b;
}

// These calls compile to separate, optimized functions:
let x: int = add<int>(1, 2);        // Same as: x = 1 + 2
let y: float = add<float>(1.0, 2.0); // Same as: y = 1.0 + 2.0
```

**No runtime dispatch** - all generic instantiations are resolved at compile time through monomorphization.

### Monomorphization

Luma generates specialized code for each type:

```luma
const max = fn<T>(a: T, b: T) T {
    if (a > b) { return a; }
    return b;
}

// Compiler generates:
// max_int(a: int, b: int) -> int { ... }
// max_float(a: float, b: float) -> float { ... }
```

**Benefits:**
- No runtime overhead
- Full optimization per type
- No vtables or dynamic dispatch

**Trade-offs:**
- Larger binary size (one copy per type)
- Longer compilation time

### Memory Layout

**Struct layout is predictable:**
```luma
const Point -> struct {
    x: int,    // Offset 0, 8 bytes
    y: int     // Offset 8, 8 bytes
};  // Total: 16 bytes
```

**Array layout is contiguous:**
```luma
let arr: [int; 10];  // 80 contiguous bytes
// arr[0] at offset 0, arr[1] at offset 8, arr[2] at offset 16...
```

### Memory Allocation Performance

**Stack allocation is fast:**
```luma
const fast_function -> fn () void {
    let buffer: [int; 1024];  // Stack allocated - instant
    // Use buffer...
}  // Automatically cleaned up
```

**Heap allocation has overhead:**
```luma
const slower_function -> fn () void {
    let buffer: *int = cast<*int>(alloc(1024 * sizeof<int>));
    defer free(buffer);
    // Use buffer...
}
```

### Optimization Guidelines

**1. Prefer stack allocation when possible:**
```luma
let temp: [int; 100];  // Good for small, fixed-size data
```

**2. Minimize pointer indirection:**
```luma
// Better: direct access
let ptr: *int;
let value: int = *ptr;   // One memory load

// Best: value directly
let value2: int = 42;     // No memory load
```

**3. Batch operations:**
```luma
// Good: one large allocation
let buffer: *int = cast<*int>(alloc(1000 * sizeof<int>));
loop [i: int = 0](i < 1000) : (++i) {
    // Use buffer[i]...
}
free(buffer);
```

**4. Avoid unnecessary copying:**
```luma
// Bad: pass large struct by value
const process -> fn (data: LargeStruct) void { }

// Good: pass by pointer
const process_fast -> fn (data: *LargeStruct) void { }
```

### Performance Summary

| Operation | Cost | Notes |
|-----------|------|-------|
| Stack variable | ~0 | Instant |
| Heap allocation | High | System call |
| Pointer dereference | Low | One memory access |
| Array index | Low | Bounds check + access |
| Function call | Low-Medium | Depends on size |
| Generic instantiation | 0 | Compile-time only |
| Struct field access | Low | Offset calculation |
| Enum comparison | ~0 | Integer comparison |

---

## Standard Library

Luma's standard library provides essential functionality for systems programming.

### Module: `math`

Mathematical operations and constants.
```luma
@use "math" as math

// Constants
math::PI           // 3.14159...
math::TWO_PI       // 6.28318...
math::HALF_PI      // 1.57079...

// Basic arithmetic functions
math::add(x: int, y: int) -> int
math::subtract(x: int, y: int) -> int
math::multiply(x: int, y: int) -> int
math::divide(x: int, y: int) -> int       // Returns 0 on division by zero
math::mod(x: int, y: int) -> int          // Returns 0 on division by zero

// Min/Max
math::max_size(a: int, b: int) -> int
math::min_size(a: int, b: int) -> int

// Power
math::power(base: double, exponent: int) -> double

// Trigonometry (uses lookup table for performance)
math::sin(angle: double) -> double        // Angle in radians
math::cos(x: double) -> double
math::tan(x: double) -> double
math::sec(x: double) -> double
math::csc(x: double) -> double
math::cot(x: double) -> double

// Other
math::fib(n: int, a: int, b: int) -> int  // Fibonacci
math::rand(seed: *int) -> int             // Simple PRNG
```

**Example:**
```luma
@use "math" as math

const main -> fn () int {
    let angle: double = math::PI / 4.0;
    let sine: double = math::sin(angle);
    outputln("sin(π/4) = ", sine);
    
    let result: int = math::power(2.0, 10);
    outputln("2^10 = ", result);
    
    return 0;
}
```

---

### Module: `memory`

Low-level memory operations.
```luma
@use "memory" as mem

// Basic operations
mem::memcpy(dest: *void, src: *void, n: int) -> *void       // Copy memory
mem::memcmp(a: *void, b: *void, n: int) -> int              // Compare memory (returns 0 if equal)
mem::memset(dest: *void, value: int, n: int) -> *void       // Fill memory
mem::memmove(dest: *void, src: *void, n: int) -> *void      // Move (handles overlap)
mem::memzero(dest: *void, n: int) -> *void                  // Zero memory

// Search
mem::memchr(ptr: *void, value: int, n: int) -> *void        // Find byte
mem::memmem(haystack: *void, haystack_len: int, 
            needle: *void, needle_len: int) -> *void        // Find substring

// Allocation helpers
mem::calloc(count: int, size: int) -> *void                 // Allocate + zero (#returns_ownership)
mem::realloc(ptr: *void, new_size: int) -> *void            // Reallocate (#returns_ownership)

// Utilities
mem::memswap(a: *void, b: *void, n: int) -> void            // Swap regions
mem::memswapn(a: *void, b: *void, count: int, size: int) -> void  // Swap n elements
mem::memfill(dest: *void, value: int, size: int, count: int) -> *void  // Fill with pattern
mem::memrev(ptr: *void, n: int) -> *void                    // Reverse bytes
mem::memcount(ptr: *void, value: int, n: int) -> int        // Count occurrences
mem::memdup(src: *void, n: int) -> *void                    // Duplicate region (#returns_ownership)
mem::memeq(a: *void, b: *void, n: int) -> bool              // Check equality
mem::align(member_alignments: *int, count: int) -> int      // Calculate alignment
```

**Example:**
```luma
@use "memory" as mem

const main -> fn () int {
    let buffer: *void = mem::calloc(10, sizeof<byte>);
    defer free(buffer);
    
    mem::memset(buffer, 65, 10);  // Fill with 'A'
    outputln("Buffer filled");
    
    return 0;
}
```

---

### Module: `string`

String manipulation functions.
```luma
@use "string" as string

// Creation (#returns_ownership)
string::from_byte(c: byte) -> *byte                         // Create string from byte
string::from_int(n: int) -> *byte                           // Convert int to string
string::from_float(f: float, precision: int) -> *byte       // Convert float to string

// Measurement
string::strlen(s: *byte) -> int                             // Get length

// Comparison
string::strcmp(s1: *byte, s2: *byte) -> int                 // Compare strings (returns 0 if equal)

// Search
string::s_byte(s: *byte, c: int) -> byte                    // Find character (returns '\0' if not found)

// Manipulation
string::copy(dest: *byte, src: *byte) -> *byte              // Copy string
string::n_copy(dest: *byte, src: *byte, n: int) -> *byte    // Copy n characters
string::cat(dest: *byte, s1: *byte, s2: *byte) -> *byte     // Concatenate

// Conversion
string::atio(value: *byte) -> int                           // ASCII to integer
string::int_to_str(num: int, buf: *byte, buf_size: int) -> void  // Int to string (in-place)

// Character classification
string::is_digit(ch: byte) -> bool                          // Check if digit
string::is_alpha(ch: byte) -> bool                          // Check if alphabetic
string::is_alnum(ch: byte) -> bool                          // Check if alphanumeric

// Output
string::putbyte(c: byte) -> int                             // Output single character

// Large number arithmetic (#returns_ownership)
string::string_add(num1: *byte, num2: *byte) -> *byte       // Add two numbers as strings
```

**Example:**
```luma
@use "string" as string

const main -> fn () int {
    let name: *byte = "Alice";
    let len: int = string::strlen(name);
    outputln("Length: ", len);
    
    let num_str: *byte = string::from_int(42);
    defer free(num_str);
    outputln("Number: ", num_str);
    
    return 0;
}
```

---

### Module: `sys`

Linux system call interface (x86_64 only).

**Platform Warning:** This module only works on x86_64 Linux. It will NOT work on macOS, Windows, ARM, or 32-bit systems.
```luma
@use "sys" as sys

// File descriptors
sys::STDIN, sys::STDOUT, sys::STDERR

// File operations
sys::read(fd: int, buf: *void, count: int) -> int
sys::write(fd: int, buf: *void, count: int) -> int
sys::open(path: *byte, flags: int, mode: int) -> int
sys::close(fd: int) -> int
sys::lseek(fd: int, offset: int, whence: int) -> int
sys::pread(fd: int, buf: *void, count: int, offset: int) -> int
sys::pwrite(fd: int, buf: *void, count: int, offset: int) -> int
sys::unlink(path: *byte) -> int
sys::dup(oldfd: int) -> int
sys::dup2(oldfd: int, newfd: int) -> int
sys::pipe(pipefd: *int) -> int

// Directory operations
sys::mkdir(path: *byte, mode: int) -> int
sys::rmdir(path: *byte) -> int
sys::chdir(path: *byte) -> int
sys::getcwd(buf: *byte, size: int) -> *byte

// Process management
sys::exit(code: int) -> void
sys::fork() -> int
sys::getpid() -> int
sys::getuid() -> int
sys::getgid() -> int
sys::kill(pid: int, sig: int) -> int
sys::wait4(pid: int, status: *int, options: int, rusage: *void) -> int
sys::execve(path: *byte, argv: **byte, envp: **byte) -> int

// Memory management
sys::brk(addr: *void) -> int
sys::mmap(addr: *void, length: int, prot: int, flags: int, fd: int, offset: int) -> *void
sys::munmap(addr: *void, length: int) -> int

// Helper functions
sys::is_error(result: int) -> bool
sys::get_errno(result: int) -> int
sys::write_str(fd: int, s: *byte) -> int
sys::eprint(s: *byte) -> int

// Constants (file flags, permissions, signals, etc.)
sys::O_RDONLY, sys::O_WRONLY, sys::O_RDWR, sys::O_CREAT, sys::O_TRUNC, sys::O_APPEND
sys::S_IRUSR, sys::S_IWUSR, sys::S_IXUSR
sys::MODE_0644, sys::MODE_0755, sys::MODE_0777
sys::SEEK_SET, sys::SEEK_CUR, sys::SEEK_END
sys::PROT_READ, sys::PROT_WRITE, sys::PROT_EXEC
sys::MAP_SHARED, sys::MAP_PRIVATE, sys::MAP_ANONYMOUS
sys::SIGHUP, sys::SIGINT, sys::SIGTERM, sys::SIGKILL
sys::EPERM, sys::ENOENT, sys::EACCES, sys::EINVAL
```

**Example:**
```luma
@use "sys" as sys

const main -> fn () int {
    let fd: int = sys::open("test.txt", sys::O_WRONLY | sys::O_CREAT, sys::MODE_0644);
    if (sys::is_error(fd)) {
        sys::eprint("Failed to open file\n");
        return 1;
    }
    defer sys::close(fd);
    
    sys::write_str(fd, "Hello, World!\n");
    return 0;
}
```

---

### Module: `io`

High-level I/O operations with formatted output.
```luma
@use "io" as io

// Formatted output (similar to printf)
io::print_int(format: *byte, args: [int; 256]) -> int        // %d for integers
io::print_str(format: *byte, args: [*byte; 256]) -> int      // %s for strings
io::print_byte(format: *byte, args: [byte; 256]) -> int      // %c for characters
io::print_err(format: *byte, args: [int; 256]) -> int        // Print to stderr with %d

// File operations (#returns_ownership)
io::read_file(path: *byte) -> *byte                          // Read entire file into string
```

**Example:**
```luma
@use "io" as io

const main -> fn () int {
    io::print_int("The answer is %d\n", [42]);
    io::print_str("Hello, %s!\n", ["World"]);
    
    let content: *byte = io::read_file("data.txt");
    if (content != cast<*byte>(0)) {
        defer free(content);
        outputln(content);
    }
    
    return 0;
}
```

---

### Module: `termfx`

Terminal formatting and colors (ANSI escape codes).
```luma
@use "termfx" as fx

// Basic colors
fx::RED, fx::GREEN, fx::BLUE, fx::YELLOW
fx::MAGENTA, fx::CYAN, fx::WHITE, fx::BLACK

// Bright colors
fx::BRIGHT_RED, fx::BRIGHT_GREEN, fx::BRIGHT_BLUE, fx::BRIGHT_YELLOW
fx::BRIGHT_MAGENTA, fx::BRIGHT_CYAN, fx::BRIGHT_WHITE, fx::BRIGHT_BLACK

// Background colors
fx::BG_RED, fx::BG_GREEN, fx::BG_BLUE, fx::BG_YELLOW
fx::BG_MAGENTA, fx::BG_CYAN, fx::BG_WHITE, fx::BG_BLACK
fx::BG_BRIGHT_RED, fx::BG_BRIGHT_GREEN, fx::BG_BRIGHT_BLUE

// Text styles
fx::BOLD, fx::DIM, fx::ITALIC, fx::UNDERLINE
fx::BLINK, fx::INVERT, fx::HIDDEN, fx::STRIKETHROUGH

// Screen control
fx::CLEAR_SCREEN, fx::CLEAR_LINE, fx::CLEAR_TO_EOL, fx::CLEAR_TO_EOS
fx::CURSOR_HOME, fx::CURSOR_HIDE, fx::CURSOR_SHOW
fx::SAVE_CURSOR, fx::RESTORE_CURSOR

// Functions (#returns_ownership)
fx::fg_rgb(r: int, g: int, b: int) -> *byte          // Custom foreground color
fx::bg_rgb(r: int, g: int, b: int) -> *byte          // Custom background color
fx::move_cursor(row: int, col: int) -> *byte         // Move cursor

// Reset
fx::RESET
```

**Example:**
```luma
@use "termfx" as fx

const main -> fn () int {
    output(fx::CLEAR_SCREEN, fx::CURSOR_HOME);
    output(fx::BOLD, fx::RED, "ERROR: ", fx::RESET);
    outputln("Something went wrong!");
    output(fx::GREEN, "✓ Success", fx::RESET, "\n");
    
    let custom_color: *byte = fx::fg_rgb(255, 128, 0);
    defer free(custom_color);
    output(custom_color, "Orange text!", fx::RESET, "\n");
    
    return 0;
}
```

---

### Module: `terminal`

Interactive terminal input functions.
```luma
@use "terminal" as term

// Raw mode control
term::enable_raw_mode() -> void                      // Enable raw mode (blocking)
term::disable_raw_mode() -> void                     // Restore normal mode

// Character input
term::getch() -> byte                                // Get single character (no echo, no enter)
term::getch_raw() -> byte                            // Get character in raw mode
term::getch_silent() -> byte                         // Get character silently
term::getche() -> byte                               // Get character with echo

// Input utilities
term::kbhit() -> int                                 // Check if key pressed (non-blocking)
term::wait_for_key() -> void                         // Wait for any key
term::clear_input_buffer() -> void                   // Clear input buffer
term::get_line(prompt: *byte, buffer: *byte, size: int) -> void  // Read line of input

// Password input (#returns_ownership)
term::getpass(prompt: *byte) -> *byte                // Get password (hidden input)

// Timing
term::sleep_ms(ms: int) -> void                      // Sleep for milliseconds
```

**Example:**
```luma
@use "terminal" as term
@use "string" as string

const main -> fn () int {
    outputln("Press any key...");
    let key: byte = term::getch();
    
    let key_str: *byte = string::from_byte(key);
    defer free(key_str);
    outputln("You pressed: ", key_str);
    
    let password: *byte = term::getpass("Enter password: ");
    defer free(password);
    outputln("Password entered");
    
    return 0;
}
```

---

### Module: `time`

Time and timing operations.
```luma
@use "time" as time

// Types
time::TimeSpec -> struct { sec: int, nsec: int }
time::Timer -> struct { start_time: TimeSpec }

// Constants
time::CLOCK_REALTIME

// Time operations
time::now() -> TimeSpec                              // Get current time
time::clock_gettime(clk_id: int, ts: *TimeSpec) -> int
time::usleep(usec: int) -> int                       // Sleep microseconds

// Conversions
time::to_millis(t: TimeSpec) -> int
time::to_micros(t: TimeSpec) -> int
time::to_nanos(t: TimeSpec) -> int

// Timer operations
time::timer_start() -> Timer                         // Start timer
time::timer_elapsed_ms(t: Timer) -> int              // Get elapsed milliseconds
time::elapsed_ms(start: TimeSpec, end: TimeSpec) -> int
time::timespec_sub(a: TimeSpec, b: TimeSpec) -> TimeSpec
```

**Example:**
```luma
@use "time" as time

const main -> fn () int {
    let timer: time::Timer = time::timer_start();
    
    // Do some work...
    time::usleep(1000000);  // Sleep 1 second
    
    let elapsed: int = time::timer_elapsed_ms(timer);
    outputln("Elapsed: ", elapsed, " ms");
    
    return 0;
}
```

---

### Module: `vector`

Dynamic array implementation.
```luma
@use "vector" as vector

// Type
vector::Vector -> struct {
    data: *void,
    capacity: int,
    size: int,
    element_size: int,
    
    // Methods
    push_back(elem: *void) -> void
    pop_back(out: *void) -> int
    insert(elem: *void, index: int) -> int
    remove_at(index: int) -> int
    get(index: int) -> *void
}

// Creation (#returns_ownership)
vector::create_vector(element_size: int) -> Vector
vector::create_vector_capacity(init_capacity: int, element_size: int) -> Vector

// Cleanup (#takes_ownership)
vector::free_vector(v: *Vector) -> void
```

**Example:**
```luma
@use "vector" as vector

const main -> fn () int {
    let v: vector::Vector = vector::create_vector(sizeof<int>);
    defer vector::free_vector(&v);
    
    loop [i: int = 0](i < 10) : (++i) {
        v.push_back(cast<*void>(&i));
    }
    
    let val: int;
    v.pop_back(cast<*void>(&val));
    outputln("Popped: ", val);
    
    return 0;
}
```

---

### Module: `arena`

Arena allocator for fast bulk allocations.
```luma
@use "arena" as arena

// Type
arena::Arena -> struct {
    buf: *byte,
    buf_len: int,
    prev_offset: int,
    curr_offset: int,
}

// Constants
arena::ARENA_DEFAULT_SIZE  // 1 MB

// Creation (#returns_ownership)
arena::create_arena() -> Arena
arena::create_arena_sized(size: int) -> Arena

// Operations
arena::alloc_arena(a: *Arena, size: int) -> *void
arena::reset_arena(a: *Arena) -> void

// Cleanup (#takes_ownership)
arena::free_arena(a: *Arena) -> void
```

**Example:**
```luma
@use "arena" as arena

const main -> fn () int {
    let a: arena::Arena = arena::create_arena();
    defer arena::free_arena(&a);
    
    // Allocate many small objects quickly
    loop [i: int = 0](i < 1000) : (++i) {
        let ptr: *int = cast<*int>(arena::alloc_arena(&a, sizeof<int>));
        *ptr = i;
    }
    
    // Reset for reuse (doesn't free memory)
    arena::reset_arena(&a);
    
    return 0;
}
```

---

### Creating Your Own Modules

**Module structure:**
```luma
// File: mymodule.lx
@module "mymodule"

// Private helper
const helper -> fn (x: int) int {
    return x * 2;
}

// Public function
pub const process -> fn (data: *int, size: int) void {
    loop [i: int = 0](i < size) : (++i) {
        data[i] = helper(data[i]);
    }
}

// Public constant
pub const VERSION: int = 1;
```

**Using your module:**
```luma
// File: main.lx
@module "main"
@use "mymodule" as mm

const main -> fn () int {
    let data: [int; 5] = [1, 2, 3, 4, 5];
    mm::process(cast<*int>(&data), 5);
    outputln("Version: ", mm::VERSION);
    return 0;
}
```

---

## Safety Features

Luma provides several safety features to prevent common bugs:

### 1. Static Memory Analysis

- Tracks allocations and deallocations at compile time
- Detects memory leaks before runtime
- Prevents double-free errors
- Identifies use-after-free bugs

### 2. Ownership Attributes

- `#returns_ownership` documents memory transfers
- `#takes_ownership` clarifies responsibility
- Compiler enforces ownership rules

### 3. Defer Statements

- Guarantees cleanup code execution
- Prevents resource leaks
- Works with early returns and errors

### 4. Strong Type System

- No implicit conversions (except safe ones)
- Explicit casting required
- Type-safe generics
- Enum exhaustiveness checking

### 5. Explicit Error Handling

- No hidden exceptions
- Clear error propagation
- Predictable control flow

---

## Quick Reference

### Keywords

```
const      let        if         elif       else
loop       break      continue   return     defer
struct     enum       pub        priv       cast
sizeof     alloc      free       switch     fn
```

### Operators

```
Arithmetic:  +  -  *  /  %  ++  --
Comparison:  ==  !=  <  >  <=  >=
Logical:     &&  ||  !
Bitwise:     &  |  ^  ~  <<  >>
Assignment:  =
Access:      .   ::  []  *  &
```

### Primitive Types

```
int     double    bool    *T      [T; N]
uint    float     byte    str     void
```

### Common Patterns

```luma
// Allocation with cleanup
let ptr: *T = cast<*T>(alloc(sizeof<T>));
defer free(ptr);

// Array iteration
loop [i: int = 0](i < size) : (++i) {
    array[i] = value;
}

// Error checking
if (ptr == cast<*T>(0)) {
    return ERROR_CODE;
}

// Module usage
@use "module" as m
let x: int = m::function();

// String operations
let s: *byte = string::from_int(42);
defer free(s);
```

---

## Conclusion

Luma is a modern systems programming language that provides:

- **Simplicity**: Clean, consistent syntax
- **Safety**: Static analysis and ownership tracking
- **Performance**: Zero-cost abstractions and predictable behavior
- **Control**: Manual memory management with safety nets

The language is designed for programmers who want the performance and control of C with modern safety features and ergonomics.

For more examples, see the standard library modules and test files included with the language distribution.