# Enumerations

Enums provide type-safe constants with clean syntax.

## Basic Enums

```luma
const Direction -> enum {
    North,
    South,
    East,
    West
};

const current_direction: Direction = Direction::North;
```

## Accessing Enum Values

Use the `::` operator for static access to enum variants:

```luma
const Status -> enum {
    Active,
    Inactive,
    Pending,
};

const main -> fn () int {
    let status: Status = Status::Active;
    
    if (status == Status::Active) {
        outputln("System is active");
    }
    
    return 0;
}
```

## Enums in Switch Statements

Enums work naturally with switch statements:

```luma
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

const main -> fn () int {
    classify_day(WeekDay::Monday);   // Output: Weekday
    classify_day(WeekDay::Saturday); // Output: Weekend
    return 0;
}
```

## Pattern Matching

Switch statements with enums must be exhaustive - all variants must be covered:

```luma
const check_status -> fn (s: Status) void {
    switch (s) {
        Status::Active => outputln("System is running");
        Status::Inactive => outputln("System is stopped");
        Status::Pending => outputln("System is starting");
        // All variants covered - no default needed
    }
}
```

## Using Enums with Functions

```luma
const Direction -> enum {
    North,
    South,
    East,
    West
};

const get_direction_name -> fn (dir: Direction) *byte {
    switch (dir) {
        Direction::North => return "North";
        Direction::South => return "South";
        Direction::East => return "East";
        Direction::West => return "West";
    }
}

const main -> fn () int {
    let dir: Direction = Direction::North;
    outputln("Moving ", get_direction_name(dir));
    return 0;
}
```

## Benefits

- **Type Safety**: Cannot accidentally use an invalid value
- **Exhaustiveness**: Compiler ensures all cases are handled
- **Self-Documenting**: Clear intent with named constants
- **Namespace Isolation**: Variants scoped to enum name

---

Next: [Structures](structs.md)
