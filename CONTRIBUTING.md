# Contributing to SSI Protocol

**Thank you for your interest in contributing to SSI Protocol!**

SSI is a **constitutional standard**, which means different types of contributions follow different processes:

---

## Types of Contributions

### 1. Implementation Improvements (Reference Code)

**What:** Bug fixes, performance improvements, SDK development  
**Where:** `reference/kernel`, `reference/gateway`, `sdks/`  
**Process:** Standard GitHub PR

**Steps:**
1. Fork the repository
2. Create a feature branch (`git checkout -b fix/issue-description`)
3. Make your changes
4. Run tests: `npm test` (or language-specific test command)
5. Submit PR with description of changes
6. Respond to code review feedback

**Requirements:**
- Tests pass
- Code style matches existing patterns
- Documentation updated (if public APIs change)
- Constitutional impact declared (`BREAKING`, `FEATURE`, or `FIX`)

---

### 2. Documentation & Tooling

**What:** Guides, examples, tutorials, compliance tooling, CLI utilities  
**Where:** `docs/`, `tools/`, supporting markdown files  
**Process:** Discussion + PR

**Steps:**
1. Open GitHub Discussion explaining the addition
2. Wait for maintainer feedback (~3-5 days)
3. Submit PR with implementation
4. Respond to review

**Non-normative docs** (USE_CASES.md, IMPLEMENTATION.md, etc.) can be updated via PR without RFC.

---

### 3. Constitutional Changes (RFC Required)

**What:** Changes to SPEC.md, DECISIONS.md, AUDIT.md, FAILURE.md, COMPLIANCE.md  
**Process:** RFC (Request for Comments)

**⚠️ Constitutional changes require multi-stakeholder consensus ⚠️**

**Steps:**
1. Open GitHub Discussion with `[RFC]` prefix
2. Describe:
   - **Problem:** What constitutional gap exists?
   - **Proposal:** What change do you propose?
   - **Impact:** What breaks? What transitions are needed?
   - **Rationale:** Why is this necessary?
3. **30-day review period** (minimum)
4. Multi-stakeholder feedback (regulators, implementers, auditors)
5. Maintainer decision (approved/rejected/deferred)
6. If approved: Implementation PR + transition timeline

**Examples of RFC-required changes:**
- New decision types in DECISIONS.md
- RPX record format changes in SPEC.md
- Compliance level criteria updates in COMPLIANCE.md
- Fail-closed semantics modifications in FAILURE.md

**Examples of non-RFC changes:**
- Typo fixes in constitutional docs (PR directly)
- Clarifications that don't change semantics (Discussion + PR)
- Implementation examples in docs/ (PR directly)

---

## Backward Compatibility

**Invariant Rule:** Constitutional guarantees cannot be weakened.

**Major Version Transitions (2.0, 3.0):**
- Require 12-24 months notice
- Backward compatibility maintained during transition
- Breaking changes must have clear migration path

**Minor Version Updates (1.1, 1.2):**
- Additive only (new features, tooling, docs)
- No breaking changes to constitutional guarantees

**Patch Updates (1.0.1, 1.0.2):**
- Bug fixes, typos, clarifications
- No semantic changes

---

## Code of Conduct

SSI Protocol follows standard open source etiquette:

**Expected:**
- Professional, respectful communication
- Technical merit-based discussions
- Constructive feedback
- Focus on constitutional guarantees, not implementation preferences

**Not Acceptable:**
- Personal attacks or harassment
- Off-topic discussions in technical threads
- Demanding features without RFC process
- Circumventing governance (e.g., bypassing 30-day review)

**Enforcement:** Maintainers may lock threads, hide comments, or block users who violate these guidelines.

---

## PR Guidelines

**Before submitting:**
- [ ] Tests pass (`npm test` or equivalent)
- [ ] Code follows existing style
- [ ] Documentation updated (if APIs changed)
- [ ] Constitutional impact declared:
  - `BREAKING`: Requires RFC
  - `FEATURE`: New capability (minor version)
  - `FIX`: Bug fix (patch version)
  - `DOCS`: Documentation only
  - `CHORE`: Tooling/build/refactor (no user impact)

**Commit Message Format:**
```
type(scope): brief description

- Detailed explanation (if needed)
- Links to relevant issues/discussions
- Constitutional impact: NONE | FIX | FEATURE | BREAKING
```

**Example:**
```
feat(kernel): Add policy caching for high-throughput scenarios

- Implements LRU cache for policy evaluation
- Reduces latency by ~40% for repeated decisions
- No constitutional impact (internal optimization)

Constitutional impact: NONE
Closes #123
```

---

## Testing

**Unit Tests:**
- Run locally: `npm test`
- Must pass before PR approval

**Conformance Tests:**
- Located in `tests/conformance/`
- Verify constitutional guarantees
- Run automatically in CI

**Integration Tests:**
- Test Gateway + Kernel interaction
- Verify hash chain integrity
- Run in CI on PR submission

**If you're unsure how to test your change, ask in GitHub Discussions.**

---

## Development Setup

**Prerequisites:**
- Node.js 18+ (for JavaScript implementations)
- PostgreSQL 14+ (for Gateway)
- Git

**Setup:**
```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/ssi-protocol-oss.git
cd ssi-protocol-oss

# Install dependencies
npm install

# Run tests
npm test

# Start reference implementations (see IMPLEMENTATION.md)
cd reference/gateway && npm start
cd reference/kernel && npm start
```

---

## Release Process

**Maintainers handle releases.** Contributors do not need to worry about versioning.

**Process:**
1. Maintainer tags release (`v1.1.0`)
2. CI builds and tests
3. GitHub Release created with changelog
4. npm packages published (SDKs)
5. Announcement in Discussions

---

## Questions?

**Implementation questions:** [GitHub Issues](https://github.com/YOUR_ORG/ssi-protocol-oss/issues)  
**RFC proposals:** [GitHub Discussions](https://github.com/YOUR_ORG/ssi-protocol-oss/discussions)  
**Security:** See [SECURITY.md](SECURITY.md)

---

**SSI Protocol is a community-driven constitutional standard.**  
**Your contributions help make AI governance transparent, auditable, and independently verifiable.**
