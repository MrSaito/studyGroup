# AI Engineer Roadmap for a Novice — Day-by-Day Plan (36 Weeks, 216 Days)

**Structure of every week:** Days 1–4 are 1-hour sessions (15 min learn, 45 min do). Day 5 is a 1-hour review day. Day 6 is the 7-hour build block. Day 7 is rest — mandatory. Burnout is the most common reason self-taught engineers quit.

**Format of every day**
- **Learn** — what to read or watch (15 min, never more).
- **Do** — what to type and commit.
- **Tip** — the trap most people fall into on this exact day, and how to avoid it.

**Standing rules:** type everything yourself; commit every day; log 3 lines in `LEARNING_LOG.md`; no AI-generated code until Stage 4 (AI for explanations only); do not advance past a stage exit test you failed.

---

# STAGE 0 — Computing Literacy (Weeks 1–2)

## Week 1 — Terminal and Git

**Day 1 — Set up the machine**
- Learn: what an operating system is; why developers use Linux/Unix shells.
- Do: install WSL2 + Ubuntu (Windows) or use Terminal (Mac/Linux). Install VS Code and the "Remote – WSL" extension if on Windows. Open a terminal. Run `whoami`, `pwd`, `ls`, `echo $HOME`.
- Tip: spend the whole hour on setup if needed. A broken environment on Day 1 poisons every day after. Don't skip WSL2 in favour of Windows CMD — every tutorial for the rest of your life assumes a Unix shell.

**Day 2 — Navigate and manipulate files**
- Learn: filesystem tree, absolute vs relative paths, `.` and `..`, hidden files.
- Do: `cd`, `ls -la`, `mkdir -p a/b/c`, `touch`, `cp`, `mv`, `rm -r` (carefully), `cat`, `less`, `head`, `tail`. Build a fake project folder tree with 10 files using only the terminal.
- Tip: never run `rm -rf` on a path you didn't just `ls`. Make this a reflex now.

**Day 3 — Search, pipe, redirect**
- Learn: stdin/stdout/stderr; what `|`, `>`, `>>` do.
- Do: `grep -r "word" .`, `find . -name "*.txt"`, `wc -l`, `sort | uniq -c`, `history`. Write a one-liner that counts how many lines across all `.txt` files contain a given word.
- Tip: `man command` and `command --help` are your primary documentation. Practise reading them today — it's a skill.

**Day 4 — Git locally**
- Learn: what version control is; commit = snapshot; the three areas (working, staged, committed).
- Do: `git init`, `git status`, `git add`, `git commit -m`, `git log --oneline`, `git diff`. Create `LEARNING_LOG.md` and make 5 commits with meaningful messages. Write a `.gitignore`.
- Tip: commit messages in the imperative ("Add log file", not "Added"). Small commits, one idea each. You'll thank yourself in Week 30.

**Day 5 — Git remote and branches**
- Learn: remote vs local; branch = pointer; merge.
- Do: create a GitHub account (professional username). `git remote add origin`, `git push -u origin main`. `git branch feature`, `git checkout feature` (or `switch`), edit, commit, push, open a pull request on GitHub, merge it, `git pull`.
- Tip: set up SSH keys today (`ssh-keygen`, add to GitHub). Password prompts on every push will make you avoid pushing.

**Day 6 — Build block: environment + editor mastery (7 h)**
- Do: (1) set up VS Code properly: Python extension, GitLens, auto-save, format-on-save, a dark theme you'll keep. Learn 10 shortcuts: command palette, quick open, multi-cursor, find/replace, toggle terminal, go to line. (2) Learn `nano` and 6 `vim` survival commands (`i`, `Esc`, `:wq`, `:q!`, `dd`, `/search`). (3) Environment variables: `export`, `.bashrc`, `PATH`. (4) Write `README.md` for your repo explaining its purpose. (5) Do a full clean run: delete the local clone, re-clone from GitHub, confirm everything works.
- Tip: the "re-clone" test is the real milestone. If your work only exists on one machine, it doesn't exist.

**Day 7 — Rest.**

## Week 2 — How the Internet Works

**Day 1 — DNS, IP, TCP**
- Learn: what a URL is; DNS resolves names to IPs; TCP carries bytes reliably; ports.
- Do: `ping`, `nslookup google.com` or `dig`, `curl -I https://example.com`. Write in your log: "when I type a URL and press Enter, the following happens…" (draft 1).
- Tip: you don't need to memorize the OSI model. You need: name → address → connection → request → response.

**Day 2 — HTTP requests and responses**
- Learn: verbs GET/POST/PUT/PATCH/DELETE; status code families 2xx/3xx/4xx/5xx; headers; body.
- Do: `curl -v https://httpbin.org/get`, `curl -X POST -d '{"a":1}' -H "Content-Type: application/json" https://httpbin.org/post`. Read every line of the verbose output and annotate it in your log.
- Tip: `-v` is your best teacher. Most "the API doesn't work" bugs are visible in the verbose headers.

**Day 3 — JSON and public APIs**
- Learn: JSON syntax (objects, arrays, strings, numbers, booleans, null); why APIs use it.
- Do: pick three free public APIs (a weather API, a public-data API, and one that needs a query parameter). `curl` each. Pipe through `python -m json.tool` to pretty-print. Save responses to files.
- Tip: read the API docs before calling. Note required headers and rate limits. Half of API integration is reading docs carefully.

**Day 4 — Browser DevTools**
- Learn: what the browser does on page load; client vs server; what "frontend" and "backend" mean.
- Do: open DevTools → Network tab on three sites. Identify HTML, CSS, JS, XHR/fetch, image requests. Find a JSON API call a website makes and replicate it with `curl`.
- Tip: this trick — "steal the API call from the Network tab" — will serve you for years in scraping, debugging, and reverse engineering.

**Day 5 — Review and write**
- Do: finalize your "URL to page" explanation (1 page, your own words, no copying). Review every command from Weeks 1–2 without notes. Re-do any you can't recall.
- Tip: explaining is the test of understanding. If a sentence feels vague, you don't understand it yet — look it up.

**Day 6 — Build block: Stage 0 exit test (7 h)**
- Do: (1) timed test, 20 min: from a fresh terminal, clone your repo, branch, edit, commit, push, open PR, and `curl` an API with a query parameter and a header. (2) If you fail, spend 2 hours drilling the weak step, then retest. (3) Install Python 3.12+ (via `uv` or python.org) and confirm `python --version`. (4) Read the first chapter of your chosen Python book. (5) Update README with a "Stage 0 complete" section listing what you can now do.
- Tip: passing the timed test without notes is non-negotiable. Everything in Stage 1 assumes it.

**Day 7 — Rest.**

---
# STAGE 1 — Python Properly (Weeks 3–9)

**Setup for the stage:** create `python-practice/` repo. Every toy problem goes in `problems/day_XX.py`. Every project in `projects/`. Register on CodeWars and Exercism (Python track).

## Week 3 — Basics

**Day 1 — Variables and types**
- Learn: int, float, str, bool, None; `type()`; dynamic typing; the REPL.
- Do: open `python` REPL and experiment for 20 min. Then write `day_01.py`: 10 variables of each type, print them with `f"..."`. Try `"3" + 3` and read the error carefully.
- Tip: read every error message top to bottom before Googling. The last line tells you the type; the lines above tell you where. This habit is worth more than any tutorial.

**Day 2 — Strings**
- Learn: indexing, slicing `s[1:4]`, `.upper() .lower() .strip() .split() .join() .replace() .find()`, `in`, `len()`.
- Do: 10 string exercises: reverse a string, count vowels, title-case a sentence manually, check if a word is in a sentence, extract a domain from an email.
- Tip: strings are immutable — every method returns a new string. `s.upper()` does nothing unless you assign it.

**Day 3 — Conditionals**
- Learn: `if/elif/else`, comparison operators, `and/or/not`, truthiness (empty string/list/0/None are false).
- Do: FizzBuzz, leap-year checker, grade calculator, BMI category, simple login check. CodeWars 8kyu ×3.
- Tip: `==` compares, `=` assigns. Also: `if x == True` should just be `if x`.

**Day 4 — Loops**
- Learn: `for x in ...`, `range(start, stop, step)`, `while`, `break`, `continue`, nested loops.
- Do: print a multiplication table, sum of digits, find primes under 100, number guessing game with `while`, draw a triangle of `*`. CodeWars 8kyu ×4.
- Tip: off-by-one errors live in `range()`. `range(5)` is 0–4. Print the loop variable when confused.

**Day 5 — Review**
- Do: CodeWars 8kyu ×3 (aim for 10 total this week). Re-solve Day 3 and Day 4 problems from memory. Read one Python solution on CodeWars that's shorter than yours and understand why.
- Tip: reading others' solutions after solving is how you learn idioms. Reading before solving is how you learn nothing.

**Day 6 — Build block (7 h)**
- Do: (1) 2 h: book chapters on input/output and basic control flow, typing every example. (2) 3 h: build a terminal "quiz game": asks 10 questions from a hard-coded list, tracks score, allows retry, handles bad input. (3) 1 h: 15 small scripts committed (you should be there by now). (4) 1 h: log what confused you this week.
- Tip: the quiz game will feel too easy or too hard. Either way, finish it. Finishing is the skill.

**Day 7 — Rest.**

## Week 4 — Collections

**Day 1 — Lists**
- Learn: creating, indexing (negative too), slicing, `.append() .insert() .pop() .remove() .sort() .reverse()`, `sorted()`, `len`, `in`, list of lists.
- Do: implement: max without `max()`, second largest, remove duplicates, rotate a list, matrix transpose with nested lists. CodeWars 8kyu ×3.
- Tip: `.sort()` returns `None` and sorts in place; `sorted()` returns a new list. This bites everyone once.

**Day 2 — Tuples and sets**
- Learn: tuples are immutable lists (use for fixed records); sets are unordered unique items with fast membership; set operations `| & - ^`.
- Do: deduplicate a list preserving order (hint: seen-set); find common elements of two lists; count unique words in a paragraph. CodeWars 7kyu ×2.
- Tip: when you need "is X in this collection?" many times, use a set. It's O(1) vs O(n) — you'll learn what that means in Week 5; feel it now by timing both on 100,000 items.

**Day 3 — Dictionaries**
- Learn: key/value, `d[key]`, `.get(key, default)`, `.keys() .values() .items()`, adding/updating/deleting, `in`, nested dicts.
- Do: word-frequency counter; invert a dict; group a list of names by first letter; phone-book lookup. CodeWars 7kyu ×2.
- Tip: `d.get(k, 0) + 1` is the counting idiom. Learn `collections.Counter` and `defaultdict` today too — you'll use them weekly.

**Day 4 — Comprehensions and iteration helpers**
- Learn: list/dict/set comprehensions, conditional comprehensions, `enumerate`, `zip`, `sorted(key=...)`, `lambda` (just enough), `min/max(key=...)`.
- Do: rewrite 5 earlier loops as comprehensions; sort a list of (name, age) tuples by age; pair two lists with `zip`; number lines with `enumerate`. CodeWars 7kyu ×3.
- Tip: if a comprehension needs more than one `if` or nesting, write a loop. Readability beats cleverness.

**Day 5 — Review**
- Do: CodeWars 7kyu ×5. Re-implement Counter, defaultdict-grouping, and dedup-preserving-order from memory. Time yourself.
- Tip: you should now be able to read a 7kyu problem and know which data structure fits within 30 seconds. If not, do 5 more.

**Day 6 — Build block: Contact Book v1 (7 h)**
- Do: a CLI contact book. Menu loop: add, list, search (by partial name), delete, quit. Contacts stored as a list of dicts. Validate input (no empty names, phone must be digits). Search is case-insensitive. Commit in stages: menu → add/list → search → delete → validation.
- Tip: write the menu loop first with all options printing "not implemented". Then fill one at a time. This is how professionals build: skeleton, then flesh.

**Day 7 — Rest.**

## Week 5 — Functions and Modules

**Day 1 — Functions**
- Learn: `def`, parameters vs arguments, `return` (vs print), default values, keyword arguments, docstrings, scope (local vs global).
- Do: convert every Week 3–4 script into functions. Write `is_palindrome`, `flatten`, `chunk(lst, n)`, `most_common(lst)`. CodeWars 7kyu ×2.
- Tip: a function that prints instead of returning can't be tested or reused. Return values; print at the edges.

**Day 2 — `*args`, `**kwargs`, type hints**
- Learn: variable arguments; type hints `def f(x: int, names: list[str]) -> dict[str, int]`; why hints matter (editor help, catching bugs, documentation).
- Do: add type hints to every function from Day 1. Install `mypy` and run it — fix what it reports. Write a `sum_all(*numbers)` and `make_profile(**fields)`.
- Tip: type hints are not enforced at runtime. They're for you, your editor, and your future teammates. Use them everywhere from today; it will make Pydantic in Stage 3 feel natural.

**Day 3 — Modules and the standard library**
- Learn: `import`, `from x import y`, `if __name__ == "__main__":`, creating your own module; tour of `math`, `random`, `datetime`, `os`, `pathlib`, `json`, `collections`, `itertools`.
- Do: split your utility functions into `utils.py` and import them from `main.py`. Write a script using `pathlib` to list all `.py` files in your repo with their sizes. Use `datetime` to compute days until a date.
- Tip: `pathlib.Path` over `os.path` — always. It's cleaner and cross-platform.

