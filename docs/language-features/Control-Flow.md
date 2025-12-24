# Control Flow

Luma provides clean, flexible control flow constructs.

## Conditional Statements

### If-Elif-Else

```luma
const x: int = 7;

if (x > 10) {
    outputln("Large number");
} elif (x > 5) {
    outputln("Medium number");  // This will execute
} else {
    outputln("Small number");
}
```

### Simple If

```luma
if (condition) {
    do_something();
}
```

### If-Else

```luma
if (x > 0) {
    outputln("Positive");
} else {
    outputln("Non-positive");
}
```

## Loop Constructs

The `loop` keyword provides several iteration patterns:

### For-Style Loops

```luma
// Basic for loop with explicit increment
loop [i: int = 0](i < 10) {
    outputln("Iteration: ", i);
    ++i;
}

// For loop with post-increment
loop [i: int = 0](i < 10) : (++i) {
    outputln("i = ", i);
}

// Multiple loop variables
loop [i: int = 0, j: int = 0](i < 10) : (++i) {
    outputln("i = ", i, ", j = ", j);
    ++j;
}
```

### While-Style Loops

```luma
// Condition-only loop
let counter: int = 0;
loop (counter < 5) {
    outputln("Count: ", counter);
    counter = counter + 1;
}

// While loop with post-action
let j: int = 0;
loop (j < 10) : (++j) {
    outputln("Processing: ", j);
}
```

### Infinite Loops

```luma
loop {
    // Runs forever until `break` is encountered
    if (should_exit()) {
        break;
    }
    do_work();
}
```

## Loop Control

### Break

Exit the loop early:

```luma
loop [i: int = 0](i < 100) : (++i) {
    if (i == 50) {
        break;  // Exit loop
    }
    process(i);
}
```

### Continue

Skip to the next iteration:

```luma
loop [i: int = 0](i < 10) : (++i) {
    if (i % 2 == 0) {
        continue;  // Skip even numbers
    }
    outputln("Odd: ", i);
}
```

## Common Patterns

### Counting Loop

```luma
loop [i: int = 0](i < 10) : (++i) {
    outputln(i);
}
```

### Array Iteration

```luma
const numbers: [int; 5] = [10, 20, 30, 40, 50];

loop [i: int = 0](i < 5) : (++i) {
    outputln("numbers[", i, "] = ", numbers[i]);
}
```

### Countdown

```luma
loop [i: int = 10](i >= 0) : (--i) {
    outputln("Countdown: ", i);
}
```

### Search Loop

```luma
const find -> fn (arr: *int, size: int, target: int) int {
    loop [i: int = 0](i < size) : (++i) {
        if (arr[i] == target) {
            return i;  // Found
        }
    }
    return -1;  // Not found
}
```

### Loop Until Condition

```luma
let done: bool = false;
loop (!done) {
    done = process_item();
}
```

## Nested Loops

```luma
loop [i: int = 0](i < 3) : (++i) {
    loop [j: int = 0](j < 3) : (++j) {
        outputln("(", i, ", ", j, ")");
    }
}
```

### Breaking from Nested Loops

```luma
let found: bool = false;
loop [i: int = 0](i < 10 && !found) : (++i) {
    loop [j: int = 0](j < 10) : (++j) {
        if (matrix[i][j] == target) {
            found = true;
            break;  // Breaks inner loop
        }
    }
}
```

---

