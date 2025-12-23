# Standard Library

Luma's standard library provides essential functionality for systems programming.

## Available Modules

- [math](#math) - Mathematical operations
- [memory](#memory) - Low-level memory operations
- [string](#string) - String manipulation
- [termfx](#termfx) - Terminal formatting and colors
- [terminal](#terminal) - Interactive terminal input

---

## math

Mathematical operations and constants.

### Import

```luma
@use "math" as math
```

### Constants

```luma
math::PI           // 3.14159265359
math::TWO_PI       // 6.28318530718
math::HALF_PI      // 1.57079632679
```

### Arithmetic Functions

```luma
math::add(x, y)           // Addition
math::subtract(x, y)      // Subtraction
math::multiply(x, y)      // Multiplication
math::divide(x, y)        // Division
math::mod(x, y)           // Modulo
math::power(base, exp)    // Exponentiation
```

### Min/Max

```luma
math::max_size(a, b)      // Maximum of two values
math::min_size(a, b)      // Minimum of two values
```

### Trigonometry

```luma
math::sin(angle)          // Sine
math::cos(angle)          // Cosine
math::tan(angle)          // Tangent
math::sec(angle)          // Secant
math::csc(angle)          // Cosecant
math::cot(angle)          // Cotangent
```

### Other

```luma
math::fib(n, a, b)        // Fibonacci calculation
```

### Example

```luma
@use "math" as math

const main -> fn () int {
    let angle: double = math::PI / 4.0;
    let sine: double = math::sin(angle);
    outputln("sin(π/4) = ", sine);
    
    let radius: double = 5.0;
    let area: double = math::PI * radius * radius;
    outputln("Circle area: ", area);
    
    return 0;
}
```

---

## memory

Low-level memory operations.

### Import

```luma
@use "memory" as mem
```

### Basic Operations

```luma
mem::memcpy(dest, src, n)       // Copy n bytes from src to dest
mem::memcmp(a, b, n)            // Compare n bytes
mem::memset(dest, value, n)     // Fill n bytes with value
mem::memmove(dest, src, n)      // Move (handles overlap)
mem::memzero(dest, n)           // Zero n bytes
```

### Search

```luma
mem::memchr(ptr, value, n)      // Find byte in memory
```

### Allocation Helpers

```luma
mem::calloc(count, size)        // Allocate + zero
mem::realloc(ptr, new_size)     // Reallocate
```

### Utilities

```luma
mem::memswap(a, b, n)           // Swap regions
mem::memrev(ptr, n)             // Reverse bytes
mem::memcount(ptr, value, n)    // Count occurrences
mem::memdup(src, n)             // Duplicate region
mem::memeq(a, b, n)             // Check equality
```

### Example

```luma
@use "memory" as mem

const main -> fn () int {
    let buffer: *void = mem::calloc(10, sizeof<byte>);
    defer free(buffer);
    
    mem::memset(buffer, 65, 10);  // Fill with 'A'
    
    let copy: *void = mem::memdup(buffer, 10);
    defer free(copy);
    
    if (mem::memeq(buffer, copy, 10)) {
        outputln("Buffers are equal");
    }
    
    return 0;
}
```

---

## string

String manipulation functions.

### Import

```luma
@use "string" as string
```

### Creation

```luma
string::from_byte(c)            // Create string from byte
string::from_int(n)             // Convert int to string
```

### Measurement

```luma
string::strlen(s)               // Get string length
```

### Comparison

```luma
string::strcmp(s1, s2)          // Compare strings
```

### Search

```luma
string::s_byte(s, c)            // Find character in string
```

### Manipulation

```luma
string::copy(dest, src)         // Copy string
string::n_copy(dest, src, n)    // Copy n characters
string::cat(dest, s1, s2)       // Concatenate strings
```

### Example

```luma
@use "string" as string

const main -> fn () int {
    let name: *byte = "Alice";
    let len: int = string::strlen(name);
    outputln("Length: ", len);
    
    let num_str: *byte = string::from_int(42);
    defer free(num_str);
    outputln("Number: ", num_str);
    
    let char_str: *byte = string::from_byte('X');
    defer free(char_str);
    outputln("Character: ", char_str);
    
    return 0;
}
```

---

## termfx

Terminal formatting and colors (ANSI escape codes).

### Import

```luma
@use "termfx" as fx
```

### Basic Colors

```luma
fx::RED, fx::GREEN, fx::BLUE, fx::YELLOW
fx::MAGENTA, fx::CYAN, fx::WHITE, fx::BLACK
```

### Bright Colors

```luma
fx::BRIGHT_RED, fx::BRIGHT_GREEN, fx::BRIGHT_BLUE
fx::BRIGHT_YELLOW, fx::BRIGHT_MAGENTA, fx::BRIGHT_CYAN
fx::BRIGHT_WHITE
```

### Background Colors

```luma
fx::BG_RED, fx::BG_GREEN, fx::BG_BLUE
fx::BG_YELLOW, fx::BG_MAGENTA, fx::BG_CYAN
fx::BG_WHITE, fx::BG_BLACK
```

### Text Styles

```luma
fx::BOLD
fx::UNDERLINE
fx::ITALIC
fx::DIM
fx::BLINK
fx::REVERSE
fx::STRIKETHROUGH
```

### Screen Control

```luma
fx::CLEAR_SCREEN
fx::CLEAR_LINE
fx::CURSOR_HOME
fx::CURSOR_HIDE
fx::CURSOR_SHOW
```

### Functions

```luma
fx::fg_rgb(r, g, b)          // Custom foreground color
fx::bg_rgb(r, g, b)          // Custom background color
fx::move_cursor(row, col)    // Move cursor to position
```

### Reset

```luma
fx::RESET                    // Reset all formatting
```

### Example

```luma
@use "termfx" as fx

const main -> fn () int {
    output(fx::CLEAR_SCREEN, fx::CURSOR_HOME);
    
    output(fx::BOLD, fx::RED, "ERROR: ", fx::RESET);
    outputln("Something went wrong!");
    
    output(fx::GREEN, "✓ Success", fx::RESET, "\n");
    
    output(fx::BLUE, fx::UNDERLINE, "Link", fx::RESET, "\n");
    
    output(fx::BG_YELLOW, fx::BLACK, " Warning ", fx::RESET, "\n");
    
    return 0;
}
```

---

## terminal

Interactive terminal input functions.

### Import

```luma
@use "terminal" as term
```

### Functions

```luma
term::getch()                   // Get single byte (no echo, no enter)
term::getch_silent()            // Get byte silently
term::getche()                  // Get byte with echo
term::kbhit()                   // Check if key pressed
term::wait_for_key()            // Wait for any key
term::clear_input_buffer()      // Clear input buffer
term::getpass(prompt)           // Get password (hidden input)
```

### Example

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
    outputln("Password length: ", string::strlen(password));
    
    if (term::kbhit()) {
        outputln("Key is ready");
    }
    
    return 0;
}
```

---

## Creating Custom Modules

### File Structure

```
project/
├── main.lx
└── mylib.lx
```

### Example Module: mylib.lx

```luma
@module "mylib"

// Public constant
pub const VERSION: int = 1;

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
```

### Using Your Module: main.lx

```luma
@module "main"

@use "mylib" as lib

const main -> fn () int {
    let data: [int; 5] = [1, 2, 3, 4, 5];
    
    lib::process(cast<*int>(&data), 5);
    
    outputln("Version: ", lib::VERSION);
    
    return 0;
}
```

---

Back to [Reference Overview](README.md)