**Day 4 — Virtual environments and pip**
- Learn: why isolation matters (project A needs version 1, project B needs version 2); `python -m venv .venv`, activate, `pip install`, `pip freeze > requirements.txt`; or `uv` as a faster alternative.
- Do: create a venv for `python-practice`, install `requests` and `rich`, freeze requirements, add `.venv/` to `.gitignore`. Delete the venv and recreate it from `requirements.txt`.
- Tip: never `pip install` outside a venv again. If your prompt doesn't show `(.venv)`, stop.

**Day 5 — Review**
- Do: CodeWars 7kyu ×5. Write, from memory, a module with 5 typed, documented functions and a `__main__` block that demos them. Run `mypy` clean.
- Tip: if `mypy` complains about something you think is fine, you've found a gap in your mental model. Chase it.

**Day 6 — Build block: Contact Book v2 (7 h)**
- Do: refactor Contact Book into a package: `contacts/models.py` (functions that create/validate a contact), `contacts/store.py` (add/search/delete), `contacts/cli.py` (menu), `main.py`. Full type hints, docstrings, `mypy` clean, inside a venv with `requirements.txt`. Add a `--help` using `argparse`.
- Tip: the refactor will feel like wasted time. It isn't — you're learning to move code without breaking it, which is 60% of real engineering.

**Day 7 — Rest.**

## Week 6 — Files, Errors, and JSON

**Day 1 — Reading and writing files**
- Learn: `open()`, modes `r/w/a`, `with` (context managers close files), reading lines, writing lines, encodings (`utf-8`).
- Do: write a script that reads a text file and reports line/word/character counts; append a timestamp to a log file each run; copy a file line by line.
- Tip: always `with open(...)`. Forgetting to close files causes data loss you won't notice until it matters.

**Day 2 — CSV and JSON**
- Learn: `csv.reader/writer/DictReader/DictWriter`; `json.load/loads/dump/dumps`; `indent=2`; what round-tripping means.
- Do: create a CSV of 20 fake contacts by hand; read it with `DictReader`; convert to JSON; read JSON back; compare. Download a real CSV dataset and load it.
- Tip: CSVs from the real world are dirty — extra spaces, missing fields, mixed encodings. Assume nothing; `.strip()` everything.

**Day 3 — Exceptions**
- Learn: `try/except/else/finally`; catching specific exceptions (`ValueError`, `FileNotFoundError`, `KeyError`, `ZeroDivisionError`); `raise`; custom exceptions via `class MyError(Exception)`; never bare `except:`.
- Do: make yesterday's CSV loader survive: missing file, empty file, malformed rows, missing columns. Each failure gets a clear message. Write a `parse_int(s)` that returns `None` on failure.
- Tip: catch the narrowest exception you can, as close to the source as you can. `except Exception:` hides bugs.

**Day 4 — Logging**
- Learn: `logging` module: levels DEBUG/INFO/WARNING/ERROR, `basicConfig`, format strings, logging to a file, why not `print()` for diagnostics.
- Do: replace every diagnostic `print` in your projects with `logging`. Log to both console and `app.log`. Log exceptions with `logger.exception()`.
- Tip: `logger.exception()` inside an `except` block captures the traceback automatically. Use it.

**Day 5 — Review**
- Do: CodeWars 7kyu ×5. Build a "messy CSV to clean JSON report" script from a spec you write yourself: handles at least 5 failure modes, logs each, never crashes.
- Tip: deliberately corrupt your input files in 5 different ways and confirm each is handled. Testing your own error handling is a professional habit.

**Day 6 — Build block: Contact Book v3 (7 h)**
- Do: contacts persist to `contacts.json`; load on start, save on every change. Survive missing/corrupt file (back it up and start fresh, with a warning). Add import-from-CSV and export-to-CSV commands. Logging throughout. Custom `ContactNotFound` exception. Commit each feature.
- Tip: write the "corrupt file" case first. Happy paths are easy; robustness is what employers pay for.

**Day 7 — Rest.**

## Week 7 — Object-Oriented Python

**Day 1 — Classes and instances**
- Learn: `class`, `__init__`, `self`, attributes, methods, `__repr__`/`__str__`. A class bundles data with behaviour.
- Do: `Contact` class with name/phone/email and `is_valid()`; `BankAccount` with deposit/withdraw that raises on overdraft; `Rectangle` with area/perimeter. CodeWars 7kyu ×2.
- Tip: `self` is just the instance. If you get "missing 1 required positional argument: self", you called a method on the class instead of an instance.

**Day 2 — Dataclasses and properties**
- Learn: `@dataclass` generates `__init__`, `__repr__`, `__eq__`; `field(default_factory=list)`; `frozen=True`; `@property` for computed attributes.
- Do: rewrite Day 1 classes as dataclasses. Add a `full_name` property. Try mutating a frozen dataclass and read the error.
- Tip: dataclasses for data, regular classes for behaviour-heavy objects. Default to dataclass — it's what Pydantic builds on in Stage 3.

**Day 3 — Inheritance and composition**
- Learn: `class Dog(Animal)`, `super().__init__()`, method overriding; composition ("has a") vs inheritance ("is a"); why composition is usually better.
- Do: `Shape` → `Circle`, `Square` with `area()`; then a `Library` that *has* a list of `Book` and `Member` objects (composition). Model a `Loan` linking them. CodeWars 6kyu ×1.
- Tip: if you're more than two levels deep in inheritance, stop and use composition. Deep hierarchies are a classic beginner trap.

**Day 4 — When NOT to use classes; dunder methods**
- Learn: functions and dicts are often enough; `__len__`, `__iter__`, `__getitem__`, `__eq__`, `__lt__` for sorting; `@classmethod` and `@staticmethod`.
- Do: make `Library` iterable and support `len()`. Add `Contact.from_dict()` classmethod and `to_dict()`. Sort a list of contacts by name using `__lt__`.
- Tip: don't wrap two functions in a class just to feel "object-oriented". Classes earn their place when state and behaviour genuinely belong together.

**Day 5 — Review**
- Do: CodeWars 6kyu ×3. Write the library system (Book, Member, Loan) from memory with dataclasses, a `Library` class managing them, and a `__main__` demo.
- Tip: draw the relationships on paper before coding. Five minutes of boxes and arrows saves an hour of refactoring.

**Day 6 — Build block: Contact Book v4 (7 h)**
- Do: `Contact` dataclass; `Storage` class with `load()/save()/add()/find()/delete()` wrapping the JSON file; `ContactBook` class using `Storage` (composition); CLI calls `ContactBook`. `from_dict/to_dict` for serialization. Sorting and iteration supported. Everything typed and `mypy` clean.
- Tip: the `Storage` abstraction is deliberate — in Week 10 you'll swap JSON for SQLite by changing one class. That's what good design buys you.

**Day 7 — Rest.**

## Week 8 — Testing and HTTP in Python

**Day 1 — pytest basics**
- Learn: install `pytest`; test files `test_*.py`; functions `test_*`; `assert`; running `pytest -v`; reading failure output.
- Do: write tests for all Week 5 utility functions (`is_palindrome`, `flatten`, `chunk`, `most_common`). Include edge cases: empty input, single element, wrong type.
- Tip: one assertion idea per test; name tests by behaviour (`test_flatten_handles_empty_list`). A failing test should tell you what broke without reading the code.

**Day 2 — Fixtures, parametrize, coverage**
- Learn: `@pytest.fixture` for setup; `@pytest.mark.parametrize` for many inputs; `pytest.raises`; `pytest-cov` and reading a coverage report; `tmp_path` fixture for file tests.
- Do: parametrize your palindrome tests with 10 cases; test that `BankAccount.withdraw` raises on overdraft; test `Storage` using `tmp_path` so real files aren't touched. Reach 100% coverage on `utils.py`.
- Tip: 100% coverage doesn't mean bug-free; it means every line ran. Still, aim for it on small modules — it forces you to think about edge cases.

**Day 3 — Test-first**
- Learn: TDD loop: write failing test → minimal code to pass → refactor.
- Do: build a `PhoneNumber` normalizer test-first: accepts `+92 300 1234567`, `0300-1234567`, `(0300) 1234567`, rejects letters. Write each test before the code that satisfies it.
- Tip: TDD feels slow the first day and fast forever after. Push through today.

**Day 4 — HTTP with `requests`**
- Learn: `requests.get/post`, `params=`, `headers=`, `json=`, `.status_code`, `.json()`, `.raise_for_status()`, `timeout=` (always), sessions.
- Do: call the three public APIs from Week 2 from Python. Handle 404, timeout, and bad JSON. Write a `fetch_json(url, params) -> dict | None` helper with retries (3 attempts, sleep between).
- Tip: always pass `timeout=`. Without it a hung server hangs your program forever. This is a real production incident waiting to happen.

**Day 5 — Mocking the network**
- Learn: why tests shouldn't hit real networks (slow, flaky, costs money); `unittest.mock.patch`, `responses` library or `pytest-httpx`.
- Do: write tests for `fetch_json` that mock success, 404, timeout, and malformed JSON. CodeWars 6kyu ×2.
- Tip: mock at the boundary (the `requests.get` call), not deep inside your code. Over-mocking makes tests meaningless.

**Day 6 — Build block: API client + full test suite (7 h)**
- Do: (1) 3 h: `api_client/` project — a CLI that fetches from a public API, caches results in a local JSON with a timestamp (skip the network if cache < 1 hour old), and prints a formatted summary using `rich`. (2) 3 h: full test suite for Contact Book v4 (Storage, ContactBook, validation) with `tmp_path`, plus mocked tests for the API client. (3) 1 h: add a `Makefile` or `justfile` with `test`, `lint`, `run` targets; add `ruff` for linting.
- Tip: run `pytest` before every commit from now until forever. Add it to your Friday review ritual.

**Day 7 — Rest.**

## Week 9 — Consolidation Project

**Day 1 — Spec**
- Do: write a one-page spec for your capstone CLI: "fetch data from [chosen public API], clean it, store as JSON and CSV, produce a summary report with statistics and a top-N list." Define inputs, outputs, error cases, and what "done" means. Draw the module layout.
- Tip: choose an API with imperfect data (public datasets, not toy endpoints). Dirty data teaches more than clean data.

**Day 2 — Fetch layer**
- Do: `fetcher.py` with typed functions, timeouts, retries, caching, logging. Tests with mocked network. Commit.
- Tip: build and test one layer per day. Vertical slices, not horizontal sprawl.

**Day 3 — Clean and model layer**
- Do: `models.py` with dataclasses for your records including `from_api(dict)` that validates and normalizes; `cleaner.py` that drops/repairs bad rows and logs each decision. Tests with 10 malformed inputs.
- Tip: log *why* each row was dropped. In Stage 3 you'll do exactly this for LLM outputs.

**Day 4 — Storage and report layer**
- Do: `storage.py` writes JSON and CSV; `report.py` computes stats (count, mean, min/max, top-N by a field) and renders a table with `rich`. Tests for stats on known data.
- Tip: compute statistics on a tiny hand-checked dataset in your tests. If `mean([1,2,3])` isn't 2, everything downstream is wrong.

**Day 5 — CLI, README, polish**
- Do: `argparse` CLI with subcommands `fetch`, `report`, `export`. README with install/run instructions and a screenshot. `ruff` clean, `mypy` clean, `pytest` green. CodeWars 6kyu ×3.
- Tip: the README is for a stranger. Have someone (or your future self after a week) follow it from scratch.

**Day 6 — Build block: Stage 1 exit test (7 h)**
- Do: (1) 2 h timed, no AI, no notes: implement from an unseen spec — "parse a web-server log file (write a generator script first to create 10,000 fake lines), report top 5 error types per hour, output JSON and a table." Must be typed, modular, tested. (2) Grade yourself honestly against the spec. (3) If failed: identify the weak area (structure? testing? parsing?), spend 3 hours drilling it, retest next weekend before starting Stage 2. (4) If passed: 2 h reading SQLBolt intro and installing SQLite tooling; 1 h retrospective in your log — what was hardest in Stage 1 and why.
- Tip: most people fail this on structure and tests, not on Python syntax. That's the point of the test.

**Day 7 — Rest.**

---
# STAGE 2 — Data and SQL (Weeks 10–13)

**Setup:** new repo `data-sql-practice/`. Install SQLite CLI (`sqlite3`) and DB Browser for SQLite (visual). Bookmark SQLBolt and pgexercises.

## Week 10 — SQL Fundamentals (SQLite)

**Day 1 — Tables and SELECT**
- Learn: relational model — table, row, column, type; `CREATE TABLE`, `INSERT`, `SELECT ... FROM ... WHERE`, `ORDER BY`, `LIMIT`, `DISTINCT`.
- Do: SQLBolt lessons 1–4. In `sqlite3`, create a `contacts` table and insert 10 rows by hand; run 10 different SELECTs.
- Tip: SQL is declarative — you say *what* you want, not *how*. Novices try to "loop" in SQL. Think in sets of rows.

