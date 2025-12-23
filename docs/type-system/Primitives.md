# Primitive Types

Luma provides several built-in primitive types for common data.

## Numeric Types

| Type | Description | Size |
|------|-------------|------|
| `int` | Signed integer | 64-bit |
| `uint` | Unsigned integer | 64-bit |
| `float` | Floating point | 32-bit |
| `double` | Floating point | 64-bit |

### Examples

```luma
const main -> fn () int {
    let x: int = 42;              // Signed 64-bit integer
    let y: uint = 100;            // Unsigned 64-bit integer
    let pi: float = 3.14159;      // 32-bit float
    let e: double = 2.71828;      // 64-bit double
    
    outputln("Integer: ", x);
    outputln("Float: ", pi);
    
    return 0;
}
```

## Boolean Type

```luma
let is_valid: bool = true;
let is_ready: bool = false;

if (is_valid && is_ready) {
    outputln("Ready to go!");
}
```

## Character Type

The `byte` type represents a single character:

```luma
let letter: byte = 'A';
let newline: byte = '\n';
let tab: byte = '\t';

outputln("Letter: ", letter);
```

### Escape Sequences

```
'\n'   // Newline
'\r'   // Carriage return
'\t'   // Horizontal tab
'\\'   // Backslash
'\''   // Single quote
'\"'   // Double quote
'\0'   // Null character
'\xHH' // Hexadecimal byte (e.g., '\x1b' for ESC)
```

## String Type

Strings in Luma are pointers to null-terminated character arrays:

```luma
let message: *byte = "Hello, World!";
outputln(message);

let name: *byte = "Alice";
let greeting: *byte = "Hello, ";
```

## Void Type

Used for functions that don't return a value:

```luma
const print_message -> fn () void {
    outputln("This function returns nothing");
}
```

## Pointer Types

Any type can be made into a pointer with `*T`:

```luma
let int_ptr: *int;        // Pointer to int
let byte_ptr: *byte;      // Pointer to byte (string)
let void_ptr: *void;      // Generic pointer
```

## Array Types

Fixed-size arrays use the syntax `[Type; Size]`:

```luma
let numbers: [int; 10];           // Array of 10 integers
let bytes: [byte; 256];           // Array of 256 characters
let primes: [int; 5] = [2, 3, 5, 7, 11];
```

---

Next: [Enumerations](enums.md)
