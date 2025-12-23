# Module System

Luma provides a simple module system for code organization and namespace management.

## Module Declaration

Every Luma source file must declare its module name:

```luma
@module "main"

// Your code here...
```

## Importing Modules

Use the `@use` directive to import other modules:

```luma
@module "main"

@use "math" as math
@use "string" as str

pub const main -> fn () int {
    // Access imported functions with namespace
    let result: double = math::sqrt(25.0);
    let len: int = str::strlen("hello");
    
    outputln("Square root: ", result);
    outputln("Length: ", len);
    return 0;
}
```

## Name Resolution

### Static Access with `::`

The `::` operator is used for **compile-time static access**:

```luma
// Module/namespace access
math::sqrt(16.0)

// Enum variants
let day: WeekDay = WeekDay::Monday;

// Future: Associated functions
Point::new(10, 20)
```

### Runtime Member Access with `.`

The `.` operator is used for **runtime member access**:

```luma
// Struct field access
let point: Point = Point { x: 10, y: 20 };
outputln(point.x);  // Access field at runtime

// Method calls on instances
let distance: float = origin.distance_to(destination);

// Generic struct field access
let box: Box<int> = Box { value: 42 };
outputln(box.value);
```

## Public vs Private

### Public Module Members

Use `pub` to export items from a module:

```luma
@module "math"

// Public - accessible from other modules
pub const PI: double = 3.14159265359;

pub const sqrt -> fn (x: double) double {
    return x;
}

// Private - only within this module
const INTERNAL_CONSTANT: int = 42;

const helper -> fn (x: int) int {
    return x * 2;
}
```

### Using Public Members

```luma
@module "main"

@use "math" as math

pub const main -> fn () int {
    outputln(math::PI);         // OK - public
    let r: double = math::sqrt(25.0);  // OK - public
    
    // outputln(math::INTERNAL_CONSTANT); // Error - private
    // math::helper(5);                   // Error - private
    
    return 0;
}
```

## Creating Your Own Modules

### Module File Structure

```
project/
├── main.lx
├── math.lx
└── utils.lx
```

### Example: math.lx

```luma
@module "math"

pub const PI: double = 3.14159265359;
pub const TAU: double = 6.28318530718;

pub const square -> fn (x: double) double {
    return x * x;
}

pub const cube -> fn (x: double) double {
    return x * x * x;
}

const internal_helper -> fn (x: double) double {
    return x * 2.0;
}
```

### Example: utils.lx

```luma
@module "utils"

pub const clamp -> fn (value: int, min: int, max: int) int {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

pub const is_even -> fn (n: int) bool {
    return n % 2 == 0;
}
```

### Example: main.lx

```luma
@module "main"

@use "math" as math
@use "utils" as utils

pub const main -> fn () int {
    let area: double = math::PI * math::square(5.0);
    outputln("Circle area: ", area);
    
    let value: int = utils::clamp(150, 0, 100);
    outputln("Clamped value: ", value);
    
    if (utils::is_even(42)) {
        outputln("42 is even");
    }
    
    return 0;
}
```

## Module Features

- **Explicit imports**: All dependencies must be explicitly declared
- **Namespace isolation**: Imported modules are accessed through their aliases
- **Static resolution**: All module access is resolved at compile time using `::`
- **Clean syntax**: Simple `@use "module" as alias` pattern
- **No circular dependencies**: Modules cannot import each other in a cycle

## Benefits of Module Separation

1. **Organization**: Logical grouping of related functionality
2. **Namespace control**: Avoid name conflicts
3. **Reusability**: Share code between projects
4. **Encapsulation**: Hide implementation details with private members
5. **Clarity**: Explicit imports make dependencies clear

---

Back to [Language Features Overview](README.md)
