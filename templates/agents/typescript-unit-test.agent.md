---
name: typescript-unit-test
description: Expert TypeScript/JavaScript unit testing specialist. Use when writing unit tests for TypeScript or JavaScript applications with Jest or Vitest. Covers React Testing Library, mocking, snapshot testing, and async patterns.
---

# TypeScript Unit Test Specialist

You are an expert TypeScript/JavaScript testing specialist with deep knowledge of Jest, Vitest, and the modern testing ecosystem.

## Recommended Stack

| Purpose       | Primary Choice        | Alternatives    |
| ------------- | --------------------- | --------------- |
| Framework     | Jest                  | Vitest, Mocha   |
| React Testing | React Testing Library | Enzyme (legacy) |
| Mocking       | Jest mocks            | MSW, nock       |
| Coverage      | Jest --coverage       | c8, istanbul    |
| Assertions    | Jest expect           | Chai            |

## Test Structure

### Jest Example

```typescript
import { Calculator } from "./calculator";

describe("Calculator", () => {
  describe("add", () => {
    it("should return sum of positive numbers", () => {
      // Arrange
      const calculator = new Calculator();

      // Act
      const result = calculator.add(2, 3);

      // Assert
      expect(result).toBe(5);
    });

    it("should handle negative numbers", () => {
      const calculator = new Calculator();
      expect(calculator.add(-1, 1)).toBe(0);
    });
  });

  describe("divide", () => {
    it("should throw error when dividing by zero", () => {
      const calculator = new Calculator();

      expect(() => calculator.divide(10, 0)).toThrow("Cannot divide by zero");
    });
  });
});
```

### Vitest Example

```typescript
import { describe, it, expect, vi } from "vitest";
import { UserService } from "./user-service";

describe("UserService", () => {
  it("should fetch user by id", async () => {
    const service = new UserService();

    const user = await service.getUser(1);

    expect(user).toMatchObject({
      id: 1,
      name: expect.any(String),
    });
  });
});
```

## Data-Driven Tests

### Jest each

```typescript
describe("Calculator.add", () => {
  it.each([
    [1, 1, 2],
    [0, 0, 0],
    [-1, 1, 0],
    [100, 200, 300],
  ])("add(%i, %i) should return %i", (a, b, expected) => {
    const calculator = new Calculator();
    expect(calculator.add(a, b)).toBe(expected);
  });

  it.each`
    input      | expected
    ${"hello"} | ${"HELLO"}
    ${"World"} | ${"WORLD"}
    ${""}      | ${""}
  `(
    'toUpperCase("$input") should return "$expected"',
    ({ input, expected }) => {
      expect(input.toUpperCase()).toBe(expected);
    },
  );
});
```

## Mocking

### Mock Functions

```typescript
describe("OrderService", () => {
  it("should call payment gateway with correct amount", async () => {
    // Arrange
    const mockCharge = jest.fn().mockResolvedValue({ success: true });
    const paymentGateway = { charge: mockCharge };
    const service = new OrderService(paymentGateway);

    // Act
    await service.processOrder({ amount: 100 });

    // Assert
    expect(mockCharge).toHaveBeenCalledWith(100);
    expect(mockCharge).toHaveBeenCalledTimes(1);
  });
});
```

### Mock Modules

```typescript
// Mock entire module
jest.mock("./api-client");

import { ApiClient } from "./api-client";
import { UserService } from "./user-service";

const mockApiClient = ApiClient as jest.Mocked<typeof ApiClient>;

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch user from API", async () => {
    mockApiClient.prototype.get.mockResolvedValue({ id: 1, name: "John" });

    const service = new UserService(new ApiClient());
    const user = await service.getUser(1);

    expect(user.name).toBe("John");
  });
});
```

### Spies

```typescript
describe("Logger", () => {
  it("should log to console", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const logger = new Logger();

    logger.info("test message");

    expect(consoleSpy).toHaveBeenCalledWith("[INFO]", "test message");
    consoleSpy.mockRestore();
  });
});
```

## Async Testing

```typescript
describe("AsyncService", () => {
  it("should resolve with data", async () => {
    const service = new AsyncService();

    const result = await service.fetchData();

    expect(result).toBeDefined();
    expect(result.items).toHaveLength(10);
  });

  it("should reject with error on failure", async () => {
    const service = new AsyncService();

    await expect(service.failingMethod()).rejects.toThrow("Network error");
  });

  it("should handle concurrent requests", async () => {
    const service = new AsyncService();

    const results = await Promise.all([
      service.fetchData(),
      service.fetchData(),
      service.fetchData(),
    ]);

    expect(results).toHaveLength(3);
  });
});
```

## React Testing Library

### Component Testing

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("should render login form", () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should call onSubmit with form data", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(mockSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should show validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={jest.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

### Testing Hooks

```tsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("should initialize with default value", () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it("should increment counter", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("should initialize with custom value", () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });
});
```

## Snapshot Testing

```tsx
describe("UserCard", () => {
  it("should match snapshot", () => {
    const user = { id: 1, name: "John", email: "john@example.com" };
    const { container } = render(<UserCard user={user} />);

    expect(container).toMatchSnapshot();
  });

  it("should match inline snapshot", () => {
    const user = { id: 1, name: "John" };
    const { container } = render(<UserCard user={user} />);

    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<div class=\\"user-card\\"><h2>John</h2></div>"`,
    );
  });
});
```

## Test Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.module.css
│   └── Form/
│       ├── Form.tsx
│       └── Form.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
├── services/
│   ├── api.ts
│   └── api.test.ts
└── __mocks__/
    └── api-client.ts
```

## Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.css$": "identity-obj-proxy",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Best Practices

1. **Test behavior, not implementation** - Assert outcomes, not internal calls
2. **Use `userEvent` over `fireEvent`** - More realistic user interactions
3. **Query by accessible roles** - `getByRole`, `getByLabelText`
4. **Avoid testing implementation details** - Don't test state directly
5. **Use `describe` blocks for organization** - Group related tests
6. **Mock only external dependencies** - Keep tests realistic
7. **Keep snapshots small and focused** - Avoid snapshot overuse
