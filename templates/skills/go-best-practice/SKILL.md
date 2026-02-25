---
name: go-best-practice
description: Master comprehensive Go (Golang) best practices covering idiomatic code, project structure, error handling, concurrency patterns, testing, performance optimization, and security. Use PROACTIVELY for Go development, code review, or establishing team standards.
---

# Go Best Practices

Master comprehensive Go development practices for writing idiomatic, maintainable, secure, and performant code following modern Go standards (2024-2026).

## When to Use This Skill

- Writing new Go applications or libraries
- Reviewing Go code for quality and idioms
- Establishing team coding standards
- Implementing concurrent systems with goroutines
- Optimizing Go application performance
- Designing Go project structure
- Writing comprehensive tests and benchmarks
- Handling errors properly in Go

## Core Concepts

### 1. Idiomatic Go Style

```go
// ✅ CORRECT: Idiomatic Go naming and structure
package user

import (
    "context"
    "errors"
    "fmt"
    "time"
)

// ErrNotFound is returned when a user is not found.
var ErrNotFound = errors.New("user: not found")

// User represents a user in the system.
type User struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}

// Service handles user operations.
type Service struct {
    repo   Repository
    cache  Cache
    logger Logger
}

// NewService creates a new user service with the given dependencies.
func NewService(repo Repository, cache Cache, logger Logger) *Service {
    return &Service{
        repo:   repo,
        cache:  cache,
        logger: logger,
    }
}

// GetByID retrieves a user by their ID.
// It returns ErrNotFound if the user does not exist.
func (s *Service) GetByID(ctx context.Context, id string) (*User, error) {
    // Check cache first
    if user, ok := s.cache.Get(id); ok {
        return user, nil
    }

    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("get user by id %s: %w", id, err)
    }

    if user == nil {
        return nil, ErrNotFound
    }

    s.cache.Set(id, user)
    return user, nil
}


// ❌ WRONG: Non-idiomatic Go
package User  // Package names should be lowercase

type user_service struct {  // Use CamelCase, not snake_case
    Repo Repository  // Unexported fields use lowercase
}

func (us *user_service) Get_User(Id string) *User {  // Method names: GetUser, param: id
    return nil
}
```

### 2. Project Structure

```
myproject/
├── cmd/                    # Application entrypoints
│   ├── api/
│   │   └── main.go        # API server
│   └── worker/
│       └── main.go        # Background worker
├── internal/              # Private application code
│   ├── config/            # Configuration loading
│   │   └── config.go
│   ├── domain/            # Business entities
│   │   ├── user.go
│   │   └── order.go
│   ├── handler/           # HTTP handlers
│   │   ├── user.go
│   │   └── order.go
│   ├── repository/        # Data access
│   │   ├── user.go
│   │   └── postgres/
│   │       └── user.go
│   └── service/           # Business logic
│       ├── user.go
│       └── order.go
├── pkg/                   # Public reusable packages
│   ├── httputil/
│   │   └── response.go
│   └── validation/
│       └── email.go
├── api/                   # API specifications
│   └── openapi.yaml
├── scripts/               # Build and automation scripts
│   └── setup.sh
├── migrations/            # Database migrations
│   └── 001_initial.sql
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

### 3. Error Handling

```go
package main

import (
    "errors"
    "fmt"
)

// Define sentinel errors for known error conditions
var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrInvalidInput = errors.New("invalid input")
)

// AppError provides structured error information
type AppError struct {
    Code    string
    Message string
    Err     error
}

func (e *AppError) Error() string {
    if e.Err != nil {
        return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Err)
    }
    return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
    return e.Err
}

// NewAppError creates a new application error
func NewAppError(code, message string, err error) *AppError {
    return &AppError{
        Code:    code,
        Message: message,
        Err:     err,
    }
}

// ✅ CORRECT: Wrap errors with context
func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        // Wrap with context using %w
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }

    if user == nil {
        return nil, ErrNotFound
    }

    return user, nil
}

