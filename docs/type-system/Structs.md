# Structures

Structures group related data with optional access control and methods.

## Basic Structures

```luma
const Point -> struct {
    x: int,
    y: int
};

const main -> fn () int {
    let origin: Point = Point { x: 0, y: 0 };
    let destination: Point = Point { x: 10, y: 20 };
    
    outputln("Origin: (", origin.x, ", ", origin.y, ")");
    outputln("Destination: (", destination.x, ", ", destination.y, ")");
    
    return 0;
}
```

## Struct with Methods

Methods can be defined inside struct definitions:

```luma
const Point -> struct {
    x: int,
    y: int,
    
    distance_to -> fn (other: Point) float {
        let dx: int = other.x - x;
        let dy: int = other.y - y;
        return sqrt(cast(dx * dx + dy * dy));
    }
};

const main -> fn () int {
    let p1: Point = Point { x: 0, y: 0 };
    let p2: Point = Point { x: 3, y: 4 };
    
    let dist: float = p1.distance_to(p2);
    outputln("Distance: ", dist);  // 5.0
    
    return 0;
}
```

## Access Control

Use `pub:` and `priv:` sections to control field visibility:

```luma
const Player -> struct {
pub:
    name: *byte,
    score: int,
    
priv:
    internal_id: uint,
    session_token: *byte,
    
    get_display_name -> fn () *byte {
        return name;  // Methods can access private fields
    }
};

const main -> fn () int {
    let player: Player = Player {
        name: "Alice",
        score: 1000,
        internal_id: 12345,
        session_token: "secret123"
    };
    
    outputln("Player: ", player.name);        // OK - public
    outputln("Score: ", player.score);        // OK - public
    // outputln(player.internal_id);         // Error - private
    
    return 0;
}
```

## Nested Structures

```luma
const Address -> struct {
    street: *byte,
    city: *byte,
    zip: int
};

const Person -> struct {
    name: *byte,
    age: int,
    address: Address
};

const main -> fn () int {
    let person: Person = Person {
        name: "Bob",
        age: 30,
        address: Address {
            street: "123 Main St",
            city: "Springfield",
            zip: 12345
        }
    };
    
    outputln(person.name, " lives in ", person.address.city);
    
    return 0;
}
```

## Passing Structures

### By Value (Copy)

```luma
const print_point -> fn (p: Point) void {
    outputln("(", p.x, ", ", p.y, ")");
}

const main -> fn () int {
    let pt: Point = Point { x: 5, y: 10 };
    print_point(pt);  // Copies the entire struct
    return 0;
}
```

### By Reference (Pointer)

More efficient for large structures:

```luma
const modify_point -> fn (p: *Point) void {
    p.x = 100;
    p.y = 200;
}

const main -> fn () int {
    let pt: Point = Point { x: 5, y: 10 };
    modify_point(&pt);  // Pass address
    outputln("Modified: (", pt.x, ", ", pt.y, ")");
    return 0;
}
```

## Member Access

Use `.` for runtime member access:

```luma
let point: Point = Point { x: 10, y: 20 };

// Field access
let x_value: int = point.x;
point.y = 30;

// Method calls
let result: float = point.distance_to(other_point);
```

---

Next: [Generics](generics.md)
