# Performance

Understanding performance is crucial for systems programming.

## Zero-Cost Abstractions

Luma follows the "zero-cost abstraction" principle: abstractions should have no runtime overhead.

### Generics are Zero-Cost

```luma
const add = fn<T>(a: T, b: T) T {
    return a + b;
}

// These calls compile to separate, optimized functions:
let x: int = add<int>(1, 2);        // Same as: x = 1 + 2
let y: float = add<float>(1.0, 2.0); // Same as: y = 1.0 + 2.0
```

**No runtime dispatch** - all generic instantiations are resolved at compile time through monomorphization.

## Monomorphization

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

### Benefits
- **No runtime overhead**: Each call is direct, no indirection
- **Full optimization**: Each instantiation fully optimized for its type
- **Type safety**: All checked at compile time

### Trade-offs
- **Binary size**: Separate copy for each type increases executable size
- **Compilation time**: More code to generate and optimize

## Memory Layout

### Struct Layout is Predictable

```luma
const Point -> struct {
    x: int,    // Offset 0, 8 bytes
    y: int     // Offset 8, 8 bytes
};  // Total: 16 bytes
```

### Array Layout is Contiguous

```luma
let arr: [int; 10];  // 80 contiguous bytes
// arr[0] at offset 0
// arr[1] at offset 8
// arr[2] at offset 16
// ...
```

This predictable layout enables:
- Cache-friendly access patterns
- SIMD optimization potential
- Direct hardware mapping

## Memory Allocation Performance

### Stack Allocation is Fast

```luma
const fast_function -> fn () void {
    let buffer: [int; 1024];  // Stack allocated - instant
    // Use buffer...
}  // Automatically cleaned up
```

**Benefits:**
- No system calls
- Instant allocation and deallocation
- Cache-friendly (usually)

### Heap Allocation has Overhead

```luma
const slower_function -> fn () void {
    let buffer: *int = cast<*int>(alloc(1024 * sizeof<int>));
    defer free(buffer);
    // Use buffer...
}
```

**Costs:**
- System call overhead
- Memory manager bookkeeping
- Potential fragmentation

## Optimization Guidelines

### 1. Prefer Stack Allocation When Possible

```luma
// Good: Stack allocation for small, fixed-size data
const process_small -> fn () void {
    let temp: [int; 100];
    // Process...
}

// Use heap only when necessary
const process_large -> fn () void {
    let temp: *int = cast<*int>(alloc(10000 * sizeof<int>));
    defer free(temp);
    // Process...
}
```

### 2. Minimize Pointer Indirection

```luma
// Better: direct access
let value: int = 42;
process(value);

// Slower: pointer dereference
let ptr: *int = &value;
process(*ptr);  // Extra memory load
```

### 3. Batch Operations

```luma
// Good: one large allocation
let buffer: *int = cast<*int>(alloc(1000 * sizeof<int>));
loop [i: int = 0](i < 1000) : (++i) {
    buffer[i] = compute(i);
}
free(buffer);

// Bad: many small allocations
loop [i: int = 0](i < 1000) : (++i) {
    let temp: *int = cast<*int>(alloc(sizeof<int>));
    *temp = compute(i);
    free(temp);
}
```

### 4. Avoid Unnecessary Copying

```luma
// Bad: pass large struct by value
const LargeStruct -> struct {
    data: [int; 1000],
    // ... more fields
};

const process_slow -> fn (s: LargeStruct) void {
    // Entire struct copied
}

// Good: pass by pointer
const process_fast -> fn (s: *LargeStruct) void {
    // Only pointer copied (8 bytes)
}
```

### 5. Use Appropriate Types

```luma
// Use smallest type that fits your data
let count: byte = 0;      // Good for 0-255
let flag: bool = true;    // Good for true/false

// Avoid oversized types
let count: int = 0;       // Overkill for small counter
```

## Performance Comparison

| Operation | Cost | Notes |
|-----------|------|-------|
| Stack variable | ~0 | Instant allocation |
| Heap allocation | High | System call, bookkeeping |
| Pointer dereference | Low | One memory access |
| Array index | Low | Offset + access |
| Function call | Low-Medium | Depends on inlining |
| Generic instantiation | 0 | Compile-time only |
| Struct field access | Low | Offset calculation |
| Enum comparison | ~0 | Integer comparison |

## Cache Efficiency

### Sequential Access (Fast)

```luma
// Good: Sequential access - cache friendly
loop [i: int = 0](i < 1000) : (++i) {
    arr[i] = arr[i] + 1;
}
```

### Random Access (Slower)

```luma
// Bad: Random access - cache unfriendly
loop [i: int = 0](i < 1000) : (++i) {
    let index: int = random() % 1000;
    arr[index] = arr[index] + 1;
}
```

## Function Inlining

Small functions may be inlined by the compiler:

```luma
// Likely inlined
const square -> fn (x: int) int {
    return x * x;
}

// Call becomes: result = value * value
let result: int = square(value);
```

## Benchmarking Tips

1. **Measure don't guess**: Use actual timings
2. **Test realistic data**: Don't optimize for toy examples
3. **Profile before optimizing**: Find actual bottlenecks
4. **Consider trade-offs**: Speed vs memory vs complexity

## Example: Optimized Buffer Processing

```luma
const process_buffer -> fn (data: *int, size: int) void {
    // Good practices:
    // 1. Pass by pointer (no copy)
    // 2. Size known (no bounds checking needed)
    // 3. Sequential access (cache-friendly)
    
    loop [i: int = 0](i < size) : (++i) {
        data[i] = data[i] * 2;
    }
}

const main -> fn () int {
    const SIZE: int = 10000;
    
    // Stack allocation for smaller sizes
    let buffer: [int; 10000];
    
    // Initialize
    loop [i: int = 0](i < SIZE) : (++i) {
        buffer[i] = i;
    }
    
    // Process (passes pointer to first element)
    process_buffer(cast<*int>(&buffer), SIZE);
    
    return 0;
}
```

## Summary

- **Use monomorphization**: Generics have zero runtime cost
- **Prefer stack allocation**: Faster and automatically cleaned up
- **Minimize indirection**: Direct access is faster
- **Sequential access**: Better cache utilization
- **Measure performance**: Profile before optimizing
- **Consider trade-offs**: Balance speed, memory, and code clarity

---

Back to [Advanced Topics Overview](README.md)