// ✅ CORRECT: Check for specific errors
func handleGetUser(svc *UserService, id string) {
    user, err := svc.GetUser(context.Background(), id)
    if err != nil {
        // Check for specific sentinel error
        if errors.Is(err, ErrNotFound) {
            fmt.Println("User not found")
            return
        }

        // Check for error type
        var appErr *AppError
        if errors.As(err, &appErr) {
            fmt.Printf("App error [%s]: %s\n", appErr.Code, appErr.Message)
            return
        }

        // Generic error handling
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Found user: %s\n", user.Name)
}

// ❌ WRONG: Ignoring errors
func badExample() {
    data, _ := os.ReadFile("config.json")  // NEVER ignore errors
    fmt.Println(string(data))
}

// ❌ WRONG: Using panic for expected errors
func anotherBadExample(id string) *User {
    user, err := findUser(id)
    if err != nil {
        panic(err)  // Don't panic for normal errors
    }
    return user
}

// ❌ WRONG: Comparing errors with ==
func wrongErrorCheck(err error) {
    if err == ErrNotFound {  // Use errors.Is instead
        // ...
    }
}
```

### 4. Concurrency Patterns

```go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

// ✅ CORRECT: Context for cancellation
func fetchWithTimeout(ctx context.Context, url string) ([]byte, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, err
    }

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}

// ✅ CORRECT: Worker pool pattern
func processItems(ctx context.Context, items []string, workers int) error {
    work := make(chan string, len(items))
    errCh := make(chan error, 1)

    var wg sync.WaitGroup

    // Start workers
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for item := range work {
                if err := processItem(ctx, item); err != nil {
                    select {
                    case errCh <- err:
                    default:
                    }
                    return
                }
            }
        }()
    }

    // Send work
    for _, item := range items {
        work <- item
    }
    close(work)

    // Wait for completion
    done := make(chan struct{})
    go func() {
        wg.Wait()
        close(done)
    }()

    select {
    case <-done:
        return nil
    case err := <-errCh:
        return err
    case <-ctx.Done():
        return ctx.Err()
    }
}

// ✅ CORRECT: Limiting concurrency with semaphore
func fetchAllWithLimit(ctx context.Context, urls []string, limit int) []Result {
    sem := make(chan struct{}, limit)
    results := make([]Result, len(urls))
    var wg sync.WaitGroup

    for i, url := range urls {
        wg.Add(1)
        go func(i int, url string) {
            defer wg.Done()

            // Acquire semaphore
            sem <- struct{}{}
            defer func() { <-sem }()

            data, err := fetch(ctx, url)
            results[i] = Result{Data: data, Err: err}
        }(i, url)
    }

    wg.Wait()
    return results
}

// ✅ CORRECT: Using errgroup for concurrent operations
import "golang.org/x/sync/errgroup"

func fetchAll(ctx context.Context, urls []string) ([][]byte, error) {
    g, ctx := errgroup.WithContext(ctx)
    results := make([][]byte, len(urls))

    for i, url := range urls {
        i, url := i, url  // Capture loop variables
        g.Go(func() error {
            data, err := fetch(ctx, url)
            if err != nil {
                return fmt.Errorf("fetch %s: %w", url, err)
            }
            results[i] = data
            return nil
        })
    }

    if err := g.Wait(); err != nil {
        return nil, err
    }

    return results, nil
}

// ✅ CORRECT: Channel ownership - sender closes
func generator(items []int) <-chan int {
    ch := make(chan int)
    go func() {
        defer close(ch)  // Sender closes the channel
        for _, item := range items {
            ch <- item
        }
    }()
    return ch
}

// ❌ WRONG: Closing channel from receiver side
func badChannelUsage() {
    ch := make(chan int)
    go func() {
        for v := range ch {
            fmt.Println(v)
        }
        close(ch)  // WRONG: receiver should not close
    }()
}

// ❌ WRONG: Goroutine leak
func leakyFunction() {
    ch := make(chan int)
    go func() {
        val := <-ch  // Will block forever if nothing sent
        fmt.Println(val)
    }()
    // Function returns without sending or closing channel
}
```

### 5. Interface Design

```go
package main

