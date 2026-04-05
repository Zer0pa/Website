#!/usr/bin/env node
/**
 * M1: Lawset Expression Evaluator
 * Reads a lawset JSON, resolves derived expressions to numbers,
 * evaluates constraints, and returns structured results.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Expression functions ──────────────────────────────────────────
const FUNCTIONS = {
  col_width: (shell, cols, gutter) => (shell - (cols - 1) * gutter) / cols,
  ratio: (part, whole) => part / whole,
  aspect_ratio: (w, h) => w / h,
  modular_scale: (base, step, ratio) => base * Math.pow(ratio, step),
  round: (value, decimals) => {
    const f = Math.pow(10, decimals);
    return Math.round(value * f) / f;
  },
  contrast_ratio: (fg, bg) => {
    // WCAG relative luminance contrast ratio for hex colors
    const hexToRgb = (hex) => {
      const h = hex.replace('#', '');
      return [
        parseInt(h.substring(0, 2), 16) / 255,
        parseInt(h.substring(2, 4), 16) / 255,
        parseInt(h.substring(4, 6), 16) / 255,
      ];
    };
    const linearize = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const luminance = (rgb) =>
      0.2126 * linearize(rgb[0]) + 0.7152 * linearize(rgb[1]) + 0.0722 * linearize(rgb[2]);

    const l1 = luminance(hexToRgb(fg));
    const l2 = luminance(hexToRgb(bg));
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },
};

// ── Expression parser ─────────────────────────────────────────────

/**
 * Tokenize an expression string into numbers, identifiers, operators, parens, commas.
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) { i++; continue; }
    // Number literal (including decimals)
    if (/[0-9]/.test(expr[i]) || (expr[i] === '.' && i + 1 < expr.length && /[0-9]/.test(expr[i + 1]))) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) { num += expr[i++]; }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }
    // Identifier (variable or function name)
    if (/[a-zA-Z_]/.test(expr[i])) {
      let id = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) { id += expr[i++]; }
      tokens.push({ type: 'identifier', value: id });
      continue;
    }
    // Operators and punctuation
    if ('+-*/(),%'.includes(expr[i])) {
      tokens.push({ type: 'operator', value: expr[i++] });
      continue;
    }
    throw new Error(`Unexpected character '${expr[i]}' in expression: ${expr}`);
  }
  return tokens;
}

/**
 * Recursive descent parser for expressions.
 * Grammar:
 *   expr     → term (('+' | '-') term)*
 *   term     → unary (('*' | '/' | '%') unary)*
 *   unary    → '-' unary | primary
 *   primary  → NUMBER | IDENT '(' args ')' | IDENT | '(' expr ')'
 *   args     → expr (',' expr)*
 */
