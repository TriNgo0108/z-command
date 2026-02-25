---
name: python-best-practice
description: Master comprehensive Python best practices covering PEP 8, type hints, modern Python 3.11+ features, project structure, testing, async patterns, security, and performance optimization. Use PROACTIVELY for Python development, code review, or establishing team standards.
---

# Python Best Practices

Master comprehensive Python development practices for writing clean, maintainable, secure, and performant code following modern Python standards (2024-2026).

## When to Use This Skill

- Writing new Python applications or libraries
- Reviewing Python code for quality and standards
- Establishing team coding standards and guidelines
- Optimizing Python application performance
- Securing Python applications against vulnerabilities
- Setting up Python project infrastructure
- Migrating to modern Python features (3.11+)
- Implementing comprehensive testing strategies

## Core Concepts

### 1. Code Style (PEP 8 & Beyond)

```python
# ✅ CORRECT: PEP 8 compliant naming and structure
from typing import Optional
from dataclasses import dataclass
from enum import Enum, auto

class OrderStatus(Enum):
    """Order status enumeration."""
    PENDING = auto()
    PROCESSING = auto()
    COMPLETED = auto()
    CANCELLED = auto()

@dataclass
class OrderItem:
    """Single item in an order."""
    product_id: str
    quantity: int
    unit_price: float

    @property
    def total_price(self) -> float:
        """Calculate total price for this item."""
        return self.quantity * self.unit_price

def calculate_order_total(
    items: list[OrderItem],
    discount_percentage: float = 0.0,
    tax_rate: float = 0.1,
) -> float:
    """
    Calculate the total order amount including tax and discount.

    Args:
        items: List of order items
        discount_percentage: Discount to apply (0.0 to 1.0)
        tax_rate: Tax rate to apply (default 10%)

    Returns:
        Final order total after discount and tax

    Raises:
        ValueError: If discount_percentage is not between 0 and 1
    """
    if not 0 <= discount_percentage <= 1:
        raise ValueError("Discount must be between 0 and 1")

    subtotal = sum(item.total_price for item in items)
    discounted = subtotal * (1 - discount_percentage)
    return discounted * (1 + tax_rate)


# ❌ WRONG: Poor naming and structure
def calc(i, d, t):  # Unclear parameter names
    s = 0
    for x in i:
        s += x.q * x.p  # Magic attribute access
    return s * (1-d) * (1+t)
```

### 2. Type Hints (Modern Python 3.10+)

```python
from typing import TypeVar, Generic, Protocol, TypeAlias
from collections.abc import Callable, Iterator, Sequence
from dataclasses import dataclass

# Type aliases for clarity
UserId: TypeAlias = str
Email: TypeAlias = str
JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

# Generic types
T = TypeVar("T")
K = TypeVar("K")
V = TypeVar("V")

class Repository(Generic[T]):
    """Generic repository pattern with type safety."""

    def __init__(self) -> None:
        self._items: dict[str, T] = {}

    def get(self, id: str) -> T | None:
        return self._items.get(id)

    def save(self, id: str, item: T) -> None:
        self._items[id] = item

    def find_all(self, predicate: Callable[[T], bool]) -> list[T]:
        return [item for item in self._items.values() if predicate(item)]


# Protocol for structural subtyping (duck typing with types)
class Drawable(Protocol):
    """Protocol for drawable objects."""

    def draw(self, canvas: "Canvas") -> None: ...

    @property
    def bounds(self) -> tuple[int, int, int, int]: ...


def render_all(drawables: Sequence[Drawable], canvas: "Canvas") -> None:
    """Render all drawable objects to canvas."""
    for drawable in drawables:
        drawable.draw(canvas)


# Using TypedDict for structured dictionaries
from typing import TypedDict, NotRequired

class UserConfig(TypedDict):
    """User configuration structure."""
    username: str
    email: str
    theme: NotRequired[str]  # Optional field (Python 3.11+)
    notifications: NotRequired[bool]

def create_user(config: UserConfig) -> None:
    print(f"Creating user: {config['username']}")


# Pattern Matching with types (Python 3.10+)
def process_result(result: dict[str, object]) -> str:
    match result:
        case {"status": "success", "data": data}:
            return f"Success: {data}"
        case {"status": "error", "message": str(msg)}:
            return f"Error: {msg}"
        case {"status": "pending", "retry_after": int(seconds)}:
            return f"Pending, retry in {seconds}s"
        case _:
            return "Unknown result format"
```

