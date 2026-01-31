---
name: go-unit-test
description: Expert Go (Golang) unit testing specialist. Use when writing unit tests for Go applications. Covers table-driven tests, subtests, testify library, HTTP handler testing, benchmarks, and mocking patterns.
---

# Go Unit Test Specialist

You are an expert Go testing specialist with deep knowledge of the standard `testing` package and the Go testing ecosystem.

## Recommended Stack

| Purpose      | Primary Choice    | Alternatives |
| ------------ | ----------------- | ------------ |
| Framework    | testing (std)     |              |
| Assertions   | testify/assert    | is, go-cmp   |
| Mocking      | testify/mock      | gomock, moq  |
| HTTP Testing | net/http/httptest |              |
| Coverage     | go test -cover    |              |

## Test Structure

### Basic Test

```go
package calculator

import "testing"

func TestAdd(t *testing.T) {
    // Arrange
    calc := NewCalculator()

    // Act
    result := calc.Add(2, 3)

    // Assert
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}
```

### With testify/assert

```go
package calculator

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestAdd(t *testing.T) {
    calc := NewCalculator()

    result := calc.Add(2, 3)

    assert.Equal(t, 5, result)
}

func TestDivide(t *testing.T) {
    calc := NewCalculator()

    result, err := calc.Divide(10, 2)

    assert.NoError(t, err)
    assert.Equal(t, 5.0, result)
}

func TestDivideByZero(t *testing.T) {
    calc := NewCalculator()

    _, err := calc.Divide(10, 0)

    assert.Error(t, err)
    assert.Contains(t, err.Error(), "division by zero")
}
```

## Table-Driven Tests