function parseExpression(tokens, scope) {
  let pos = 0;

  function peek() { return pos < tokens.length ? tokens[pos] : null; }
  function consume() { return tokens[pos++]; }

  function parseExpr() {
    let left = parseTerm();
    while (peek() && peek().type === 'operator' && (peek().value === '+' || peek().value === '-')) {
      const op = consume().value;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseUnary();
    while (peek() && peek().type === 'operator' && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
      const op = consume().value;
      const right = parseUnary();
      if (op === '*') left = left * right;
      else if (op === '/') left = left / right;
      else left = left % right;
    }
    return left;
  }

  function parseUnary() {
    if (peek() && peek().type === 'operator' && peek().value === '-') {
      consume();
      return -parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) throw new Error('Unexpected end of expression');

    // Number literal
    if (tok.type === 'number') {
      consume();
      return tok.value;
    }

    // Parenthesized expression
    if (tok.type === 'operator' && tok.value === '(') {
      consume(); // '('
      const val = parseExpr();
      if (!peek() || peek().value !== ')') throw new Error('Missing closing parenthesis');
      consume(); // ')'
      return val;
    }

    // Identifier — either function call or variable
    if (tok.type === 'identifier') {
      consume();
      // Check if it's a function call
      if (peek() && peek().type === 'operator' && peek().value === '(') {
        consume(); // '('
        const args = [];
        if (!(peek() && peek().type === 'operator' && peek().value === ')')) {
          args.push(parseExpr());
          while (peek() && peek().type === 'operator' && peek().value === ',') {
            consume(); // ','
            args.push(parseExpr());
          }
        }
        if (!peek() || peek().value !== ')') throw new Error(`Missing closing parenthesis for function ${tok.value}`);
        consume(); // ')'

        const fn = FUNCTIONS[tok.value];
        if (!fn) throw new Error(`Unknown function: ${tok.value}`);
        return fn(...args);
      }

      // Variable lookup
      if (tok.value in scope) {
        return scope[tok.value];
      }
      throw new Error(`Unknown variable: ${tok.value}`);
    }

    throw new Error(`Unexpected token: ${JSON.stringify(tok)}`);
  }

  const result = parseExpr();
  if (pos < tokens.length) {
    throw new Error(`Unexpected tokens remaining after parse: ${tokens.slice(pos).map(t => t.value).join(' ')}`);
  }
  return result;
}

function evaluateExpression(expr, scope) {
  const tokens = tokenize(String(expr));
  return parseExpression(tokens, scope);
}

// ── Constraint evaluation ─────────────────────────────────────────

function resolveValue(ref, scope) {
  if (typeof ref === 'number') return ref;
  if (typeof ref === 'string') {
    // If it's a simple variable name in scope, return it
    if (ref in scope) return scope[ref];
    // Otherwise evaluate as expression
    return evaluateExpression(ref, scope);
  }
  if (Array.isArray(ref)) return ref.map(v => resolveValue(v, scope));
  return ref;
}

function evaluateConstraint(constraint, scope) {
  const { id, lhs, op, rhs, tolerance } = constraint;
  const result = { id, passed: false, lhs_value: null, rhs_value: null, message: '' };

  try {
    result.lhs_value = resolveValue(lhs, scope);
    result.rhs_value = resolveValue(rhs, scope);

    switch (op) {
      case 'eq':
        result.passed = result.lhs_value === result.rhs_value;
        result.message = result.passed
          ? `${result.lhs_value} === ${result.rhs_value}`
          : `${result.lhs_value} !== ${result.rhs_value}`;
        break;

      case 'approx_eq':
        result.passed = Math.abs(result.lhs_value - result.rhs_value) <= (tolerance || 0);
        result.message = result.passed
          ? `|${result.lhs_value} - ${result.rhs_value}| <= ${tolerance}`
          : `|${result.lhs_value} - ${result.rhs_value}| = ${Math.abs(result.lhs_value - result.rhs_value)} > ${tolerance}`;
        break;

      case 'between': {
        const [lo, hi] = result.rhs_value;
        result.passed = result.lhs_value >= lo && result.lhs_value <= hi;
        result.message = result.passed
          ? `${lo} <= ${result.lhs_value} <= ${hi}`
          : `${result.lhs_value} not in [${lo}, ${hi}]`;
        break;
      }

      case 'gt':
        result.passed = result.lhs_value > result.rhs_value;
        result.message = result.passed
          ? `${result.lhs_value} > ${result.rhs_value}`
          : `${result.lhs_value} <= ${result.rhs_value}`;
        break;

      case 'gte':
        result.passed = result.lhs_value >= result.rhs_value;
        result.message = result.passed
          ? `${result.lhs_value} >= ${result.rhs_value}`
          : `${result.lhs_value} < ${result.rhs_value}`;
        break;

      case 'multiple_of':
        result.passed = Math.abs(result.lhs_value % result.rhs_value) < 0.001;
        result.message = result.passed
          ? `${result.lhs_value} is a multiple of ${result.rhs_value}`
          : `${result.lhs_value} % ${result.rhs_value} = ${result.lhs_value % result.rhs_value}`;
        break;

      default:
        result.message = `Unknown operator: ${op}`;
    }
  } catch (err) {
    result.message = `Evaluation error: ${err.message}`;
  }

  return result;
}

// ── Main evaluator ────────────────────────────────────────────────

export function evaluateLawset(lawsetPath) {
  const raw = readFileSync(resolve(lawsetPath), 'utf-8');
  const lawset = JSON.parse(raw);

  // Build scope from constants
  const scope = { ...lawset.constants };

  // Evaluate derived expressions
  const derived_values = {};
  if (lawset.derived) {
    // Multi-pass resolution: some derived values may reference other derived values
    const derivedKeys = Object.keys(lawset.derived);
    const resolved = new Set();
    let lastResolvedCount = -1;

    while (resolved.size < derivedKeys.length && resolved.size > lastResolvedCount) {
      lastResolvedCount = resolved.size;
      for (const key of derivedKeys) {
        if (resolved.has(key)) continue;
        try {
          const value = evaluateExpression(lawset.derived[key], scope);
          derived_values[key] = value;
          scope[key] = value;
          resolved.add(key);
        } catch {
          // May need other derived values resolved first — retry next pass
        }
      }
    }

    // Check for unresolved
    for (const key of derivedKeys) {
      if (!resolved.has(key)) {
        try {
          const value = evaluateExpression(lawset.derived[key], scope);
          derived_values[key] = value;
          scope[key] = value;
        } catch (err) {
          derived_values[key] = { error: err.message };
        }
      }
    }
  }

  // Evaluate constraints
  const constraint_results = (lawset.constraints || []).map(c => evaluateConstraint(c, scope));

  return {
    id: lawset.id,
    constants: lawset.constants,
    derived_values,
    constraint_results,
  };
}

// ── CLI entry point ───────────────────────────────────────────────

const __filename = decodeURIComponent(new URL(import.meta.url).pathname);
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node evaluate-lawset.mjs <lawset.json> [--all]');
    process.exit(1);
  }

  if (args[0] === '--all') {
    // Evaluate all lawsets in the lawsets directory
    const { readdirSync } = await import('fs');
    const lawsetsDir = resolve(decodeURIComponent(new URL('.', import.meta.url).pathname), '../equations/lawsets');
    const files = readdirSync(lawsetsDir).filter(f => f.endsWith('.json'));
    const results = {};
    let allPassed = true;

    for (const file of files) {
      const filePath = resolve(lawsetsDir, file);
      const result = evaluateLawset(filePath);
      results[result.id] = result;
      const failed = result.constraint_results.filter(c => !c.passed);
      if (failed.length > 0) allPassed = false;
      console.error(`${result.id}: ${result.constraint_results.length - failed.length}/${result.constraint_results.length} constraints pass`);
    }

    console.log(JSON.stringify(results, null, 2));
    process.exit(allPassed ? 0 : 1);
  } else {
    const result = evaluateLawset(args[0]);
    console.log(JSON.stringify(result, null, 2));
    const failed = result.constraint_results.filter(c => !c.passed);
    if (failed.length > 0) {
      console.error(`\n${failed.length} constraint(s) failed:`);
      for (const f of failed) {
        console.error(`  [${f.id}] ${f.message}`);
      }
      process.exit(1);
    } else {
      console.error(`\nAll ${result.constraint_results.length} constraints pass.`);
    }
  }
}
