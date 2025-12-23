# Type Casting

Luma uses explicit casting with the `cast<T>()` function for all type conversions.

## Basic Syntax

```luma
cast<TargetType>(expression)
```

All type conversions must be explicit - there are no implicit casts (except for safe promotions).

## Numeric Conversions

### Integer to Float

```luma
const main -> fn () int {
    let i: int = 42;
    let f: float = cast<float>(i);  // 42.0
    
    outputln("Integer: ", i);
    outputln("Float: ", f);
    
    return 0;
}
```

### Float to Integer

Truncates the decimal part:

```luma
const main -> fn () int {
    let pi: double = 3.14159;
    let rounded: int = cast<int>(pi);  // 3
    
    outputln("Original: ", pi);
    outputln("Truncated: ", rounded);
    
    return 0;
}
```

### Between Integer Types

```luma
const main -> fn () int {
    // int to byte
    let large: int = 65;
    let small: byte = cast<byte>(large);  // 'A'
    
    // byte to int
    let c: byte = 'Z';
    let code: int = cast<int>(c);  // 90
    
    outputln("Character: ", small);
    outputln("ASCII code: ", code);
    
    return 0;
}
```

## Pointer Casting

### Void Pointer to Typed Pointer

```luma
const main -> fn () int {
    // Allocate as void pointer
    let raw: *void = alloc(sizeof<int>);
    
    // Cast to typed pointer
    let typed: *int = cast<*int>(raw);
    *typed = 42;
    
    outputln("Value: ", *typed);
    free(raw);
    
    return 0;
}
```

### Between Pointer Types

```luma
const main -> fn () int {
    let int_ptr: *int = cast<*int>(alloc(sizeof<int>));
    *int_ptr = 100;
    
    // Cast to void pointer
    let void_ptr: *void = cast<*void>(int_ptr);
    
    // Cast back
    let int_ptr2: *int = cast<*int>(void_ptr);
    outputln("Value: ", *int_ptr2);  // 100
    
    free(int_ptr);
    return 0;
}
```

## Pointer to Integer (and back)

Useful for pointer arithmetic:

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
    
    *offset_ptr = 'X';
    outputln("Set byte at offset 5");
    
    return 0;
}
```

## Array Element Pointers

```luma
const main -> fn () int {
    let arr: [int; 5] = [10, 20, 30, 40, 50];
    
    // Get pointer to array
    let ptr: *int = cast<*int>(&arr);
    
    // Access elements via pointer
    outputln("First: ", *ptr);      // 10
    outputln("Second: ", ptr[1]);   // 20
    
    return 0;
}
```

## Type Reinterpretation

### Viewing Data as Different Type

```luma
const main -> fn () int {
    let value: int = 0x4142434445464748;
    
    // View as byte array
    let bytes: *byte = cast<*byte>(&value);
    
    loop [i: int = 0](i < sizeof<int>) : (++i) {
        outputln("Byte ", i, ": ", bytes[i]);
    }
    
    return 0;
}
```

## Common Patterns

### Memory Allocation

```luma
const allocate_buffer -> fn (size: int) *int {
    let raw: *void = alloc(size * sizeof<int>);
    return cast<*int>(raw);
}

const main -> fn () int {
    let buffer: *int = allocate_buffer(100);
    defer free(buffer);
    
    buffer[0] = 42;
    outputln(buffer[0]);
    
    return 0;
}
```

### Character Conversion

```luma
const to_uppercase -> fn (c: byte) byte {
    if (c >= 'a' && c <= 'z') {
        return cast<byte>(cast<int>(c) - 32);
    }
    return c;
}

const main -> fn () int {
    let lower: byte = 'a';
    let upper: byte = to_uppercase(lower);
    outputln("Uppercase: ", upper);  // 'A'
    return 0;
}
```

### Null Pointer Checks

```luma
const main -> fn () int {
    let ptr: *int = cast<*int>(alloc(sizeof<int>));
    
    if (ptr == cast<*int>(0)) {
        outputln("Allocation failed!");
        return -1;
    }
    
    *ptr = 42;
    outputln("Value: ", *ptr);
    free(ptr);
    
    return 0;
}
```

## Safety Considerations

1. **Know your types**: Understand what you're casting to/from
2. **Check alignment**: Ensure proper alignment for typed pointers
3. **Validate sizes**: Don't cast between incompatible sizes carelessly
4. **Document intent**: Comment why the cast is necessary
5. **Avoid data loss**: Be aware of truncation in numeric casts

### Safe Casting Examples

```luma
// Good: Safe promotion
let small: int = 100;
let large: double = cast<double>(small);  // No data loss

// Caution: Potential truncation
let big: double = 3.14159;
let truncated: int = cast<int>(big);  // Loses decimal part

// Good: Explicit null check
let ptr: *int = cast<*int>(alloc(sizeof<int>));
if (ptr == cast<*int>(0)) {
    // Handle allocation failure
}

// Caution: Reinterpreting memory
let int_val: int = 42;
let byte_ptr: *byte = cast<*byte>(&int_val);  // Platform-dependent
```

## When to Cast

**Required casts:**
- `alloc()` returns `*void` - must cast to specific type
- Pointer arithmetic requires integer conversion
- Between numeric types for calculations

**Optional but recommended:**
- Making implicit conversions explicit
- Documenting intentional type changes
- Clarifying code intent

---

Next: [Performance](performance.md)
