---
title: Getting Started
status: Draft
priority: Low
tags: 'Docs, Onboarding, C++, Python'
docnote: Short starter checklist for Python and C++.
---

# Getting Started

A tiny checklist to make sure your setup works for **Python** and **C++**.

--------------------------------------------------------------------------------

## 1) Check tools

```bash
# Python
python3 --version

# C++
g++ --version       # or: clang++ --version
`
```

If missing:

- Python: install from <https://python.org>
- C++: install Xcode Command Line Tools (macOS), MSVC/Build Tools (Windows), or `build-essential` (Linux).

--------------------------------------------------------------------------------

## 2) Create a workspace

```bash
mkdir quickstart && cd quickstart
```

--------------------------------------------------------------------------------

## 3) Python: hello world

```bash
python3 -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

python -m pip install --upgrade pip
printf 'print("Hello from Python")\n' > hello.py
python hello.py
```

--------------------------------------------------------------------------------

## 4) C++: hello world

```bash
printf '#include <iostream>\nint main(){std::cout<<"Hello from C++\\n";}\n' > main.cpp
g++ -std=c++20 -O2 main.cpp -o app
./app
```

(Windows MSVC)

```bat
echo #include ^<iostream^> > main.cpp
echo int main(){std::cout<<"Hello from C++\n";} >> main.cpp
cl /std:c++20 /O2 main.cpp
main.exe
```

--------------------------------------------------------------------------------

## 5) Next steps

- Python: try installing a package: `pip install requests` and call an API.
- C++: add a header/source pair and build again, or set up CMake later.