**Day 2 — Filtering and functions**
- Learn: `LIKE`, `IN`, `BETWEEN`, `IS NULL`, `AND/OR/NOT`, string functions, `CASE WHEN`, `COALESCE`.
- Do: SQLBolt 5–8. Write 15 queries against your contacts table using every operator above.
- Tip: `NULL` is not equal to anything, including `NULL`. Use `IS NULL`. This causes silent wrong answers, not errors.

**Day 3 — Aggregation**
- Learn: `COUNT SUM AVG MIN MAX`, `GROUP BY`, `HAVING` (filter after grouping) vs `WHERE` (filter before).
- Do: SQLBolt 9–12. Load a real CSV into SQLite (`.import`), then: rows per category, average per group, groups with more than N rows, top 5 by a metric.
- Tip: every non-aggregated column in `SELECT` must be in `GROUP BY`. SQLite is lenient about this; Postgres will reject it. Write it correctly now.

**Day 4 — SQLite from Python**
- Learn: `sqlite3.connect`, cursor, `execute`, `executemany`, `fetchall/fetchone`, parameterized queries with `?`, `commit`, `with conn:`.
- Do: script that creates the contacts table, inserts from your Week 6 CSV, and runs 5 queries. Then deliberately try string-formatting a query with user input and inject `'; DROP TABLE contacts; --` — watch it work. Then fix with parameters.
- Tip: you just performed SQL injection on yourself. Never build a query with f-strings or `+`. Parameters, always. This is interview material.

**Day 5 — Review**
- Do: SQLBolt remaining lessons. From memory, write: a table with 3 constraints, 5 SELECTs covering filter/sort/aggregate, and a parameterized Python insert.
- Tip: read `EXPLAIN QUERY PLAN` output for one query today just to see it exists. You'll use it seriously on Day 3 of Week 11.

**Day 6 — Build block: Contact Book v5 on SQLite (7 h)**
- Do: replace the JSON `Storage` class with a `SqliteStorage` class implementing the same methods — the rest of the app should not change. Schema with constraints (`NOT NULL`, `UNIQUE` on email). Migrations as numbered SQL files applied on startup. Tests using an in-memory database (`:memory:`). Import/export still work.
- Tip: if you have to change `ContactBook` or the CLI to swap storage, your Week 7 abstraction leaked. Fix the abstraction, not the callers.

**Day 7 — Rest.**

## Week 11 — Joins, Schema Design, Indexes

**Day 1 — Keys and relationships**
- Learn: primary key, foreign key, one-to-many, many-to-many via junction table; `REFERENCES`; `ON DELETE CASCADE`.
- Do: design on paper, then create: `patients`, `doctors`, `appointments` (FK to both), `prescriptions` (FK to appointment). Insert 5 of each. Delete a patient and observe cascade.
- Tip: many-to-many always needs a third table. If you find yourself storing comma-separated IDs in a column, stop — that's the classic beginner schema error.

**Day 2 — Joins**
- Learn: `INNER JOIN`, `LEFT JOIN`, (`RIGHT`, `FULL` rarely), join conditions, table aliases, joining three tables, self-join.
- Do: pgexercises "Joins and Subqueries" section (do it on SQLite or set up Postgres early). On your clinic schema: appointments with patient and doctor names; doctors with zero appointments (LEFT JOIN + IS NULL); prescriptions with all four tables joined.
- Tip: draw the Venn diagram for each join type once, then never again — instead, ask "which table's rows must all appear?" That table goes on the LEFT.

**Day 3 — Subqueries and indexes**
- Learn: subqueries in `WHERE` and `FROM`, `EXISTS`, CTEs (`WITH ... AS`); what an index is (a sorted lookup structure), `CREATE INDEX`, when it helps (filter/join columns), when it hurts (write-heavy tables); `EXPLAIN QUERY PLAN`.
- Do: generate 100,000 fake appointments with a Python script. Time a query filtering by `doctor_id` before and after `CREATE INDEX`. Read the plan for both. Rewrite one nested subquery as a CTE.
- Tip: the 100k-row timing demo is the single most important thing this week. Feel the difference; don't just read about it.

**Day 4 — Normalization, just enough**
- Learn: 1NF (atomic values), 2NF/3NF (no partial or transitive dependencies) in plain terms: "don't repeat facts; store each fact once and reference it." When denormalization is acceptable (read-heavy reporting).
- Do: take a deliberately bad flat table (patient name, doctor name, doctor phone, appointment date, drug all in one row) and normalize it into your clinic schema. Write the migration.
- Tip: the smell of bad design is *update anomalies* — changing a doctor's phone in 400 rows. If updating one fact means touching many rows, normalize.

**Day 5 — Review**
- Do: pgexercises "Aggregates" section. From memory: create the clinic schema with constraints and two indexes, write 10 queries including a 3-table join, a LEFT JOIN with NULL check, a CTE, and a `GROUP BY` with `HAVING`.
- Tip: the 10 queries should read like questions a clinic manager would ask. If you can't phrase the business question, you don't need the query.

**Day 6 — Build block: transactions and a reporting script (7 h)**
- Learn (1 h): transactions — `BEGIN/COMMIT/ROLLBACK`, atomicity, why a transfer between two accounts must be one transaction; isolation in one paragraph.
- Do: (3 h) Python script that books an appointment transactionally: check doctor availability, insert appointment, insert prescription placeholder — all-or-nothing; simulate a failure mid-way and confirm rollback. (3 h) reporting script: appointments per doctor per month, top drugs prescribed, patients with no visits in 6 months — output as a `rich` table. Tests on a seeded `:memory:` DB.
- Tip: the "simulate failure mid-transaction" test is the one interviewers ask about. Make sure you can explain why the rollback happened.

**Day 7 — Rest.**

## Week 12 — PostgreSQL and Python

**Day 1 — Install and explore Postgres**
- Learn: Postgres vs SQLite — a server process, users/roles, databases, schemas; why it's the industry default (concurrency, extensions, reliability).
- Do: install locally (native or `docker run postgres` — preview of Week 23; the one-liner is fine to copy today). Connect with `psql`. Learn `\l \c \dt \d table \q \x`. Create a database, a user, grant privileges.
- Tip: Postgres setup frustration is universal. Budget the whole hour; if you finish early, explore `\?` for psql commands.

**Day 2 — Port the schema**
- Learn: Postgres types (`SERIAL`/`GENERATED AS IDENTITY`, `TEXT`, `TIMESTAMPTZ`, `NUMERIC`, `BOOLEAN`, `JSONB`), `RETURNING`, `ON CONFLICT`.
- Do: port the clinic schema to Postgres with proper types and constraints. Insert with `RETURNING id`. Try `ON CONFLICT DO NOTHING` for an upsert. Run yesterday's 10 queries and fix what Postgres rejects that SQLite allowed.
- Tip: use `TIMESTAMPTZ`, never `TIMESTAMP`. Timezone bugs are miserable and permanent.

**Day 3 — Python with psycopg**
- Learn: `psycopg` (v3): `connect`, `cursor`, `execute` with `%s` parameters, `fetchall`, `commit`, context managers, connection strings, reading credentials from environment variables, `dict_row` row factory.
- Do: rewrite the transactional booking script and the reporting script against Postgres. Credentials via `.env` loaded with `python-dotenv`. `.env` in `.gitignore`.
- Tip: never commit a `.env`. Add a `.env.example` with placeholder values instead. Leaked database credentials in public repos get scanned and exploited within minutes.

**Day 4 — Seeding and timing at scale**
- Learn: `executemany` vs `COPY` for bulk loads; `EXPLAIN ANALYZE` in Postgres (actual timings); sequential scan vs index scan.
- Do: seed 1,000 patients, 100 doctors, 200,000 appointments with `Faker`. Run 5 queries with `EXPLAIN ANALYZE`; add indexes on foreign keys and the date column; re-run and record before/after in your log.
- Tip: Postgres does not automatically index foreign keys. Many real-world slow queries are exactly this omission.

**Day 5 — Review**
- Do: pgexercises "Modifying data" and "String" sections. Write a `db.py` module with a `get_connection()` helper, a `run_query(sql, params)` helper, and tests against a test database (create/drop in a fixture).
- Tip: separate "connect" from "query" from "business logic." This three-layer split reappears in FastAPI in Week 22.

