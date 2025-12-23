# Safety Features

Luma provides several safety features to prevent common bugs.

## 1. Static Memory Analysis

The compiler tracks memory allocations and deallocations at compile time.

### What It Detects

- **Memory leaks**: Allocations without corresponding frees
- **Double-free**: Freeing the same pointer twice
- **Use-after-free**: Accessing freed memory
- **Missing cleanup**: Forgotten defer statements

### How It Works

```luma
// ✅ Good: Properly freed
const safe_function -> fn () void {
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    defer free(ptr);
    *ptr = 42;
}

// ❌ Bad: Memory leak detected
const leak_function -> fn () void {
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    *ptr = 42;
    // Compiler error: memory leak
}
```

### Benefits

- Catches errors before runtime
- No performance overhead
- Clear error messages

## 2. Ownership Attributes

Document and enforce memory ownership patterns.

### `#returns_ownership`

Marks functions that allocate and return memory:

```luma
#returns_ownership
const create_buffer -> fn (size: int) *int {
    let buffer: *int = cast<*int>(alloc(size * sizeof<int>));
    return buffer;  // Caller owns this
}

const main -> fn () int {
    let data: *int = create_buffer(100);
    defer free(data);  // Caller must free
    return 0;
}
```

### `#takes_ownership`

Marks functions that take ownership of parameters:

```luma
#takes_ownership
const consume -> fn (ptr: *int) void {
    outputln(*ptr);
    free(ptr);  // This function frees it
}

const main -> fn () int {
    let data: *int = cast<*int>(alloc(sizeof<int>));
    *data = 42;
    consume(data);  // Ownership transferred
    // Don't use data after this!
    return 0;
}
```

### Benefits

- Self-documenting code
- Compiler verification
- Clear ownership transfer

## 3. Defer Statements

Guarantee cleanup code execution.

### Basic Usage

```luma
const process -> fn () int {
    let file: *File = open("data.txt");
    defer close(file);  // Always runs
    
    let buffer: *byte = cast<*byte>(alloc(1024));
    defer free(buffer);  // Always runs
    
    // Even if early return
    if (error) {
        return -1;  // Defers still execute
    }
    
    return 0;
    // Defers execute here in reverse order
}
```

### Execution Order

LIFO - Last In, First Out:

```luma
defer outputln("Third");
defer outputln("Second");
defer outputln("First");
// Outputs: First, Second, Third
```

### Benefits

- Prevents resource leaks
- Works with early returns
- Keeps cleanup code together

## 4. Strong Type System

No implicit conversions that lose information.

### Explicit Casting Required

```luma
let i: int = 42;
let f: float = cast<float>(i);  // Must be explicit

// let f: float = i;  // Error: no implicit conversion
```

### Type-Safe Generics

```luma
const add = fn<T>(a: T, b: T) T {
    return a + b;
}

// Must specify type
let result: int = add<int>(5, 10);  // OK

// Type mismatch caught at compile time
// let result: int = add<int>(5, 3.14);  // Error
```

### Enum Exhaustiveness

All enum variants must be handled:

```luma
const Status -> enum {
    Active,
    Inactive,
    Pending,
};

const check -> fn (s: Status) void {
    switch (s) {
        Status::Active => outputln("Running");
        Status::Inactive => outputln("Stopped");
        Status::Pending => outputln("Starting");
        // All variants covered - compiler happy
    }
}

// Missing a variant?
// Compiler error: non-exhaustive switch
```

### Benefits

- Catch errors at compile time
- No runtime surprises
- Self-documenting code

## 5. Explicit Error Handling

No hidden exceptions or error paths.

### Error Return Values

```luma
const divide -> fn (a: int, b: int) int {
    if (b == 0) {
        return -1;  // Error code
    }
    return a / b;
}

const main -> fn () int {
    let result: int = divide(10, 0);
    if (result < 0) {
        outputln("Division by zero");
        return 1;
    }
    return 0;
}
```

### Result Structs

```luma
const Result -> struct {
    success: bool,
    value: int,
    error: *byte
};

const safe_divide -> fn (a: int, b: int) Result {
    if (b == 0) {
        return Result {
            success: false,
            value: 0,
            error: "Division by zero"
        };
    }
    return Result {
        success: true,
        value: a / b,
        error: cast<*byte>(0)
    };
}
```

### Benefits

- Predictable control flow
- No hidden costs
- Explicit error paths

## 6. Compile-Time Checks

Many errors caught before running.

### Examples

```luma
// Type errors
let x: int = "hello";  // Error: type mismatch

// Const reassignment
const MAX: int = 100;
MAX = 200;  // Error: cannot reassign const

// Missing return
const get_value -> fn () int {
    // Error: no return statement
}

// Undefined variable
outputln(undefined_var);  // Error: not defined

// Wrong argument types
const add -> fn (a: int, b: int) int { return a + b; };
add(5, 3.14);  // Error: type mismatch
```

## Best Practices Summary

1. **Use `defer` for cleanup**: Pair every allocation with a defer
2. **Annotate ownership**: Use `#returns_ownership` and `#takes_ownership`
3. **Handle all cases**: Make switch statements exhaustive
4. **Check allocations**: Verify `alloc()` didn't return null
5. **Explicit casts**: Don't hide type conversions
6. **Return error codes**: Make errors visible
7. **Trust the compiler**: Fix warnings before they become bugs

## Example: Safe Code Pattern

```luma
#returns_ownership
const create_safe -> fn (size: int) *int {
    // Allocate
    let ptr: *int = cast<*int>(alloc(size * sizeof<int>));
    
    // Check allocation
    if (ptr == cast<*int>(0)) {
        return cast<*int>(0);  // Return null on failure
    }
    
    // Initialize
    loop [i: int = 0](i < size) : (++i) {
        ptr[i] = 0;
    }
    
    return ptr;  // Ownership transferred
}

const main -> fn () int {
    let data: *int = create_safe(100);
    defer free(data);  // Guaranteed cleanup
    
    // Check allocation succeeded
    if (data == cast<*int>(0)) {
        outputln("Allocation failed");
        return 1;
    }
    
    // Safe to use
    data[0] = 42;
    outputln("Success: ", data[0]);
    
    return 0;
}
```

---

Next: [Quick Reference](quick-reference.md)
