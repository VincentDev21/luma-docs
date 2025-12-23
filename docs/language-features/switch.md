# Switch Statements

Luma provides powerful pattern matching through switch statements.

## Basic Syntax

```luma
@module "main"

const WeekDay -> enum {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
};

const classify_day -> fn (day: WeekDay) void {
    switch (day) {
        WeekDay::Monday, WeekDay::Tuesday, WeekDay::Wednesday, 
        WeekDay::Thursday, WeekDay::Friday =>
            outputln("Weekday");
        WeekDay::Saturday, WeekDay::Sunday =>
            outputln("Weekend");
    }
}

pub const main -> fn () int {
    classify_day(WeekDay::Monday);   // Output: Weekday
    classify_day(WeekDay::Saturday); // Output: Weekend
    return 0;
}
```

## Switch with Enums

All enum variants must be covered:

```luma
const Status -> enum {
    Active,
    Inactive,
    Pending,
};

const check_status -> fn (s: Status) void {
    switch (s) {
        Status::Active => outputln("System is running");
        Status::Inactive => outputln("System is stopped");
        Status::Pending => outputln("System is starting");
        // All variants covered - exhaustive
    }
}
```

## Switch with Integers

```luma
const handle_status_code -> fn (code: int) void {
    switch (code) {
        200 => outputln("OK");
        404 => outputln("Not Found");
        500 => outputln("Internal Server Error");
        _ => outputln("Unknown status code");  // Default case
    }
};
```

## Default Case

Use `_` for catch-all cases:

```luma
const get_grade -> fn (score: int) *byte {
    switch (score / 10) {
        10, 9 => return "A";
        8 => return "B";
        7 => return "C";
        6 => return "D";
        _ => return "F";  // Everything else
    }
}
```

## Multiple Values Per Case

Combine multiple values using commas:

```luma
const classify_number -> fn (n: int) void {
    switch (n) {
        1, 3, 5, 7, 9 => outputln("Odd single digit");
        0, 2, 4, 6, 8 => outputln("Even single digit");
        _ => outputln("Other number");
    }
}
```

## Switch Features

### No Fallthrough

Each case is automatically contained (no `break` needed):

```luma
switch (value) {
    1 => do_something();     // Executes only this
    2 => do_something_else(); // Won't fall through from case 1
    _ => default_action();
}
```

### Compile-Time Constants

All case values must be compile-time constants:

```luma
const MAX: int = 100;

switch (value) {
    0 => handle_zero();
    MAX => handle_max();  // OK - constant
    // variable => ...    // Error - not a constant
}
```

### Exhaustiveness

Enums require all variants to be covered:

```luma
const Direction -> enum {
    North,
    South,
    East,
    West
};

const move -> fn (dir: Direction) void {
    switch (dir) {
        Direction::North => move_up();
        Direction::South => move_down();
        Direction::East => move_right();
        Direction::West => move_left();
        // All covered - compiler is happy
    }
}
```

## Return from Switch

```luma
const get_message -> fn (status: Status) *byte {
    switch (status) {
        Status::Active => return "Running";
        Status::Inactive => return "Stopped";
        Status::Pending => return "Starting";
    }
}
```

## Complex Switch Logic

```luma
const process_input -> fn (cmd: byte) void {
    switch (cmd) {
        'q', 'Q' => {
            outputln("Quitting...");
            cleanup();
            exit(0);
        }
        'h', 'H', '?' => {
            show_help();
        }
        '1', '2', '3', '4', '5' => {
            select_option(cmd - '0');
        }
        _ => {
            outputln("Unknown command");
        }
    }
}
```

## Best Practices

1. **Use enums for state**: Leverage exhaustiveness checking
2. **Keep cases simple**: Complex logic should be in separate functions
3. **Provide defaults**: Use `_` for unexpected values
4. **Group related values**: Use comma-separated lists

---

Next: [Module System](modules.md)