**Day 6 — Build block: migrations and a data layer (7 h)**
- Learn (1 h): what migrations are and why teams need them; Alembic in concept (you'll use it in Week 22); for now, numbered SQL files with a `schema_migrations` table.
- Do: (4 h) build a `migrate.py` that applies unapplied `migrations/NNN_*.sql` files in order and records them; write 4 migrations evolving the clinic schema (add a column, add an index, add a table, backfill data). (2 h) refactor the reporting script to use the `db.py` layer; add 3 more reports. Tests green.
- Tip: migrations must be forward-only and idempotent. Run `migrate.py` twice; the second run must do nothing.

**Day 7 — Rest.**

## Week 13 — Working with Data in Python

**Day 1 — pandas basics**
- Learn: `DataFrame`, `read_csv`, `.head() .info() .describe()`, selecting columns, boolean filtering, `.loc/.iloc`, sorting, `.value_counts()`.
- Do: load a real public dataset (few thousand rows). Answer 10 questions about it using pandas only. Compare with the same questions in SQL — note which feels natural where.
- Tip: pandas and SQL overlap heavily. Rule of thumb: filtering/joining large data → SQL; analysis/transformation of a result → pandas.

**Day 2 — groupby, merge, and SQL interop**
- Learn: `.groupby().agg()`, `.merge()` (it's a join), `.pivot_table()`, `pd.read_sql`, `.to_sql`, handling missing values (`.isna() .fillna() .dropna()`).
- Do: read the clinic tables from Postgres into DataFrames; reproduce three of your SQL reports in pandas; write a cleaned DataFrame back to a new table.
- Tip: `merge` default is inner join. Same LEFT/INNER reasoning as Week 11 applies.

**Day 3 — Just enough maths: vectors**
- Learn: a vector is a list of numbers; dot product; vector length (norm); cosine similarity = dot / (norm × norm) → 1 means "same direction", 0 unrelated, −1 opposite. Why this measures similarity of meaning in Stage 3.
- Do: with `numpy`: implement `dot`, `norm`, `cosine_similarity` by hand; verify against `numpy.dot` and `numpy.linalg.norm`. Compute pairwise similarity for 5 hand-made vectors and rank them. Implement `top_k(query_vec, matrix, k)`.
- Tip: you are writing the core of every vector search engine today. Keep this file — you'll reuse it in Week 17.

**Day 4 — Just enough maths: statistics and probability**
- Learn: mean, median, variance, standard deviation, percentiles (p50/p95 — you'll see these in monitoring); what a probability distribution is; why "temperature" in LLMs is about sampling from a distribution; precision, recall, accuracy with a 2×2 table.
- Do: compute all of these on your dataset with numpy/pandas. Build a tiny classifier by rule (e.g. "flag appointments longer than 60 min") and compute its precision/recall against a hand-labelled sample of 50.
- Tip: precision and recall will be your daily language from Week 18. Learn them on 50 rows you can count by hand.

**Day 5 — Plotting and review**
- Learn: `matplotlib` basics: bar, line, histogram, labels, titles, saving to PNG. Seaborn optional.
- Do: two charts from your dataset. Then, from memory: cosine similarity + top_k, a groupby report, and precision/recall from a confusion matrix.
- Tip: every chart needs a title, axis labels, and units. Unlabelled charts are the data-analysis equivalent of untyped functions.

**Day 6 — Build block: Stage 2 exit test + data report (7 h)**
- Do: (1) 2 h timed exit test: from a written description of a small business ("a gym with members, classes, trainers, bookings, payments"), design the schema with constraints and two justified indexes, load 50 fake rows per table into Postgres via Python, write 5 queries including a 3-table join, and read the `EXPLAIN ANALYZE` for the join out loud. (2) 4 h: a `report/` project — load a public dataset into Postgres, analyze with pandas, produce a markdown report with two charts and five findings, committed with the code that generated it. (3) 1 h: retrospective; read the first section of a provider's LLM API docs.
- Tip: the "read the query plan aloud" part is deliberate. If you can explain a seq scan vs index scan to a rubber duck, you've passed.

**Day 7 — Rest.**

---
# STAGE 3 — LLM Engineering Without Frameworks (Weeks 14–19)

**Setup:** new repo `llm-practice/`. Get an API key from one provider (Anthropic or OpenAI). Set a spend cap in the provider dashboard immediately — $10/month is plenty for this stage. Store the key in `.env`. Install the provider SDK, `pydantic`, `numpy`, `tiktoken` (or the provider's tokenizer).

**Rule for this stage:** no LangChain, LlamaIndex, or any orchestration framework. Raw SDK calls and your own code only.

## Week 14 — How LLMs Actually Work

**Day 1 — Tokens**
- Learn: an LLM predicts the next token; a token is a chunk of text (roughly ¾ of a word in English, worse for other languages and code); tokenizers; you pay per token in and out.
- Do: use a tokenizer to count tokens for 10 texts — English prose, code, Urdu/Arabic script, numbers, JSON. Record the words-to-tokens ratio for each in your log.
- Tip: non-English text and JSON with lots of punctuation are token-expensive. This affects cost and context budgeting later — notice it now.

**Day 2 — First API call**
- Learn: messages format (system, user, assistant), the request/response shape, `max_tokens`, reading usage from the response.
- Do: make one call from Python. Print the response text and the token usage. Compute the cost from the provider's price table. Wrap it in `ask(prompt: str) -> str` with error handling and a timeout.
- Tip: print `usage` on every call for the rest of this stage. Cost awareness is a professional reflex, and interviewers ask about it.

**Day 3 — Sampling and context**
- Learn: temperature (0 = deterministic-ish, higher = more random), `top_p`, context window limits, what happens when you exceed it, why long contexts cost more and can degrade quality.
- Do: same prompt at temperature 0, 0.7, 1.2 — five runs each; note variance. Send a prompt that exceeds the context window and read the error. Measure latency vs output length.
- Tip: use temperature 0 for anything you need to test or evaluate. Randomness makes bugs unreproducible.

**Day 4 — Why models hallucinate**
- Learn: the model generates plausible continuations, not verified facts; it has no database; it's confident by construction. Grounding (giving it the facts in the prompt) is the fix — this is the entire motivation for RAG.
- Do: ask the model 10 factual questions in a niche domain you know well. Verify each answer. Record the hallucination rate. Then repeat with the correct facts pasted into the prompt; record again.
- Tip: keep this experiment's results. It's the clearest "why RAG exists" demonstration you'll ever have, and a great interview story.

**Day 5 — Review + chat loop**
- Do: build a terminal chat loop that keeps conversation history (a list of messages), shows cumulative token usage and cost, and lets you `/reset`. Handle rate-limit errors with a retry. CodeWars 6kyu ×2 (keep the problem-solving muscle alive).
- Tip: notice that the full history is re-sent every turn — cost grows with conversation length. That's why production systems summarize or truncate history.

**Day 6 — Build block: model comparison harness (7 h)**
- Do: (1) 3 h: a script that runs a set of 20 prompts against two models (e.g. a small and a large one), recording latency, tokens, cost, and output for each into a CSV. (2) 2 h: analyze with pandas — cost per model, p50/p95 latency, output length distribution; two charts. (3) 2 h: read your provider's docs on structured outputs and tool use ahead of next week; write a one-page summary in your log.
- Tip: p95 latency, not average, is what users feel. You learned percentiles in Week 13 — this is where they start mattering.

**Day 7 — Rest.**

## Week 15 — Prompting and Structured Outputs

**Day 1 — Prompting that works**
- Learn: the handful of patterns that reliably matter: clear task statement, role/context in the system prompt, explicit output format, delimiters around input data (`<document>...</document>`), few-shot examples, "if unsure say so". Ignore "magic phrase" prompt hacks.
- Do: take a bad prompt ("summarize this") and iterate it 5 times on the same 3 documents, recording output quality each time. Write down which change helped most.
- Tip: put the data at the end and the instructions at the top or bottom, never buried in the middle. Test rather than trust folklore.

**Day 2 — Pydantic v2 fundamentals**
- Learn: `BaseModel`, field types, `Field(description=..., ge=0)`, validators, `.model_validate()`, `.model_dump()`, `.model_json_schema()`, `ValidationError`.
- Do: define `Receipt(merchant: str, date: date, total: float, items: list[Item])`. Validate 10 hand-written dicts, 3 of them wrong. Print the JSON schema and read it — this schema is what you'll hand to the model.
- Tip: Pydantic is dataclasses with validation. You did the groundwork in Week 7. Everything in FastAPI (Stage 4) is Pydantic.

**Day 3 — Getting JSON from the model**
- Learn: structured output / JSON mode in your provider's API; passing a JSON schema; why free-text JSON extraction breaks (markdown fences, trailing commas, commentary).
- Do: extract `Receipt` from 10 messy receipt texts using the schema. Parse with `Receipt.model_validate_json`. Count successes. Then try *without* structured mode and count again.
- Tip: never regex JSON out of prose. Use the schema-enforced mode. When it's unavailable, validate and retry with the error message fed back to the model.

**Day 4 — Validate, retry, measure**
- Learn: the extract → validate → on failure retry with feedback loop; bounded retries; logging every attempt.
- Do: write `extract[T](text, model_class, max_retries=2) -> T | None`. Run it on 50 messy inputs (generate them: receipts, emails, short bios). Record success rate, average retries, cost.
- Tip: generic typed functions like this are reusable across every project. Keep a `llm_utils.py` and grow it for the rest of the roadmap.

**Day 5 — Review**
- Do: from memory: a Pydantic model with a validator, a structured-output call, and the retry loop. Then measure: does adding one few-shot example to the prompt raise the 50-input success rate? Record the number.
- Tip: every prompt change from now on gets a number attached. "It seems better" is not evidence.

**Day 6 — Build block: extraction pipeline (7 h)**
- Do: (1) 4 h: `extractor/` — reads a folder of unstructured text files, extracts a chosen schema from each with retries, writes results to Postgres (reuse Week 12 skills) and a CSV, logs failures with reasons, and prints a scorecard (success %, cost, p95 latency). (2) 2 h: tests with mocked LLM responses (mock at the SDK call boundary, like Week 8). (3) 1 h: README with the scorecard.
- Tip: mocking the LLM in tests is essential — real calls are slow, cost money, and are non-deterministic. Your tests must run offline.

**Day 7 — Rest.**

## Week 16 — Tool Calling and Single-Step Agents

**Day 1 — Tool calling concept**
- Learn: you describe tools (name, description, JSON schema of parameters); the model decides whether to call one and returns structured arguments; *your code* executes it; you send the result back; the model continues.
- Do: define one tool `get_weather(city)` (stub returning fake data). Send a question; inspect the raw response to see the tool-call block; execute it; send the result back; print the final answer.
- Tip: the model never runs code. It only *asks*. Everything dangerous happens in your executor — that's where validation and permissions live.

**Day 2 — Multiple tools and the loop**
- Learn: a tool registry (dict name → function + schema); the agent loop: call model → if tool call, execute and append result → repeat until a final text answer; max-iteration guard.
- Do: three tools — `get_weather`, `calculate(expression)` (use a safe evaluator, never `eval`), `lookup_contact(name)` reading your Postgres contacts. Build the loop. Ask compound questions ("what's the weather where Ahmed lives?").
- Tip: always cap iterations (e.g. 10). An uncapped loop with a confused model is a runaway bill.

**Day 3 — Tool schemas from Pydantic**
- Learn: generating tool parameter schemas from Pydantic models; good descriptions matter more than clever prompts; validating tool arguments before execution.
- Do: refactor tools so each has a Pydantic args model; generate schemas automatically; validate arguments and return a structured error to the model if invalid. Watch the model self-correct.
- Tip: tool descriptions are prompts. Write them as instructions to a smart intern: what it does, when to use it, what it returns.

**Day 4 — Evaluating tool choice**
- Learn: for agents, "did it pick the right tool with the right arguments?" is a measurable eval.
- Do: write 20 test questions with the expected tool (or "none"). Run the agent at temperature 0; log chosen tool and args; compute accuracy. Improve the worst tool description; re-run; record the delta.
- Tip: this is your first agent eval. The pattern — labelled expectations, automated run, a single number, iterate — is the same pattern for every eval you'll ever build.

**Day 5 — Review**
- Do: rebuild the tool loop from memory in 45 minutes. Add a `--verbose` flag that prints every model/tool exchange. CodeWars 6kyu ×2.
- Tip: verbose tracing of every step is the primitive version of what Langfuse does in Week 26. Build the habit now.

**Day 6 — Build block: database-aware assistant (7 h)**
- Do: (1) 4 h: an agent over your clinic Postgres DB with tools: `list_tables`, `describe_table`, `run_read_only_query(sql)` (enforce SELECT-only, add LIMIT, timeout), `book_appointment(...)` (validated, transactional — Week 11). Natural-language questions become answers with the SQL shown. (2) 2 h: 20-question eval set with expected answers; report accuracy. (3) 1 h: write a threat-model paragraph: what could go wrong if the query tool weren't read-only? (Preview of Week 27.)
- Tip: the read-only enforcement must be in *code* (parse/allow-list), not in the prompt. Prompts are suggestions; code is a boundary.

**Day 7 — Rest.**

## Week 17 — Embeddings and Retrieval

**Day 1 — What embeddings are**
- Learn: an embedding turns text into a vector so that similar meanings are close (high cosine similarity). Embedding models are separate from chat models. Dimensions (e.g. 1024–3072). They're the bridge between "search" and "meaning".
- Do: embed 10 sentences (some paraphrases, some unrelated) via the API. Compute all pairwise cosine similarities with your Week 13 code. Rank and eyeball — do paraphrases cluster?
- Tip: same model for indexing and querying, always. Mixing embedding models gives garbage similarities with no error.

**Day 2 — Chunking**
- Learn: documents are too long to embed whole; you split into chunks; strategies: fixed characters, by sentence/paragraph, with overlap; chunk size trades precision against context; store metadata (source, position) with every chunk.
- Do: pick a document set you care about (a textbook chapter, docs, policies — 50–200 pages). Write `chunk(text, size, overlap) -> list[Chunk]` with a `Chunk` dataclass (id, text, source, index). Produce chunks at 300, 600, 1200 characters; inspect samples of each.
- Tip: chunk on natural boundaries (paragraphs) where possible. Splitting mid-sentence hurts retrieval more than any embedding-model choice.

**Day 3 — Build the index**
- Learn: batching embedding calls; storing vectors as a numpy matrix plus a parallel list of chunks; persisting with `np.save` and JSON; embedding cost estimation.
- Do: embed all chunks (600-char version), persist the matrix and metadata, write `load_index()`. Record total cost and time.
- Tip: cache embeddings keyed by a hash of the chunk text. Re-embedding unchanged text on every run wastes money and time.

**Day 4 — Retrieval**
- Learn: query embedding → cosine against the matrix → top-k; returning chunks with scores; the `k` trade-off.
- Do: `retrieve(question, k=5) -> list[ScoredChunk]`. Try 10 questions; print the top-5 chunks and scores. Note where the right chunk ranks.
- Tip: print scores. A top-1 at 0.45 and a top-1 at 0.85 mean very different things. You'll use score thresholds in Week 27 to refuse when nothing relevant exists.

**Day 5 — Manual recall@5**
- Learn: recall@k = fraction of questions where a correct chunk appears in the top k. It's the core retrieval metric.
- Do: write 20 questions; for each, identify the correct chunk(s) by reading the source. Run retrieval; mark hits by hand. Compute recall@5 and recall@1. This is the seed of your golden set.
- Tip: label by hand today even though it's tedious. Evals built on labels you didn't verify are worthless.

**Day 6 — Build block: retrieval experiments (7 h)**
- Do: (1) 2 h: grow the golden set to 30 questions with labelled correct chunk IDs, stored as JSON. (2) 2 h: `eval_retrieval.py` that computes recall@1/@5 automatically from the golden set. (3) 3 h: run the eval across chunk sizes 300/600/1200 and overlap 0/100; tabulate results; pick the best and write a paragraph explaining why.
- Tip: you've just run your first controlled experiment on an AI system. One variable at a time, one number, a decision. That's the job.

**Day 7 — Rest.**

## Week 18 — RAG End-to-End and Evals

**Day 1 — Assemble RAG**
- Learn: the pipeline: question → retrieve top-k → build a prompt with the chunks as context (with source IDs) → generate → return answer plus citations.
- Do: `answer(question) -> Answer(text, sources)` using a Pydantic model. Instruct the model to cite chunk IDs and to say "not found in the documents" when the context doesn't contain the answer. Test on your 30 questions.
- Tip: "answer only from the provided context; if absent, say so" is the single most important line in a RAG prompt. Without it you've built a hallucination machine with extra steps.

**Day 2 — Golden set with answers**
- Learn: a golden set pairs questions with correct chunks *and* reference answers; evaluation compares generated answers to references.
- Do: add a reference answer to each of the 30 questions (hand-written from the source). Add 5 "unanswerable" questions where the correct behaviour is refusal.
- Tip: include unanswerable questions from day one. A system that never says "I don't know" will fail in production on exactly the questions that matter.

**Day 3 — Answer evaluation**
- Learn: exact match (rare), substring/keyword match (crude), LLM-as-judge (a second model call grading the answer against the reference on a rubric — correct/partial/wrong); judge prompts must be strict and structured.
- Do: implement `judge(question, reference, generated) -> Grade` with structured output. Run on all 35. Report answer accuracy, refusal accuracy on the 5 unanswerables, retrieval recall@5, cost, p95 latency — one scorecard.
- Tip: spot-check 10 judge verdicts by hand. If the judge disagrees with you more than once or twice, fix the judge prompt before trusting any number.

**Day 4 — Change one thing**
- Do: three experiments, each changing one variable: (a) k=3 vs k=5 vs k=8; (b) a stricter vs looser answer prompt; (c) a different chat model. Record the full scorecard for each. Keep the best configuration as your baseline.
- Tip: more context (higher k) isn't always better — irrelevant chunks distract the model. Let the number decide.

**Day 5 — Review and refactor**
- Do: refactor into a clean package: `rag/chunking.py`, `rag/index.py`, `rag/retrieve.py`, `rag/generate.py`, `rag/eval.py`, `rag/models.py`. Tests for chunking and retrieval with a tiny fixed corpus (no API calls — mock embeddings with fixed vectors).
- Tip: your RAG should be ~200–300 lines. If it's much more, you're over-engineering; if much less, you're missing error handling.

**Day 6 — Build block: RAG scorecard release (7 h)**
- Do: (1) 3 h: CLI with `ingest <folder>`, `ask "<question>"`, `eval`. (2) 2 h: `eval` prints a formatted scorecard and writes `eval_results/<timestamp>.json` so you can compare runs. (3) 1 h: README documenting the architecture (one diagram, drawn by hand and photographed is fine), the golden set, and the baseline numbers. (4) 1 h: write a short "what would break this?" section — long documents, tables, images, questions spanning multiple chunks.
- Tip: saving every eval run as a timestamped file is the difference between "I think it got better" and "recall went from 0.73 to 0.87 on run 14."

**Day 7 — Rest.**

## Week 19 — Improving Retrieval

**Day 1 — Keyword search (BM25)**
- Learn: embeddings miss exact terms (codes, names, numbers); BM25 is classic term-frequency ranking; it's complementary to vectors.
- Do: implement BM25 over your chunks with the `rank_bm25` library (or hand-roll a simple TF-IDF). Run the retrieval eval with BM25 only. Compare recall to vector-only.
- Tip: look at which questions BM25 wins. They're usually ones with specific identifiers. That tells you why hybrid search exists.

**Day 2 — Hybrid search**
- Learn: combine rankings — reciprocal rank fusion (RRF) is simple and robust: score = Σ 1/(60 + rank).
- Do: implement RRF over vector and BM25 results. Run the eval. Record recall@5 vs each alone.
- Tip: RRF needs no tuning and usually beats either method. Start there; only tune weights if the eval demands it.

**Day 3 — Reranking**
- Learn: retrieve broadly (top-20) then rerank with a cross-encoder or an LLM judging relevance of each chunk to the question; slower but more precise.
- Do: implement an LLM-based reranker (structured output: relevance 0–3 per chunk) over the top-20 hybrid results; return top-5. Run the eval. Record recall, latency, cost.
- Tip: reranking costs latency and money. The eval tells you whether it's worth it *for your data*. Sometimes it isn't — that's a valid finding.

**Day 4 — pgvector**
- Learn: storing vectors in Postgres with the `pgvector` extension; `vector(1024)` column; cosine distance operator `<=>`; an HNSW index; combining with `WHERE` metadata filters and full-text search (`tsvector`) in one query.
- Do: `CREATE EXTENSION vector`; migrate your chunks and embeddings into a `chunks` table; write `retrieve_pg(question, k, source=None)` using SQL; add a full-text column for hybrid search in SQL. Run the eval — numbers should match your numpy version.
- Tip: putting vectors in Postgres means one database, one backup, one set of permissions, real metadata filtering. For most products this beats a separate vector database.

**Day 5 — Query rewriting and review**
- Learn: rewriting the user's question before retrieval (expand abbreviations, generate 2–3 alternate phrasings, merge results) — helps with vague or terse questions.
- Do: implement multi-query rewriting; run the eval; record. Then review the whole week's results in one table and choose your production configuration with a written justification.
- Tip: not every technique will help on your corpus. Documenting "tried X, no gain, removed" is as valuable as a win — and it's what good engineers do.

**Day 6 — Build block: Stage 3 exit test (7 h)**
- Do: (1) 4 h timed, no frameworks: given a *new* document set (pick something unfamiliar — a public policy manual, a different domain's docs), build ingest → hybrid retrieval in pgvector → generation with citations → a 20-question golden set → eval harness reporting recall@5 and judged accuracy. (2) 1 h: compare your numbers to the Week 18 baseline; write down what was different about this corpus. (3) 1 h: retrospective. (4) 1 h: read the FastAPI tutorial's first three pages.
- Tip: if the exit test took much longer than 4 hours, the bottleneck was probably data preparation, not AI code. That's normal — and it's why data skills came before LLM skills in this plan.

**Day 7 — Rest.**

---
# STAGE 4 — Backend Engineering (Weeks 20–25)

**Setup:** new repo `rag-api/`. Install `fastapi`, `uvicorn`, `httpx`, `pytest`, `psycopg`, `python-dotenv`. **AI-assistance rule relaxes from here:** you may use AI to generate boilerplate and to draft tests — but you must read every line and be able to rewrite it. If you can't explain it, delete it and write it yourself.

## Week 20 — FastAPI Basics

**Day 1 — Hello, API**
- Learn: what FastAPI is (a Python web framework built on type hints and Pydantic); ASGI; `uvicorn` as the server; automatic docs at `/docs`.
- Do: `main.py` with `GET /health` returning `{"status": "ok"}`. Run with `uvicorn main:app --reload`. Open `/docs`. Hit it with `curl` and with `httpx` from Python.
- Tip: `--reload` for development only. Note how the docs are generated from your code — that's Pydantic and type hints paying off.

**Day 2 — Path and query parameters**
- Learn: `@app.get("/items/{item_id}")`, typed path params, query params with defaults, `Optional`, validation errors returning 422 automatically.
- Do: `GET /contacts/{id}`, `GET /contacts?q=&limit=` backed by an in-memory list. Send bad types and read the 422 body.
- Tip: FastAPI validates and documents parameters from the type hints alone. Write precise types and you get validation for free.

**Day 3 — Request bodies and response models**
- Learn: Pydantic models as request bodies; `response_model=`; `status_code=201`; `HTTPException`; separate `Create`, `Update`, `Read` models (never expose internal fields).
- Do: `POST /contacts` (201), `PUT /contacts/{id}`, `DELETE /contacts/{id}` (204). `ContactCreate`, `ContactRead`. 404 when missing. Test all from `/docs`.
- Tip: the response model is a contract. Changing it breaks clients. Design it deliberately; don't just return your database row.

**Day 4 — Dependency injection and structure**
- Learn: `Depends()` for shared logic (settings, DB connections, current user); `APIRouter` to split routes into files; settings via `pydantic-settings` reading `.env`.
- Do: restructure: `app/main.py`, `app/routers/contacts.py`, `app/schemas.py`, `app/config.py` (Settings), `app/deps.py`. Inject settings into a route.
- Tip: `Depends` is how FastAPI stays testable — in tests you override dependencies (e.g. swap the real DB for a test DB). Learn it now, use it everywhere.

**Day 5 — Review**
- Do: rebuild the CRUD API from memory in 45 minutes. Add pagination (`offset/limit`) with a response envelope `{items, total}`. Add a `X-Request-ID` header middleware that logs each request.
- Tip: middleware that logs method, path, status, and duration for every request is the first observability you'll ever add. Keep it in every service you build.

**Day 6 — Build block: Contact API v1 (7 h)**
- Do: (1) 3 h: full CRUD Contact API with routers, schemas, settings, pagination, search, consistent error responses (`{"detail": ...}`), request logging. (2) 2 h: `tests/` with `TestClient`: every endpoint, happy path and errors. (3) 1 h: `ruff`, `mypy`, `Makefile` targets. (4) 1 h: README with `curl` examples for every endpoint.
- Tip: write the tests before the README examples — then the README examples are copied from tests you know pass.

**Day 7 — Rest.**

## Week 21 — Async and Testing

**Day 1 — Async concepts**
- Learn: I/O-bound vs CPU-bound; `async def`, `await`; the event loop; concurrency ≠ parallelism; when async helps (waiting on network/DB) and when it doesn't (heavy computation); `asyncio.gather`.
- Do: script that fetches 10 URLs sequentially with `httpx.Client`, then concurrently with `httpx.AsyncClient` + `gather`. Time both. Then do a CPU-heavy loop in both — note no speedup.
- Tip: never call a blocking function (like `time.sleep` or a sync DB driver) inside `async def` — it freezes the whole server. Use `asyncio.sleep` and async drivers, or `run_in_threadpool`.

**Day 2 — Async FastAPI**
- Learn: `async def` routes; `httpx.AsyncClient` as a dependency; background tasks; streaming responses (`StreamingResponse`).
- Do: an endpoint that calls an external API three times sequentially, then a version with `gather`; measure. Add a `/stream` endpoint that yields lines with a delay; watch it in `curl -N`.
- Tip: streaming is how LLM apps show tokens as they arrive. You'll wire real LLM streaming into this in Week 24.

**Day 3 — Testing async and dependency overrides**
- Learn: `pytest-asyncio`; `httpx.AsyncClient` against the app; `app.dependency_overrides` to inject fakes.
- Do: async tests for the external-API endpoint with the HTTP client dependency overridden by a fake returning canned data. No real network in tests.
- Tip: dependency overrides replace mocking for most FastAPI tests. Cleaner, and it forces good structure.

**Day 4 — Configuration and secrets**
- Learn: `pydantic-settings` with environment-specific `.env` files; never commit secrets; `.env.example`; secret scanning; reading a secret at startup and failing fast if missing.
- Do: `Settings` with `DATABASE_URL`, `LLM_API_KEY`, `ENV=dev|test|prod`. Make startup fail with a clear message if a required key is absent. Add `.env.example`. Run `git log -p | grep -i key` to confirm you've never committed one.
- Tip: fail fast at startup, not on the first request an hour later. A missing secret should be the first line of the log, not a 500 at 3am.

**Day 5 — Review**
- Do: from memory: an async route with a concurrent fanout, a streaming endpoint, and an async test using a dependency override. Add proper error handling for the external call (timeout → 504, upstream 5xx → 502).
- Tip: map upstream failures to correct status codes. Returning 500 for "the other service was slow" misleads everyone debugging later.

**Day 6 — Build block: Contact API v2 (7 h)**
- Do: (1) 3 h: convert the API to async end-to-end; add an `/enrich/{id}` endpoint that concurrently calls two fake external services and merges results; add streaming export of all contacts as NDJSON. (2) 2 h: full async test suite with overrides; test the failure mappings. (3) 1 h: a simple load test with `hey` or `locust` — record requests/sec before and after async. (4) 1 h: log the results and read the psycopg async docs.
- Tip: load-test numbers in your README are a strong signal to employers that you think about performance empirically.

**Day 7 — Rest.**

## Week 22 — Database Integration and Auth

**Day 1 — Async Postgres in FastAPI**
- Learn: `psycopg` async, `psycopg_pool.AsyncConnectionPool`; opening the pool at startup (`lifespan`), closing at shutdown; a `get_db` dependency that yields a connection.
- Do: wire the Contact API to Postgres (schema from Week 10 with migrations). Replace the in-memory store. All CRUD through parameterized SQL.
- Tip: one pool per process, created in `lifespan`. Creating a connection per request is the #1 cause of "database has too many connections" in beginner deployments.

**Day 2 — Migrations with Alembic**
- Learn: Alembic setup, autogenerate (with SQLAlchemy models) or hand-written migrations, `upgrade head`, `downgrade`, migration hygiene.
- Do: initialize Alembic; convert your numbered SQL migrations into Alembic revisions; add a new column via a migration; run up and down.
- Tip: you may keep raw SQL inside Alembic revisions if you prefer it over SQLAlchemy models. The tool matters less than the discipline: schema changes are versioned and repeatable.

**Day 3 — Test database strategy**
- Learn: tests against a real Postgres (a throwaway test DB), truncating between tests or wrapping each test in a rolled-back transaction; fixtures for seed data.
- Do: `conftest.py` with a session-scoped test DB (create, migrate, drop) and a function-scoped transaction rollback. Convert all API tests to hit the real test DB.
- Tip: testing against real Postgres catches the constraint and type errors that mocks hide. It's slower; it's worth it.

**Day 4 — Authentication: API keys and JWT**
- Learn: authentication (who are you) vs authorization (what may you do); API keys for machine clients; passwords hashed with `bcrypt`/`argon2` (never stored plain); JWT: header/payload/signature, expiry, `Authorization: Bearer`; `OAuth2PasswordBearer` in FastAPI.
- Do: `POST /auth/register`, `POST /auth/token` returning a JWT; a `get_current_user` dependency; protect the contacts routes so users only see their own contacts (owner column + `WHERE owner_id = ...`).
- Tip: authorization bugs are data-leak bugs. Write a test where user A tries to read user B's contact and gets 404 — before you write anything else.

**Day 5 — CORS, rate limiting, review**
- Learn: what CORS is and why browsers need it; `CORSMiddleware` with an explicit allow-list; simple per-key rate limiting (in-memory token bucket now, Redis later).
- Do: add CORS for a fake frontend origin; add a rate limiter dependency (e.g. 60 req/min per API key) returning 429; tests for both.
- Tip: `allow_origins=["*"]` with credentials is a security hole and browsers reject it anyway. Explicit origins only.

**Day 6 — Build block: Contact API v3 (7 h)**
- Do: (1) 3 h: multi-user Contact API with Postgres, Alembic, JWT auth, ownership enforcement, rate limiting, CORS. (2) 2 h: tests covering auth flows, cross-user access denial, rate-limit 429, migrations up/down. (3) 1 h: seed script creating two users with data. (4) 1 h: README security section: how auth works, what's protected, known limitations.
- Tip: the "known limitations" section is a maturity signal. No JWT refresh? No email verification? Say so. Honesty about scope beats false completeness.

**Day 7 — Rest.**

## Week 23 — Docker

**Day 1 — Containers explained**
- Learn: an image is a frozen filesystem + command; a container is a running instance; why: "works on my machine" eliminated, identical dev/prod; images vs VMs; Docker Hub.
- Do: install Docker. `docker run hello-world`, `docker run -it python:3.12 bash`, explore inside, exit, `docker ps -a`, `docker rm`. Run `docker run -e POSTGRES_PASSWORD=x -p 5432:5432 postgres:16` and connect with `psql`.
- Tip: containers are ephemeral — anything written inside is gone when removed unless you use a volume. Learn that by losing data once, today, on purpose.

**Day 2 — Your first Dockerfile**
- Learn: `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `EXPOSE`, `CMD`; layer caching (copy requirements before code); `.dockerignore`.
- Do: Dockerfile for the Contact API. Build, run, hit `/health` from the host. Change a line of code, rebuild — observe which layers are cached.
- Tip: order Dockerfile lines from least to most frequently changing. `COPY requirements.txt` + `pip install` before `COPY . .` makes rebuilds take seconds instead of minutes.

**Day 3 — docker compose**
- Learn: multi-container apps; `compose.yaml` with `api` and `db` services; networks (services reach each other by name); volumes for Postgres data; `depends_on` and healthchecks; env files.
- Do: `compose.yaml` running API + Postgres + migrations on startup. `docker compose up`, `logs`, `down`, `down -v`. Confirm data persists across `down`/`up` but not `down -v`.
- Tip: inside compose, the DB host is `db` (the service name), not `localhost`. This confuses everyone once.

**Day 4 — Production images**
- Learn: multi-stage builds (build deps in one stage, copy only what's needed); non-root user; pinned base image; `uvicorn` with multiple workers or behind `gunicorn`; image size inspection.
- Do: multi-stage Dockerfile; run as non-root; compare image size before/after; healthcheck instruction. Run tests *inside* the container.
- Tip: running as root inside a container is a real security finding in audits. Add a user; it's four lines.

**Day 5 — Review**
- Do: from memory: Dockerfile, compose with DB and volume, healthcheck. Add a `Makefile` target `make up`, `make test-docker`, `make logs`. Delete all local images and rebuild from scratch to prove reproducibility.
- Tip: "delete everything and rebuild" is the container equivalent of Week 1's re-clone test. Do it before every stage exit from now on.

**Day 6 — Build block: containerized Contact API (7 h)**
- Do: (1) 3 h: production-grade Dockerfile + compose for API, Postgres, and a one-shot `migrate` service; environment separation (`compose.override.yaml` for dev with `--reload` and mounted source). (2) 2 h: run the full test suite inside a container via compose (`compose run api pytest`). (3) 1 h: document in README: one command to run, one to test. (4) 1 h: install `pgvector` in the compose Postgres (use the `pgvector/pgvector` image) in preparation for next week.
- Tip: a stranger should be able to `git clone && docker compose up` and have a working API in under two minutes. Test that claim on a clean machine or VM if you can.

**Day 7 — Rest.**

## Week 24 — RAG as a Service (Part 1)

**Day 1 — Design**
- Do: write the API spec for the RAG service: `POST /documents` (upload text/PDF, returns document id, ingestion runs in background), `GET /documents/{id}` (status: pending/ready/failed), `POST /query` (question → answer + citations + scores), `GET /health`. Pydantic models for all. Schema: `documents`, `chunks` (with `vector` and `tsvector` columns), `queries` (log every query and answer). Draw it.
- Tip: logging every query and answer to a table from day one gives you a dataset for evals and debugging. Products that skip this regret it.

**Day 2 — Ingestion pipeline**
- Do: port Week 17–19 chunking + embedding into `app/services/ingest.py`; `POST /documents` stores the document, enqueues a `BackgroundTask` that chunks, embeds (batched, cached), inserts into `chunks`, updates status; failures set `failed` with an error message.
- Tip: `BackgroundTasks` is fine for now; you'll note in Week 29 why a real queue (e.g. a worker process) is needed at scale. Know the limitation.

**Day 3 — Retrieval and query endpoint**
- Do: `app/services/retrieve.py` with hybrid search in SQL (pgvector + full-text, RRF); `app/services/generate.py` with the RAG prompt and citations; `POST /query` wires them, persists to `queries`, returns `QueryResponse(answer, citations: list[Citation], retrieval_scores)`.
- Tip: return the retrieval scores and chunk IDs in the response. Clients (and you) need them to debug "why did it say that?"

**Day 4 — Streaming answers**
- Do: `POST /query/stream` that streams the answer tokens as server-sent events while still persisting the final answer. Handle client disconnect.
- Tip: persist the final answer *after* streaming completes, in a `finally`, so a disconnect mid-stream doesn't lose the log.

**Day 5 — Tests**
- Do: tests with the LLM and embedding clients replaced via dependency overrides returning deterministic fakes; a test corpus of 5 tiny documents; assertions on retrieval order, citation presence, refusal on unanswerable questions, and document status transitions.
- Tip: the fake embedding can be a hash-based deterministic vector. It doesn't need to be meaningful — tests need determinism, not intelligence.

**Day 6 — Build block: integrate the eval harness (7 h)**
- Do: (1) 3 h: `scripts/eval.py` that ingests your golden corpus through the real API (compose stack), runs the golden questions through `/query`, and reports recall@5, judged accuracy, refusal accuracy, p95 latency, and cost — same scorecard as Week 18, now against the service. (2) 2 h: fix anything that regressed versus the standalone version (there will be something). (3) 2 h: README with architecture diagram, endpoints, and the scorecard.
- Tip: the eval regressing when you moved to a service is normal — usually a prompt or chunking detail changed silently. This is why the harness exists.

**Day 7 — Rest.**

## Week 25 — RAG as a Service (Part 2)

**Day 1 — Multi-tenancy**
- Do: documents and queries belong to a user (JWT from Week 22); every retrieval query filters by `owner_id`; cross-user test proving isolation.
- Tip: tenant isolation in the SQL `WHERE` clause, tested — never "the frontend won't ask for other people's documents."

**Day 2 — PDF and file handling**
- Learn: `UploadFile`, size limits, MIME checks, extracting text from PDFs with `pypdf`, handling scanned PDFs (no text) gracefully.
- Do: accept PDF and `.txt`/`.md` uploads; reject others with 415; cap size; extract text; mark scanned PDFs as `failed` with a clear reason.
- Tip: file uploads are an attack surface (huge files, wrong types, path tricks). Validate before you touch the bytes.

**Day 3 — Collections and metadata filters**
- Do: `collections` table (user-owned); documents belong to a collection; `/query` accepts `collection_id`; retrieval filters by it in SQL. Update tests.
- Tip: metadata filtering inside the vector query is exactly why pgvector in Postgres was the right call in Week 19.

**Day 4 — Operational endpoints**
- Do: `GET /health` checks DB connectivity and reports version; `GET /metrics` (simple counters: queries served, ingestion failures, average latency — real Prometheus format comes in Week 26 if you want it); admin `DELETE /documents/{id}` cascades chunks.
- Tip: a health endpoint that only returns `ok` without checking dependencies lies to your load balancer. Check the DB.

**Day 5 — Review and hardening**
- Do: run `ruff`, `mypy` strict, full tests in compose; fix every warning. Read your own code as a reviewer: naming, dead code, duplicated logic. Refactor for one hour.
- Tip: self-review with a checklist (naming, errors handled, tests present, secrets absent, logging present) before every stage exit. It's what code review will do to you at a job.

**Day 6 — Build block: Stage 4 exit test (7 h)**
- Do: (1) 4 h timed: implement an unseen feature — "per-collection sharing: a user can grant read access to another user; shared users can query but not upload or delete" — with migration, endpoints, ownership/permission logic, and tests. (2) 1 h: run the eval harness to confirm no regression. (3) 1 h: tag a release `v1.0.0`, write release notes. (4) 1 h: retrospective; create accounts on Langfuse and Sentry (free tiers).
- Tip: the feature is deliberately about authorization. If the tests for "shared user cannot delete" aren't there, you didn't pass.

**Day 7 — Rest.**

---
# STAGE 5 — Production Readiness (Weeks 26–29)

**Frame for this stage:** you don't discharge a patient without post-op monitoring. You don't ship an AI system without tracing, error tracking, guardrails, and automated evals. The brands (Langfuse, Sentry) are interchangeable; the concepts are permanent.

## Week 26 — Observability

**Day 1 — Structured logging**
- Learn: logs as JSON with consistent fields (timestamp, level, request_id, user_id, path, duration_ms); log levels used deliberately; correlation IDs across a request.
- Do: switch the API to JSON logging (`structlog` or stdlib with a JSON formatter). Propagate `request_id` from middleware into every log line, including inside services. Confirm with `docker compose logs | jq`.
- Tip: if you can't filter logs by request_id to see one request's entire story, your logging isn't done.

**Day 2 — Tracing LLM calls with Langfuse**
- Learn: what a trace is (a request) and a span is (a step: retrieve, generate, judge); recording prompts, completions, tokens, cost, latency per span; why prompts must be inspectable in production.
- Do: instrument `/query`: one trace per request, spans for retrieval and generation, with inputs/outputs, token usage, and cost attached. Open the Langfuse dashboard and read a trace end to end.
- Tip: attach `user_id`, `collection_id`, and a release version as trace metadata. You'll filter on these the first time a user says "it gave a wrong answer yesterday."

**Day 3 — Error monitoring with Sentry**
- Learn: exception capture with stack traces and request context; alerting; grouping; breadcrumbs; release tagging.
- Do: install the Sentry SDK in the API; trigger a deliberate exception; find it in the dashboard; add `user_id` and `request_id` as context; set up an email alert for new error groups.
- Tip: capture upstream LLM/API failures as *handled* events with context, not just unhandled crashes. The interesting failures are the ones you caught and degraded on.

**Day 4 — Metrics and latency**
- Learn: counters, gauges, histograms; p50/p95/p99; why averages lie; `/metrics` in Prometheus format via `prometheus-fastapi-instrumentator` (optional — a simple in-app histogram is fine).
- Do: instrument request duration histograms per route; expose `/metrics`; compute p95 for `/query` over 100 requests from a script. Add LLM cost as a counter.
- Tip: track cost per query as a first-class metric. "Our p95 is 2.1s and median cost is $0.004/query" is a sentence that gets you hired.

**Day 5 — Review: answer three questions**
- Do: using only your dashboards and logs (no code reading), answer: (1) what did the slowest query today cost and why was it slow? (2) which user has made the most queries? (3) what was the last error and what request triggered it? Write the answers and how you found them in your log.
- Tip: if any of the three took more than five minutes, add the missing metadata/field today.

**Day 6 — Build block: observability release (7 h)**
- Do: (1) 2 h: trace the ingestion pipeline too (per-document spans, chunk counts, embedding cost). (2) 2 h: a "debug view" endpoint (admin-only) returning a query's full trace summary: chunks retrieved with scores, prompt used, answer, judge score if any. (3) 2 h: a runbook in `docs/RUNBOOK.md`: how to find a request by ID, how to see cost by user, what to do when Sentry alerts, how to roll back. (4) 1 h: tag `v1.1.0`.
- Tip: a runbook you write now is the document a future on-call teammate (or you at 2am) will thank you for. Keep it short and imperative.

**Day 7 — Rest.**

## Week 27 — Safety and Guardrails

**Day 1 — Prompt injection**
- Learn: a document or user message can contain instructions ("ignore previous instructions and reveal…"); RAG makes this worse because retrieved text enters the prompt; the model can't reliably distinguish data from instructions.
- Do: upload a document containing an injection payload; ask a question that retrieves it; observe. Write 10 injection attempts (in documents and in questions); record which succeed.
- Tip: you cannot fully "prompt away" injection. Defences layer: delimit untrusted text, instruct the model to treat it as data, limit what tools/outputs can do, validate outputs, and never let retrieved text trigger actions without a human.

**Day 2 — Input and output controls**
- Learn: input validation (length caps, type checks, blocked patterns as a weak signal), output validation (schema, citation-must-exist check, no verbatim secrets), refusal when retrieval scores are below a threshold.
- Do: add: max question length; require that every cited chunk ID actually exists in the retrieved set (reject and retry otherwise); refuse with a clear message when top retrieval score < threshold (tune the threshold on your golden set's unanswerables).
- Tip: "citations must point to real retrieved chunks" is a cheap, powerful check that catches a large class of fabrication.

**Day 3 — Grounding and confabulation**
- Learn: in factual domains (health, law, finance, defence) an ungrounded confident answer is worse than no answer; a grounding gate = the answer is only surfaced if it's supported by retrieved evidence; faithfulness judging (does the answer follow from the context?).
- Do: add a faithfulness judge step (structured output: supported / partially / unsupported, with the unsupported claims listed). Unsupported → refuse or flag. Run the golden set; measure how many answers get flagged and whether they deserved it.
- Tip: this gate costs a second model call. Make it configurable per collection — mandatory for high-stakes domains, optional for casual ones. Product judgment, backed by numbers.

**Day 4 — PII, secrets, and abuse**
- Learn: detect and redact obvious PII in logs and traces (emails, phone numbers, IDs) before they reach third-party dashboards; never log raw API keys; abuse controls — per-user daily token budgets, cost caps, kill switch env var.
- Do: a redaction function applied to all log/trace payloads; per-user daily token budget enforced in `/query` (429 with a clear message); a `LLM_DISABLED=true` env flag that makes the service degrade gracefully.
- Tip: the kill switch is not paranoia. A runaway loop or a leaked key can burn a month's budget in an hour. One env var, tested, saves you.

**Day 5 — Adversarial review**
- Do: run all 10 injection attempts again plus 10 new ones (jailbreaks, prompt-leak requests, oversized inputs, malformed files, cross-tenant probes). Record pass/fail in `docs/SECURITY.md`. Fix failures. Re-run.
- Tip: keep the adversarial set as a test suite (`tests/test_adversarial.py`). Regressions in safety are as real as regressions in accuracy.

**Day 6 — Build block: safety release (7 h)**
- Do: (1) 3 h: adversarial test suite automated in pytest with the fake LLM plus a small "real model" subset run manually. (2) 2 h: threat model document: assets, actors, attack surfaces (upload, query, tools, logs), mitigations, residual risks. (3) 1 h: update the golden-set eval to include safety metrics (injection success rate, refusal correctness). (4) 1 h: tag `v1.2.0`.
- Tip: a written threat model, even one page, puts you ahead of most applicants. Security reviewers and hiring managers both read it.

**Day 7 — Rest.**

## Week 28 — Evals in CI

**Day 1 — GitHub Actions basics**
- Learn: workflows, jobs, steps, triggers (`push`, `pull_request`), runners, caching dependencies, secrets in Actions.
- Do: `.github/workflows/ci.yml` running `ruff`, `mypy`, and `pytest` on every push and PR. Make it green. Break a test on a branch and watch the PR check fail.
- Tip: the first workflow always takes several tries. Iterate on a branch; read the logs line by line.

**Day 2 — Services in CI**
- Learn: Actions service containers (Postgres with pgvector) so integration tests run in CI exactly like local compose.
- Do: add a Postgres service to the workflow; run migrations; run the full integration suite in CI. Cache pip/uv dependencies.
- Tip: CI should match local as closely as possible — same Postgres image tag, same env var names. Divergence is how "passes locally, fails in CI" is born.

**Day 3 — Evals as a gate**
- Learn: running the golden-set eval in CI on a schedule and on PRs touching prompts/retrieval; storing baseline numbers; failing when a metric drops below the baseline minus a tolerance.
- Do: `scripts/eval.py --ci` that loads `eval/baseline.json`, runs the golden set (with a small budget-capped real-model subset, and the fake model for the rest), and exits non-zero if recall@5 or accuracy falls more than 3 points. Add it as a job that runs on PRs labelled `eval` and nightly.
- Tip: use a dedicated CI API key with a hard spend cap. Real-model evals in CI are valuable and must not be able to bankrupt you.

**Day 4 — Model and prompt versioning**
- Learn: pin model IDs (don't use "latest" aliases in production); store prompts as versioned files or in Langfuse prompt management; record model+prompt version in every trace.
- Do: move prompts to `app/prompts/*.md` with a version header; include prompt and model versions in traces and in the eval results; write the changelog entry format for prompt changes.
- Tip: a model provider updating a "latest" alias has silently changed the behaviour of many production systems. Pin, and re-run evals when you upgrade.

**Day 5 — Review**
- Do: open a PR that deliberately worsens the RAG prompt. Confirm: CI runs, eval fails, PR is blocked. Revert. Open a PR that improves it; confirm the numbers rise and update the baseline via a documented process.
- Tip: the "documented process for updating the baseline" matters — otherwise someone (you) will just bump the baseline to make CI green.

**Day 6 — Build block: CI hardening (7 h)**
- Do: (1) 2 h: branch protection on `main` (require CI, require review — review your own PR honestly). (2) 2 h: build and push the Docker image in CI to GitHub Container Registry, tagged with the commit SHA. (3) 2 h: a status badge, a `CONTRIBUTING.md`, and a PR template with a checklist (tests, eval impact, security impact). (4) 1 h: tag `v1.3.0`.
- Tip: an image built in CI and tagged by SHA is what you'll deploy in Week 31. Never deploy something built on your laptop.

**Day 7 — Rest.**

## Week 29 — Reliability

**Day 1 — Retries, timeouts, backoff**
- Learn: transient vs permanent failures; exponential backoff with jitter; per-call timeouts; retry budgets; idempotency (safe to retry?).
- Do: wrap LLM and embedding calls with `tenacity` (or hand-rolled) — 3 attempts, exponential backoff with jitter, retry only on timeouts/429/5xx. Tests with a fake that fails twice then succeeds.
- Tip: retrying on a 400 (your request is malformed) is pointless and wastes budget. Retry classes of errors, not all errors.

**Day 2 — Fallbacks and circuit breakers**
- Learn: fallback to a second model/provider when the primary fails; circuit breaker (stop calling a failing dependency for a cooling period); degraded mode.
- Do: configure a secondary model; on primary failure after retries, fall back and tag the trace `fallback=true`; a simple circuit breaker that opens after N consecutive failures for 60s. Simulate an outage by pointing the primary at a dead URL.
- Tip: make degraded behaviour visible — a header or field saying `"degraded": true`. Silent degradation hides incidents.

**Day 3 — Caching**
- Learn: exact-match cache for identical queries (hash of question + collection + prompt version); semantic cache (embed the question, return a cached answer if similarity > threshold) — with the risk of wrong hits; cache invalidation on document changes.
- Do: exact-match cache in Postgres (or Redis if you want to add it) with TTL; measure hit rate on the golden set run twice; implement semantic cache behind a flag and measure false-hit rate against the golden set.
- Tip: semantic caching can return a confidently wrong cached answer for a subtly different question. Only enable it where the eval shows the false-hit rate is acceptable.

**Day 4 — Background jobs done properly**
- Learn: why `BackgroundTasks` doesn't survive restarts or scale; a job table + worker process pattern (or a queue like Redis/RQ); retries and dead-letter handling for failed ingestions.
- Do: move ingestion to a `jobs` table with status/attempts; a separate `worker.py` process (add to compose) that claims jobs with `SELECT ... FOR UPDATE SKIP LOCKED`, processes, retries up to 3, marks dead. Kill the worker mid-job and restart; confirm the job completes.
- Tip: `FOR UPDATE SKIP LOCKED` is the classic Postgres job-queue trick. It's interview-worthy and needs no extra infrastructure.

**Day 5 — Load and chaos**
- Do: load-test `/query` with `locust` at 10, 50, 100 concurrent users (with the fake model to avoid cost; then 5 users with the real model). Record p95, error rate, DB connection usage. Then: kill the DB for 10 seconds under load, restore, and confirm recovery without restart.
- Tip: find the point where it breaks and write down why (pool exhaustion? CPU? provider rate limits?). Knowing your system's limits is more valuable than pretending it has none.

**Day 6 — Build block: Stage 5 exit (7 h)**
- Do: (1) 3 h: write `docs/FAILURE_MODES.md` — for each dependency (Postgres, LLM provider, embedding provider, worker): what fails, how it's detected (which log/trace/metric/alert), how the system behaves (retry/fallback/degrade/refuse), how to recover. (2) 2 h: demonstrate three of them live: cause the failure, show the detection in dashboards, show the behaviour, recover — record it as a short screen video for your portfolio. (3) 1 h: tag `v2.0.0`. (4) 1 h: pick your deployment target for Stage 6 and read its quickstart.
- Tip: the exit test is the *explanation*, not the code. If you can walk a stranger through failure modes with dashboards open, you're production-ready.

**Day 7 — Rest.**

---
# STAGE 6 — Deployment and Capstone (Weeks 30–36)

**Decision to make on Day 1:** pick ONE deployment target. Option A: AWS (largest job market; steeper). Option B: a developer platform (Fly.io, Railway, Render) with managed Postgres (faster; learn AWS later if a job requires it). The plan below is written for either; the concepts are identical.

## Week 30 — Cloud Fundamentals

**Day 1 — Concepts and account setup**
- Learn: compute (a machine or container that runs your image), managed database (someone else runs Postgres), object storage (files), secrets manager, regions, environments (staging vs production), billing alerts.
- Do: create the account. **Set a billing alert first** ($10, $25). Create a staging environment/project. Read the pricing page and write down what your expected monthly cost is.
- Tip: billing alerts before anything else. Cloud bill surprises are the #1 beginner disaster and are entirely preventable.

**Day 2 — Managed Postgres**
- Do: provision a small managed Postgres with pgvector support (check the provider; on AWS RDS Postgres supports pgvector). Restrict network access to your app only. Run your migrations against it from your laptop via a secure connection. Store the connection string in the platform's secrets manager, not in a file.
- Tip: a database open to the internet with a weak password gets found by scanners within hours. Private networking or IP allow-lists, always.

**Day 3 — Deploy the container**
- Do: deploy the image built in Week 28 (from your registry) to staging. Set env vars/secrets. Confirm `/health` reports DB connectivity. Deploy the worker as a second service. Check logs in the platform's console.
- Tip: deploy the *same* image SHA that CI built. If you rebuild locally to deploy, you've broken the chain of custody.

**Day 4 — Domain, TLS, and networking**
- Learn: DNS records (A/CNAME), TLS certificates (usually automatic on platforms; ACM/ALB on AWS), HTTPS-only, health-check-based routing.
- Do: attach a domain or subdomain (a cheap one is fine); confirm HTTPS works and HTTP redirects; set CORS to the real frontend origin you'll use.
- Tip: even if you have no frontend yet, having a real HTTPS URL for your API is what makes the portfolio "real" to a hiring manager.

**Day 5 — Observability in the cloud**
- Do: confirm Langfuse and Sentry receive events from staging with `environment=staging` tags; set up the platform's uptime check on `/health`; set an alert if it fails twice.
- Tip: an uptime check that pages you (email is fine) is the minimum. Learning your site is down from a user is a rite of passage you can skip.

**Day 6 — Build block: staging + production (7 h)**
- Do: (1) 2 h: create the production environment as a copy of staging with its own DB and secrets. (2) 2 h: run the eval harness against staging over the network; record the scorecard — this is now your production baseline. (3) 1 h: cost review: what does the stack cost per month at zero traffic? at 1,000 queries/day? Write it down. (4) 2 h: `docs/DEPLOYMENT.md`: how to deploy, roll back, rotate a secret, restore the DB from a backup — and test the backup restore.
- Tip: an untested backup is not a backup. Restore it into a scratch DB once, today.

**Day 7 — Rest.**

## Week 31 — CI/CD

**Day 1 — Deploy from CI**
- Do: extend the workflow: on merge to `main`, build → test → push image → deploy to staging automatically. Platform CLI/API credentials stored as Actions secrets.
- Tip: staging gets every merge. Production gets deliberate promotions. Never auto-deploy `main` straight to production this early.

**Day 2 — Promote to production**
- Do: a manually-triggered workflow (`workflow_dispatch`) that promotes a specific image SHA from staging to production, runs the migration, runs a smoke test (`/health` + one `/query`), and posts the result.
- Tip: promote *the same SHA* that ran in staging. The whole point of staging is that what you tested is what you ship.

**Day 3 — Rollback**
- Do: a rollback workflow that redeploys the previous SHA. Practise: deploy a deliberately broken version to staging, detect it via the smoke test, roll back. Time it.
- Tip: rollback should take under five minutes and require no thinking. Write it as a runbook step with the exact command.

**Day 4 — Preview environments and migrations safety**
- Learn: per-PR preview deploys (many platforms support this); safe migration patterns (add column → backfill → switch code → drop later; never rename in one step).
- Do: enable preview deploys if available; write and apply one "expand/contract" migration on staging with zero downtime.
- Tip: destructive migrations (drop/rename) are how production data disappears. Expand first, contract in a later release.

**Day 5 — Review**
- Do: end-to-end: open a PR with a small feature → CI green → preview (or staging) deploy → merge → staging auto-deploy → promote to production → smoke test → verify in Langfuse/Sentry with `environment=production`. Document the flow with screenshots in `docs/`.
- Tip: this end-to-end flow is a portfolio artifact in itself. Record a 3-minute screen walkthrough.

**Day 6 — Build block: capstone kickoff (7 h)**
- Do: (1) 3 h: choose the capstone domain and write a one-page product brief: the user, the painful task, why RAG/agents help, what "done" means, what you'll measure. Suggested directions: a document Q&A assistant for a specific profession; an automation agent for a repetitive workflow (e.g. triaging support emails into a tracker); a research literature assistant with verified citations. (2) 2 h: find one real prospective user and get a 15-minute conversation booked for Week 35. (3) 2 h: write the golden set *first* — 30 questions/tasks that the product must handle, with expected outcomes.
- Tip: the golden set before the product forces you to define success. It's the AI equivalent of writing the test before the code — you learned that in Week 8.

**Day 7 — Rest.**

## Week 32 — Capstone: Scope and Design

**Day 1 — Architecture**
- Do: system diagram: frontend (minimal — Streamlit/Gradio or a plain HTML page is acceptable), API, worker, Postgres+pgvector, LLM provider, tracing/errors, payment provider (test mode). Data model with ownership and billing fields. List every external dependency and its failure mode (you have a template from Week 29).
- Tip: reuse `rag-api` as the base. The capstone is your existing service plus product features, not a rewrite.

**Day 2 — Auth and billing design**
- Learn: subscription basics; Stripe (test mode) checkout + webhooks; plan limits enforced server-side; never trust the client for plan status.
- Do: schema for `subscriptions`, `usage`; decide plan limits (e.g. free: 20 queries/day, 5 documents); write the webhook handler spec.
- Tip: enforce limits from the database on every request. A "Pro" flag in the browser is decoration, not authorization.

**Day 3 — Frontend minimum**
- Do: choose Streamlit/Gradio (fastest) or a small HTML+JS page that calls your API. Sketch three screens: login, upload/manage documents, ask/answer with citations. No design polish — clarity only.
- Tip: you're an AI engineer, not a frontend engineer. Spend the minimum here; spend the surplus on evals and reliability, which is what you're being hired for.

**Day 4 — Evals plan**
- Do: define the capstone scorecard: task success rate on the golden set, refusal correctness, p95 latency, cost per task, safety suite pass rate. Set target numbers. Put the eval in CI as the release gate.
- Tip: publish the targets in the README now, before the build. Hitting stated targets is far more credible than post-hoc numbers.

**Day 5 — Milestone plan**
- Do: break the build into Week 33–35 daily tickets (GitHub Issues), each small enough for one session. Order by risk: the riskiest integration (billing webhooks, a new tool, a tricky document type) goes first.
- Tip: riskiest-first means you discover the blocker on Week 33 Day 1, not Week 35 Day 5.

**Day 6 — Build block: foundation (7 h)**
- Do: fork/clone `rag-api` into `capstone/`; apply the new schema; wire Stripe test-mode checkout and webhook (verify signatures); plan-limit enforcement dependency; deploy skeleton to staging; CI green.
- Tip: verify webhook signatures. An unverified webhook endpoint lets anyone grant themselves a paid plan.

**Day 7 — Rest.**

## Week 33 — Capstone: Core Build

**Day 1 — Domain-specific ingestion**
- Do: handle the document types your user actually has (PDF reports, spreadsheets via pandas, emails, web pages via a fetcher). Chunking tuned per type. Ingestion tests with real samples.
- Tip: real documents will break your chunker in ways the textbook never did. Budget time for it.

**Day 2 — Core task flow**
- Do: implement the primary user task end-to-end (ask with citations, or run the automation agent with tools). Trace every step. Persist results.
- Tip: get the ugly version working end-to-end first, then improve. A thin slice through the whole stack beats a polished half.

**Day 3 — Agent/tool layer (if applicable)**
- Do: tools with Pydantic schemas, code-enforced permissions (read vs write), iteration caps, and human confirmation for any write action. Tool-choice eval from Week 16 adapted to the domain.
- Tip: any tool that changes the world (sends an email, writes a record) requires an explicit user confirmation step in the first version. Autonomy is earned by eval results, not assumed.

**Day 4 — Frontend wiring**
- Do: the three screens connected to the API; streaming answers displayed progressively; citations clickable to show the source chunk.
- Tip: showing the source chunk on click is the feature that makes users trust the answer. It's also your best debugging tool.

**Day 5 — Eval run**
- Do: run the capstone scorecard against staging. Compare with targets. List the top 5 failures with root causes (retrieval miss? bad chunking? prompt? judge disagreement?).
- Tip: root-cause by category before fixing anything. Five failures with one shared cause is one fix.

**Day 6 — Build block: iterate on evals (7 h)**
- Do: fix the top causes one at a time, re-running the eval after each. Log each experiment: what changed, before/after numbers, kept or reverted. Stop when you hit targets or run out of time; record where you landed.
- Tip: this day is the job. Hypothesis → change → measure → decide, six times in a row. Notice how it feels.

**Day 7 — Rest.**

## Week 34 — Capstone: Production Hardening

**Day 1 — Safety pass**
- Do: run the adversarial suite against the capstone (injection via uploaded docs, cross-tenant probes, tool abuse attempts, plan-limit bypass attempts). Fix. Add domain-specific cases.
- Tip: a paying-plan bypass is a business bug and a security bug. Test it explicitly.

**Day 2 — Reliability pass**
- Do: confirm retries, fallbacks, circuit breaker, kill switch, and job-queue retries all work in the capstone. Load test at your expected peak ×3.
- Tip: ×3 headroom is a reasonable rule for a small product. Know the number where it breaks.

**Day 3 — Observability pass**
- Do: dashboards (Langfuse + Sentry + platform metrics) with: queries/day, cost/day, p95, error rate, ingestion failures, per-user usage. Alerts: error spike, cost spike, health failure.
- Tip: a daily cost alert at 2× your normal spend catches both bugs and abuse.

**Day 4 — Data and privacy**
- Do: user data deletion endpoint (account + documents + chunks + traces where possible); a privacy note in the app; retention policy for query logs; backup schedule verified.
- Tip: "delete my data" is a legal requirement in many jurisdictions and a trust requirement everywhere. Build it before you have users.

**Day 5 — Docs and onboarding**
- Do: README (product, architecture, scorecard, how to run), `docs/` (runbook, deployment, failure modes, security, threat model), a 2-minute onboarding guide for your first user.
- Tip: write the onboarding guide as if the user is busy and sceptical. Because they are.

**Day 6 — Build block: production launch (7 h)**
- Do: promote to production via the Week 31 workflow; smoke test; verify dashboards show `production`; run the eval once against production with a budget cap; create the first-user account; send the invite.
- Tip: launching to one user is a launch. Treat it with the same care as launching to a thousand — the habits transfer.

**Day 7 — Rest.**

## Week 35 — Capstone: Real User

**Day 1 — Onboard the user**
- Do: the 15-minute session (screen-share or in person). Watch them use it. Do not help unless they're stuck for 60 seconds. Take notes on every hesitation and error.
- Tip: what they *do* matters more than what they *say*. Note the moments they frown.

**Day 2 — Triage feedback**
- Do: convert observations into issues, tagged bug / usability / missing feature / eval-gap. Add any real questions they asked to the golden set (with correct answers).
- Tip: real user questions are the most valuable eval data you'll ever get. They're nothing like the questions you wrote.

**Day 3 — Fix the top three**
- Do: fix the three highest-impact issues; re-run evals; deploy to staging → production.
- Tip: ship fixes within 48 hours of feedback. Responsiveness is what turns a test user into an advocate.

**Day 4 — Measure real usage**
- Do: from dashboards: queries by the user, cost, latency, any refusals — were the refusals correct? Any errors? Write a one-page "week one in production" report.
- Tip: compare production numbers to your eval numbers. Divergence tells you your golden set isn't representative yet.

**Day 5 — Second round**
- Do: a second short session or async feedback; fix; deploy. Update the scorecard and README with production-observed numbers.
- Tip: two feedback loops in one week is what "iterating with users" means. Most side projects never do one.

**Day 6 — Build block: harden and freeze (7 h)**
- Do: (1) 3 h: final eval and safety runs; fix stragglers. (2) 2 h: clean the repo — remove dead code, update docs, tag `v1.0.0` of the capstone with release notes. (3) 2 h: write the outline of your blog post: problem, architecture, eval methodology, results, what failed, what's next.
- Tip: "what failed" is the section hiring managers read most carefully. Be specific and unembarrassed.

**Day 7 — Rest.**

## Week 36 — Portfolio and Job Readiness

**Day 1 — The blog post**
- Do: write the full post (1,500–2,500 words) with the architecture diagram, scorecard table, and one trace screenshot. Publish it (personal site, dev.to, Medium). Link it from the repo.
- Tip: numbers and diagrams over adjectives. "Recall@5 went from 0.71 to 0.89 by switching to hybrid search" is the sentence that gets shared.

**Day 2 — Repos and profile**
- Do: audit every public repo: README quality, CI badge, license, no secrets in history (`gitleaks`), pinned dependencies. Archive or hide junk. Update your GitHub profile README with three pinned projects and a one-line positioning statement.
- Tip: hiring managers look at 2–3 repos for 90 seconds each. The README is the interview before the interview.

**Day 3 — Interview prep: system questions**
- Do: write and rehearse answers (out loud, timed to 3 minutes each): How would you evaluate a RAG system? How do you prevent prompt injection? How do you reduce LLM cost and latency? Walk me through your system's failure modes. When would you fine-tune vs prompt vs RAG? How do you version prompts and models?
- Tip: every answer should cite a number from your own project. "In my capstone, reranking added 400ms p95 and 3 points of recall, so I made it per-collection configurable" is unbeatable.

**Day 4 — Interview prep: coding and SQL**
- Do: 3 timed problems: a CodeWars 6kyu, a SQL join/aggregate question, and "design a schema for X" on a whiteboard. Then a 30-minute mock: explain your capstone architecture to a friend and answer their questions.
- Tip: practise saying "I don't know, but here's how I'd find out." It's the most credible sentence in an interview.

**Day 5 — Demo and positioning**
- Do: record a 10-minute demo of the capstone from memory: problem → live use → architecture → evals → observability → one failure mode handled live. Write your positioning: "AI engineer who ships evaluated, monitored LLM systems — [domain] focus." Draft a CV that leads with the capstone and its numbers.
- Tip: lead with outcomes and numbers on the CV. Tools list goes last.

**Day 6 — Build block: launch the search (7 h)**
- Do: (1) 2 h: identify 20 target companies/teams (AI product teams, health-tech, automation, research tools — those that value domain + engineering). (2) 2 h: write one tailored outreach message template and send 5. (3) 1 h: apply to 3 roles. (4) 1 h: set up a 2-hours/week maintenance cadence for the capstone (dependency updates, eval re-runs, user check-ins). (5) 1 h: choose your specialization track (health/science, automation, defence/security, ML depth) and write its first 4-week plan using the same daily format.
- Tip: the roadmap ends; the practice doesn't. Two hours a week keeping a real system healthy and evaluated is worth more than starting three new tutorials.

**Day 7 — Rest. You've built and shipped a production AI system in 36 weeks.**

---

# APPENDIX A — Universal Tips and Tricks

**Debugging protocol (use every time something breaks)**
1. Read the full error, bottom line first (the type), then the top of the traceback (your code, not the library's).
2. Reproduce it in the smallest possible script.
3. Print or log the inputs right before the failure.
4. Change one thing. Re-run.
5. Only after 20 minutes stuck: search the exact error message; then ask an AI with the minimal reproduction and what you've tried.

**Asking for help (AI or human) — the format that gets answers**
What I'm trying to do · what I did · what I expected · what happened (exact error) · what I've already tried.

**Weekly review checklist (Day 5, every week)**
- Every commit has a meaningful message
- `pytest`, `ruff`, `mypy` clean
- Learning log has entries for every day
- At least one thing I can now do from memory that I couldn't last week
- One thing I'm still confused about, written down for Day 6

**Spaced retrieval**
Every Day 5, re-implement one thing from *two* stages ago from memory (e.g. in Week 20, rebuild cosine top-k; in Week 28, rebuild a tool-calling loop). Fifteen minutes. This is what keeps early skills alive.

**Time-boxing**
If a Day 1–4 task takes more than the hour, stop, log where you are, and continue on Day 5 or Day 6. Never let one day's overrun eat the week. Repeating a week is fine; skipping days is not.

**Cost guardrails for the whole roadmap**
- Provider spend caps set on Week 14 Day 1 ($10–20/month is sufficient through Stage 5)
- Dedicated CI key with its own cap
- Cloud billing alerts before the first deploy
- Expected total spend for 36 weeks: under $150 including a small cloud footprint

# APPENDIX B — Stage Exit Tests (summary)

| Stage | Exit test | Pass criterion |
|---|---|---|
| 0 | Clone → branch → PR → curl | Under 20 min, no notes |
| 1 | Unseen spec → typed, modular, tested solution | Under 2 h, no AI |
| 2 | Schema + load + 3-table join + explain plan | Plan explained aloud correctly |
| 3 | New corpus → hybrid RAG + golden set + eval | Weekend, no frameworks, numbers reported |
| 4 | Unseen authorization feature + migration + tests | Weekend, cross-user denial tested |
| 5 | Failure-modes document + live demonstration | Three failures caused, detected, recovered |
| 6 | Live URL + repo + blog post + 10-min demo | Delivered from memory |

# APPENDIX C — Hype vs Essential (2026), one line each

- **Essential:** Python depth, SQL/Postgres, Git, HTTP, Docker, evals and golden sets, retrieval quality, structured outputs, tool calling, tracing, error monitoring, testing, CI/CD, one cloud.
- **Learn late or shallowly:** orchestration frameworks, multi-agent frameworks, fine-tuning, Kubernetes, a second cloud, vector-DB brand tours, "prompt engineering" as a job title.
- **The rule:** depth over breadth. One system you can defend with numbers beats twelve tools you can name.
