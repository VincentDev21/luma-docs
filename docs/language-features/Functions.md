# Functions

Functions are first-class values in Luma.

## Function Declaration

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

## Function Calls

```luma
const main -> fn () int {
    let result: int = add(5, 3);
    outputln("5 + 3 = ", result);
    
    greet();
    print_number(42);
    
    return 0;
}
```

## Function Parameters

### Pass by Value

Parameters are passed by value by default (copied):

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

### Pass by Reference

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

## Return Values

### Single Return Value

```luma
const square -> fn (x: int) int {
    return x * x;
};
```

### Multiple Return Values

Use a struct to return multiple values:

```luma
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

## Early Returns

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

## Recursive Functions

```luma
const factorial -> fn (n: int) int {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
};

const fibonacci -> fn (n: int) int {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
};

const main -> fn () int {
    outputln("factorial(5) = ", factorial(5));   // 120
    outputln("fibonacci(10) = ", fibonacci(10)); // 55
    return 0;
}
```

## Function Pointers

Functions can be assigned to variables:

```luma
const add -> fn (a: int, b: int) int {
    return a + b;
};

const subtract -> fn (a: int, b: int) int {
    return a - b;
};

const main -> fn () int {
    let operation: fn(int, int) -> int;
    
    operation = add;
    outputln("5 + 3 = ", operation(5, 3));
    
    operation = subtract;
    outputln("5 - 3 = ", operation(5, 3));
    
    return 0;
}
```

## Public vs Private Functions

Use `pub` to make functions visible outside their module:

```luma
// Public - accessible from other modules
pub const public_function -> fn () void {
    outputln("This is public");
}

// Private - only within this module
const private_helper -> fn () void {
    outputln("This is private");
}
```

## Name Resolution

Functions use the `::` operator for static access:

```luma
@use "math" as math

const main -> fn () int {
    let result: double = math::sqrt(25.0);
    outputln("Square root: ", result);
    return 0;
}
```

---

