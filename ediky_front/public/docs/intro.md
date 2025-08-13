---
title: Intro to C++ & Python — Practical, Minimal Guide
status: In Progress
due: 2025-08-20T00:00:00.000Z
priority: Medium
assignee: Idoitachi
tags: 'Docs, Programming, C++, Python, Cheat Sheet'
links: 'https://isocpp.org, https://docs.python.org/3'
docnote: Keep this as the starting page; expand with deeper pages later.
---



## 1) Install & Run

### Python
- Check install: `python3 --version`
- Create virtual env:
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate     # Windows: .venv\Scripts\activate
  python -m pip install --upgrade pip

- Run: `python main.py`

# C++

- Compilers: `g++` (GCC), `clang++`, MSVC (`cl`)
- Quick build:

  ```bash
  g++ -std=c++20 -O2 main.cpp -o app && ./app
  ```

- Prefer **CMake** for portable builds; optional package managers: **vcpkg**, **Conan**

--------------------------------------------------------------------------------

## 2) Hello, World

### Python

```python
print("Hello, world!")
```

### C++

```c++
#include <iostream>
int main() {
    std::cout << "Hello, world!\n";
}
```

--------------------------------------------------------------------------------

## 3) Comments & Formatting

- **Python**: `# line`, triple quotes for docstrings Formatter: `black` (linter: `ruff`)
- **C++**: `// line`, `/* block */` Formatter: `clang-format`

--------------------------------------------------------------------------------

## 4) Types & Variables (side-by-side)

Concept     | Python                         | C++
----------- | ------------------------------ | --------------------------------------------------------
Declaration | dynamic                        | static (or `auto`)
Int / Float | `x = 42`, `pi = 3.14`          | `int x = 42; double pi = 3.14;`
String      | `s = "hi"`                     | `std::string s = "hi";`
Bool        | `flag = True`                  | `bool flag = true;`
None / Null | `None`                         | `nullptr`
Collections | `list`, `tuple`, `dict`, `set` | `std::vector`, `std::array`, `std::map`, `std::set`, ...
Print       | `print(x, y)`                  | `std::cout << x << " " << y << "\n";`

> **Tip** C++: use `auto` when the type is obvious. Python: add type hints for clarity: `def f(x: int) -> str: ...`

--------------------------------------------------------------------------------

## 5) Control Flow

### Python

```python
x = 10
if x > 5:
    print("big")
elif x == 5:
    print("equal")
else:
    print("small")

for i in range(3):
    print(i)

while x > 0:
    x -= 1
```

### C++

```c++
int x = 10;
if (x > 5) {
    std::cout << "big\n";
} else if (x == 5) {
    std::cout << "equal\n";
} else {
    std::cout << "small\n";
}

for (int i = 0; i < 3; ++i) {
    std::cout << i << "\n";
}

while (x > 0) {
    --x;
}
```

--------------------------------------------------------------------------------

## 6) Functions

### Python

```python
def add(a: int, b: int = 0) -> int:
    return a + b

print(add(2, 3))
```

### C++

```c++
int add(int a, int b = 0) {
    return a + b;
}

std::cout << add(2, 3) << "\n";
```

Notes:

- Python: `*args`, `**kwargs` for variadics
- C++: function overloading, templates

--------------------------------------------------------------------------------

## 7) Collections & Comprehensions

### Python

```python
nums = [1, 2, 3]
squares = [n*n for n in nums if n % 2 == 1]  # list comp
counts = {"a": 1, "b": 2}                     # dict
```

### C++ (C++20)

```c++
#include <vector>

std::vector<int> nums{1,2,3};
std::vector<int> squares;
squares.reserve(nums.size());
for (int n : nums) if (n % 2 == 1) squares.push_back(n*n);
```

--------------------------------------------------------------------------------

## 8) Strings & File I/O

### Python

```python
name = "Ada"
msg = f"Hello, {name}!"
with open("data.txt") as f:
    text = f.read()
```

### C++

```c++
#include <string>
#include <fstream>
#include <iterator>

std::string name = "Ada";
std::string msg = "Hello, " + name + "!";
std::ifstream in("data.txt");
std::string text((std::istreambuf_iterator<char>(in)),
                 std::istreambuf_iterator<char>());
```

--------------------------------------------------------------------------------

## 9) Classes (OOP)

### Python

```python
class Counter:
    def __init__(self, start: int = 0):
        self.value = start

    def inc(self, step: int = 1) -> None:
        self.value += step

c = Counter(10)
c.inc()
print(c.value)
```

### C++

```c++
struct Counter {
    int value{0};
    explicit Counter(int start = 0) : value(start) {}
    void inc(int step = 1) { value += step; }
};

Counter c(10);
c.inc();
std::cout << c.value << "\n";
```