### Standard Pattern

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers", 2, 3, 5},
        {"zeros", 0, 0, 0},
        {"negative numbers", -1, -1, -2},
        {"mixed signs", -1, 1, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            calc := NewCalculator()

            result := calc.Add(tt.a, tt.b)

            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d",
                    tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

### With testify

```go
func TestUserValidation(t *testing.T) {
    tests := []struct {
        name        string
        user        User
        expectError bool
        errorMsg    string
    }{
        {
            name:        "valid user",
            user:        User{Name: "John", Email: "john@example.com"},
            expectError: false,
        },
        {
            name:        "missing name",
            user:        User{Email: "john@example.com"},
            expectError: true,
            errorMsg:    "name is required",
        },
        {
            name:        "invalid email",
            user:        User{Name: "John", Email: "invalid"},
            expectError: true,
            errorMsg:    "invalid email format",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.user.Validate()

            if tt.expectError {
                assert.Error(t, err)
                assert.Contains(t, err.Error(), tt.errorMsg)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

## Subtests

```go
func TestUserService(t *testing.T) {
    service := NewUserService()

    t.Run("Create", func(t *testing.T) {
        t.Run("with valid data", func(t *testing.T) {
            user, err := service.Create("John", "john@example.com")

            assert.NoError(t, err)
            assert.NotEmpty(t, user.ID)
        })

        t.Run("with duplicate email", func(t *testing.T) {
            _, _ = service.Create("John", "duplicate@example.com")
            _, err := service.Create("Jane", "duplicate@example.com")

            assert.Error(t, err)
        })
    })

    t.Run("Get", func(t *testing.T) {
        t.Run("existing user", func(t *testing.T) {
            user, _ := service.Create("Test", "test@example.com")

            found, err := service.Get(user.ID)

            assert.NoError(t, err)
            assert.Equal(t, user.Name, found.Name)
        })

        t.Run("non-existing user", func(t *testing.T) {
            _, err := service.Get("non-existent-id")

            assert.Error(t, err)
        })
    })
}
```

## Mocking with testify/mock

### Define Mock

```go
package mocks

import (
    "github.com/stretchr/testify/mock"
)

type MockUserRepository struct {
    mock.Mock
}

func (m *MockUserRepository) GetByID(id string) (*User, error) {
    args := m.Called(id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

func (m *MockUserRepository) Save(user *User) error {
    args := m.Called(user)
    return args.Error(0)
}
```

### Use Mock in Tests

```go
func TestUserService_GetUser(t *testing.T) {
    t.Run("returns user when found", func(t *testing.T) {
        // Arrange
        mockRepo := new(mocks.MockUserRepository)
        expectedUser := &User{ID: "1", Name: "John"}
        mockRepo.On("GetByID", "1").Return(expectedUser, nil)

        service := NewUserService(mockRepo)

        // Act
        user, err := service.GetUser("1")

        // Assert
        assert.NoError(t, err)
        assert.Equal(t, "John", user.Name)
        mockRepo.AssertExpectations(t)
    })

    t.Run("returns error when not found", func(t *testing.T) {
        mockRepo := new(mocks.MockUserRepository)
        mockRepo.On("GetByID", "999").Return(nil, ErrNotFound)

        service := NewUserService(mockRepo)

        _, err := service.GetUser("999")

        assert.ErrorIs(t, err, ErrNotFound)
    })
}
```

## HTTP Handler Testing

```go
package handlers

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"

    "github.com/stretchr/testify/assert"
)

func TestGetUserHandler(t *testing.T) {
    t.Run("returns user for valid ID", func(t *testing.T) {
        // Arrange
        req := httptest.NewRequest(http.MethodGet, "/users/1", nil)
        rec := httptest.NewRecorder()
        handler := NewUserHandler()

        // Act
        handler.ServeHTTP(rec, req)

        // Assert
        assert.Equal(t, http.StatusOK, rec.Code)

        var user User
        err := json.NewDecoder(rec.Body).Decode(&user)
        assert.NoError(t, err)
        assert.Equal(t, "1", user.ID)
    })

    t.Run("returns 404 for invalid ID", func(t *testing.T) {
        req := httptest.NewRequest(http.MethodGet, "/users/999", nil)
        rec := httptest.NewRecorder()
        handler := NewUserHandler()

        handler.ServeHTTP(rec, req)

        assert.Equal(t, http.StatusNotFound, rec.Code)
    })
}

func TestCreateUserHandler(t *testing.T) {
    t.Run("creates user with valid data", func(t *testing.T) {
        body := `{"name": "John", "email": "john@example.com"}`
        req := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader(body))
        req.Header.Set("Content-Type", "application/json")
        rec := httptest.NewRecorder()
        handler := NewUserHandler()

        handler.ServeHTTP(rec, req)

        assert.Equal(t, http.StatusCreated, rec.Code)

        var user User
        json.NewDecoder(rec.Body).Decode(&user)
        assert.NotEmpty(t, user.ID)
        assert.Equal(t, "John", user.Name)
    })
}
```

## Benchmarks

```go
func BenchmarkAdd(b *testing.B) {
    calc := NewCalculator()

    for i := 0; i < b.N; i++ {
        calc.Add(100, 200)
    }
}

func BenchmarkProcessUsers(b *testing.B) {
    users := generateTestUsers(1000)
    service := NewUserService()

    b.ResetTimer() // Reset timer after setup

    for i := 0; i < b.N; i++ {
        service.Process(users)
    }
}

// Run with: go test -bench=. -benchmem
```

## Test Organization

```
project/
├── user/
│   ├── user.go
│   ├── user_test.go
│   ├── service.go
│   └── service_test.go
├── order/
│   ├── order.go
│   └── order_test.go
├── mocks/
│   ├── user_repository.go
│   └── order_service.go
└── testdata/
    ├── users.json
    └── orders.json
```

## Test Helpers

```go
// testutil/helpers.go
package testutil

import (
    "testing"
)

func AssertNoError(t *testing.T, err error) {
    t.Helper()
    if err != nil {
        t.Fatalf("expected no error, got: %v", err)
    }
}

func AssertEqual[T comparable](t *testing.T, expected, actual T) {
    t.Helper()
    if expected != actual {
        t.Errorf("expected %v, got %v", expected, actual)
    }
}
```

## Cleanup with t.Cleanup

```go
func TestWithDatabase(t *testing.T) {
    db := setupTestDatabase()
    t.Cleanup(func() {
        db.Close()
        os.Remove(db.Path)
    })

    // Test code here - cleanup runs automatically
}
```

## Best Practices

1. **Use table-driven tests** - Reduce duplication, improve coverage
2. **Name tests descriptively** - `TestFunction_Scenario_ExpectedResult`
3. **Use subtests with `t.Run`** - Better organization, selective running
4. **Use `t.Helper()`** - Better error reporting in helper functions
5. **Use `t.Cleanup()`** - Clean resource management
6. **Prefer testify for assertions** - Cleaner, more readable tests
7. **Keep test files alongside code** - `foo.go` and `foo_test.go`
8. **Use black-box testing** - Test package `foo_test` imports `foo`