// ✅ CORRECT: Small, focused interfaces
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// Compose interfaces when needed
type ReadWriter interface {
    Reader
    Writer
}

// ✅ CORRECT: Accept interfaces, return structs
type UserRepository interface {
    FindByID(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
}

// Concrete implementation
type PostgresUserRepository struct {
    db *sql.DB
}

func NewPostgresUserRepository(db *sql.DB) *PostgresUserRepository {
    return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) FindByID(ctx context.Context, id string) (*User, error) {
    // Implementation
}

// ✅ CORRECT: Interface defined where it's used (consumer defines interface)
// In the service package:
package service

type userRepository interface {
    FindByID(ctx context.Context, id string) (*User, error)
}

type UserService struct {
    repo userRepository  // Unexported interface
}

// ❌ WRONG: Large interfaces
type HugeRepository interface {
    FindByID(ctx context.Context, id string) (*User, error)
    FindByEmail(ctx context.Context, email string) (*User, error)
    FindByName(ctx context.Context, name string) (*User, error)
    FindAll(ctx context.Context) ([]*User, error)
    Save(ctx context.Context, user *User) error
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
    Count(ctx context.Context) (int, error)
    // ... 20 more methods
}

// ❌ WRONG: Interface pollution
type User interface {  // Don't make interfaces for data types
    GetID() string
    GetName() string
}
```

### 6. Testing Patterns

```go
package user_test

import (
    "context"
    "errors"
    "testing"
)

// Table-driven tests
func TestUserService_GetByID(t *testing.T) {
    tests := []struct {
        name      string
        id        string
        mockUser  *User
        mockErr   error
        wantUser  *User
        wantErr   error
    }{
        {
            name:     "success",
            id:       "user-123",
            mockUser: &User{ID: "user-123", Name: "John"},
            wantUser: &User{ID: "user-123", Name: "John"},
        },
        {
            name:    "not found",
            id:      "unknown",
            wantErr: ErrNotFound,
        },
        {
            name:    "repository error",
            id:      "user-123",
            mockErr: errors.New("db connection failed"),
            wantErr: errors.New("db connection failed"),
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Arrange
            repo := &mockRepository{
                user: tt.mockUser,
                err:  tt.mockErr,
            }
            svc := NewService(repo)

            // Act
            got, err := svc.GetByID(context.Background(), tt.id)

            // Assert
            if tt.wantErr != nil {
                if err == nil {
                    t.Fatalf("expected error %v, got nil", tt.wantErr)
                }
                if !errors.Is(err, tt.wantErr) {
                    t.Errorf("error = %v, want %v", err, tt.wantErr)
                }
                return
            }

            if err != nil {
                t.Fatalf("unexpected error: %v", err)
            }

            if got.ID != tt.wantUser.ID {
                t.Errorf("user.ID = %s, want %s", got.ID, tt.wantUser.ID)
            }
        })
    }
}

// Subtests for organization
func TestUserValidation(t *testing.T) {
    t.Run("email", func(t *testing.T) {
        t.Run("valid", func(t *testing.T) {
            err := ValidateEmail("test@example.com")
            if err != nil {
                t.Errorf("unexpected error: %v", err)
            }
        })

        t.Run("invalid", func(t *testing.T) {
            err := ValidateEmail("not-an-email")
            if err == nil {
                t.Error("expected error for invalid email")
            }
        })
    })
}

// Test helpers
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()

    db, err := sql.Open("postgres", "postgres://test:test@localhost/test")
    if err != nil {
        t.Fatalf("failed to open database: %v", err)
    }

    t.Cleanup(func() {
        db.Close()
    })

    return db
}

// Benchmarking
func BenchmarkUserService_GetByID(b *testing.B) {
    repo := &mockRepository{user: &User{ID: "user-123"}}
    svc := NewService(repo)
    ctx := context.Background()

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _, _ = svc.GetByID(ctx, "user-123")
    }
}