Notes:

- Python: GC + ref counting
- C++: RAII (destructors). Prefer smart pointers: `std::unique_ptr`, `std::shared_ptr`

--------------------------------------------------------------------------------

## 10) Exceptions

### Python

```python
try:
    1 / 0
except ZeroDivisionError as e:
    print("bad math:", e)
```

### C++

```c++
#include <stdexcept>

try {
    throw std::runtime_error("bad math");
} catch (const std::exception& e) {
    std::cout << e.what() << "\n";
}
```

--------------------------------------------------------------------------------

## 11) Modules, Builds & Project Layout

### Python (package skeleton)

```
project/
├─ .venv/
├─ pyproject.toml          # optional (Poetry / PEP 517)
├─ requirements.txt        # or Poetry/UV
├─ src/
│  └─ mypkg/
│     ├─ __init__.py
│     └─ core.py
└─ tests/
```

- Tests: `pytest`
- Lint/format/type-check: `ruff`, `black`, `mypy`

### C++ (CMake skeleton)

```
project/
├─ CMakeLists.txt
├─ include/
│  └─ mylib/add.hpp
├─ src/
│  ├─ add.cpp
│  └─ main.cpp
└─ tests/
```

**Minimal `CMakeLists.txt`**

```cmake
cmake_minimum_required(VERSION 3.20)
project(demo LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)
add_executable(app src/main.cpp src/add.cpp)
target_include_directories(app PRIVATE include)
```

**Build & run**

```bash
cmake -S . -B build
cmake --build build -j
./build/app
```

--------------------------------------------------------------------------------

## 12) Performance -- when to use what

- **Python**: maximum dev speed, huge ecosystem (data/ML/web). For speed: vectorize (NumPy), use C-extensions or Numba/PyPy.
- **C++**: deterministic performance, systems/real-time/compute-heavy. Zero-cost abstractions, control over memory.

**Common hybrid**: write hot loops in C++ and expose to Python.

--------------------------------------------------------------------------------

## 13) C++ ↔ Python interop (pybind11)

### C++ (`module.cpp`)

```c++
#include <pybind11/pybind11.h>
int add(int a, int b) { return a + b; }
PYBIND11_MODULE(mylib, m) {
    m.def("add", &add);
}
```

### Python

```python
import mylib
print(mylib.add(2, 3))
```

--------------------------------------------------------------------------------

## 14) Concurrency snapshot

- **Python**: `asyncio` (IO-bound), `multiprocessing` (CPU-bound due to GIL), `concurrent.futures`
- **C++**: `std::thread`, `std::future/std::async`, atomics, condition vars; or TBB / OpenMP

--------------------------------------------------------------------------------

## 15) Common pitfalls

**Python**

- Mutable default args (`def f(x=[]): ...`) → use `None` sentinel
- Late binding in lambdas within loops
- Shadowing builtins (`list`, `dict`)

**C++**

- Dangling refs/pointers → RAII + smart pointers
- UB from uninitialized/out-of-bounds
- Missing `virtual` destructor in polymorphic base

--------------------------------------------------------------------------------

## 16) Competitive programming quickies

**Python**

```python
import sys
data = sys.stdin.read().strip().split()
# Use PyPy when allowed for speed
```

**C++**

```c++
std::ios::sync_with_stdio(false);
std::cin.tie(nullptr);
// Compile with -O2, prefer std::vector, preallocate
```

--------------------------------------------------------------------------------

## 17) Mini exercises

**FizzBuzz**

- Python

  ```python
  for i in range(1, 101):
      s = ("Fizz"*(i%3==0)) + ("Buzz"*(i%5==0)) or str(i)
      print(s)
  ```

- C++

  ```c++
  for (int i = 1; i <= 100; ++i) {
      bool f = i % 3 == 0, b = i % 5 == 0;
      if (f || b) std::cout << (f ? "Fizz" : "") << (b ? "Buzz" : "") << "\n";
      else std::cout << i << "\n";
  }
  ```

**File sum**

- Python

  ```python
  with open("nums.txt") as f:
      print(sum(map(int, f)))
  ```

- C++

  ```c++
  #include <fstream>
  int x, sum = 0;
  std::ifstream in("nums.txt");
  while (in >> x) sum += x;
  std::cout << sum << "\n";
  ```

--------------------------------------------------------------------------------

## 18) What to learn next

- **Python**: Async IO, packaging (`pyproject.toml`), NumPy/Pandas, FastAPI/Flask, PyTorch
- **C++**: STL algorithms/ranges, templates & move semantics, coroutines, testing (Catch2/GoogleTest), deeper CMake
