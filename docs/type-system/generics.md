# Generics (Not Yet Supported)

Luma supports generic programming through templates, enabling you to write code that works with multiple types while maintaining type safety and zero-cost abstractions.

> **Note**: Generic support is planned but not yet implemented in the current version.

## Generic Functions

Generic functions are declared with type parameters in angle brackets `<>`:

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

## Using Generic Functions

Generic functions require **explicit type arguments** at the call site:

```luma
const main -> fn() int {
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

## Generic Structs

Structs can also be generic:

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
```

## Usage Examples

```luma
const main -> fn() int {
    // Box holding an integer
    let int_box: Box<int> = Box { value: 42 };
    outputln("Box contains: ", int_box.get());
    
    // Box holding a float
    let float_box: Box<float> = Box { value: 3.14 };
    
    // Pair with different types
    let pair: Pair<int, *byte> = Pair { 
        first: 1, 
        second: "hello" 
    };
    outputln("Pair: (", pair.first, ", ", pair.second, ")");
    
    return 0;
}
```

## Monomorphization

Luma uses **monomorphization** for generic code generation:

- The compiler generates **separate machine code** for each concrete type used
- Generic code has **zero runtime overhead** compared to hand-written type-specific code
- Each instantiation (e.g., `add<int>`, `add<float>`) produces its own optimized assembly
- Similar to C++ templates and Rust generics, not Java's type erasure

### Example

```luma
const identity = fn<T>(x: T) T {
    return x;
}

// These calls generate separate functions in the compiled binary:
let a: int = identity<int>(42);        // Generates identity_int
let b: float = identity<float>(3.14);  // Generates identity_float
let c: *byte = identity<*byte>("hello");   // Generates identity_str
```

## Benefits

- **Type Safety**: Compile-time type checking
- **Zero Cost**: No runtime overhead
- **Code Reuse**: Write once, use with many types
- **Optimization**: Each instantiation fully optimized

## Trade-offs

- **Binary Size**: Separate copy for each type increases executable size
- **Compilation Time**: More code to generate and optimize
- **Explicit Types**: Must specify type arguments at call sites

---

Back to [Type System Overview](README.md)