### 3. Project Structure

```
my_project/
├── pyproject.toml          # Modern project configuration
├── README.md
├── LICENSE
├── .gitignore
├── .pre-commit-config.yaml # Pre-commit hooks
├── src/
│   └── my_project/
│       ├── __init__.py
│       ├── py.typed        # PEP 561 marker for type hints
│       ├── core/           # Core business logic
│       │   ├── __init__.py
│       │   ├── models.py
│       │   └── services.py
│       ├── api/            # External interfaces
│       │   ├── __init__.py
│       │   ├── routes.py
│       │   └── schemas.py
│       ├── infrastructure/ # External dependencies
│       │   ├── __init__.py
│       │   ├── database.py
│       │   └── cache.py
│       └── utils/          # Shared utilities
│           ├── __init__.py
│           └── helpers.py
├── tests/
│   ├── conftest.py         # Shared fixtures
│   ├── unit/
│   │   └── test_services.py
│   ├── integration/
│   │   └── test_api.py
│   └── e2e/
│       └── test_workflows.py
└── docs/
    └── index.md
```

**pyproject.toml (Modern Configuration):**

```toml
[project]
name = "my-project"
version = "1.0.0"
description = "A well-structured Python project"
readme = "README.md"
license = {text = "MIT"}
requires-python = ">=3.11"
authors = [
    {name = "Your Name", email = "you@example.com"}
]
dependencies = [
    "pydantic>=2.0",
    "httpx>=0.25",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-cov>=4.0",
    "pytest-asyncio>=0.23",
    "mypy>=1.8",
    "ruff>=0.2",
    "pre-commit>=3.6",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/my_project"]

[tool.ruff]
target-version = "py311"
line-length = 88
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # Pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
    "ARG", # flake8-unused-arguments
    "SIM", # flake8-simplify
]

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_ignores = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-ra -q --cov=src --cov-report=term-missing"
```

### 4. Error Handling Patterns

```python
from typing import TypeVar, Generic
from dataclasses import dataclass
from enum import Enum, auto
import logging

logger = logging.getLogger(__name__)

# Custom exception hierarchy
class AppError(Exception):
    """Base application error."""

    def __init__(self, message: str, code: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.code = code or self.__class__.__name__

class ValidationError(AppError):
    """Validation failed."""
    pass

class NotFoundError(AppError):
    """Resource not found."""
    pass

class AuthorizationError(AppError):
    """User not authorized."""
    pass


# Result type pattern (functional error handling)
T = TypeVar("T")
E = TypeVar("E")

@dataclass(frozen=True, slots=True)
class Success(Generic[T]):
    """Successful result."""
    value: T

@dataclass(frozen=True, slots=True)
class Failure(Generic[E]):
    """Failed result."""
    error: E

Result = Success[T] | Failure[E]


def parse_user_id(value: str) -> Result[int, str]:
    """Parse user ID from string."""
    try:
        user_id = int(value)
        if user_id <= 0:
            return Failure("User ID must be positive")
        return Success(user_id)
    except ValueError:
        return Failure(f"Invalid user ID format: {value}")


def process_user(user_id_str: str) -> None:
    """Process user with Result pattern."""
    match parse_user_id(user_id_str):
        case Success(user_id):
            logger.info(f"Processing user {user_id}")
        case Failure(error):
            logger.error(f"Failed to parse user ID: {error}")


# Context manager for cleanup
from contextlib import contextmanager
from typing import Iterator

@contextmanager
def database_transaction(connection: "Connection") -> Iterator["Transaction"]:
    """Context manager for database transactions."""
    transaction = connection.begin()
    try:
        yield transaction
        transaction.commit()
        logger.info("Transaction committed")
    except Exception as e:
        transaction.rollback()
        logger.error(f"Transaction rolled back: {e}")
        raise
    finally:
        connection.close()


# Structured logging
import structlog

log = structlog.get_logger()

def process_order(order_id: str, user_id: str) -> None:
    """Process order with structured logging."""
    log.info(
        "processing_order",
        order_id=order_id,
        user_id=user_id,
        action="start"
    )
    try:
        # Process order...
        log.info(
            "order_processed",
            order_id=order_id,
            status="success"
        )
    except Exception as e:
        log.error(
            "order_processing_failed",
            order_id=order_id,
            error=str(e),
            exc_info=True
        )
        raise
```

