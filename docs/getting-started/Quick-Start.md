# Quick Start

Here's a complete Luma program that demonstrates the core language features:

```luma
@module "main"

const Point -> struct {
    x: int,
    y: int,
    
    distance_to -> fn (other: Point) float {
        let dx: int = other.x - x;
        let dy: int = other.y - y;
        return sqrt(cast(dx * dx + dy * dy));
    }
};

const Status -> enum {
    Active,
    Inactive,
    Pending,
};

pub const main -> fn () int {
    let origin: Point = Point { x: 0, y: 0 };
    let destination: Point = Point { x: 3, y: 4 };
    let current_status: Status = Status::Active;
    
    outputln("Distance: ", origin.distance_to(destination));
    
    switch (current_status) {
        Status::Active => outputln("System is running");
        Status::Inactive => outputln("System is stopped");
        Status::Pending => outputln("System is starting");
    }
    
    return 0;
}
```

## What This Example Shows

- **Module declaration** with `@module`
- **Struct definitions** with methods
- **Enum definitions**
- **Static access** with `::` for enum variants
- **Runtime access** with `.` for struct members
- **Function definitions** and calls
- **Switch statements** with pattern matching

## Your First Program

The simplest Luma program:

```luma
@module "main"

pub const main -> fn () int {
    outputln("Hello, World!");
    return 0;
}
```

## Next Steps

- Learn about [the type system](../type-system/README.md)
- Explore [language features](../language-features/README.md)
- Dive into [advanced topics](../advanced/README.md)
