# Pointer Arithmetic

Luma supports pointer arithmetic for low-level memory manipulation.

## Basic Pattern

Convert pointer to integer, perform arithmetic, convert back:

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

## Array Indexing vs Pointer Arithmetic

### Array Indexing (Preferred)

```luma
let arr: *int = cast<*int>(alloc(10 * sizeof<int>));
defer free(arr);

arr[0] = 10;
arr[1] = 20;
arr[2] = 30;

outputln("arr[1] = ", arr[1]);
```

### Pointer Arithmetic (Manual)

```luma
let arr: *int = cast<*int>(alloc(10 * sizeof<int>));
defer free(arr);

// Set arr[0]
*arr = 10;

// Set arr[1]
let addr1: int = cast<int>(arr) + sizeof<int>;
let ptr1: *int = cast<*int>(addr1);
*ptr1 = 20;

// Set arr[2]
let addr2: int = cast<int>(arr) + (2 * sizeof<int>);
let ptr2: *int = cast<*int>(addr2);
*ptr2 = 30;
```

## Traversing Memory

```luma
const traverse -> fn (arr: *int, size: int) void {
    let i: int = 0;
    loop (i < size) {
        let addr: int = cast<int>(arr) + (i * sizeof<int>);
        let ptr: *int = cast<*int>(addr);
        outputln("Value: ", *ptr);
        ++i;
    }
}
```

## Byte-Level Access

```luma
const inspect_bytes -> fn (ptr: *int) void {
    let byte_ptr: *byte = cast<*byte>(ptr);
    
    loop [i: int = 0](i < sizeof<int>) : (++i) {
        let addr: int = cast<int>(byte_ptr) + i;
        let b: *byte = cast<*byte>(addr);
        outputln("Byte ", i, ": ", *b);
    }
}
```

## Pointer Offsets

```luma
const get_offset -> fn (base: *int, offset: int) *int {
    let addr: int = cast<int>(base);
    let new_addr: int = addr + (offset * sizeof<int>);
    return cast<*int>(new_addr);
}

const main -> fn () int {
    let arr: *int = cast<*int>(alloc(10 * sizeof<int>));
    defer free(arr);
    
    arr[5] = 100;
    
    let ptr: *int = get_offset(arr, 5);
    outputln("Value at offset 5: ", *ptr);  // 100
    
    return 0;
}
```

## Buffer Manipulation

```luma
const copy_buffer -> fn (dest: *byte, src: *byte, size: int) void {
    loop [i: int = 0](i < size) : (++i) {
        let src_addr: int = cast<int>(src) + i;
        let dest_addr: int = cast<int>(dest) + i;
        
        let src_ptr: *byte = cast<*byte>(src_addr);
        let dest_ptr: *byte = cast<*byte>(dest_addr);
        
        *dest_ptr = *src_ptr;
    }
}
```

## Alignment Considerations

Be careful with alignment when casting:

```luma
// Safe: int is 8 bytes, address is 8-byte aligned
let int_ptr: *int = cast<*int>(alloc(sizeof<int>));
defer free(int_ptr);

// Potentially unsafe: manual address might not be aligned
let addr: int = some_address;
let ptr: *double = cast<*double>(addr);  // Ensure addr % 8 == 0
```

## Common Use Cases

### Substring Pointer

```luma
const get_substring -> fn (str: *byte, offset: int) *byte {
    let addr: int = cast<int>(str);
    let new_addr: int = addr + offset;
    return cast<*byte>(new_addr);
}

const main -> fn () int {
    let text: *byte = "Hello, World!";
    let substr: *byte = get_substring(text, 7);
    outputln(substr);  // "World!"
    return 0;
}
```

### Array Slicing

```luma
const process_slice -> fn (arr: *int, start: int, end: int) void {
    loop [i: int = start](i < end) : (++i) {
        let addr: int = cast<int>(arr) + (i * sizeof<int>);
        let ptr: *int = cast<*int>(addr);
        outputln(*ptr);
    }
}
```

## Safety Guidelines

1. **Always check bounds**: Don't access beyond allocated memory
2. **Respect alignment**: Ensure pointers are properly aligned for their type
3. **Prefer array indexing**: Use `arr[i]` over manual pointer arithmetic
4. **Document assumptions**: Comment size and alignment requirements
5. **Use sizeof**: Never hardcode type sizes

```luma
// Good: Safe bounds checking
const safe_access -> fn (arr: *int, size: int, index: int) int {
    if (index < 0 || index >= size) {
        return -1;  // Error
    }
    return arr[index];
}

// Bad: No bounds checking
const unsafe_access -> fn (arr: *int, index: int) int {
    return arr[index];  // Might access invalid memory
}
```

---

