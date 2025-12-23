# Memory Management

Luma provides explicit memory management with safety-oriented features.

## Basic Memory Operations

```luma
alloc(size: int) -> *void    // Allocate memory
free(ptr: *void)             // Deallocate memory
sizeof<T> -> int             // Size of type
```

## Simple Example

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

## The `defer` Statement

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

### Multiple Deferred Statements

```luma
defer {
    close_file(file);
    cleanup_resources();
    log("Operation completed");
}
```

### Defer Execution Order

Deferred statements execute in reverse order (LIFO - Last In, First Out):

```luma
const demo -> fn () void {
    defer outputln("Third");
    defer outputln("Second");
    defer outputln("First");
    outputln("Function body");
}
// Output: Function body, First, Second, Third
```

## Ownership Transfer Attributes

Luma provides function attributes that document and enforce ownership semantics.

### `#returns_ownership`

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

### `#takes_ownership`

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
    // data should not be used after this
    
    return 0;
}
```

## Static Memory Analysis

Luma's compiler includes a static analyzer that tracks memory at compile time.

### What the Analyzer Tracks

**Verified at Compile Time:**
- **Memory Leaks**: Detects `alloc()` calls without corresponding `free()`
- **Double-Free**: Prevents freeing the same pointer twice
- **Use-After-Free**: Catches access to freed memory within the same function
- **Ownership Transfer**: Validates ownership annotations
- **Defer Statement Cleanup**: Ensures deferred frees execute properly

### Examples

#### Good: Proper Cleanup

```luma
const good_memory_usage -> fn () void {
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    defer free(ptr);  // Analyzer confirms cleanup
    *ptr = 42;
}  // No leak reported
```

#### Bad: Memory Leak

```luma
const bad_memory_usage -> fn () void {
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    *ptr = 42;
    // Compiler error: memory leak - ptr never freed
}
```

#### Good: Ownership Transfer

```luma
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

## Working with Arrays

```luma
const main -> fn () int {
    // Allocate array
    let arr: *int = cast<*int>(alloc(10 * sizeof<int>));
    defer free(arr);
    
    // Initialize
    loop [i: int = 0](i < 10) : (++i) {
        arr[i] = i * 10;
    }
    
    // Use array
    loop [i: int = 0](i < 10) : (++i) {
        outputln("arr[", i, "] = ", arr[i]);
    }
    
    return 0;
}
```

## Best Practices

1. **Always pair `alloc` with `free`**: Use `defer` to guarantee cleanup
2. **Use ownership annotations**: Document which functions own memory
3. **Prefer stack allocation**: For small, fixed-size data
4. **Check allocation success**: Handle out-of-memory conditions
5. **One allocation per variable**: Avoid reassigning pointers without freeing

```luma
const safe_allocation -> fn () int {
    // Good: Clear ownership with defer
    let buffer: *int = cast<*int>(alloc(100 * sizeof<int>));
    defer free(buffer);
    
    if (buffer == cast<*int>(0)) {
        return -1;  // Allocation failed
    }
    
    // Use buffer safely
    buffer[0] = 42;
    
    return 0;
    // Automatically freed via defer
}
```

## Common Patterns

### Temporary Buffer

```luma
const process -> fn () void {
    let temp: *byte = cast<*byte>(alloc(1024));
    defer free(temp);
    
    // Use temp...
}
```

### Resource Management

```luma
const do_work -> fn () int {
    let file: *File = open("data.txt");
    defer close(file);
    
    let buffer: *byte = cast<*byte>(alloc(4096));
    defer free(buffer);
    
    // Process file...
    
    return 0;
}
```

### Factory Pattern

```luma
#returns_ownership
const create_object -> fn () *MyObject {
    let obj: *MyObject = cast<*MyObject>(alloc(sizeof<MyObject>));
    initialize_object(obj);
    return obj;
}

const main -> fn () int {
    let obj: *MyObject = create_object();
    defer free(obj);
    
    use_object(obj);
    
    return 0;
}
```

---

Next: [Pointer Arithmetic](pointer-arithmetic.md)