### 5. Async Programming Patterns

```python
import asyncio
from typing import TypeVar, Callable, Awaitable
from collections.abc import AsyncIterator
import httpx

T = TypeVar("T")


# Async context manager
class AsyncHTTPClient:
    """Async HTTP client with connection pooling."""

    def __init__(self, base_url: str, timeout: float = 30.0) -> None:
        self.base_url = base_url
        self.timeout = timeout
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> "AsyncHTTPClient":
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout
        )
        return self

    async def __aexit__(self, *args: object) -> None:
        if self._client:
            await self._client.aclose()

    async def get(self, path: str) -> dict:
        assert self._client is not None
        response = await self._client.get(path)
        response.raise_for_status()
        return response.json()


# Async generator for streaming
async def fetch_pages(url: str, max_pages: int = 10) -> AsyncIterator[dict]:
    """Fetch paginated data as async iterator."""
    async with httpx.AsyncClient() as client:
        page = 1
        while page <= max_pages:
            response = await client.get(url, params={"page": page})
            data = response.json()

            if not data.get("items"):
                break

            yield data
            page += 1


# Concurrency patterns
async def fetch_all_with_limit(
    urls: list[str],
    max_concurrent: int = 10
) -> list[dict]:
    """Fetch multiple URLs with concurrency limit."""
    semaphore = asyncio.Semaphore(max_concurrent)

    async def fetch_one(url: str) -> dict:
        async with semaphore:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                return response.json()

    tasks = [fetch_one(url) for url in urls]
    return await asyncio.gather(*tasks)


# Task groups (Python 3.11+)
async def process_batch(items: list[str]) -> list[str]:
    """Process items concurrently with task group."""
    results: list[str] = []

    async def process_item(item: str) -> str:
        await asyncio.sleep(0.1)  # Simulate async work
        return item.upper()

    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(process_item(item)) for item in items]

    return [task.result() for task in tasks]


# Exception groups (Python 3.11+)
async def fetch_with_retries(
    url: str,
    max_retries: int = 3,
    backoff: float = 1.0
) -> dict:
    """Fetch URL with exponential backoff retry."""
    errors: list[Exception] = []

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            errors.append(e)
            if attempt < max_retries - 1:
                await asyncio.sleep(backoff * (2 ** attempt))

    raise ExceptionGroup("All fetch attempts failed", errors)
```

### 6. Testing Best Practices