// Benchmark with different sizes
func BenchmarkProcessItems(b *testing.B) {
    sizes := []int{10, 100, 1000, 10000}

    for _, size := range sizes {
        items := make([]string, size)
        for i := range items {
            items[i] = fmt.Sprintf("item-%d", i)
        }

        b.Run(fmt.Sprintf("size-%d", size), func(b *testing.B) {
            for i := 0; i < b.N; i++ {
                processItems(items)
            }
        })
    }
}

// Mock implementation
type mockRepository struct {
    user *User
    err  error
}

func (m *mockRepository) FindByID(ctx context.Context, id string) (*User, error) {
    return m.user, m.err
}
```

### 7. Performance Optimization

```go
package main

import (
    "bytes"
    "strings"
    "sync"
)

// ✅ CORRECT: Use sync.Pool for frequently allocated objects
var bufferPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func processWithPool(data []byte) string {
    buf := bufferPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufferPool.Put(buf)
    }()

    // Use buffer...
    buf.Write(data)
    return buf.String()
}

// ✅ CORRECT: Pre-allocate slices when size is known
func collectIDs(users []User) []string {
    ids := make([]string, 0, len(users))  // Pre-allocate capacity
    for _, u := range users {
        ids = append(ids, u.ID)
    }
    return ids
}

// ✅ CORRECT: Use strings.Builder for string concatenation
func buildQuery(fields []string) string {
    var sb strings.Builder
    sb.Grow(100)  // Pre-allocate if size is estimable

    sb.WriteString("SELECT ")
    for i, field := range fields {
        if i > 0 {
            sb.WriteString(", ")
        }
        sb.WriteString(field)
    }
    sb.WriteString(" FROM users")

    return sb.String()
}

// ❌ WRONG: String concatenation in loops
func badStringBuilding(items []string) string {
    result := ""
    for _, item := range items {
        result += item + ", "  // Creates new string each iteration
    }
    return result
}

// ✅ CORRECT: Avoid unnecessary allocations
func processSlice(data []byte) {
    // Iterate without copying
    for _, b := range data {
        // Process byte
    }
}

// ✅ CORRECT: Use pointer receivers for large structs
type LargeStruct struct {
    data [1024]byte
    // ... more fields
}

func (l *LargeStruct) Process() {  // Pointer receiver avoids copying
    // Process...
}

// ✅ CORRECT: Use sync.Map for concurrent map access
var cache sync.Map

func getCached(key string) (interface{}, bool) {
    return cache.Load(key)
}

func setCached(key string, value interface{}) {
    cache.Store(key, value)
}

// ❌ WRONG: Map access without synchronization
var unsafeCache = make(map[string]string)  // Race condition in concurrent access

// ✅ CORRECT: Efficient struct field ordering (reduce padding)
type OptimizedStruct struct {
    a int64   // 8 bytes
    b int64   // 8 bytes
    c int32   // 4 bytes
    d int16   // 2 bytes
    e int8    // 1 byte
    f bool    // 1 byte
    // Total: 24 bytes with proper alignment
}

type UnoptimizedStruct struct {
    e int8    // 1 byte + 7 padding
    a int64   // 8 bytes
    f bool    // 1 byte + 3 padding
    c int32   // 4 bytes
    d int16   // 2 byte + 6 padding
    b int64   // 8 bytes
    // Total: 40 bytes due to padding
}
```

### 8. Security Best Practices

```go
package main

import (
    "crypto/rand"
    "crypto/subtle"
    "encoding/hex"
    "golang.org/x/crypto/bcrypt"
)

// ✅ CORRECT: Secure random generation
func generateToken(length int) (string, error) {
    bytes := make([]byte, length)
    if _, err := rand.Read(bytes); err != nil {
        return "", err
    }
    return hex.EncodeToString(bytes), nil
}

// ✅ CORRECT: Password hashing with bcrypt
func hashPassword(password string) (string, error) {
    hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return "", err
    }
    return string(hash), nil
}

func verifyPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

