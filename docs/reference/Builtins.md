# Built-in Functions

Luma provides several built-in functions that are always available without imports.

## Output Functions

### `output(...)`

Print values without newline.

```luma
output("Hello", " ", "World");  // Hello World
```

**Variadic**: Accepts any number of arguments of any type.

### `outputln(...)`

Print values with newline.

```luma
outputln("The answer is:", 42);  // The answer is: 42\n
```

**Examples:**

```luma
const main -> fn () int {
    let x: int = 10;
    let y: float = 3.14;
    
    outputln("x = ", x, ", y = ", y);  // x = 10, y = 3.14
    output("No newline");
    output(" - same line\n");
    
    return 0;
}
```

## Input Functions

### `input<T>(prompt: *byte) -> T`

Read typed input from user.

```luma
let name: *byte = input<*byte>("Enter your name: ");
let age: int = input<int>("Enter your age: ");
let height: double = input<double>("Enter height (meters): ");
```

**Type parameter**: Specify the type to read with `<T>`.

**Example:**

```luma
const main -> fn () int {
    let number: int = input<int>("Enter a number: ");
    outputln("You entered: ", number);
    
    let text: *byte = input<*byte>("Enter text: ");
    outputln("You wrote: ", text);
    
    return 0;
}
```

## System Functions

### `system(command: *byte) -> int`

Execute system command.

```luma
system("clear");           // Clear terminal (Linux/Mac)
system("cls");             // Clear terminal (Windows)
system("ls -la");          // List files
```

**Returns**: Command exit code.

**Example:**

```luma
const main -> fn () int {
    system("clear");
    outputln("Terminal cleared");
    
    let result: int = system("stty -icanon -echo");
    if (result != 0) {
        outputln("Command failed");
    }
    
    return 0;
}
```

## Type Information

### `sizeof<T> -> int`

Get the size of any type in bytes at compile time.

```luma
sizeof<int>        // 8
sizeof<byte>       // 1
sizeof<double>     // 8
sizeof<float>      // 4
sizeof<bool>       // 1
```

**Example:**

```luma
const main -> fn () int {
    outputln("int: ", sizeof<int>, " bytes");
    outputln("double: ", sizeof<double>, " bytes");
    outputln("byte: ", sizeof<byte>, " bytes");
    
    // Use in allocations
    let buffer: *int = cast<*int>(alloc(100 * sizeof<int>));
    defer free(buffer);
    
    return 0;
}
```

## Memory Functions

### `alloc(size: int) -> *void`

Allocate memory on the heap.

```luma
let ptr: *void = alloc(100);  // Allocate 100 bytes
```

**Returns**: Pointer to allocated memory, or null if failed.

### `free(ptr: *void)`

Deallocate previously allocated memory.

```luma
free(ptr);  // Free the memory
```

**Example:**

```luma
const main -> fn () int {
    // Allocate
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    defer free(ptr);
    
    // Use
    *ptr = 42;
    outputln("Value: ", *ptr);
    
    // Automatically freed via defer
    return 0;
}
```

## Type Casting

### `cast<T>(value)`

Explicitly convert between types.

```luma
let i: int = 42;
let f: float = cast<float>(i);  // int to float

let ptr: *void = alloc(100);
let typed: *int = cast<*int>(ptr);  // void* to int*
```

**See**: [Type Casting Guide](../advanced/type-casting.md)

## Summary Table

| Function | Purpose | Example |
|----------|---------|---------|
| `output(...)` | Print without newline | `output("Hi")` |
| `outputln(...)` | Print with newline | `outputln("Hello")` |
| `input<T>(...)` | Read typed input | `input<int>("Age: ")` |
| `system(...)` | Run shell command | `system("clear")` |
| `sizeof<T>` | Get type size | `sizeof<int>` |
| `alloc(...)` | Allocate memory | `alloc(100)` |
| `free(...)` | Free memory | `free(ptr)` |
| `cast<T>(...)` | Convert types | `cast<int>(3.14)` |

---