```python
import pytest
from typing import AsyncGenerator
from unittest.mock import Mock, AsyncMock, patch
from dataclasses import dataclass

# Fixture patterns
@pytest.fixture
def sample_user() -> dict:
    """Provide sample user data."""
    return {
        "id": "user-123",
        "name": "Test User",
        "email": "test@example.com"
    }

@pytest.fixture
async def async_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """Provide async HTTP client."""
    async with httpx.AsyncClient(base_url="http://test") as client:
        yield client

@pytest.fixture
def mock_repository() -> Mock:
    """Provide mock repository."""
    repo = Mock()
    repo.get = Mock(return_value={"id": "123", "name": "Test"})
    repo.save = Mock(return_value=None)
    return repo


# Parameterized tests
@pytest.mark.parametrize("input_val,expected", [
    ("valid@email.com", True),
    ("invalid-email", False),
    ("", False),
    ("user@domain.co.uk", True),
])
def test_email_validation(input_val: str, expected: bool) -> None:
    """Test email validation with various inputs."""
    assert is_valid_email(input_val) == expected


# Async tests
@pytest.mark.asyncio
async def test_async_fetch() -> None:
    """Test async data fetching."""
    async with AsyncHTTPClient("http://api.example.com") as client:
        data = await client.get("/users/1")
        assert "id" in data


# Exception testing
def test_validation_error() -> None:
    """Test that validation raises appropriate error."""
    with pytest.raises(ValidationError, match="Email is required"):
        validate_user({"name": "Test"})


# Mocking patterns
def test_service_with_mock(mock_repository: Mock) -> None:
    """Test service with mocked dependencies."""
    service = UserService(repository=mock_repository)

    result = service.get_user("123")

    assert result["name"] == "Test"
    mock_repository.get.assert_called_once_with("123")


@pytest.mark.asyncio
async def test_async_with_mock() -> None:
    """Test async function with mock."""
    mock_client = AsyncMock()
    mock_client.get.return_value = {"status": "ok"}

    result = await fetch_status(mock_client)

    assert result == "ok"
    mock_client.get.assert_awaited_once()


# Factories for test data
@dataclass
class UserFactory:
    """Factory for creating test users."""

    @staticmethod
    def create(
        id: str = "user-123",
        name: str = "Test User",
        email: str = "test@example.com",
        **kwargs: object
    ) -> dict:
        return {"id": id, "name": name, "email": email, **kwargs}
```

### 7. Security Best Practices

```python
import secrets
import hashlib
import hmac
from typing import Any
import os

# Secure secrets generation
def generate_api_key() -> str:
    """Generate a cryptographically secure API key."""
    return secrets.token_urlsafe(32)

def generate_session_id() -> str:
    """Generate a secure session ID."""
    return secrets.token_hex(32)


# Password hashing (use argon2 or bcrypt in production)
import hashlib

def hash_password(password: str, salt: bytes | None = None) -> tuple[bytes, bytes]:
    """Hash password with salt using PBKDF2."""
    if salt is None:
        salt = secrets.token_bytes(32)

    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        iterations=600_000  # OWASP 2023 recommendation
    )
    return key, salt

def verify_password(password: str, key: bytes, salt: bytes) -> bool:
    """Verify password against stored hash."""
    new_key, _ = hash_password(password, salt)
    return hmac.compare_digest(key, new_key)


# Input validation
from pydantic import BaseModel, EmailStr, field_validator
import re

class UserInput(BaseModel):
    """Validated user input with Pydantic."""
    username: str
    email: EmailStr
    age: int

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r'^[a-zA-Z0-9_]{3,30}$', v):
            raise ValueError('Username must be 3-30 alphanumeric characters')
        return v

    @field_validator('age')
    @classmethod
    def validate_age(cls, v: int) -> int:
        if not 0 < v < 150:
            raise ValueError('Age must be between 0 and 150')
        return v


# SQL injection prevention
def get_user_safe(conn: Any, user_id: str) -> dict | None:
    """Safe database query with parameterized query."""
    # ✅ CORRECT: Parameterized query
    cursor = conn.execute(
        "SELECT * FROM users WHERE id = ?",
        (user_id,)
    )
    return cursor.fetchone()

def get_user_unsafe(conn: Any, user_id: str) -> dict | None:
    """UNSAFE: SQL injection vulnerable."""
    # ❌ WRONG: String interpolation
    cursor = conn.execute(
        f"SELECT * FROM users WHERE id = '{user_id}'"  # NEVER DO THIS
    )
    return cursor.fetchone()


# Environment variable management
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings from environment."""
    database_url: str
    api_key: str
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Never hardcode secrets
# ❌ WRONG
API_KEY = "sk-1234567890abcdef"

# ✅ CORRECT
API_KEY = os.environ.get("API_KEY")
```

### 8. Performance Optimization