// ✅ CORRECT: Constant-time comparison for secrets
func secureCompare(a, b string) bool {
    return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

// ✅ CORRECT: Input validation and sanitization
import "regexp"

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func validateEmail(email string) error {
    if !emailRegex.MatchString(email) {
        return errors.New("invalid email format")
    }
    return nil
}

// ✅ CORRECT: SQL injection prevention
func getUserByID(ctx context.Context, db *sql.DB, id string) (*User, error) {
    // Use parameterized queries
    row := db.QueryRowContext(ctx,
        "SELECT id, name, email FROM users WHERE id = $1",
        id)

    var user User
    err := row.Scan(&user.ID, &user.Name, &user.Email)
    return &user, err
}

// ❌ WRONG: SQL injection vulnerability
func badGetUser(db *sql.DB, id string) (*User, error) {
    query := fmt.Sprintf("SELECT * FROM users WHERE id = '%s'", id)  // VULNERABLE!
    return db.Query(query)
}

// ✅ CORRECT: Secure HTTP headers
func secureHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("X-XSS-Protection", "1; mode=block")
        w.Header().Set("Content-Security-Policy", "default-src 'self'")
        next.ServeHTTP(w, r)
    })
}
```

## Quick Reference

### Go Proverbs

| Proverb                                                              | Meaning                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| "Don't communicate by sharing memory; share memory by communicating" | Use channels, not shared state                                     |
| "Concurrency is not parallelism"                                     | Goroutines enable concurrency; parallelism requires multiple cores |
| "The bigger the interface, the weaker the abstraction"               | Keep interfaces small and focused                                  |
| "Make the zero value useful"                                         | Design types so zero values work                                   |
| "A little copying is better than a little dependency"                | Avoid dependencies for simple code                                 |
| "Clear is better than clever"                                        | Prioritize readability over cleverness                             |

### Naming Conventions

| Element         | Convention                   | Example                         |
| --------------- | ---------------------------- | ------------------------------- |
| Package         | lowercase, single word       | `user`, `httputil`              |
| Exported        | PascalCase                   | `UserService`, `GetByID`        |
| Unexported      | camelCase                    | `userRepo`, `parseConfig`       |
| Interface       | -er suffix for single method | `Reader`, `Stringer`            |
| Error variables | `Err` prefix                 | `ErrNotFound`                   |
| Context         | First parameter, named `ctx` | `func Get(ctx context.Context)` |

## Common Pitfalls

| Pitfall                 | Problem                          | Solution                     |
| ----------------------- | -------------------------------- | ---------------------------- |
| Nil pointer dereference | Dereferencing nil                | Always check for nil         |
| Goroutine leak          | Blocked goroutine never exits    | Use context for cancellation |
| Race condition          | Concurrent map access            | Use sync.Map or mutex        |
| Closing nil channel     | Panic                            | Check before closing         |
| Loop variable capture   | All goroutines use same variable | Create local copy            |
| Ignoring context        | Long operations can't cancel     | Pass and check context       |

## Best Practices Summary

### DO

1. Pass context.Context as first parameter
2. Return errors as last return value
3. Wrap errors with context using fmt.Errorf and %w
4. Use table-driven tests
5. Accept interfaces, return structs
6. Keep packages focused and small
7. Use defer for cleanup
8. Pre-allocate slices when size is known
9. Use golangci-lint for static analysis
10. Document exported functions and types

### DON'T

1. Ignore errors (even with `_`)
2. Use panic for expected errors
3. Create large interfaces
4. Share memory between goroutines without sync
5. Use global variables for state
6. Close channels from the receiver
7. Use string concatenation in loops
8. Spawn goroutines without cleanup plan
9. Use init() functions for complex logic
10. Import packages only for side effects without explicit need


## Parent Hub
- [_backend-mastery](../_backend-mastery/SKILL.md)


## Part of Workflow
This skill is utilized in the following sequential workflows:
- [_workflow-feature-lifecycle](../_workflow-feature-lifecycle/SKILL.md)