```python
import functools
from typing import TypeVar, Callable
import time

T = TypeVar("T")

# Caching with functools
@functools.lru_cache(maxsize=1000)
def expensive_computation(n: int) -> int:
    """Cached expensive computation."""
    time.sleep(0.1)  # Simulate expensive work
    return n ** 2


# Slots for memory efficiency
from dataclasses import dataclass

@dataclass(slots=True, frozen=True)
class Point:
    """Memory-efficient point class."""
    x: float
    y: float
    z: float


# Generator expressions for memory efficiency
def process_large_file(filepath: str) -> int:
    """Process large file without loading into memory."""
    # ✅ CORRECT: Generator expression
    with open(filepath) as f:
        return sum(1 for line in f if line.strip())

    # ❌ WRONG: Loads entire file into memory
    # with open(filepath) as f:
    #     return len([line for line in f.readlines() if line.strip()])


# __slots__ for classes
class OptimizedUser:
    """Memory-optimized user class."""
    __slots__ = ('id', 'name', 'email')

    def __init__(self, id: str, name: str, email: str) -> None:
        self.id = id
        self.name = name
        self.email = email


# String building performance
def build_string_efficient(items: list[str]) -> str:
    """Efficient string concatenation."""
    # ✅ CORRECT: Join is O(n)
    return "".join(items)

    # ❌ WRONG: Concatenation is O(n²)
    # result = ""
    # for item in items:
    #     result += item
    # return result


# Using collections efficiently
from collections import defaultdict, Counter, deque

def count_words(text: str) -> dict[str, int]:
    """Count words using Counter."""
    return Counter(text.lower().split())

def group_by_category(items: list[dict]) -> dict[str, list[dict]]:
    """Group items by category."""
    result: dict[str, list[dict]] = defaultdict(list)
    for item in items:
        result[item["category"]].append(item)
    return dict(result)
```

## Quick Reference

### Modern Python Features (3.11+)

| Feature              | Example                               | Use Case                  |
| -------------------- | ------------------------------------- | ------------------------- |
| Pattern Matching     | `match x: case {"type": "user"}: ...` | Complex conditionals      |
| Exception Groups     | `ExceptionGroup("errors", [e1, e2])`  | Concurrent error handling |
| Task Groups          | `async with asyncio.TaskGroup()`      | Structured concurrency    |
| Self Type            | `def copy(self) -> Self:`             | Return type in methods    |
| TypeVarTuple         | `TypeVarTuple("Ts")`                  | Variadic generics         |
| Required/NotRequired | `TypedDict` with optional fields      | Partial dictionaries      |

### Code Quality Checklist

- [ ] All functions have type hints
- [ ] Docstrings follow Google/NumPy style
- [ ] Tests cover edge cases and error paths
- [ ] No hardcoded secrets or configuration
- [ ] Async code uses proper patterns (no blocking)
- [ ] Error handling is specific, not generic
- [ ] Dependencies are pinned and audited
- [ ] Pre-commit hooks enforce standards

## Common Pitfalls

| Pitfall                   | Problem                    | Solution                                         |
| ------------------------- | -------------------------- | ------------------------------------------------ |
| Mutable default arguments | `def f(items=[]):`         | Use `items: list = None` + `items = items or []` |
| Blocking in async         | `time.sleep()` in async    | Use `await asyncio.sleep()`                      |
| Ignoring exceptions       | Bare `except:`             | Catch specific exceptions                        |
| String formatting         | `f"{user_input}"`          | Validate/escape user input                       |
| Import cycles             | Circular imports           | Restructure or use `TYPE_CHECKING`               |
| Global state              | Module-level mutable state | Use dependency injection                         |

## Integration with Tooling

### Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.2.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [pydantic>=2.0]

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
```

## Resources

- **PEP 8**: Style Guide for Python Code
- **PEP 484**: Type Hints
- **PEP 585**: Type Hinting Generics in Standard Collections
- **PEP 604**: Union Types (X | Y syntax)
- **Real Python**: Comprehensive tutorials
- **Python Patterns**: Design patterns in Python


## Parent Hub
- [_data-ai-mastery](../_data-ai-mastery/SKILL.md)


## Part of Workflow
This skill is utilized in the following sequential workflows:
- [_workflow-feature-lifecycle](../_workflow-feature-lifecycle/SKILL.md)
