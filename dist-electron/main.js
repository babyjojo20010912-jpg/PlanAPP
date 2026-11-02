var ch = Object.defineProperty;
var Vc = (e) => {
  throw TypeError(e);
};
var lh = (e, t, r) => t in e ? ch(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var vo = (e, t, r) => lh(e, typeof t != "symbol" ? t + "" : t, r), wo = (e, t, r) => t.has(e) || Vc("Cannot " + r);
var A = (e, t, r) => (wo(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Se = (e, t, r) => t.has(e) ? Vc("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), $e = (e, t, r, n) => (wo(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), k = (e, t, r) => (wo(e, t, "access private method"), r);
import bu, { app as Ir, BrowserWindow as Su, ipcMain as ge, screen as uh, nativeImage as xo, Tray as dh, Menu as fh, Notification as zc } from "electron";
import { fileURLToPath as hh } from "node:url";
import x from "node:path";
import fe from "node:process";
import { Buffer as Eo } from "node:buffer";
import { promisify as Te, isDeepStrictEqual as bo } from "node:util";
import U from "node:fs";
import _n, { randomUUID as Pu } from "node:crypto";
import Ou from "node:os";
import "node:events";
import "node:stream";
const ja = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), mh = Math.max(...[...ja].map((e) => e.length)), Nu = 1e6, ph = (e) => e >= "0" && e <= "9";
function $h(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= Nu;
  }
  return !1;
}
function So(e, t) {
  return ja.has(e) ? !1 : (e && $h(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function Iu(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let r = "", n = "", s = !1, o = "start", a = !1, c = 0;
  for (const l of e) {
    if (c++, a) {
      r += l, a = !1;
      continue;
    }
    if (l === "\\") {
      if (o === "index")
        throw new Error(`Invalid character '${l}' in an index at position ${c}`);
      if (o === "indexEnd")
        throw new Error(`Invalid character '${l}' after an index at position ${c}`);
      a = !0, o = o === "start" ? "property" : o;
      continue;
    }
    switch (l) {
      case ".": {
        if (o === "index")
          throw new Error(`Invalid character '${l}' in an index at position ${c}`);
        if (o === "indexEnd") {
          o = "property";
          break;
        }
        if (!So(r, t))
          return [];
        r = "", o = "property";
        break;
      }
      case "[": {
        if (o === "index")
          throw new Error(`Invalid character '${l}' in an index at position ${c}`);
        if (o === "indexEnd") {
          o = "index";
          break;
        }
        if (o === "property" && r.length <= mh && ja.has(r))
          return [];
        s = o === "property", o = "index";
        break;
      }
      case "]": {
        if (o === "indexEnd")
          throw new Error(`Invalid character '${l}' after an index at position ${c}`);
        if (o !== "index") {
          o === "start" && (o = "property"), r += l;
          break;
        }
        if (n === "") {
          r += "[]", o = "property";
          break;
        }
        if ((r !== "" || s) && !So(r, t))
          return [];
        r = "", s = !1;
        const d = Number.parseInt(n, 10), u = d <= Nu && n === String(d);
        t.push(u ? d : n), n = "", o = "indexEnd";
        break;
      }
      default: {
        if (o === "index") {
          if (!ph(l))
            throw new Error(`Invalid character '${l}' in an index at position ${c}`);
          n += l;
          break;
        }
        if (o === "indexEnd")
          throw new Error(`Invalid character '${l}' after an index at position ${c}`);
        o === "start" && (o = "property"), r += l;
      }
    }
  }
  switch (a && (r += "\\"), o) {
    case "property": {
      if (!So(r, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function yh(e) {
  if (typeof e != "string")
    return !1;
  const t = e.trim();
  return t !== "" && t !== "." && t !== ".." && !e.includes("/") && !e.includes("\\") && !e.includes("\0");
}
function Uc(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  if (!yh(e))
    throw new Error(`Unsafe filename: ${JSON.stringify(e)}`);
}
const Kt = Ou.homedir(), ka = Ou.tmpdir(), { env: Hr } = fe, gh = (e) => {
  const t = x.join(Kt, "Library");
  return {
    data: x.join(t, "Application Support", e),
    config: x.join(t, "Preferences", e),
    cache: x.join(t, "Caches", e),
    log: x.join(t, "Logs", e),
    temp: x.join(ka, e)
  };
}, _h = (e) => {
  const t = Hr.APPDATA || x.join(Kt, "AppData", "Roaming"), r = Hr.LOCALAPPDATA || x.join(Kt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: x.join(r, e, "Data"),
    config: x.join(t, e, "Config"),
    cache: x.join(r, e, "Cache"),
    log: x.join(r, e, "Log"),
    temp: x.join(ka, e)
  };
}, vh = (e) => {
  const t = x.basename(Kt);
  return {
    data: x.join(Hr.XDG_DATA_HOME || x.join(Kt, ".local", "share"), e),
    config: x.join(Hr.XDG_CONFIG_HOME || x.join(Kt, ".config"), e),
    cache: x.join(Hr.XDG_CACHE_HOME || x.join(Kt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: x.join(Hr.XDG_STATE_HOME || x.join(Kt, ".local", "state"), e),
    temp: x.join(ka, t, e)
  };
};
function wh(e, { suffix: t = "nodejs" } = {}) {
  return Uc(e), t && (e += `-${t}`), Uc(e), fe.platform === "darwin" ? gh(e) : fe.platform === "win32" ? _h(e) : vh(e);
}
const At = (e, t) => {
  const { onError: r } = t;
  return function(...s) {
    return e.apply(void 0, s).catch(r);
  };
}, bt = (e, t) => {
  const { onError: r } = t;
  return function(...s) {
    try {
      return e.apply(void 0, s);
    } catch (o) {
      return r(o);
    }
  };
}, Eh = 250, Ct = (e, t) => {
  const { isRetriable: r } = t;
  return function(s) {
    const { timeout: o } = s, a = s.interval ?? Eh, c = Date.now() + o;
    return function l(...d) {
      return e.apply(void 0, d).catch((u) => {
        if (!r(u) || Date.now() >= c)
          throw u;
        const h = Math.round(a * Math.random());
        return h > 0 ? new Promise((g) => setTimeout(g, h)).then(() => l.apply(void 0, d)) : l.apply(void 0, d);
      });
    };
  };
}, Dt = (e, t) => {
  const { isRetriable: r } = t;
  return function(s) {
    const { timeout: o } = s, a = Date.now() + o;
    return function(...l) {
      for (; ; )
        try {
          return e.apply(void 0, l);
        } catch (d) {
          if (!r(d) || Date.now() >= a)
            throw d;
          continue;
        }
    };
  };
}, Br = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!Br.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !bh && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!Br.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!Br.isNodeError(e))
      throw e;
    if (!Br.isChangeErrorOk(e))
      throw e;
  }
}, ns = {
  onError: Br.onChangeError
}, Xe = {
  onError: () => {
  }
}, bh = fe.getuid ? !fe.getuid() : !1, je = {
  isRetriable: Br.isRetriableError
}, De = {
  attempt: {
    /* ASYNC */
    chmod: At(Te(U.chmod), ns),
    chown: At(Te(U.chown), ns),
    close: At(Te(U.close), Xe),
    fsync: At(Te(U.fsync), Xe),
    mkdir: At(Te(U.mkdir), Xe),
    realpath: At(Te(U.realpath), Xe),
    stat: At(Te(U.stat), Xe),
    unlink: At(Te(U.unlink), Xe),
    /* SYNC */
    chmodSync: bt(U.chmodSync, ns),
    chownSync: bt(U.chownSync, ns),
    closeSync: bt(U.closeSync, Xe),
    existsSync: bt(U.existsSync, Xe),
    fsyncSync: bt(U.fsync, Xe),
    mkdirSync: bt(U.mkdirSync, Xe),
    realpathSync: bt(U.realpathSync, Xe),
    statSync: bt(U.statSync, Xe),
    unlinkSync: bt(U.unlinkSync, Xe)
  },
  retry: {
    /* ASYNC */
    close: Ct(Te(U.close), je),
    fsync: Ct(Te(U.fsync), je),
    open: Ct(Te(U.open), je),
    readFile: Ct(Te(U.readFile), je),
    rename: Ct(Te(U.rename), je),
    stat: Ct(Te(U.stat), je),
    write: Ct(Te(U.write), je),
    writeFile: Ct(Te(U.writeFile), je),
    /* SYNC */
    closeSync: Dt(U.closeSync, je),
    fsyncSync: Dt(U.fsyncSync, je),
    openSync: Dt(U.openSync, je),
    readFileSync: Dt(U.readFileSync, je),
    renameSync: Dt(U.renameSync, je),
    statSync: Dt(U.statSync, je),
    writeSync: Dt(U.writeSync, je),
    writeFileSync: Dt(U.writeFileSync, je)
  }
}, Sh = "utf8", Kc = 438, Ph = 511, Oh = {}, Nh = fe.geteuid ? fe.geteuid() : -1, Ih = fe.getegid ? fe.getegid() : -1, Rh = 1e3, Th = !!fe.getuid;
fe.getuid && fe.getuid();
const qc = 128, jh = (e) => e instanceof Error && "code" in e, Gc = (e) => typeof e == "string", Po = (e) => e === void 0, kh = fe.platform === "linux", Ru = fe.platform === "win32", Aa = ["SIGHUP", "SIGINT", "SIGTERM"];
Ru || Aa.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
kh && Aa.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class Ah {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Ru && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? fe.kill(fe.pid, "SIGTERM") : fe.kill(fe.pid, t));
      }
    }, this.hook = () => {
      fe.once("exit", () => this.exit());
      for (const t of Aa)
        try {
          fe.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Ch = new Ah(), Dh = Ch.register, Me = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Me.truncate(t(e));
    return n in Me.store ? Me.get(e, t, r) : (Me.store[n] = r, [n, () => delete Me.store[n]]);
  },
  purge: (e) => {
    Me.store[e] && (delete Me.store[e], De.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Me.store[e] && (delete Me.store[e], De.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Me.store)
      Me.purgeSync(e);
  },
  truncate: (e) => {
    const t = x.basename(e);
    if (t.length <= qc)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - qc;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Dh(Me.purgeSyncAll);
function Tu(e, t, r = Oh) {
  if (Gc(r))
    return Tu(e, t, { encoding: r });
  const s = { timeout: r.timeout ?? Rh };
  let o = null, a = null, c = null;
  try {
    const l = De.attempt.realpathSync(e), d = !!l;
    e = l || e, [a, o] = Me.get(e, r.tmpCreate || Me.create, r.tmpPurge !== !1);
    const u = Th && Po(r.chown), h = Po(r.mode);
    if (d && (u || h)) {
      const b = De.attempt.statSync(e);
      b && (r = { ...r }, u && (r.chown = { uid: b.uid, gid: b.gid }), h && (r.mode = b.mode));
    }
    if (!d) {
      const b = x.dirname(e);
      De.attempt.mkdirSync(b, {
        mode: Ph,
        recursive: !0
      });
    }
    c = De.retry.openSync(s)(a, "w", r.mode || Kc), r.tmpCreated && r.tmpCreated(a), Gc(t) ? De.retry.writeSync(s)(c, t, 0, r.encoding || Sh) : Po(t) || De.retry.writeSync(s)(c, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? De.retry.fsyncSync(s)(c) : De.attempt.fsync(c)), De.retry.closeSync(s)(c), c = null, r.chown && (r.chown.uid !== Nh || r.chown.gid !== Ih) && De.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== Kc && De.attempt.chmodSync(a, r.mode);
    try {
      De.retry.renameSync(s)(a, e);
    } catch (b) {
      if (!jh(b) || b.code !== "ENAMETOOLONG")
        throw b;
      De.retry.renameSync(s)(a, Me.truncate(e));
    }
    o(), a = null;
  } finally {
    c && De.attempt.closeSync(c), a && Me.purge(a);
  }
}
function ju(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Jo = { exports: {} }, ku = {}, dt = {}, rn = {}, Jn = {}, Z = {}, Hn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(w) {
      if (super(), !e.IDENTIFIER.test(w))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(w) {
      super(), this._items = typeof w == "string" ? [w] : w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const w = this._items[0];
      return w === "" || w === '""';
    }
    get str() {
      var w;
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((O, I) => `${O}${I}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((O, I) => (I instanceof r && (O[I.str] = (O[I.str] || 0) + 1), O), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const O = [m[0]];
    let I = 0;
    for (; I < w.length; )
      c(O, w[I]), O.push(m[++I]);
    return new n(O);
  }
  e._ = s;
  const o = new n("+");
  function a(m, ...w) {
    const O = [g(m[0])];
    let I = 0;
    for (; I < w.length; )
      O.push(o), c(O, w[I]), O.push(o, g(m[++I]));
    return l(O), new n(O);
  }
  e.str = a;
  function c(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(h(w));
  }
  e.addCodeArg = c;
  function l(m) {
    let w = 1;
    for (; w < m.length - 1; ) {
      if (m[w] === o) {
        const O = d(m[w - 1], m[w + 1]);
        if (O !== void 0) {
          m.splice(w - 1, 3, O);
          continue;
        }
        m[w++] = "+";
      }
      w++;
    }
  }
  function d(m, w) {
    if (w === '""')
      return m;
    if (m === '""')
      return w;
    if (typeof m == "string")
      return w instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof w != "string" ? `${m.slice(0, -1)}${w}"` : w[0] === '"' ? m.slice(0, -1) + w.slice(1) : void 0;
    if (typeof w == "string" && w[0] === '"' && !(m instanceof r))
      return `"${m}${w.slice(1)}`;
  }
  function u(m, w) {
    return w.emptyStr() ? m : m.emptyStr() ? w : a`${m}${w}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : g(Array.isArray(m) ? m.join(",") : m);
  }
  function b(m) {
    return new n(g(m));
  }
  e.stringify = b;
  function g(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = g;
  function v(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = v;
  function _(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = _;
  function y(m) {
    return new n(m.toString());
  }
  e.regexpCode = y;
})(Hn);
var Wo = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Hn;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: u } = {}) {
      this._names = {}, this._prefixes = d, this._parent = u;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const u = this._names[d] || this._nameGroup(d);
      return `${d}${u.index++}`;
    }
    _nameGroup(d) {
      var u, h;
      if (!((h = (u = this._parent) === null || u === void 0 ? void 0 : u._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class o extends t.Name {
    constructor(d, u) {
      super(u), this.prefix = d;
    }
    setValue(d, { property: u, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(u)}[${h}]`;
    }
  }
  e.ValueScopeName = o;
  const a = (0, t._)`\n`;
  class c extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? a : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new o(d, this._newName(d));
    }
    value(d, u) {
      var h;
      if (u.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const b = this.toName(d), { prefix: g } = b, v = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let _ = this._values[g];
      if (_) {
        const w = _.get(v);
        if (w)
          return w;
      } else
        _ = this._values[g] = /* @__PURE__ */ new Map();
      _.set(v, b);
      const y = this._scope[g] || (this._scope[g] = []), m = y.length;
      return y[m] = u.ref, b.setValue(u, { property: g, itemIndex: m }), b;
    }
    getValue(d, u) {
      const h = this._values[d];
      if (h)
        return h.get(u);
    }
    scopeRefs(d, u = this._values) {
      return this._reduceValues(u, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, u, h) {
      return this._reduceValues(d, (b) => {
        if (b.value === void 0)
          throw new Error(`CodeGen: name "${b}" has no value`);
        return b.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, b) {
      let g = t.nil;
      for (const v in d) {
        const _ = d[v];
        if (!_)
          continue;
        const y = h[v] = h[v] || /* @__PURE__ */ new Map();
        _.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, n.Started);
          let w = u(m);
          if (w) {
            const O = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            g = (0, t._)`${g}${O} ${m} = ${w};${this.opts._n}`;
          } else if (w = b == null ? void 0 : b(m))
            g = (0, t._)`${g}${w}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return g;
    }
  }
  e.ValueScope = c;
})(Wo);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Hn, r = Wo;
  var n = Hn;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = Wo;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class o {
    optimizeNodes() {
      return this;
    }
    optimizeNames(i, f) {
      return this;
    }
  }
  class a extends o {
    constructor(i, f, E) {
      super(), this.varKind = i, this.name = f, this.rhs = E;
    }
    render({ es5: i, _n: f }) {
      const E = i ? r.varKinds.var : this.varKind, j = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${j};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = J(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class c extends o {
    constructor(i, f, E) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = E;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = J(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return ie(i, this.rhs);
    }
  }
  class l extends c {
    constructor(i, f, E, j) {
      super(i, E, j), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class d extends o {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class u extends o {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends o {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class b extends o {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = J(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class g extends o {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, E) => f + E.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const E = i[f].optimizeNodes();
        Array.isArray(E) ? i.splice(f, 1, ...E) : E ? i[f] = E : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: E } = this;
      let j = E.length;
      for (; j--; ) {
        const T = E[j];
        T.optimizeNames(i, f) || (de(i, T.names), E.splice(j, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => B(i, f.names), {});
    }
  }
  class v extends g {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class _ extends g {
  }
  class y extends v {
  }
  y.kind = "else";
  class m extends v {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const E = f.optimizeNodes();
        f = this.else = Array.isArray(E) ? new y(E) : E;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(Re(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = J(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return ie(i, this.condition), this.else && B(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class w extends v {
  }
  w.kind = "for";
  class O extends w {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = J(this.iteration, i, f), this;
    }
    get names() {
      return B(super.names, this.iteration.names);
    }
  }
  class I extends w {
    constructor(i, f, E, j) {
      super(), this.varKind = i, this.name = f, this.from = E, this.to = j;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: E, from: j, to: T } = this;
      return `for(${f} ${E}=${j}; ${E}<${T}; ${E}++)` + super.render(i);
    }
    get names() {
      const i = ie(super.names, this.from);
      return ie(i, this.to);
    }
  }
  class R extends w {
    constructor(i, f, E, j) {
      super(), this.loop = i, this.varKind = f, this.name = E, this.iterable = j;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = J(this.iterable, i, f), this;
    }
    get names() {
      return B(super.names, this.iterable.names);
    }
  }
  class H extends v {
    constructor(i, f, E) {
      super(), this.name = i, this.args = f, this.async = E;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  H.kind = "func";
  class Y extends g {
    render(i) {
      return "return " + super.render(i);
    }
  }
  Y.kind = "return";
  class pe extends v {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var E, j;
      return super.optimizeNames(i, f), (E = this.catch) === null || E === void 0 || E.optimizeNames(i, f), (j = this.finally) === null || j === void 0 || j.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && B(i, this.catch.names), this.finally && B(i, this.finally.names), i;
    }
  }
  class ye extends v {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  ye.kind = "catch";
  class we extends v {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  we.kind = "finally";
  class K {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new _()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const E = this._extScope.value(i, f);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, E, j) {
      const T = this._scope.toName(f);
      return E !== void 0 && j && (this._constants[T.str] = E), this._leafNode(new a(i, T, E)), T;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, E) {
      return this._def(r.varKinds.const, i, f, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, E) {
      return this._def(r.varKinds.let, i, f, E);
    }
    // `var` declaration with optional assignment
    var(i, f, E) {
      return this._def(r.varKinds.var, i, f, E);
    }
    // assignment code
    assign(i, f, E) {
      return this._leafNode(new c(i, f, E));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new b(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [E, j] of i)
        f.length > 1 && f.push(","), f.push(E), (E !== j || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, j));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, E) {
      if (this._blockNode(new m(i)), f && E)
        this.code(f).else().code(E).endIf();
      else if (f)
        this.code(f).endIf();
      else if (E)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new y());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, y);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new O(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, E, j, T = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const L = this._scope.toName(i);
      return this._for(new I(T, L, f, E), () => j(L));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, E, j = r.varKinds.const) {
      const T = this._scope.toName(i);
      if (this.opts.es5) {
        const L = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${L}.length`, (z) => {
          this.var(T, (0, t._)`${L}[${z}]`), E(T);
        });
      }
      return this._for(new R("of", j, T, f), () => E(T));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, E, j = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, E);
      const T = this._scope.toName(i);
      return this._for(new R("in", j, T, f), () => E(T));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new u(i));
    }
    // `return` statement
    return(i) {
      const f = new Y();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Y);
    }
    // `try` statement
    try(i, f, E) {
      if (!f && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const j = new pe();
      if (this._blockNode(j), this.code(i), f) {
        const T = this.name("e");
        this._currNode = j.catch = new ye(T), f(T);
      }
      return E && (this._currNode = j.finally = new we(), this.code(E)), this._endBlockNode(ye, we);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const E = this._nodes.length - f;
      if (E < 0 || i !== void 0 && E !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, E, j) {
      return this._blockNode(new H(i, f, E)), j && this.code(j).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(H);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const E = this._currNode;
      if (E instanceof i || f && E instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = K;
  function B($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) + (i[f] || 0);
    return $;
  }
  function ie($, i) {
    return i instanceof t._CodeOrName ? B($, i.names) : $;
  }
  function J($, i, f) {
    if ($ instanceof t.Name)
      return E($);
    if (!j($))
      return $;
    return new t._Code($._items.reduce((T, L) => (L instanceof t.Name && (L = E(L)), L instanceof t._Code ? T.push(...L._items) : T.push(L), T), []));
    function E(T) {
      const L = f[T.str];
      return L === void 0 || i[T.str] !== 1 ? T : (delete i[T.str], L);
    }
    function j(T) {
      return T instanceof t._Code && T._items.some((L) => L instanceof t.Name && i[L.str] === 1 && f[L.str] !== void 0);
    }
  }
  function de($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) - (i[f] || 0);
  }
  function Re($) {
    return typeof $ == "boolean" || typeof $ == "number" || $ === null ? !$ : (0, t._)`!${S($)}`;
  }
  e.not = Re;
  const D = p(e.operators.AND);
  function C(...$) {
    return $.reduce(D);
  }
  e.and = C;
  const V = p(e.operators.OR);
  function P(...$) {
    return $.reduce(V);
  }
  e.or = P;
  function p($) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${$} ${S(f)}`;
  }
  function S($) {
    return $ instanceof t.Name ? $ : (0, t._)`(${$})`;
  }
})(Z);
var M = {};
Object.defineProperty(M, "__esModule", { value: !0 });
M.checkStrictMode = M.getErrorPath = M.Type = M.useFunc = M.setEvaluated = M.evaluatedPropsToName = M.mergeEvaluated = M.eachItem = M.unescapeJsonPointer = M.escapeJsonPointer = M.escapeFragment = M.unescapeFragment = M.schemaRefOrVal = M.schemaHasRulesButRef = M.schemaHasRules = M.checkUnknownRules = M.alwaysValidSchema = M.toHash = void 0;
const ce = Z, Mh = Hn;
function Fh(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
M.toHash = Fh;
function Lh(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Au(e, t), !Cu(t, e.self.RULES.all));
}
M.alwaysValidSchema = Lh;
function Au(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const o in t)
    s[o] || Fu(e, `unknown keyword: "${o}"`);
}
M.checkUnknownRules = Au;
function Cu(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
M.schemaHasRules = Cu;
function Vh(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
M.schemaHasRulesButRef = Vh;
function zh({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ce._)`${r}`;
  }
  return (0, ce._)`${e}${t}${(0, ce.getProperty)(n)}`;
}
M.schemaRefOrVal = zh;
function Uh(e) {
  return Du(decodeURIComponent(e));
}
M.unescapeFragment = Uh;
function Kh(e) {
  return encodeURIComponent(Ca(e));
}
M.escapeFragment = Kh;
function Ca(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
M.escapeJsonPointer = Ca;
function Du(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
M.unescapeJsonPointer = Du;
function qh(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
M.eachItem = qh;
function Hc({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, o, a, c) => {
    const l = a === void 0 ? o : a instanceof ce.Name ? (o instanceof ce.Name ? e(s, o, a) : t(s, o, a), a) : o instanceof ce.Name ? (t(s, a, o), o) : r(o, a);
    return c === ce.Name && !(l instanceof ce.Name) ? n(s, l) : l;
  };
}
M.mergeEvaluated = {
  props: Hc({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ce._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ce._)`${r} || {}`).code((0, ce._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ce._)`${r} || {}`), Da(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Mu
  }),
  items: Hc({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ce._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ce._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Mu(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ce._)`{}`);
  return t !== void 0 && Da(e, r, t), r;
}
M.evaluatedPropsToName = Mu;
function Da(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ce._)`${t}${(0, ce.getProperty)(n)}`, !0));
}
M.setEvaluated = Da;
const Bc = {};
function Gh(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Bc[t.code] || (Bc[t.code] = new Mh._Code(t.code))
  });
}
M.useFunc = Gh;
var Xo;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Xo || (M.Type = Xo = {}));
function Hh(e, t, r) {
  if (e instanceof ce.Name) {
    const n = t === Xo.Num;
    return r ? n ? (0, ce._)`"[" + ${e} + "]"` : (0, ce._)`"['" + ${e} + "']"` : n ? (0, ce._)`"/" + ${e}` : (0, ce._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ce.getProperty)(e).toString() : "/" + Ca(e);
}
M.getErrorPath = Hh;
function Fu(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
M.checkStrictMode = Fu;
var Ze = {};
Object.defineProperty(Ze, "__esModule", { value: !0 });
const ke = Z, Bh = {
  // validation function arguments
  data: new ke.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new ke.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new ke.Name("instancePath"),
  parentData: new ke.Name("parentData"),
  parentDataProperty: new ke.Name("parentDataProperty"),
  rootData: new ke.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new ke.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new ke.Name("vErrors"),
  // null or array of validation errors
  errors: new ke.Name("errors"),
  // counter of validation errors
  this: new ke.Name("this"),
  // "globals"
  self: new ke.Name("self"),
  scope: new ke.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new ke.Name("json"),
  jsonPos: new ke.Name("jsonPos"),
  jsonLen: new ke.Name("jsonLen"),
  jsonPart: new ke.Name("jsonPart")
};
Ze.default = Bh;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = Z, r = M, n = Ze;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, w, O) {
    const { it: I } = y, { gen: R, compositeRule: H, allErrors: Y } = I, pe = h(y, m, w);
    O ?? (H || Y) ? l(R, pe) : d(I, (0, t._)`[${pe}]`);
  }
  e.reportError = s;
  function o(y, m = e.keywordError, w) {
    const { it: O } = y, { gen: I, compositeRule: R, allErrors: H } = O, Y = h(y, m, w);
    l(I, Y), R || H || d(O, n.default.vErrors);
  }
  e.reportExtraError = o;
  function a(y, m) {
    y.assign(n.default.errors, m), y.if((0, t._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = a;
  function c({ gen: y, keyword: m, schemaValue: w, data: O, errsCount: I, it: R }) {
    if (I === void 0)
      throw new Error("ajv implementation error");
    const H = y.name("err");
    y.forRange("i", I, n.default.errors, (Y) => {
      y.const(H, (0, t._)`${n.default.vErrors}[${Y}]`), y.if((0, t._)`${H}.instancePath === undefined`, () => y.assign((0, t._)`${H}.instancePath`, (0, t.strConcat)(n.default.instancePath, R.errorPath))), y.assign((0, t._)`${H}.schemaPath`, (0, t.str)`${R.errSchemaPath}/${m}`), R.opts.verbose && (y.assign((0, t._)`${H}.schema`, w), y.assign((0, t._)`${H}.data`, O));
    });
  }
  e.extendErrors = c;
  function l(y, m) {
    const w = y.const("err", m);
    y.if((0, t._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), y.code((0, t._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: w, validateName: O, schemaEnv: I } = y;
    I.$async ? w.throw((0, t._)`new ${y.ValidationError}(${m})`) : (w.assign((0, t._)`${O}.errors`, m), w.return(!1));
  }
  const u = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h(y, m, w) {
    const { createErrors: O } = y.it;
    return O === !1 ? (0, t._)`{}` : b(y, m, w);
  }
  function b(y, m, w = {}) {
    const { gen: O, it: I } = y, R = [
      g(I, w),
      v(y, w)
    ];
    return _(y, m, R), O.object(...R);
  }
  function g({ errorPath: y }, { instancePath: m }) {
    const w = m ? (0, t.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
  }
  function v({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: O }) {
    let I = O ? m : (0, t.str)`${m}/${y}`;
    return w && (I = (0, t.str)`${I}${(0, r.getErrorPath)(w, r.Type.Str)}`), [u.schemaPath, I];
  }
  function _(y, { params: m, message: w }, O) {
    const { keyword: I, data: R, schemaValue: H, it: Y } = y, { opts: pe, propertyName: ye, topSchemaRef: we, schemaPath: K } = Y;
    O.push([u.keyword, I], [u.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), pe.messages && O.push([u.message, typeof w == "function" ? w(y) : w]), pe.verbose && O.push([u.schema, H], [u.parentSchema, (0, t._)`${we}${K}`], [n.default.data, R]), ye && O.push([u.propertyName, ye]);
  }
})(Jn);
Object.defineProperty(rn, "__esModule", { value: !0 });
rn.boolOrEmptySchema = rn.topBoolOrEmptySchema = void 0;
const xh = Jn, Jh = Z, Wh = Ze, Xh = {
  message: "boolean schema is false"
};
function Yh(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? Lu(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Wh.default.data) : (t.assign((0, Jh._)`${n}.errors`, null), t.return(!0));
}
rn.topBoolOrEmptySchema = Yh;
function Zh(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), Lu(e)) : r.var(t, !0);
}
rn.boolOrEmptySchema = Zh;
function Lu(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, xh.reportError)(s, Xh, void 0, t);
}
var Ee = {}, Rr = {};
Object.defineProperty(Rr, "__esModule", { value: !0 });
Rr.getRules = Rr.isJSONType = void 0;
const Qh = ["string", "number", "integer", "boolean", "null", "object", "array"], em = new Set(Qh);
function tm(e) {
  return typeof e == "string" && em.has(e);
}
Rr.isJSONType = tm;
function rm() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
Rr.getRules = rm;
var It = {};
Object.defineProperty(It, "__esModule", { value: !0 });
It.shouldUseRule = It.shouldUseGroup = It.schemaHasRulesForType = void 0;
function nm({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && Vu(e, n);
}
It.schemaHasRulesForType = nm;
function Vu(e, t) {
  return t.rules.some((r) => zu(e, r));
}
It.shouldUseGroup = Vu;
function zu(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
It.shouldUseRule = zu;
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.reportTypeError = Ee.checkDataTypes = Ee.checkDataType = Ee.coerceAndCheckDataType = Ee.getJSONTypes = Ee.getSchemaTypes = Ee.DataType = void 0;
const sm = Rr, om = It, am = Jn, Q = Z, Uu = M;
var Wr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(Wr || (Ee.DataType = Wr = {}));
function im(e) {
  const t = Ku(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
Ee.getSchemaTypes = im;
function Ku(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(sm.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Ee.getJSONTypes = Ku;
function cm(e, t) {
  const { gen: r, data: n, opts: s } = e, o = lm(t, s.coerceTypes), a = t.length > 0 && !(o.length === 0 && t.length === 1 && (0, om.schemaHasRulesForType)(e, t[0]));
  if (a) {
    const c = Ma(t, n, s.strictNumbers, Wr.Wrong);
    r.if(c, () => {
      o.length ? um(e, t, o) : Fa(e);
    });
  }
  return a;
}
Ee.coerceAndCheckDataType = cm;
const qu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function lm(e, t) {
  return t ? e.filter((r) => qu.has(r) || t === "array" && r === "array") : [];
}
function um(e, t, r) {
  const { gen: n, data: s, opts: o } = e, a = n.let("dataType", (0, Q._)`typeof ${s}`), c = n.let("coerced", (0, Q._)`undefined`);
  o.coerceTypes === "array" && n.if((0, Q._)`${a} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Q._)`${s}[0]`).assign(a, (0, Q._)`typeof ${s}`).if(Ma(t, s, o.strictNumbers), () => n.assign(c, s))), n.if((0, Q._)`${c} !== undefined`);
  for (const d of r)
    (qu.has(d) || d === "array" && o.coerceTypes === "array") && l(d);
  n.else(), Fa(e), n.endIf(), n.if((0, Q._)`${c} !== undefined`, () => {
    n.assign(s, c), dm(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, Q._)`${a} == "number" || ${a} == "boolean"`).assign(c, (0, Q._)`"" + ${s}`).elseIf((0, Q._)`${s} === null`).assign(c, (0, Q._)`""`);
        return;
      case "number":
        n.elseIf((0, Q._)`${a} == "boolean" || ${s} === null
              || (${a} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, Q._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, Q._)`${a} === "boolean" || ${s} === null
              || (${a} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, Q._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, Q._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, Q._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, Q._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, Q._)`${a} === "string" || ${a} === "number"
              || ${a} === "boolean" || ${s} === null`).assign(c, (0, Q._)`[${s}]`);
    }
  }
}
function dm({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Q._)`${t} !== undefined`, () => e.assign((0, Q._)`${t}[${r}]`, n));
}
function Yo(e, t, r, n = Wr.Correct) {
  const s = n === Wr.Correct ? Q.operators.EQ : Q.operators.NEQ;
  let o;
  switch (e) {
    case "null":
      return (0, Q._)`${t} ${s} null`;
    case "array":
      o = (0, Q._)`Array.isArray(${t})`;
      break;
    case "object":
      o = (0, Q._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      o = a((0, Q._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      o = a();
      break;
    default:
      return (0, Q._)`typeof ${t} ${s} ${e}`;
  }
  return n === Wr.Correct ? o : (0, Q.not)(o);
  function a(c = Q.nil) {
    return (0, Q.and)((0, Q._)`typeof ${t} == "number"`, c, r ? (0, Q._)`isFinite(${t})` : Q.nil);
  }
}
Ee.checkDataType = Yo;
function Ma(e, t, r, n) {
  if (e.length === 1)
    return Yo(e[0], t, r, n);
  let s;
  const o = (0, Uu.toHash)(e);
  if (o.array && o.object) {
    const a = (0, Q._)`typeof ${t} != "object"`;
    s = o.null ? a : (0, Q._)`!${t} || ${a}`, delete o.null, delete o.array, delete o.object;
  } else
    s = Q.nil;
  o.number && delete o.integer;
  for (const a in o)
    s = (0, Q.and)(s, Yo(a, t, r, n));
  return s;
}
Ee.checkDataTypes = Ma;
const fm = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Q._)`{type: ${e}}` : (0, Q._)`{type: ${t}}`
};
function Fa(e) {
  const t = hm(e);
  (0, am.reportError)(t, fm);
}
Ee.reportTypeError = Fa;
function hm(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Uu.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
eo.assignDefaults = void 0;
const Cr = Z, mm = M;
function pm(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      xc(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, o) => xc(e, o, s.default));
}
eo.assignDefaults = pm;
function xc(e, t, r) {
  const { gen: n, compositeRule: s, data: o, opts: a } = e;
  if (r === void 0)
    return;
  const c = (0, Cr._)`${o}${(0, Cr.getProperty)(t)}`;
  if (s) {
    (0, mm.checkStrictMode)(e, `default is ignored for: ${c}`);
    return;
  }
  let l = (0, Cr._)`${c} === undefined`;
  a.useDefaults === "empty" && (l = (0, Cr._)`${l} || ${c} === null || ${c} === ""`), n.if(l, (0, Cr._)`${c} = ${(0, Cr.stringify)(r)}`);
}
var _t = {}, re = {};
Object.defineProperty(re, "__esModule", { value: !0 });
re.validateUnion = re.validateArray = re.usePattern = re.callValidateCode = re.schemaProperties = re.allSchemaProperties = re.noPropertyInData = re.propertyInData = re.isOwnProperty = re.hasPropFunc = re.reportMissingProp = re.checkMissingProp = re.checkReportMissingProp = void 0;
const he = Z, La = M, Mt = Ze, $m = M;
function ym(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(za(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, he._)`${t}` }, !0), e.error();
  });
}
re.checkReportMissingProp = ym;
function gm({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, he.or)(...n.map((o) => (0, he.and)(za(e, t, o, r.ownProperties), (0, he._)`${s} = ${o}`)));
}
re.checkMissingProp = gm;
function _m(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
re.reportMissingProp = _m;
function Gu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, he._)`Object.prototype.hasOwnProperty`
  });
}
re.hasPropFunc = Gu;
function Va(e, t, r) {
  return (0, he._)`${Gu(e)}.call(${t}, ${r})`;
}
re.isOwnProperty = Va;
function vm(e, t, r, n) {
  const s = (0, he._)`${t}${(0, he.getProperty)(r)} !== undefined`;
  return n ? (0, he._)`${s} && ${Va(e, t, r)}` : s;
}
re.propertyInData = vm;
function za(e, t, r, n) {
  const s = (0, he._)`${t}${(0, he.getProperty)(r)} === undefined`;
  return n ? (0, he.or)(s, (0, he.not)(Va(e, t, r))) : s;
}
re.noPropertyInData = za;
function Hu(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
re.allSchemaProperties = Hu;
function wm(e, t) {
  return Hu(t).filter((r) => !(0, La.alwaysValidSchema)(e, t[r]));
}
re.schemaProperties = wm;
function Em({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: o }, it: a }, c, l, d) {
  const u = d ? (0, he._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Mt.default.instancePath, (0, he.strConcat)(Mt.default.instancePath, o)],
    [Mt.default.parentData, a.parentData],
    [Mt.default.parentDataProperty, a.parentDataProperty],
    [Mt.default.rootData, Mt.default.rootData]
  ];
  a.opts.dynamicRef && h.push([Mt.default.dynamicAnchors, Mt.default.dynamicAnchors]);
  const b = (0, he._)`${u}, ${r.object(...h)}`;
  return l !== he.nil ? (0, he._)`${c}.call(${l}, ${b})` : (0, he._)`${c}(${b})`;
}
re.callValidateCode = Em;
const bm = (0, he._)`new RegExp`;
function Sm({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, o = s(r, n);
  return e.scopeValue("pattern", {
    key: o.toString(),
    ref: o,
    code: (0, he._)`${s.code === "new RegExp" ? bm : (0, $m.useFunc)(e, s)}(${r}, ${n})`
  });
}
re.usePattern = Sm;
function Pm(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, o = t.name("valid");
  if (s.allErrors) {
    const c = t.let("valid", !0);
    return a(() => t.assign(c, !1)), c;
  }
  return t.var(o, !0), a(() => t.break()), o;
  function a(c) {
    const l = t.const("len", (0, he._)`${r}.length`);
    t.forRange("i", 0, l, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: La.Type.Num
      }, o), t.if((0, he.not)(o), c);
    });
  }
}
re.validateArray = Pm;
function Om(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, La.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const a = t.let("valid", !1), c = t.name("_valid");
  t.block(() => r.forEach((l, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, c);
    t.assign(a, (0, he._)`${a} || ${c}`), e.mergeValidEvaluated(u, c) || t.if((0, he.not)(a));
  })), e.result(a, () => e.reset(), () => e.error(!0));
}
re.validateUnion = Om;
Object.defineProperty(_t, "__esModule", { value: !0 });
_t.validateKeywordUsage = _t.validSchemaType = _t.funcKeywordCode = _t.macroKeywordCode = void 0;
const Ue = Z, _r = Ze, Nm = re, Im = Jn;
function Rm(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: o, it: a } = e, c = t.macro.call(a.self, s, o, a), l = Bu(r, n, c);
  a.opts.validateSchema !== !1 && a.self.validateSchema(c, !0);
  const d = r.name("valid");
  e.subschema({
    schema: c,
    schemaPath: Ue.nil,
    errSchemaPath: `${a.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
_t.macroKeywordCode = Rm;
function Tm(e, t) {
  var r;
  const { gen: n, keyword: s, schema: o, parentSchema: a, $data: c, it: l } = e;
  km(l, t);
  const d = !c && t.compile ? t.compile.call(l.self, o, a, l) : t.validate, u = Bu(n, s, d), h = n.let("valid");
  e.block$data(h, b), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function b() {
    if (t.errors === !1)
      _(), t.modifying && Jc(e), y(() => e.error());
    else {
      const m = t.async ? g() : v();
      t.modifying && Jc(e), y(() => jm(e, m));
    }
  }
  function g() {
    const m = n.let("ruleErrs", null);
    return n.try(() => _((0, Ue._)`await `), (w) => n.assign(h, !1).if((0, Ue._)`${w} instanceof ${l.ValidationError}`, () => n.assign(m, (0, Ue._)`${w}.errors`), () => n.throw(w))), m;
  }
  function v() {
    const m = (0, Ue._)`${u}.errors`;
    return n.assign(m, null), _(Ue.nil), m;
  }
  function _(m = t.async ? (0, Ue._)`await ` : Ue.nil) {
    const w = l.opts.passContext ? _r.default.this : _r.default.self, O = !("compile" in t && !c || t.schema === !1);
    n.assign(h, (0, Ue._)`${m}${(0, Nm.callValidateCode)(e, u, w, O)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, Ue.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
_t.funcKeywordCode = Tm;
function Jc(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Ue._)`${n.parentData}[${n.parentDataProperty}]`));
}
function jm(e, t) {
  const { gen: r } = e;
  r.if((0, Ue._)`Array.isArray(${t})`, () => {
    r.assign(_r.default.vErrors, (0, Ue._)`${_r.default.vErrors} === null ? ${t} : ${_r.default.vErrors}.concat(${t})`).assign(_r.default.errors, (0, Ue._)`${_r.default.vErrors}.length`), (0, Im.extendErrors)(e);
  }, () => e.error());
}
function km({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function Bu(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Ue.stringify)(r) });
}
function Am(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
_t.validSchemaType = Am;
function Cm({ schema: e, opts: t, self: r, errSchemaPath: n }, s, o) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(o) : s.keyword !== o)
    throw new Error("ajv implementation error");
  const a = s.dependencies;
  if (a != null && a.some((c) => !Object.prototype.hasOwnProperty.call(e, c)))
    throw new Error(`parent schema must have dependencies of ${o}: ${a.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[o])) {
    const l = `keyword "${o}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
_t.validateKeywordUsage = Cm;
var Xt = {};
Object.defineProperty(Xt, "__esModule", { value: !0 });
Xt.extendSubschemaMode = Xt.extendSubschemaData = Xt.getSubschema = void 0;
const yt = Z, xu = M;
function Dm(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: o, topSchemaRef: a }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const c = e.schema[t];
    return r === void 0 ? {
      schema: c,
      schemaPath: (0, yt._)`${e.schemaPath}${(0, yt.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: c[r],
      schemaPath: (0, yt._)`${e.schemaPath}${(0, yt.getProperty)(t)}${(0, yt.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, xu.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || o === void 0 || a === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: a,
      errSchemaPath: o
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Xt.getSubschema = Dm;
function Mm(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: o, propertyName: a }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: c } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, b = c.let("data", (0, yt._)`${t.data}${(0, yt.getProperty)(r)}`, !0);
    l(b), e.errorPath = (0, yt.str)`${d}${(0, xu.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, yt._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof yt.Name ? s : c.let("data", s, !0);
    l(d), a !== void 0 && (e.propertyName = a);
  }
  o && (e.dataTypes = o);
  function l(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Xt.extendSubschemaData = Mm;
function Fm(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: o }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), o !== void 0 && (e.allErrors = o), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Xt.extendSubschemaMode = Fm;
var Ne = {}, to = function e(t, r) {
  if (t === r) return !0;
  if (t && r && typeof t == "object" && typeof r == "object") {
    if (t.constructor !== r.constructor) return !1;
    var n, s, o;
    if (Array.isArray(t)) {
      if (n = t.length, n != r.length) return !1;
      for (s = n; s-- !== 0; )
        if (!e(t[s], r[s])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
    if (o = Object.keys(t), n = o.length, n !== Object.keys(r).length) return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, o[s])) return !1;
    for (s = n; s-- !== 0; ) {
      var a = o[s];
      if (!e(t[a], r[a])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, Ju = { exports: {} }, Jt = Ju.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Ns(t, n, s, e, "", e);
};
Jt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Jt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Jt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Jt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function Ns(e, t, r, n, s, o, a, c, l, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, o, a, c, l, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Jt.arrayKeywords)
          for (var b = 0; b < h.length; b++)
            Ns(e, t, r, h[b], s + "/" + u + "/" + b, o, s, u, n, b);
      } else if (u in Jt.propsKeywords) {
        if (h && typeof h == "object")
          for (var g in h)
            Ns(e, t, r, h[g], s + "/" + u + "/" + Lm(g), o, s, u, n, g);
      } else (u in Jt.keywords || e.allKeys && !(u in Jt.skipKeywords)) && Ns(e, t, r, h, s + "/" + u, o, s, u, n);
    }
    r(n, s, o, a, c, l, d);
  }
}
function Lm(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Vm = Ju.exports;
Object.defineProperty(Ne, "__esModule", { value: !0 });
Ne.getSchemaRefs = Ne.resolveUrl = Ne.normalizeId = Ne._getFullPath = Ne.getFullPath = Ne.inlineRef = void 0;
const zm = M, Um = to, Km = Vm, qm = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Gm(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Zo(e) : t ? Wu(e) <= t : !1;
}
Ne.inlineRef = Gm;
const Hm = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Zo(e) {
  for (const t in e) {
    if (Hm.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Zo) || typeof r == "object" && Zo(r))
      return !0;
  }
  return !1;
}
function Wu(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !qm.has(r) && (typeof e[r] == "object" && (0, zm.eachItem)(e[r], (n) => t += Wu(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function Xu(e, t = "", r) {
  r !== !1 && (t = Xr(t));
  const n = e.parse(t);
  return Yu(e, n);
}
Ne.getFullPath = Xu;
function Yu(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Ne._getFullPath = Yu;
const Bm = /#\/?$/;
function Xr(e) {
  return e ? e.replace(Bm, "") : "";
}
Ne.normalizeId = Xr;
function xm(e, t, r) {
  return r = Xr(r), e.resolve(t, r);
}
Ne.resolveUrl = xm;
const Jm = /^[a-z_][-a-z0-9._]*$/i;
function Wm(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Xr(e[r] || t), o = { "": s }, a = Xu(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return Km(e, { allKeys: !0 }, (h, b, g, v) => {
    if (v === void 0)
      return;
    const _ = a + b;
    let y = o[v];
    typeof h[r] == "string" && (y = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), o[b] = y;
    function m(O) {
      const I = this.opts.uriResolver.resolve;
      if (O = Xr(y ? I(y, O) : O), l.has(O))
        throw u(O);
      l.add(O);
      let R = this.refs[O];
      return typeof R == "string" && (R = this.refs[R]), typeof R == "object" ? d(h, R.schema, O) : O !== Xr(_) && (O[0] === "#" ? (d(h, c[O], O), c[O] = h) : this.refs[O] = _), O;
    }
    function w(O) {
      if (typeof O == "string") {
        if (!Jm.test(O))
          throw new Error(`invalid anchor "${O}"`);
        m.call(this, `#${O}`);
      }
    }
  }), c;
  function d(h, b, g) {
    if (b !== void 0 && !Um(h, b))
      throw u(g);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Ne.getSchemaRefs = Wm;
Object.defineProperty(dt, "__esModule", { value: !0 });
dt.getData = dt.KeywordCxt = dt.validateFunctionCode = void 0;
const Zu = rn, Wc = Ee, Ua = It, Us = Ee, Xm = eo, Dn = _t, Oo = Xt, q = Z, W = Ze, Ym = Ne, Rt = M, vn = Jn;
function Zm(e) {
  if (td(e) && (rd(e), ed(e))) {
    tp(e);
    return;
  }
  Qu(e, () => (0, Zu.topBoolOrEmptySchema)(e));
}
dt.validateFunctionCode = Zm;
function Qu({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, o) {
  s.code.es5 ? e.func(t, (0, q._)`${W.default.data}, ${W.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${Xc(r, s)}`), ep(e, s), e.code(o);
  }) : e.func(t, (0, q._)`${W.default.data}, ${Qm(s)}`, n.$async, () => e.code(Xc(r, s)).code(o));
}
function Qm(e) {
  return (0, q._)`{${W.default.instancePath}="", ${W.default.parentData}, ${W.default.parentDataProperty}, ${W.default.rootData}=${W.default.data}${e.dynamicRef ? (0, q._)`, ${W.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function ep(e, t) {
  e.if(W.default.valCxt, () => {
    e.var(W.default.instancePath, (0, q._)`${W.default.valCxt}.${W.default.instancePath}`), e.var(W.default.parentData, (0, q._)`${W.default.valCxt}.${W.default.parentData}`), e.var(W.default.parentDataProperty, (0, q._)`${W.default.valCxt}.${W.default.parentDataProperty}`), e.var(W.default.rootData, (0, q._)`${W.default.valCxt}.${W.default.rootData}`), t.dynamicRef && e.var(W.default.dynamicAnchors, (0, q._)`${W.default.valCxt}.${W.default.dynamicAnchors}`);
  }, () => {
    e.var(W.default.instancePath, (0, q._)`""`), e.var(W.default.parentData, (0, q._)`undefined`), e.var(W.default.parentDataProperty, (0, q._)`undefined`), e.var(W.default.rootData, W.default.data), t.dynamicRef && e.var(W.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function tp(e) {
  const { schema: t, opts: r, gen: n } = e;
  Qu(e, () => {
    r.$comment && t.$comment && sd(e), ap(e), n.let(W.default.vErrors, null), n.let(W.default.errors, 0), r.unevaluated && rp(e), nd(e), lp(e);
  });
}
function rp(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function Xc(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function np(e, t) {
  if (td(e) && (rd(e), ed(e))) {
    sp(e, t);
    return;
  }
  (0, Zu.boolOrEmptySchema)(e, t);
}
function ed({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function td(e) {
  return typeof e.schema != "boolean";
}
function sp(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && sd(e), ip(e), cp(e);
  const o = n.const("_errs", W.default.errors);
  nd(e, o), n.var(t, (0, q._)`${o} === ${W.default.errors}`);
}
function rd(e) {
  (0, Rt.checkUnknownRules)(e), op(e);
}
function nd(e, t) {
  if (e.opts.jtd)
    return Yc(e, [], !1, t);
  const r = (0, Wc.getSchemaTypes)(e.schema), n = (0, Wc.coerceAndCheckDataType)(e, r);
  Yc(e, r, !n, t);
}
function op(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, Rt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function ap(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, Rt.checkStrictMode)(e, "default is ignored in the schema root");
}
function ip(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Ym.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function cp(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function sd({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const o = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${W.default.self}.logger.log(${o})`);
  else if (typeof s.$comment == "function") {
    const a = (0, q.str)`${n}/$comment`, c = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${W.default.self}.opts.$comment(${o}, ${a}, ${c}.schema)`);
  }
}
function lp(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: o } = e;
  r.$async ? t.if((0, q._)`${W.default.errors} === 0`, () => t.return(W.default.data), () => t.throw((0, q._)`new ${s}(${W.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, W.default.vErrors), o.unevaluated && up(e), t.return((0, q._)`${W.default.errors} === 0`));
}
function up({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function Yc(e, t, r, n) {
  const { gen: s, schema: o, data: a, allErrors: c, opts: l, self: d } = e, { RULES: u } = d;
  if (o.$ref && (l.ignoreKeywordsWithRef || !(0, Rt.schemaHasRulesButRef)(o, u))) {
    s.block(() => id(e, "$ref", u.all.$ref.definition));
    return;
  }
  l.jtd || dp(e, t), s.block(() => {
    for (const b of u.rules)
      h(b);
    h(u.post);
  });
  function h(b) {
    (0, Ua.shouldUseGroup)(o, b) && (b.type ? (s.if((0, Us.checkDataType)(b.type, a, l.strictNumbers)), Zc(e, b), t.length === 1 && t[0] === b.type && r && (s.else(), (0, Us.reportTypeError)(e)), s.endIf()) : Zc(e, b), c || s.if((0, q._)`${W.default.errors} === ${n || 0}`));
  }
}
function Zc(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Xm.assignDefaults)(e, t.type), r.block(() => {
    for (const o of t.rules)
      (0, Ua.shouldUseRule)(n, o) && id(e, o.keyword, o.definition, t.type);
  });
}
function dp(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (fp(e, t), e.opts.allowUnionTypes || hp(e, t), mp(e, e.dataTypes));
}
function fp(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      od(e.dataTypes, r) || Ka(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), $p(e, t);
  }
}
function hp(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Ka(e, "use allowUnionTypes to allow union type keyword");
}
function mp(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Ua.shouldUseRule)(e.schema, s)) {
      const { type: o } = s.definition;
      o.length && !o.some((a) => pp(t, a)) && Ka(e, `missing type "${o.join(",")}" for keyword "${n}"`);
    }
  }
}
function pp(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function od(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function $p(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    od(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Ka(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, Rt.checkStrictMode)(e, t, e.opts.strictTypes);
}
let ad = class {
  constructor(t, r, n) {
    if ((0, Dn.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, Rt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", cd(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Dn.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", W.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, q.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, q.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, q._)`${r} !== undefined && (${(0, q.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? vn.reportExtraError : vn.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, vn.reportError)(this, this.def.$dataError || vn.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, vn.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = q.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = q.nil, r = q.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: o, def: a } = this;
    n.if((0, q.or)((0, q._)`${s} === undefined`, r)), t !== q.nil && n.assign(t, !0), (o.length || a.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== q.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: o } = this;
    return (0, q.or)(a(), c());
    function a() {
      if (n.length) {
        if (!(r instanceof q.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, q._)`${(0, Us.checkDataTypes)(l, r, o.opts.strictNumbers, Us.DataType.Wrong)}`;
      }
      return q.nil;
    }
    function c() {
      if (s.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, q._)`!${l}(${r})`;
      }
      return q.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Oo.getSubschema)(this.it, t);
    (0, Oo.extendSubschemaData)(n, this.it, t), (0, Oo.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return np(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = Rt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = Rt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, q.Name)), !0;
  }
};
dt.KeywordCxt = ad;
function id(e, t, r, n) {
  const s = new ad(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Dn.funcKeywordCode)(s, r) : "macro" in r ? (0, Dn.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Dn.funcKeywordCode)(s, r);
}
const yp = /^\/(?:[^~]|~0|~1)*$/, gp = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function cd(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, o;
  if (e === "")
    return W.default.rootData;
  if (e[0] === "/") {
    if (!yp.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, o = W.default.rootData;
  } else {
    const d = gp.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(l("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(l("data", u));
    if (o = r[t - u], !s)
      return o;
  }
  let a = o;
  const c = s.split("/");
  for (const d of c)
    d && (o = (0, q._)`${o}${(0, q.getProperty)((0, Rt.unescapeJsonPointer)(d))}`, a = (0, q._)`${a} && ${o}`);
  return a;
  function l(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
dt.getData = cd;
var Wn = {};
Object.defineProperty(Wn, "__esModule", { value: !0 });
let _p = class extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
};
Wn.default = _p;
var cn = {};
Object.defineProperty(cn, "__esModule", { value: !0 });
const No = Ne;
let vp = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, No.resolveUrl)(t, r, n), this.missingSchema = (0, No.normalizeId)((0, No.getFullPath)(t, this.missingRef));
  }
};
cn.default = vp;
var qe = {};
Object.defineProperty(qe, "__esModule", { value: !0 });
qe.resolveSchema = qe.getCompilingSchema = qe.resolveRef = qe.compileSchema = qe.SchemaEnv = void 0;
const st = Z, wp = Wn, mr = Ze, lt = Ne, Qc = M, Ep = dt;
let ro = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, lt.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
qe.SchemaEnv = ro;
function qa(e) {
  const t = ld.call(this, e);
  if (t)
    return t;
  const r = (0, lt.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: o } = this.opts, a = new st.CodeGen(this.scope, { es5: n, lines: s, ownProperties: o });
  let c;
  e.$async && (c = a.scopeValue("Error", {
    ref: wp.default,
    code: (0, st._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = a.scopeName("validate");
  e.validateName = l;
  const d = {
    gen: a,
    allErrors: this.opts.allErrors,
    data: mr.default.data,
    parentData: mr.default.parentData,
    parentDataProperty: mr.default.parentDataProperty,
    dataNames: [mr.default.data],
    dataPathArr: [st.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: a.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, st.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: st.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, st._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, Ep.validateFunctionCode)(d), a.optimize(this.opts.code.optimize);
    const h = a.toString();
    u = `${a.scopeRefs(mr.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const g = new Function(`${mr.default.self}`, `${mr.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: g }), g.errors = null, g.schema = e.schema, g.schemaEnv = e, e.$async && (g.$async = !0), this.opts.code.source === !0 && (g.source = { validateName: l, validateCode: h, scopeValues: a._values }), this.opts.unevaluated) {
      const { props: v, items: _ } = d;
      g.evaluated = {
        props: v instanceof st.Name ? void 0 : v,
        items: _ instanceof st.Name ? void 0 : _,
        dynamicProps: v instanceof st.Name,
        dynamicItems: _ instanceof st.Name
      }, g.source && (g.source.evaluated = (0, st.stringify)(g.evaluated));
    }
    return e.validate = g, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
qe.compileSchema = qa;
function bp(e, t, r) {
  var n;
  r = (0, lt.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let o = Op.call(this, e, r);
  if (o === void 0) {
    const a = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    a && (o = new ro({ schema: a, schemaId: c, root: e, baseId: t }));
  }
  if (o !== void 0)
    return e.refs[r] = Sp.call(this, o);
}
qe.resolveRef = bp;
function Sp(e) {
  return (0, lt.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : qa.call(this, e);
}
function ld(e) {
  for (const t of this._compilations)
    if (Pp(t, e))
      return t;
}
qe.getCompilingSchema = ld;
function Pp(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Op(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || no.call(this, e, t);
}
function no(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, lt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, lt.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Io.call(this, r, e);
  const o = (0, lt.normalizeId)(n), a = this.refs[o] || this.schemas[o];
  if (typeof a == "string") {
    const c = no.call(this, e, a);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Io.call(this, r, c);
  }
  if (typeof (a == null ? void 0 : a.schema) == "object") {
    if (a.validate || qa.call(this, a), o === (0, lt.normalizeId)(t)) {
      const { schema: c } = a, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, lt.resolveUrl)(this.opts.uriResolver, s, d)), new ro({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Io.call(this, r, a);
  }
}
qe.resolveSchema = no;
const Np = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Io(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, Qc.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Np.has(c) && d && (t = (0, lt.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let o;
  if (typeof r != "boolean" && r.$ref && !(0, Qc.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, lt.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    o = no.call(this, n, c);
  }
  const { schemaId: a } = this.opts;
  if (o = o || new ro({ schema: r, schemaId: a, root: n, baseId: t }), o.schema !== o.root.schema)
    return o;
}
const Ip = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Rp = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Tp = "object", jp = [
  "$data"
], kp = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Ap = !1, Cp = {
  $id: Ip,
  description: Rp,
  type: Tp,
  required: jp,
  properties: kp,
  additionalProperties: Ap
};
var Ga = {}, so = { exports: {} };
const Dp = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Ha = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u), Mp = RegExp.prototype.test.bind(/^\d*$/u), ln = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu), Ba = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu), ud = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/]$/u), xa = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]$/u), Fp = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:]$/u), Be = new Array(256);
{
  const e = "0123456789ABCDEF";
  for (let t = 0; t < 256; t++)
    Be[t] = "%" + e[t >> 4] + e[t & 15];
}
function Fe(e) {
  return e < 2048 ? Be[192 | e >> 6] + Be[128 | e & 63] : e < 65536 ? Be[224 | e >> 12] + Be[128 | e >> 6 & 63] + Be[128 | e & 63] : Be[240 | e >> 18] + Be[128 | e >> 12 & 63] + Be[128 | e >> 6 & 63] + Be[128 | e & 63];
}
const Lp = RegExp.prototype.test.bind(/^[\dA-Fa-f]{1,4}$/), Vp = RegExp.prototype.test.bind(/^[vV][\dA-Fa-f]+\.[A-Za-z\d\-._~!$&'()*+,;=:]+$/), zp = RegExp.prototype.test.bind(/^[A-Za-z\d\-._~]$/), Up = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function Kp(e) {
  if (e.length === 0) return !1;
  for (let t = 0; t < e.length; t++)
    if (!zp(e[t])) {
      if (e[t] === "%" && t + 2 < e.length && ln(e.slice(t + 1, t + 3))) {
        t += 2;
        continue;
      }
      return !1;
    }
  return !0;
}
function el(e) {
  let t = -1, r = 0, n = -1, s = 0;
  for (let c = 0; c < e.length; c++)
    e[c] === "0" ? (n === -1 && (n = c), s++, s > r && (r = s, t = n)) : (n = -1, s = 0);
  if (r < 2) return e.join(":");
  const o = e.slice(0, t).join(":"), a = e.slice(t + r).join(":");
  return o + "::" + a;
}
function qp(e) {
  const t = e.indexOf("::");
  if (t !== -1 && e.indexOf("::", t + 1) !== -1) return;
  const r = t === -1 ? e.split(":") : e.slice(0, t).split(":"), n = t === -1 ? [] : e.slice(t + 2).split(":");
  t !== -1 && (r.length === 1 && r[0] === "" && (r.length = 0), n.length === 1 && n[0] === "" && (n.length = 0));
  const s = r.concat(n);
  let o = 0;
  for (let c = 0; c < s.length; c++) {
    const l = s[c];
    if (l === "") return;
    if (l.indexOf(".") !== -1) {
      if (c !== s.length - 1 || t !== -1 && n.length === 0 || !Ha(l)) return;
      o += 2;
      continue;
    }
    if (!Lp(l)) return;
    s[c] = parseInt(l, 16).toString(16), o++;
  }
  if (t === -1)
    return o !== 8 ? void 0 : el(s);
  if (o >= 8) return;
  const a = s.slice(0, r.length);
  for (let c = o; c < 8; c++) a.push("0");
  for (let c = r.length; c < s.length; c++) a.push(s[c]);
  return el(a);
}
function Qo(e) {
  const t = e[0] === "[" && e[e.length - 1] === "]";
  if ((e[0] === "[" || e[e.length - 1] === "]") && !t) return { host: e, isIPV6: !1, error: !0 };
  let n = t ? e.slice(1, -1) : e;
  if (t && Vp(n))
    return n = n.toLowerCase(), { host: `[${n}]`, escapedHost: n, isIPV6: !1, isIPVFuture: !0 };
  if (Gp(n, ":") < 2)
    return { host: e, isIPV6: !1, error: t };
  let s = "";
  const o = n.indexOf("%");
  if (o !== -1) {
    const c = n.slice(o, o + 3).toLowerCase() === "%25" ? 3 : 1;
    if (s = n.slice(o + c), !Kp(s)) return { host: e, isIPV6: !1, error: !0 };
    n = n.slice(0, o);
  }
  const a = qp(n);
  return a === void 0 ? { host: e, isIPV6: !1, error: !0 } : {
    host: a + (s ? "%" + s : ""),
    escapedHost: a + (s ? "%25" + s : ""),
    isIPV6: !0
  };
}
function Gp(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function Hp(e) {
  let t = e;
  const r = [];
  let n = -1, s = 0;
  for (; s = t.length; ) {
    if (s === 1) {
      if (t === ".")
        break;
      if (t === "/") {
        r.push("/");
        break;
      } else {
        r.push(t);
        break;
      }
    } else if (s === 2) {
      if (t[0] === ".") {
        if (t[1] === ".")
          break;
        if (t[1] === "/") {
          t = t.slice(2);
          continue;
        }
      } else if (t[0] === "/" && (t[1] === "." || t[1] === "/")) {
        r.push("/");
        break;
      }
    } else if (s === 3 && t === "/..") {
      r.length !== 0 && r.pop(), r.push("/");
      break;
    }
    if (t[0] === ".") {
      if (t[1] === ".") {
        if (t[2] === "/") {
          t = t.slice(3);
          continue;
        }
      } else if (t[1] === "/") {
        t = t.slice(2);
        continue;
      }
    } else if (t[0] === "/" && t[1] === ".") {
      if (t[2] === "/") {
        t = t.slice(2);
        continue;
      } else if (t[2] === "." && t[3] === "/") {
        t = t.slice(3), r.length !== 0 && r.pop();
        continue;
      }
    }
    if ((n = t.indexOf("/", 1)) === -1) {
      r.push(t);
      break;
    } else
      r.push(t.slice(0, n)), t = t.slice(n);
  }
  return r.join("");
}
const Bp = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" }, xp = /[@/?#:]/g, Jp = /[@/?#]/g;
function dd(e, t) {
  const r = t ? Jp : xp;
  return r.lastIndex = 0, e.replace(r, (n) => Bp[n]);
}
function fd(e, t = !1) {
  if (e.indexOf("%") === -1)
    return e;
  let r = "";
  for (let n = 0; n < e.length; n++) {
    if (e[n] === "%" && n + 2 < e.length) {
      const s = e.slice(n + 1, n + 3);
      if (ln(s)) {
        const o = s.toUpperCase(), a = String.fromCharCode(parseInt(o, 16));
        t && Ba(a) ? r += a : r += "%" + o, n += 2;
        continue;
      }
    }
    r += e[n];
  }
  return r;
}
function Wp(e) {
  let t = "";
  for (let r = 0; r < e.length; r++) {
    const n = e[r];
    if (n === "%" && r + 2 < e.length) {
      const s = e.slice(r + 1, r + 3);
      if (ln(s)) {
        const o = s.toUpperCase(), a = String.fromCharCode(parseInt(o, 16));
        a !== "." && Ba(a) ? t += a : t += "%" + o, r += 2;
        continue;
      }
    }
    if (ud(n))
      t += n;
    else {
      const s = e.charCodeAt(r);
      if (s < 128)
        t += hd(s) ? n : Be[s];
      else if (s < 55296 || s > 57343)
        t += Fe(s);
      else if (s <= 56319 && r + 1 < e.length) {
        const o = e.charCodeAt(r + 1);
        o >= 56320 && o <= 57343 ? (t += Fe(65536 + (s - 55296 << 10) + (o - 56320)), r++) : t += Fe(65533);
      } else
        t += Fe(65533);
    }
  }
  return t;
}
function Xp(e, t = !1) {
  let r = "", n = t && e[0] !== "/";
  for (let s = 0; s < e.length; s++) {
    const o = e[s];
    if (o === "%" && s + 2 < e.length) {
      const a = e.slice(s + 1, s + 3);
      if (ln(a)) {
        r += "%" + a.toUpperCase(), s += 2;
        continue;
      }
    }
    if (o === "/" && (n = !1), ud(o) && (o !== ":" || !n))
      r += o;
    else {
      const a = e.charCodeAt(s);
      if (a < 128)
        r += Be[a];
      else if (a < 55296 || a > 57343)
        r += Fe(a);
      else if (a <= 56319 && s + 1 < e.length) {
        const c = e.charCodeAt(s + 1);
        c >= 56320 && c <= 57343 ? (r += Fe(65536 + (a - 55296 << 10) + (c - 56320)), s++) : r += Fe(65533);
      } else
        r += Fe(65533);
    }
  }
  return r;
}
function Ja(e, t) {
  let r = "";
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    if (s === "%" && n + 2 < e.length) {
      const o = e.slice(n + 1, n + 3);
      if (ln(o)) {
        r += "%" + o.toUpperCase(), n += 2;
        continue;
      }
    }
    if (t(s))
      r += s;
    else {
      const o = e.charCodeAt(n);
      if (o < 128)
        r += Be[o];
      else if (o < 55296 || o > 57343)
        r += Fe(o);
      else if (o <= 56319 && n + 1 < e.length) {
        const a = e.charCodeAt(n + 1);
        a >= 56320 && a <= 57343 ? (r += Fe(65536 + (o - 55296 << 10) + (a - 56320)), n++) : r += Fe(65533);
      } else
        r += Fe(65533);
    }
  }
  return r;
}
function Yp(e) {
  return Ja(e, Fp);
}
function Zp(e) {
  return Ja(e, xa);
}
function Qp(e) {
  return Ja(e, xa);
}
function hd(e) {
  return e >= 48 && e <= 57 || e >= 65 && e <= 90 || e >= 97 && e <= 122 || e === 42 || e === 43 || e === 45 || e === 46 || e === 47 || e === 64 || e === 95;
}
function e$(e) {
  let t = "";
  for (let r = 0; r < e.length; r++) {
    const n = e[r];
    if (n === "%" && r + 2 < e.length) {
      const s = e.slice(r + 1, r + 3);
      if (ln(s)) {
        const o = s.toUpperCase(), a = String.fromCharCode(parseInt(o, 16));
        Ba(a) ? t += a : t += "%" + o, r += 2;
        continue;
      }
    }
    if (xa(n))
      t += n;
    else {
      const s = e.charCodeAt(r);
      if (s < 128)
        t += hd(s) ? n : Be[s];
      else if (s < 55296 || s > 57343)
        t += Fe(s);
      else if (s <= 56319 && r + 1 < e.length) {
        const o = e.charCodeAt(r + 1);
        o >= 56320 && o <= 57343 ? (t += Fe(65536 + (s - 55296 << 10) + (o - 56320)), r++) : t += Fe(65533);
      } else
        t += Fe(65533);
    }
  }
  return t;
}
function t$(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(Yp(e.userinfo)), t.push("@")), e.host !== void 0) {
    let r = e.host;
    if (!Ha(r)) {
      let n = Qo(r);
      n.isIPV6 !== !0 && n.isIPVFuture !== !0 && (r = fd(r, !0), n = Qo(r)), n.isIPV6 === !0 || n.isIPVFuture === !0 ? r = `[${n.escapedHost}]` : r = dd(r, !1);
    }
    t.push(r);
  }
  if (typeof e.port == "number" || typeof e.port == "string") {
    const r = String(e.port);
    if (!Mp(r))
      throw new TypeError("URI port is malformed.");
    t.push(":"), t.push(r);
  }
  return t.length ? t.join("") : void 0;
}
var md = {
  nonSimpleDomain: Up,
  recomposeAuthority: t$,
  reescapeHostDelimiters: dd,
  normalizePercentEncoding: fd,
  normalizePathEncoding: Wp,
  serializePathEncoding: Xp,
  normalizeQueryFragmentEncoding: e$,
  encodeQuery: Zp,
  encodeFragment: Qp,
  removeDotSegments: Hp,
  isIPv4: Ha,
  isUUID: Dp,
  normalizeIPv6: Qo
};
const { isUUID: r$ } = md, n$ = /^([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-./:;=@]|%[\da-f]{2})+)$/iu;
function pd(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function $d(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function yd(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function s$(e) {
  return e.secure = pd(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function o$(e) {
  if ((e.port === (pd(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const t = e.resourceName.indexOf("?"), r = t === -1 ? e.resourceName : e.resourceName.slice(0, t);
    e.path = r && r !== "/" ? r : void 0, e.query = t === -1 ? void 0 : e.resourceName.slice(t + 1), e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function a$(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(n$);
  if (r && r[0] === e.path) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, o = Wa(s);
    e.path = void 0, o && (e = o.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function i$(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, o = Wa(s);
  o && (e = o.serialize(e, t));
  const a = e, c = e.nss;
  return a.path = `${n || t.nid}:${c}`, t.skipEscape = !0, a;
}
function c$(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !r$(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function l$(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const gd = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: $d,
    serialize: yd
  }
), u$ = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: gd.domainHost,
    parse: $d,
    serialize: yd
  }
), Is = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: s$,
    serialize: o$
  }
), d$ = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Is.domainHost,
    parse: Is.parse,
    serialize: Is.serialize
  }
), f$ = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: a$,
    serialize: i$,
    skipNormalize: !0
  }
), h$ = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: c$,
    serialize: l$,
    skipNormalize: !0
  }
), Ks = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: gd,
    https: u$,
    ws: Is,
    wss: d$,
    urn: f$,
    "urn:uuid": h$
  }
);
Object.setPrototypeOf(Ks, null);
function Wa(e) {
  return e && (Ks[
    /** @type {SchemeName} */
    e
  ] || Ks[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var m$ = {
  SCHEMES: Ks,
  getSchemeHandler: Wa
};
const { normalizeIPv6: _d, removeDotSegments: On, recomposeAuthority: p$, normalizePercentEncoding: ea, normalizePathEncoding: $$, serializePathEncoding: tl, normalizeQueryFragmentEncoding: rl, encodeQuery: y$, encodeFragment: g$, reescapeHostDelimiters: _$, isIPv4: vd, nonSimpleDomain: v$ } = md, { SCHEMES: wd, getSchemeHandler: Xa } = m$, Ed = /^[A-Za-z][A-Za-z0-9+.-]*$/u, bd = "URI scheme is malformed.";
function nl(e) {
  const t = unescape(String(e));
  if (!Ed.test(t))
    throw new TypeError(bd);
  return t;
}
function w$(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  R$(e, t) : typeof e == "object" && (e = /** @type {T} */
  Gs(Tr(e, t), t)), e;
}
function E$(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, {
    parsed: s,
    malformedAuthorityOrPort: o,
    malformedPercentEncoding: a,
    malformedSchemeSpecific: c,
    malformedHost: l,
    malformedScheme: d
  } = qs(e, n), {
    parsed: u,
    malformedAuthorityOrPort: h,
    malformedPercentEncoding: b,
    malformedSchemeSpecific: g,
    malformedHost: v,
    malformedScheme: _
  } = qs(t, n);
  if (o || h || a || b || c || g || l || v || d || _)
    throw new Error(s.error || u.error || "URI is malformed.");
  const y = Sd(s, u, n, !0), m = Xa(r && r.scheme || y.scheme), w = y.host, O = w !== void 0 && w !== "" && (vd(w) || _d(w).isIPV6);
  Pd(y, r || {}, m, O);
  const I = w && w.indexOf("%") !== -1 && !new RegExp("\\P{ASCII}", "u").test(w);
  if (y.error && !I)
    throw new Error(y.error);
  return n.skipEscape = !0, Tr(y, n);
}
function Sd(e, t, r, n) {
  const s = {};
  return n || (e = Gs(Tr(e, r), r), t = Gs(Tr(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = On(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = On(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = On(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = On(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function b$(e, t, r) {
  const n = sl(e, r), s = sl(t, r);
  return n !== void 0 && s !== void 0 && n === s;
}
function Tr(e, t) {
  const r = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, n = Object.assign({}, t), s = [];
  r.scheme && (r.scheme = nl(r.scheme));
  const o = Xa(n.scheme || r.scheme);
  o && o.serialize && o.serialize(r, n);
  const a = r.userinfo !== void 0 || r.host !== void 0 || r.port !== void 0, c = !n.skipEscape && r.scheme === void 0 && !a;
  r.path !== void 0 && (n.skipEscape ? r.path = ea(r.path) : r.path = tl(r.path, c)), n.reference !== "suffix" && r.scheme && (r.scheme = nl(r.scheme), s.push(r.scheme, ":"));
  const l = p$(r);
  if (l !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(l), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let d = r.path;
    !n.absolutePath && (!o || !o.absolutePath) && (d = On(d)), c && (d = tl(d, !0)), l === void 0 && d[0] === "/" && d[1] === "/" && (d = "/%2F" + d.slice(2)), s.push(d);
  }
  return r.query !== void 0 && s.push("?", y$(r.query)), r.fragment !== void 0 && s.push("#", g$(r.fragment)), s.join("");
}
const S$ = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u, P$ = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/, O$ = /^(?:[^#/:?]+:)?([/\\\t\n\r]*)/;
function N$(e, t) {
  if (t[2] !== void 0 && e.path && e.path[0] !== "/")
    return 'URI path must start with "/" when authority is present.';
  if (typeof e.port == "number" && (e.port < 0 || e.port > 65535))
    return "URI port is malformed.";
}
function wn(e) {
  if (e === void 0) return !1;
  let t = e.indexOf("%");
  for (; t !== -1; ) {
    if (t + 2 >= e.length || !/^[\da-f]{2}$/iu.test(e.slice(t + 1, t + 3)))
      return !0;
    t = e.indexOf("%", t + 3);
  }
  return !1;
}
function Ya(e) {
  return e[0] === "[" && e[e.length - 1] === "]";
}
function I$(e) {
  const t = e[4];
  return wn(e[3]) || t !== void 0 && !Ya(t) && wn(t) || wn(e[6]) || wn(e[7]) || wn(e[8]);
}
function Pd(e, t, r, n) {
  if (!t.unicodeSupport && (!r || !r.unicodeSupport) && e.host && !Ya(e.host) && (t.domainHost || r && r.domainHost) && n === !1 && v$(e.host))
    try {
      e.host = new URL("http://" + e.host).hostname;
    } catch (s) {
      return e.error = e.error || "Host's domain name can not be converted to ASCII: " + s, !0;
    }
  return !1;
}
function qs(e, t) {
  const r = Object.assign({}, t), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  let s = !1, o = !1, a = !1, c = !1, l = !1, d = !1, u = !1;
  r.reference === "suffix" && (r.scheme ? e = r.scheme + ":" + e : e = "//" + e);
  const h = e.match(P$);
  h !== null && h[1].indexOf("\\") !== -1 && (n.error = "URI authority must not contain a literal backslash.", s = !0);
  const b = e.match(O$);
  if (b !== null) {
    const v = b[1], _ = v.replace(/[\t\n\r]/g, "");
    _.length >= 2 && (_.slice(0, 2) !== "//" ? (n.error = n.error || "URI authority must not contain a literal backslash.", s = !0) : v.length !== _.length && (n.error = n.error || "URI authority introducer must not contain whitespace.", s = !0));
  }
  const g = e.match(S$);
  if (g) {
    if (n.scheme = g[1], n.userinfo = g[3], n.host = g[4], n.port = parseInt(g[5], 10), n.path = g[6] || "", n.query = g[7], n.fragment = g[8], n.scheme !== void 0) {
      const y = unescape(n.scheme);
      Ed.test(y) ? n.scheme = y.toLowerCase() : (n.error = n.error || bd, d = !0);
    }
    o = I$(g), o && (n.error = n.error || "URI contains malformed percent-encoding."), isNaN(n.port) && (n.port = g[5]);
    const v = N$(n, g);
    if (v !== void 0 && (n.error = n.error || v, s = !0), n.host)
      if (vd(n.host) === !1) {
        const m = Ya(n.host), w = n.host.indexOf("[") !== -1 || n.host.indexOf("]") !== -1, O = _d(n.host);
        u = O.isIPV6 || O.isIPVFuture === !0, l = w && (!m || O.error === !0), n.host = u ? O.host : O.host.toLowerCase(), l && (n.error = n.error || "URI host is malformed.", s = !0);
      } else
        u = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const _ = Xa(r.scheme || n.scheme);
    if (l || (c = Pd(n, r, _, u)), e.indexOf("%") !== -1 && n.host !== void 0 && !l) {
      let y = u ? n.host : ea(n.host, !0);
      u || (y = ea(y.toLowerCase())), n.host = _$(y, u);
    }
    (!_ || _ && !_.skipNormalize) && (n.path && (n.path = $$(n.path)), n.query && (n.query = rl(n.query)), n.fragment && (n.fragment = rl(n.fragment))), _ && _.parse && (_.parse(n, r), _ === wd.urn && n.nid === void 0 && (a = !0));
  } else
    n.error = n.error || "URI can not be parsed.";
  return { parsed: n, malformedAuthorityOrPort: s, malformedPercentEncoding: o, malformedSchemeSpecific: a, malformedHost: c, malformedScheme: d };
}
function Gs(e, t) {
  return qs(e, t).parsed;
}
function R$(e, t) {
  return Od(e, t).normalized;
}
function Od(e, t) {
  const { parsed: r, malformedAuthorityOrPort: n, malformedPercentEncoding: s, malformedSchemeSpecific: o, malformedHost: a, malformedScheme: c } = qs(e, t);
  return {
    normalized: n || s || o || a || c ? e : Tr(r, t),
    malformedAuthorityOrPort: n,
    malformedPercentEncoding: s,
    malformedSchemeSpecific: o,
    malformedHost: a,
    malformedScheme: c
  };
}
function sl(e, t) {
  if (typeof e != "string" && typeof e != "object")
    return;
  let r;
  try {
    r = typeof e == "string" ? e : Tr(e, t);
  } catch {
    return;
  }
  const { normalized: n, malformedAuthorityOrPort: s, malformedPercentEncoding: o, malformedSchemeSpecific: a, malformedHost: c, malformedScheme: l } = Od(r, t);
  return s || o || a || c || l ? void 0 : n;
}
const Za = {
  SCHEMES: wd,
  normalize: w$,
  resolve: E$,
  resolveComponent: Sd,
  equal: b$,
  serialize: Tr,
  parse: Gs
};
so.exports = Za;
so.exports.default = Za;
so.exports.fastUri = Za;
var Nd = so.exports;
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Id = Nd;
Id.code = 'require("ajv/dist/runtime/uri").default';
Ga.default = Id;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = dt;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = Z;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = Wn, s = cn, o = Rr, a = qe, c = Z, l = Ne, d = Ee, u = M, h = Cp, b = Ga, g = (P, p) => new RegExp(P, p);
  g.code = "new RegExp";
  const v = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), y = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, w = 200;
  function O(P) {
    var p, S, $, i, f, E, j, T, L, z, se, We, er, tr, rr, nr, sr, or, ar, ir, cr, lr, ur, dr, fr;
    const nt = P.strict, hr = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, yn = hr === !0 || hr === void 0 ? 1 : hr || 0, gn = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : g, _o = (i = P.uriResolver) !== null && i !== void 0 ? i : b.default;
    return {
      strictSchema: (E = (f = P.strictSchema) !== null && f !== void 0 ? f : nt) !== null && E !== void 0 ? E : !0,
      strictNumbers: (T = (j = P.strictNumbers) !== null && j !== void 0 ? j : nt) !== null && T !== void 0 ? T : !0,
      strictTypes: (z = (L = P.strictTypes) !== null && L !== void 0 ? L : nt) !== null && z !== void 0 ? z : "log",
      strictTuples: (We = (se = P.strictTuples) !== null && se !== void 0 ? se : nt) !== null && We !== void 0 ? We : "log",
      strictRequired: (tr = (er = P.strictRequired) !== null && er !== void 0 ? er : nt) !== null && tr !== void 0 ? tr : !1,
      code: P.code ? { ...P.code, optimize: yn, regExp: gn } : { optimize: yn, regExp: gn },
      loopRequired: (rr = P.loopRequired) !== null && rr !== void 0 ? rr : w,
      loopEnum: (nr = P.loopEnum) !== null && nr !== void 0 ? nr : w,
      meta: (sr = P.meta) !== null && sr !== void 0 ? sr : !0,
      messages: (or = P.messages) !== null && or !== void 0 ? or : !0,
      inlineRefs: (ar = P.inlineRefs) !== null && ar !== void 0 ? ar : !0,
      schemaId: (ir = P.schemaId) !== null && ir !== void 0 ? ir : "$id",
      addUsedSchema: (cr = P.addUsedSchema) !== null && cr !== void 0 ? cr : !0,
      validateSchema: (lr = P.validateSchema) !== null && lr !== void 0 ? lr : !0,
      validateFormats: (ur = P.validateFormats) !== null && ur !== void 0 ? ur : !0,
      unicodeRegExp: (dr = P.unicodeRegExp) !== null && dr !== void 0 ? dr : !0,
      int32range: (fr = P.int32range) !== null && fr !== void 0 ? fr : !0,
      uriResolver: _o
    };
  }
  class I {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = /* @__PURE__ */ Object.create(null), this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...O(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: _, es5: S, lines: $ }), this.logger = B(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, o.getRules)(), R.call(this, y, p, "NOT SUPPORTED"), R.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = we.call(this), p.formats && pe.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && ye.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: $ } = this.opts;
      let i = h;
      $ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[$], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let $;
      if (typeof p == "string") {
        if ($ = this.getSchema(p), !$)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        $ = this.compile(p);
      const i = $(S);
      return "$async" in $ || (this.errors = $.errors), i;
    }
    compile(p, S) {
      const $ = this._addSchema(p, S);
      return $.validate || this._compileSchemaEnv($);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: $ } = this.opts;
      return i.call(this, p, S);
      async function i(z, se) {
        await f.call(this, z.$schema);
        const We = this._addSchema(z, se);
        return We.validate || E.call(this, We);
      }
      async function f(z) {
        z && !this.getSchema(z) && await i.call(this, { $ref: z }, !0);
      }
      async function E(z) {
        try {
          return this._compileSchemaEnv(z);
        } catch (se) {
          if (!(se instanceof s.default))
            throw se;
          return j.call(this, se), await T.call(this, se.missingSchema), E.call(this, z);
        }
      }
      function j({ missingSchema: z, missingRef: se }) {
        if (this.refs[z])
          throw new Error(`AnySchema ${z} is loaded but ${se} cannot be resolved`);
      }
      async function T(z) {
        const se = await L.call(this, z);
        this.refs[z] || await f.call(this, se.$schema), this.refs[z] || this.addSchema(se, z, S);
      }
      async function L(z) {
        const se = this._loading[z];
        if (se)
          return se;
        try {
          return await (this._loading[z] = $(z));
        } finally {
          delete this._loading[z];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, $, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const E of p)
          this.addSchema(E, void 0, $, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: E } = this.opts;
        if (f = p[E], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, $, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, $ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, $), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let $;
      if ($ = p.$schema, $ !== void 0 && typeof $ != "string")
        throw new Error("$schema must be a string");
      if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate($, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = H.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: $ } = this.opts, i = new a.SchemaEnv({ schema: {}, schemaId: $ });
        if (S = a.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = H.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let $ = p[this.opts.schemaId];
          return $ && ($ = (0, l.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let $;
      if (typeof p == "string")
        $ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = $);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, $ = S.keyword, Array.isArray($) && !$.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (J.call(this, $, S), !S)
        return (0, u.eachItem)($, (f) => de.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)($, i.type.length === 0 ? (f) => de.call(this, f, i) : (f) => i.type.forEach((E) => de.call(this, f, i, E))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const $ of S.rules) {
        const i = $.rules.findIndex((f) => f.keyword === p);
        i >= 0 && $.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: $ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${$}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const $ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let E = p;
        for (const j of f)
          E = E[j];
        for (const j in $) {
          const T = $[j];
          if (typeof T != "object")
            continue;
          const { $data: L } = T.definition, z = E[j];
          L && z && (E[j] = V(z));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const $ in p) {
        const i = p[$];
        (!S || S.test($)) && (typeof i == "string" ? delete p[$] : i && !i.meta && (this._cache.delete(i.schema), delete p[$]));
      }
    }
    _addSchema(p, S, $, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let E;
      const { schemaId: j } = this.opts;
      if (typeof p == "object")
        E = p[j];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let T = this._cache.get(p);
      if (T !== void 0)
        return T;
      $ = (0, l.normalizeId)(E || $);
      const L = l.getSchemaRefs.call(this, p, $);
      return T = new a.SchemaEnv({ schema: p, schemaId: j, meta: S, baseId: $, localRefs: L }), this._cache.set(T.schema, T), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = T), i && this.validateSchema(p, !0), T;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : a.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        a.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  I.ValidationError = n.default, I.MissingRefError = s.default, e.default = I;
  function R(P, p, S, $ = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[$](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function H(P) {
    return P = (0, l.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function Y() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function pe() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function ye(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function we() {
    const P = { ...this.opts };
    for (const p of v)
      delete P[p];
    return P;
  }
  const K = { log() {
  }, warn() {
  }, error() {
  } };
  function B(P) {
    if (P === !1)
      return K;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const ie = /^[a-z_$][a-z0-9_$:-]*$/i;
  function J(P, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(P, ($) => {
      if (S.keywords[$])
        throw new Error(`Keyword ${$} is already defined`);
      if (!ie.test($))
        throw new Error(`Keyword ${$} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function de(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let E = i ? f.post : f.rules.find(({ type: T }) => T === S);
    if (E || (E = { type: S, rules: [] }, f.rules.push(E)), f.keywords[P] = !0, !p)
      return;
    const j = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? Re.call(this, E, j, p.before) : E.rules.push(j), f.all[P] = j, ($ = p.implements) === null || $ === void 0 || $.forEach((T) => this.addKeyword(T));
  }
  function Re(P, p, S) {
    const $ = P.rules.findIndex((i) => i.keyword === S);
    $ >= 0 ? P.rules.splice($, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = V(p)), P.validateSchema = this.compile(p, !0));
  }
  const C = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function V(P) {
    return { anyOf: [P, C] };
  }
})(ku);
var Qa = {}, ei = {}, ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
const T$ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ti.default = T$;
var kt = {};
Object.defineProperty(kt, "__esModule", { value: !0 });
kt.callRef = kt.getValidate = void 0;
const j$ = cn, ol = re, Ge = Z, Dr = Ze, al = qe, ss = M, k$ = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: o, validateName: a, opts: c, self: l } = n, { root: d } = o;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = al.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new j$.default(n.opts.uriResolver, s, r);
    if (u instanceof al.SchemaEnv)
      return b(u);
    return g(u);
    function h() {
      if (o === d)
        return Rs(e, a, o, o.$async);
      const v = t.scopeValue("root", { ref: d });
      return Rs(e, (0, Ge._)`${v}.validate`, d, d.$async);
    }
    function b(v) {
      const _ = Rd(e, v);
      Rs(e, _, v, v.$async);
    }
    function g(v) {
      const _ = t.scopeValue("schema", c.code.source === !0 ? { ref: v, code: (0, Ge.stringify)(v) } : { ref: v }), y = t.name("valid"), m = e.subschema({
        schema: v,
        dataTypes: [],
        schemaPath: Ge.nil,
        topSchemaRef: _,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function Rd(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ge._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
kt.getValidate = Rd;
function Rs(e, t, r, n) {
  const { gen: s, it: o } = e, { allErrors: a, schemaEnv: c, opts: l } = o, d = l.passContext ? Dr.default.this : Ge.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, Ge._)`await ${(0, ol.callValidateCode)(e, t, d)}`), g(t), a || s.assign(v, !0);
    }, (_) => {
      s.if((0, Ge._)`!(${_} instanceof ${o.ValidationError})`, () => s.throw(_)), b(_), a || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, ol.callValidateCode)(e, t, d), () => g(t), () => b(t));
  }
  function b(v) {
    const _ = (0, Ge._)`${v}.errors`;
    s.assign(Dr.default.vErrors, (0, Ge._)`${Dr.default.vErrors} === null ? ${_} : ${Dr.default.vErrors}.concat(${_})`), s.assign(Dr.default.errors, (0, Ge._)`${Dr.default.vErrors}.length`);
  }
  function g(v) {
    var _;
    if (!o.opts.unevaluated)
      return;
    const y = (_ = r == null ? void 0 : r.validate) === null || _ === void 0 ? void 0 : _.evaluated;
    if (o.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (o.props = ss.mergeEvaluated.props(s, y.props, o.props));
      else {
        const m = s.var("props", (0, Ge._)`${v}.evaluated.props`);
        o.props = ss.mergeEvaluated.props(s, m, o.props, Ge.Name);
      }
    if (o.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (o.items = ss.mergeEvaluated.items(s, y.items, o.items));
      else {
        const m = s.var("items", (0, Ge._)`${v}.evaluated.items`);
        o.items = ss.mergeEvaluated.items(s, m, o.items, Ge.Name);
      }
  }
}
kt.callRef = Rs;
kt.default = k$;
Object.defineProperty(ei, "__esModule", { value: !0 });
const A$ = ti, C$ = kt, D$ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  A$.default,
  C$.default
];
ei.default = D$;
var ri = {}, ni = {};
Object.defineProperty(ni, "__esModule", { value: !0 });
const Hs = Z, Ft = Hs.operators, Bs = {
  maximum: { okStr: "<=", ok: Ft.LTE, fail: Ft.GT },
  minimum: { okStr: ">=", ok: Ft.GTE, fail: Ft.LT },
  exclusiveMaximum: { okStr: "<", ok: Ft.LT, fail: Ft.GTE },
  exclusiveMinimum: { okStr: ">", ok: Ft.GT, fail: Ft.LTE }
}, M$ = {
  message: ({ keyword: e, schemaCode: t }) => (0, Hs.str)`must be ${Bs[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Hs._)`{comparison: ${Bs[e].okStr}, limit: ${t}}`
}, F$ = {
  keyword: Object.keys(Bs),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: M$,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Hs._)`${r} ${Bs[t].fail} ${n} || isNaN(${r})`);
  }
};
ni.default = F$;
var si = {};
Object.defineProperty(si, "__esModule", { value: !0 });
const Mn = Z, L$ = {
  message: ({ schemaCode: e }) => (0, Mn.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Mn._)`{multipleOf: ${e}}`
}, V$ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: L$,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, o = s.opts.multipleOfPrecision, a = t.let("res"), c = o ? (0, Mn._)`Math.abs(Math.round(${a}) - ${a}) > 1e-${o}` : (0, Mn._)`${a} !== parseInt(${a})`;
    e.fail$data((0, Mn._)`(${n} === 0 || (${a} = ${r}/${n}, ${c}))`);
  }
};
si.default = V$;
var oi = {}, ai = {};
Object.defineProperty(ai, "__esModule", { value: !0 });
function Td(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
ai.default = Td;
Td.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(oi, "__esModule", { value: !0 });
const vr = Z, z$ = M, U$ = ai, K$ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, vr.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, vr._)`{limit: ${e}}`
}, q$ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: K$,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, o = t === "maxLength" ? vr.operators.GT : vr.operators.LT, a = s.opts.unicode === !1 ? (0, vr._)`${r}.length` : (0, vr._)`${(0, z$.useFunc)(e.gen, U$.default)}(${r})`;
    e.fail$data((0, vr._)`${a} ${o} ${n}`);
  }
};
oi.default = q$;
var ii = {};
Object.defineProperty(ii, "__esModule", { value: !0 });
const G$ = re, H$ = M, xr = Z, B$ = {
  message: ({ schemaCode: e }) => (0, xr.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, xr._)`{pattern: ${e}}`
}, x$ = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: B$,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: o, it: a } = e, c = a.opts.unicodeRegExp ? "u" : "";
    if (n) {
      const { regExp: l } = a.opts.code, d = l.code === "new RegExp" ? (0, xr._)`new RegExp` : (0, H$.useFunc)(t, l), u = t.let("valid");
      t.try(() => t.assign(u, (0, xr._)`${d}(${o}, ${c}).test(${r})`), () => t.assign(u, !1)), e.fail$data((0, xr._)`!${u}`);
    } else {
      const l = (0, G$.usePattern)(e, s);
      e.fail$data((0, xr._)`!${l}.test(${r})`);
    }
  }
};
ii.default = x$;
var ci = {};
Object.defineProperty(ci, "__esModule", { value: !0 });
const Fn = Z, J$ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Fn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Fn._)`{limit: ${e}}`
}, W$ = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: J$,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Fn.operators.GT : Fn.operators.LT;
    e.fail$data((0, Fn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
ci.default = W$;
var li = {};
Object.defineProperty(li, "__esModule", { value: !0 });
const En = re, Ln = Z, X$ = M, Y$ = {
  message: ({ params: { missingProperty: e } }) => (0, Ln.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Ln._)`{missingProperty: ${e}}`
}, Z$ = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Y$,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: o, it: a } = e, { opts: c } = a;
    if (!o && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (a.allErrors ? d() : u(), c.strictRequired) {
      const g = e.parentSchema.properties, { definedProperties: v } = e.it;
      for (const _ of r)
        if ((g == null ? void 0 : g[_]) === void 0 && !v.has(_)) {
          const y = a.schemaEnv.baseId + a.errSchemaPath, m = `required property "${_}" is not defined at "${y}" (strictRequired)`;
          (0, X$.checkStrictMode)(a, m, a.opts.strictRequired);
        }
    }
    function d() {
      if (l || o)
        e.block$data(Ln.nil, h);
      else
        for (const g of r)
          (0, En.checkReportMissingProp)(e, g);
    }
    function u() {
      const g = t.let("missing");
      if (l || o) {
        const v = t.let("valid", !0);
        e.block$data(v, () => b(g, v)), e.ok(v);
      } else
        t.if((0, En.checkMissingProp)(e, r, g)), (0, En.reportMissingProp)(e, g), t.else();
    }
    function h() {
      t.forOf("prop", n, (g) => {
        e.setParams({ missingProperty: g }), t.if((0, En.noPropertyInData)(t, s, g, c.ownProperties), () => e.error());
      });
    }
    function b(g, v) {
      e.setParams({ missingProperty: g }), t.forOf(g, n, () => {
        t.assign(v, (0, En.propertyInData)(t, s, g, c.ownProperties)), t.if((0, Ln.not)(v), () => {
          e.error(), t.break();
        });
      }, Ln.nil);
    }
  }
};
li.default = Z$;
var ui = {};
Object.defineProperty(ui, "__esModule", { value: !0 });
const Vn = Z, Q$ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Vn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Vn._)`{limit: ${e}}`
}, ey = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Q$,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Vn.operators.GT : Vn.operators.LT;
    e.fail$data((0, Vn._)`${r}.length ${s} ${n}`);
  }
};
ui.default = ey;
var di = {}, Xn = {};
Object.defineProperty(Xn, "__esModule", { value: !0 });
const jd = to;
jd.code = 'require("ajv/dist/runtime/equal").default';
Xn.default = jd;
Object.defineProperty(di, "__esModule", { value: !0 });
const Ro = Ee, Pe = Z, ty = M, ry = Xn, ny = {
  message: ({ params: { i: e, j: t } }) => (0, Pe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Pe._)`{i: ${e}, j: ${t}}`
}, sy = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: ny,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: o, schemaCode: a, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = o.items ? (0, Ro.getSchemaTypes)(o.items) : [];
    e.block$data(l, u, (0, Pe._)`${a} === false`), e.ok(l);
    function u() {
      const v = t.let("i", (0, Pe._)`${r}.length`), _ = t.let("j");
      e.setParams({ i: v, j: _ }), t.assign(l, !0), t.if((0, Pe._)`${v} > 1`, () => (h() ? b : g)(v, _));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function b(v, _) {
      const y = t.name("item"), m = (0, Ro.checkDataTypes)(d, y, c.opts.strictNumbers, Ro.DataType.Wrong), w = t.const("indices", (0, Pe._)`{}`);
      t.for((0, Pe._)`;${v}--;`, () => {
        t.let(y, (0, Pe._)`${r}[${v}]`), t.if(m, (0, Pe._)`continue`), d.length > 1 && t.if((0, Pe._)`typeof ${y} == "string"`, (0, Pe._)`${y} += "_"`), t.if((0, Pe._)`typeof ${w}[${y}] == "number"`, () => {
          t.assign(_, (0, Pe._)`${w}[${y}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Pe._)`${w}[${y}] = ${v}`);
      });
    }
    function g(v, _) {
      const y = (0, ty.useFunc)(t, ry.default), m = t.name("outer");
      t.label(m).for((0, Pe._)`;${v}--;`, () => t.for((0, Pe._)`${_} = ${v}; ${_}--;`, () => t.if((0, Pe._)`${y}(${r}[${v}], ${r}[${_}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
di.default = sy;
var fi = {};
Object.defineProperty(fi, "__esModule", { value: !0 });
const ta = Z, oy = M, ay = Xn, iy = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, ta._)`{allowedValue: ${e}}`
}, cy = {
  keyword: "const",
  $data: !0,
  error: iy,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: o } = e;
    n || o && typeof o == "object" ? e.fail$data((0, ta._)`!${(0, oy.useFunc)(t, ay.default)}(${r}, ${s})`) : e.fail((0, ta._)`${o} !== ${r}`);
  }
};
fi.default = cy;
var hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
const Nn = Z, ly = M, uy = Xn, dy = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Nn._)`{allowedValues: ${e}}`
}, fy = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: dy,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: o, it: a } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= a.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, ly.useFunc)(t, uy.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const g = t.const("vSchema", o);
      u = (0, Nn.or)(...s.map((v, _) => b(g, _)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", o, (g) => t.if((0, Nn._)`${d()}(${r}, ${g})`, () => t.assign(u, !0).break()));
    }
    function b(g, v) {
      const _ = s[v];
      return typeof _ == "object" && _ !== null ? (0, Nn._)`${d()}(${r}, ${g}[${v}])` : (0, Nn._)`${r} === ${_}`;
    }
  }
};
hi.default = fy;
Object.defineProperty(ri, "__esModule", { value: !0 });
const hy = ni, my = si, py = oi, $y = ii, yy = ci, gy = li, _y = ui, vy = di, wy = fi, Ey = hi, by = [
  // number
  hy.default,
  my.default,
  // string
  py.default,
  $y.default,
  // object
  yy.default,
  gy.default,
  // array
  _y.default,
  vy.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  wy.default,
  Ey.default
];
ri.default = by;
var mi = {}, un = {};
Object.defineProperty(un, "__esModule", { value: !0 });
un.validateAdditionalItems = void 0;
const wr = Z, ra = M, Sy = {
  message: ({ params: { len: e } }) => (0, wr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, wr._)`{limit: ${e}}`
}, Py = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Sy,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, ra.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    kd(e, n);
  }
};
function kd(e, t) {
  const { gen: r, schema: n, data: s, keyword: o, it: a } = e;
  a.items = !0;
  const c = r.const("len", (0, wr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, wr._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, ra.alwaysValidSchema)(a, n)) {
    const d = r.var("valid", (0, wr._)`${c} <= ${t.length}`);
    r.if((0, wr.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: o, dataProp: u, dataPropType: ra.Type.Num }, d), a.allErrors || r.if((0, wr.not)(d), () => r.break());
    });
  }
}
un.validateAdditionalItems = kd;
un.default = Py;
var pi = {}, dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
dn.validateTuple = void 0;
const il = Z, Ts = M, Oy = re, Ny = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Ad(e, "additionalItems", t);
    r.items = !0, !(0, Ts.alwaysValidSchema)(r, t) && e.ok((0, Oy.validateArray)(e));
  }
};
function Ad(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: o, keyword: a, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = Ts.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, il._)`${o}.length`);
  r.forEach((h, b) => {
    (0, Ts.alwaysValidSchema)(c, h) || (n.if((0, il._)`${d} > ${b}`, () => e.subschema({
      keyword: a,
      schemaProp: b,
      dataProp: b
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: b, errSchemaPath: g } = c, v = r.length, _ = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (b.strictTuples && !_) {
      const y = `"${a}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${g}"`;
      (0, Ts.checkStrictMode)(c, y, b.strictTuples);
    }
  }
}
dn.validateTuple = Ad;
dn.default = Ny;
Object.defineProperty(pi, "__esModule", { value: !0 });
const Iy = dn, Ry = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Iy.validateTuple)(e, "items")
};
pi.default = Ry;
var $i = {};
Object.defineProperty($i, "__esModule", { value: !0 });
const cl = Z, Ty = M, jy = re, ky = un, Ay = {
  message: ({ params: { len: e } }) => (0, cl.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, cl._)`{limit: ${e}}`
}, Cy = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Ay,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Ty.alwaysValidSchema)(n, t) && (s ? (0, ky.validateAdditionalItems)(e, s) : e.ok((0, jy.validateArray)(e)));
  }
};
$i.default = Cy;
var yi = {};
Object.defineProperty(yi, "__esModule", { value: !0 });
const et = Z, os = M, Dy = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, et.str)`must contain at least ${e} valid item(s)` : (0, et.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, et._)`{minContains: ${e}}` : (0, et._)`{minContains: ${e}, maxContains: ${t}}`
}, My = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Dy,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: o } = e;
    let a, c;
    const { minContains: l, maxContains: d } = n;
    o.opts.next ? (a = l === void 0 ? 1 : l, c = d) : a = 1;
    const u = t.const("len", (0, et._)`${s}.length`);
    if (e.setParams({ min: a, max: c }), c === void 0 && a === 0) {
      (0, os.checkStrictMode)(o, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && a > c) {
      (0, os.checkStrictMode)(o, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, os.alwaysValidSchema)(o, r)) {
      let _ = (0, et._)`${u} >= ${a}`;
      c !== void 0 && (_ = (0, et._)`${_} && ${u} <= ${c}`), e.pass(_);
      return;
    }
    o.items = !0;
    const h = t.name("valid");
    c === void 0 && a === 1 ? g(h, () => t.if(h, () => t.break())) : a === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, et._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
    function b() {
      const _ = t.name("_valid"), y = t.let("count", 0);
      g(_, () => t.if(_, () => v(y)));
    }
    function g(_, y) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: os.Type.Num,
          compositeRule: !0
        }, _), y();
      });
    }
    function v(_) {
      t.code((0, et._)`${_}++`), c === void 0 ? t.if((0, et._)`${_} >= ${a}`, () => t.assign(h, !0).break()) : (t.if((0, et._)`${_} > ${c}`, () => t.assign(h, !1).break()), a === 1 ? t.assign(h, !0) : t.if((0, et._)`${_} >= ${a}`, () => t.assign(h, !0)));
    }
  }
};
yi.default = My;
var oo = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = Z, r = M, n = re;
  e.error = {
    message: ({ params: { property: l, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${l},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${u}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [d, u] = o(l);
      a(l, d), c(l, u);
    }
  };
  function o({ schema: l }) {
    const d = {}, u = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const b = Array.isArray(l[h]) ? d : u;
      b[h] = l[h];
    }
    return [d, u];
  }
  function a(l, d = l.schema) {
    const { gen: u, data: h, it: b } = l;
    if (Object.keys(d).length === 0)
      return;
    const g = u.let("missing");
    for (const v in d) {
      const _ = d[v];
      if (_.length === 0)
        continue;
      const y = (0, n.propertyInData)(u, h, v, b.opts.ownProperties);
      l.setParams({
        property: v,
        depsCount: _.length,
        deps: _.join(", ")
      }), b.allErrors ? u.if(y, () => {
        for (const m of _)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${y} && (${(0, n.checkMissingProp)(l, _, g)})`), (0, n.reportMissingProp)(l, g), u.else());
    }
  }
  e.validatePropertyDeps = a;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: b, it: g } = l, v = u.name("valid");
    for (const _ in d)
      (0, r.alwaysValidSchema)(g, d[_]) || (u.if(
        (0, n.propertyInData)(u, h, _, g.opts.ownProperties),
        () => {
          const y = l.subschema({ keyword: b, schemaProp: _ }, v);
          l.mergeValidEvaluated(y, v);
        },
        () => u.var(v, !0)
        // TODO var
      ), l.ok(v));
  }
  e.validateSchemaDeps = c, e.default = s;
})(oo);
var gi = {};
Object.defineProperty(gi, "__esModule", { value: !0 });
const Cd = Z, Fy = M, Ly = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Cd._)`{propertyName: ${e.propertyName}}`
}, Vy = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Ly,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Fy.alwaysValidSchema)(s, r))
      return;
    const o = t.name("valid");
    t.forIn("key", n, (a) => {
      e.setParams({ propertyName: a }), e.subschema({
        keyword: "propertyNames",
        data: a,
        dataTypes: ["string"],
        propertyName: a,
        compositeRule: !0
      }, o), t.if((0, Cd.not)(o), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(o);
  }
};
gi.default = Vy;
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const as = re, at = Z, zy = Ze, is = M, Uy = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, at._)`{additionalProperty: ${e.additionalProperty}}`
}, Ky = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Uy,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: o, it: a } = e;
    if (!o)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = a;
    if (a.props = !0, l.removeAdditional !== "all" && (0, is.alwaysValidSchema)(a, r))
      return;
    const d = (0, as.allSchemaProperties)(n.properties), u = (0, as.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, at._)`${o} === ${zy.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(b(y), () => v(y));
      });
    }
    function b(y) {
      let m;
      if (d.length > 8) {
        const w = (0, is.schemaRefOrVal)(a, n.properties, "properties");
        m = (0, as.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, at.or)(...d.map((w) => (0, at._)`${y} === ${w}`)) : m = at.nil;
      return u.length && (m = (0, at.or)(m, ...u.map((w) => (0, at._)`${(0, as.usePattern)(e, w)}.test(${y})`))), (0, at.not)(m);
    }
    function g(y) {
      t.code((0, at._)`delete ${s}[${y}]`);
    }
    function v(y) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        g(y);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: y }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, is.alwaysValidSchema)(a, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (_(y, m, !1), t.if((0, at.not)(m), () => {
          e.reset(), g(y);
        })) : (_(y, m), c || t.if((0, at.not)(m), () => t.break()));
      }
    }
    function _(y, m, w) {
      const O = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: is.Type.Str
      };
      w === !1 && Object.assign(O, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(O, m);
    }
  }
};
ao.default = Ky;
var _i = {};
Object.defineProperty(_i, "__esModule", { value: !0 });
const qy = dt, ll = re, To = M, ul = ao, Gy = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: o } = e;
    o.opts.removeAdditional === "all" && n.additionalProperties === void 0 && ul.default.code(new qy.KeywordCxt(o, ul.default, "additionalProperties"));
    const a = (0, ll.allSchemaProperties)(r);
    for (const h of a)
      o.definedProperties.add(h);
    o.opts.unevaluated && a.length && o.props !== !0 && (o.props = To.mergeEvaluated.props(t, (0, To.toHash)(a), o.props));
    const c = a.filter((h) => !(0, To.alwaysValidSchema)(o, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, ll.propertyInData)(t, s, h, o.opts.ownProperties)), u(h), o.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function d(h) {
      return o.opts.useDefaults && !o.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
_i.default = Gy;
var vi = {};
Object.defineProperty(vi, "__esModule", { value: !0 });
const dl = re, cs = Z, fl = M, hl = M, Hy = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: o } = e, { opts: a } = o, c = (0, dl.allSchemaProperties)(r), l = c.filter((_) => (0, fl.alwaysValidSchema)(o, r[_]));
    if (c.length === 0 || l.length === c.length && (!o.opts.unevaluated || o.props === !0))
      return;
    const d = a.strictSchema && !a.allowMatchingProperties && s.properties, u = t.name("valid");
    o.props !== !0 && !(o.props instanceof cs.Name) && (o.props = (0, hl.evaluatedPropsToName)(t, o.props));
    const { props: h } = o;
    b();
    function b() {
      for (const _ of c)
        d && g(_), o.allErrors ? v(_) : (t.var(u, !0), v(_), t.if(u));
    }
    function g(_) {
      for (const y in d)
        new RegExp(_).test(y) && (0, fl.checkStrictMode)(o, `property ${y} matches pattern ${_} (use allowMatchingProperties)`);
    }
    function v(_) {
      t.forIn("key", n, (y) => {
        t.if((0, cs._)`${(0, dl.usePattern)(e, _)}.test(${y})`, () => {
          const m = l.includes(_);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: _,
            dataProp: y,
            dataPropType: hl.Type.Str
          }, u), o.opts.unevaluated && h !== !0 ? t.assign((0, cs._)`${h}[${y}]`, !0) : !m && !o.allErrors && t.if((0, cs.not)(u), () => t.break());
        });
      });
    }
  }
};
vi.default = Hy;
var wi = {};
Object.defineProperty(wi, "__esModule", { value: !0 });
const By = M, xy = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, By.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
wi.default = xy;
var Ei = {};
Object.defineProperty(Ei, "__esModule", { value: !0 });
const Jy = re, Wy = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Jy.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Ei.default = Wy;
var bi = {};
Object.defineProperty(bi, "__esModule", { value: !0 });
const js = Z, Xy = M, Yy = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, js._)`{passingSchemas: ${e.passing}}`
}, Zy = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Yy,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const o = r, a = t.let("valid", !1), c = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: c }), t.block(d), e.result(a, () => e.reset(), () => e.error(!0));
    function d() {
      o.forEach((u, h) => {
        let b;
        (0, Xy.alwaysValidSchema)(s, u) ? t.var(l, !0) : b = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, js._)`${l} && ${a}`).assign(a, !1).assign(c, (0, js._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(a, !0), t.assign(c, h), b && e.mergeEvaluated(b, js.Name);
        });
      });
    }
  }
};
bi.default = Zy;
var Si = {};
Object.defineProperty(Si, "__esModule", { value: !0 });
const Qy = M, e0 = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((o, a) => {
      if ((0, Qy.alwaysValidSchema)(n, o))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: a }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
Si.default = e0;
var Pi = {};
Object.defineProperty(Pi, "__esModule", { value: !0 });
const xs = Z, Dd = M, t0 = {
  message: ({ params: e }) => (0, xs.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, xs._)`{failingKeyword: ${e.ifClause}}`
}, r0 = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: t0,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Dd.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = ml(n, "then"), o = ml(n, "else");
    if (!s && !o)
      return;
    const a = t.let("valid", !0), c = t.name("_valid");
    if (l(), e.reset(), s && o) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(c, d("then", u), d("else", u));
    } else s ? t.if(c, d("then")) : t.if((0, xs.not)(c), d("else"));
    e.pass(a, () => e.error(!0));
    function l() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const b = e.subschema({ keyword: u }, c);
        t.assign(a, c), e.mergeValidEvaluated(b, a), h ? t.assign(h, (0, xs._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function ml(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Dd.alwaysValidSchema)(e, r);
}
Pi.default = r0;
var Oi = {};
Object.defineProperty(Oi, "__esModule", { value: !0 });
const n0 = M, s0 = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, n0.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Oi.default = s0;
Object.defineProperty(mi, "__esModule", { value: !0 });
const o0 = un, a0 = pi, i0 = dn, c0 = $i, l0 = yi, u0 = oo, d0 = gi, f0 = ao, h0 = _i, m0 = vi, p0 = wi, $0 = Ei, y0 = bi, g0 = Si, _0 = Pi, v0 = Oi;
function w0(e = !1) {
  const t = [
    // any
    p0.default,
    $0.default,
    y0.default,
    g0.default,
    _0.default,
    v0.default,
    // object
    d0.default,
    f0.default,
    u0.default,
    h0.default,
    m0.default
  ];
  return e ? t.push(a0.default, c0.default) : t.push(o0.default, i0.default), t.push(l0.default), t;
}
mi.default = w0;
var Ni = {}, fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
fn.dynamicAnchor = void 0;
const jo = Z, E0 = Ze, pl = qe, b0 = kt, S0 = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Md(e, e.schema)
};
function Md(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, jo._)`${E0.default.dynamicAnchors}${(0, jo.getProperty)(t)}`, o = n.errSchemaPath === "#" ? n.validateName : P0(e);
  r.if((0, jo._)`!${s}`, () => r.assign(s, o));
}
fn.dynamicAnchor = Md;
function P0(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: o, localRefs: a, meta: c } = t.root, { schemaId: l } = n.opts, d = new pl.SchemaEnv({ schema: r, schemaId: l, root: s, baseId: o, localRefs: a, meta: c });
  return pl.compileSchema.call(n, d), (0, b0.getValidate)(e, d);
}
fn.default = S0;
var hn = {};
Object.defineProperty(hn, "__esModule", { value: !0 });
hn.dynamicRef = void 0;
const $l = Z, O0 = Ze, yl = kt, N0 = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Fd(e, e.schema)
};
function Fd(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const o = t.slice(1);
  if (s.allErrors)
    a();
  else {
    const l = r.let("valid", !1);
    a(l), e.ok(l);
  }
  function a(l) {
    if (s.schemaEnv.root.dynamicAnchors[o]) {
      const d = r.let("_v", (0, $l._)`${O0.default.dynamicAnchors}${(0, $l.getProperty)(o)}`);
      r.if(d, c(d, l), c(s.validateName, l));
    } else
      c(s.validateName, l)();
  }
  function c(l, d) {
    return d ? () => r.block(() => {
      (0, yl.callRef)(e, l), r.let(d, !0);
    }) : () => (0, yl.callRef)(e, l);
  }
}
hn.dynamicRef = Fd;
hn.default = N0;
var Ii = {};
Object.defineProperty(Ii, "__esModule", { value: !0 });
const I0 = fn, R0 = M, T0 = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, I0.dynamicAnchor)(e, "") : (0, R0.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
Ii.default = T0;
var Ri = {};
Object.defineProperty(Ri, "__esModule", { value: !0 });
const j0 = hn, k0 = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, j0.dynamicRef)(e, e.schema)
};
Ri.default = k0;
Object.defineProperty(Ni, "__esModule", { value: !0 });
const A0 = fn, C0 = hn, D0 = Ii, M0 = Ri, F0 = [A0.default, C0.default, D0.default, M0.default];
Ni.default = F0;
var Ti = {}, ji = {};
Object.defineProperty(ji, "__esModule", { value: !0 });
const gl = oo, L0 = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: gl.error,
  code: (e) => (0, gl.validatePropertyDeps)(e)
};
ji.default = L0;
var ki = {};
Object.defineProperty(ki, "__esModule", { value: !0 });
const V0 = oo, z0 = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, V0.validateSchemaDeps)(e)
};
ki.default = z0;
var Ai = {};
Object.defineProperty(Ai, "__esModule", { value: !0 });
const U0 = M, K0 = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, U0.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
Ai.default = K0;
Object.defineProperty(Ti, "__esModule", { value: !0 });
const q0 = ji, G0 = ki, H0 = Ai, B0 = [q0.default, G0.default, H0.default];
Ti.default = B0;
var Ci = {}, Di = {};
Object.defineProperty(Di, "__esModule", { value: !0 });
const Ut = Z, _l = M, x0 = Ze, J0 = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Ut._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, W0 = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: J0,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: o } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: a, props: c } = o;
    c instanceof Ut.Name ? t.if((0, Ut._)`${c} !== true`, () => t.forIn("key", n, (h) => t.if(d(c, h), () => l(h)))) : c !== !0 && t.forIn("key", n, (h) => c === void 0 ? l(h) : t.if(u(c, h), () => l(h))), o.props = !0, e.ok((0, Ut._)`${s} === ${x0.default.errors}`);
    function l(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), a || t.break();
        return;
      }
      if (!(0, _l.alwaysValidSchema)(o, r)) {
        const b = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: _l.Type.Str
        }, b), a || t.if((0, Ut.not)(b), () => t.break());
      }
    }
    function d(h, b) {
      return (0, Ut._)`!${h} || !${h}[${b}]`;
    }
    function u(h, b) {
      const g = [];
      for (const v in h)
        h[v] === !0 && g.push((0, Ut._)`${b} !== ${v}`);
      return (0, Ut.and)(...g);
    }
  }
};
Di.default = W0;
var Mi = {};
Object.defineProperty(Mi, "__esModule", { value: !0 });
const Er = Z, vl = M, X0 = {
  message: ({ params: { len: e } }) => (0, Er.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Er._)`{limit: ${e}}`
}, Y0 = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: X0,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, o = s.items || 0;
    if (o === !0)
      return;
    const a = t.const("len", (0, Er._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: o }), e.fail((0, Er._)`${a} > ${o}`);
    else if (typeof r == "object" && !(0, vl.alwaysValidSchema)(s, r)) {
      const l = t.var("valid", (0, Er._)`${a} <= ${o}`);
      t.if((0, Er.not)(l), () => c(l, o)), e.ok(l);
    }
    s.items = !0;
    function c(l, d) {
      t.forRange("i", d, a, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: vl.Type.Num }, l), s.allErrors || t.if((0, Er.not)(l), () => t.break());
      });
    }
  }
};
Mi.default = Y0;
Object.defineProperty(Ci, "__esModule", { value: !0 });
const Z0 = Di, Q0 = Mi, eg = [Z0.default, Q0.default];
Ci.default = eg;
var Fi = {}, Li = {};
Object.defineProperty(Li, "__esModule", { value: !0 });
const _e = Z, tg = {
  message: ({ schemaCode: e }) => (0, _e.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, _e._)`{format: ${e}}`
}, rg = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: tg,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: o, schemaCode: a, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? b() : g();
    function b() {
      const v = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), _ = r.const("fDef", (0, _e._)`${v}[${a}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, _e._)`typeof ${_} == "object" && !(${_} instanceof RegExp)`, () => r.assign(y, (0, _e._)`${_}.type || "string"`).assign(m, (0, _e._)`${_}.validate`), () => r.assign(y, (0, _e._)`"string"`).assign(m, _)), e.fail$data((0, _e.or)(w(), O()));
      function w() {
        return l.strictSchema === !1 ? _e.nil : (0, _e._)`${a} && !${m}`;
      }
      function O() {
        const I = u.$async ? (0, _e._)`(${_}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, _e._)`${m}(${n})`, R = (0, _e._)`(typeof ${m} == "function" ? ${I} : ${m}.test(${n}))`;
        return (0, _e._)`${m} && ${m} !== true && ${y} === ${t} && !${R}`;
      }
    }
    function g() {
      const v = h.formats[o];
      if (!v) {
        w();
        return;
      }
      if (v === !0)
        return;
      const [_, y, m] = O(v);
      _ === t && e.pass(I());
      function w() {
        if (l.strictSchema === !1) {
          h.logger.warn(R());
          return;
        }
        throw new Error(R());
        function R() {
          return `unknown format "${o}" ignored in schema at path "${d}"`;
        }
      }
      function O(R) {
        const H = R instanceof RegExp ? (0, _e.regexpCode)(R) : l.code.formats ? (0, _e._)`${l.code.formats}${(0, _e.getProperty)(o)}` : void 0, Y = r.scopeValue("formats", { key: o, ref: R, code: H });
        return typeof R == "object" && !(R instanceof RegExp) ? [R.type || "string", R.validate, (0, _e._)`${Y}.validate`] : ["string", R, Y];
      }
      function I() {
        if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, _e._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, _e._)`${m}(${n})` : (0, _e._)`${m}.test(${n})`;
      }
    }
  }
};
Li.default = rg;
Object.defineProperty(Fi, "__esModule", { value: !0 });
const ng = Li, sg = [ng.default];
Fi.default = sg;
var nn = {};
Object.defineProperty(nn, "__esModule", { value: !0 });
nn.contentVocabulary = nn.metadataVocabulary = void 0;
nn.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
nn.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Qa, "__esModule", { value: !0 });
const og = ei, ag = ri, ig = mi, cg = Ni, lg = Ti, ug = Ci, dg = Fi, wl = nn, fg = [
  cg.default,
  og.default,
  ag.default,
  (0, ig.default)(!0),
  dg.default,
  wl.metadataVocabulary,
  wl.contentVocabulary,
  lg.default,
  ug.default
];
Qa.default = fg;
var Vi = {}, io = {};
Object.defineProperty(io, "__esModule", { value: !0 });
io.DiscrError = void 0;
var El;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(El || (io.DiscrError = El = {}));
Object.defineProperty(Vi, "__esModule", { value: !0 });
const zr = Z, na = io, bl = qe, hg = cn, mg = M, pg = {
  message: ({ params: { discrError: e, tagName: t } }) => e === na.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, zr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, $g = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: pg,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: o } = e, { oneOf: a } = s;
    if (!o.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const c = n.propertyName;
    if (typeof c != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!a)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), d = t.const("tag", (0, zr._)`${r}${(0, zr.getProperty)(c)}`);
    t.if((0, zr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: na.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const g = b();
      t.if(!1);
      for (const v in g)
        t.elseIf((0, zr._)`${d} === ${v}`), t.assign(l, h(g[v]));
      t.else(), e.error(!1, { discrError: na.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h(g) {
      const v = t.name("valid"), _ = e.subschema({ keyword: "oneOf", schemaProp: g }, v);
      return e.mergeEvaluated(_, zr.Name), v;
    }
    function b() {
      var g;
      const v = {}, _ = m(s);
      let y = !0;
      for (let I = 0; I < a.length; I++) {
        let R = a[I];
        if (R != null && R.$ref && !(0, mg.schemaHasRulesButRef)(R, o.self.RULES)) {
          const Y = R.$ref;
          if (R = bl.resolveRef.call(o.self, o.schemaEnv.root, o.baseId, Y), R instanceof bl.SchemaEnv && (R = R.schema), R === void 0)
            throw new hg.default(o.opts.uriResolver, o.baseId, Y);
        }
        const H = (g = R == null ? void 0 : R.properties) === null || g === void 0 ? void 0 : g[c];
        if (typeof H != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        y = y && (_ || m(R)), w(H, I);
      }
      if (!y)
        throw new Error(`discriminator: "${c}" must be required`);
      return v;
      function m({ required: I }) {
        return Array.isArray(I) && I.includes(c);
      }
      function w(I, R) {
        if (I.const)
          O(I.const, R);
        else if (I.enum)
          for (const H of I.enum)
            O(H, R);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function O(I, R) {
        if (typeof I != "string" || I in v)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        v[I] = R;
      }
    }
  }
};
Vi.default = $g;
var zi = {};
const yg = "https://json-schema.org/draft/2020-12/schema", gg = "https://json-schema.org/draft/2020-12/schema", _g = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, vg = "meta", wg = "Core and Validation specifications meta-schema", Eg = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], bg = [
  "object",
  "boolean"
], Sg = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Pg = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, Og = {
  $schema: yg,
  $id: gg,
  $vocabulary: _g,
  $dynamicAnchor: vg,
  title: wg,
  allOf: Eg,
  type: bg,
  $comment: Sg,
  properties: Pg
}, Ng = "https://json-schema.org/draft/2020-12/schema", Ig = "https://json-schema.org/draft/2020-12/meta/applicator", Rg = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, Tg = "meta", jg = "Applicator vocabulary meta-schema", kg = [
  "object",
  "boolean"
], Ag = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, Cg = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, Dg = {
  $schema: Ng,
  $id: Ig,
  $vocabulary: Rg,
  $dynamicAnchor: Tg,
  title: jg,
  type: kg,
  properties: Ag,
  $defs: Cg
}, Mg = "https://json-schema.org/draft/2020-12/schema", Fg = "https://json-schema.org/draft/2020-12/meta/unevaluated", Lg = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, Vg = "meta", zg = "Unevaluated applicator vocabulary meta-schema", Ug = [
  "object",
  "boolean"
], Kg = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, qg = {
  $schema: Mg,
  $id: Fg,
  $vocabulary: Lg,
  $dynamicAnchor: Vg,
  title: zg,
  type: Ug,
  properties: Kg
}, Gg = "https://json-schema.org/draft/2020-12/schema", Hg = "https://json-schema.org/draft/2020-12/meta/content", Bg = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, xg = "meta", Jg = "Content vocabulary meta-schema", Wg = [
  "object",
  "boolean"
], Xg = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Yg = {
  $schema: Gg,
  $id: Hg,
  $vocabulary: Bg,
  $dynamicAnchor: xg,
  title: Jg,
  type: Wg,
  properties: Xg
}, Zg = "https://json-schema.org/draft/2020-12/schema", Qg = "https://json-schema.org/draft/2020-12/meta/core", e_ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, t_ = "meta", r_ = "Core vocabulary meta-schema", n_ = [
  "object",
  "boolean"
], s_ = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, o_ = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, a_ = {
  $schema: Zg,
  $id: Qg,
  $vocabulary: e_,
  $dynamicAnchor: t_,
  title: r_,
  type: n_,
  properties: s_,
  $defs: o_
}, i_ = "https://json-schema.org/draft/2020-12/schema", c_ = "https://json-schema.org/draft/2020-12/meta/format-annotation", l_ = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, u_ = "meta", d_ = "Format vocabulary meta-schema for annotation results", f_ = [
  "object",
  "boolean"
], h_ = {
  format: {
    type: "string"
  }
}, m_ = {
  $schema: i_,
  $id: c_,
  $vocabulary: l_,
  $dynamicAnchor: u_,
  title: d_,
  type: f_,
  properties: h_
}, p_ = "https://json-schema.org/draft/2020-12/schema", $_ = "https://json-schema.org/draft/2020-12/meta/meta-data", y_ = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, g_ = "meta", __ = "Meta-data vocabulary meta-schema", v_ = [
  "object",
  "boolean"
], w_ = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, E_ = {
  $schema: p_,
  $id: $_,
  $vocabulary: y_,
  $dynamicAnchor: g_,
  title: __,
  type: v_,
  properties: w_
}, b_ = "https://json-schema.org/draft/2020-12/schema", S_ = "https://json-schema.org/draft/2020-12/meta/validation", P_ = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, O_ = "meta", N_ = "Validation vocabulary meta-schema", I_ = [
  "object",
  "boolean"
], R_ = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, T_ = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, j_ = {
  $schema: b_,
  $id: S_,
  $vocabulary: P_,
  $dynamicAnchor: O_,
  title: N_,
  type: I_,
  properties: R_,
  $defs: T_
};
Object.defineProperty(zi, "__esModule", { value: !0 });
const k_ = Og, A_ = Dg, C_ = qg, D_ = Yg, M_ = a_, F_ = m_, L_ = E_, V_ = j_, z_ = ["/properties"];
function U_(e) {
  return [
    k_,
    A_,
    C_,
    D_,
    M_,
    t(this, F_),
    L_,
    t(this, V_)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, z_) : n;
  }
}
zi.default = U_;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = ku, n = Qa, s = Vi, o = zi, a = "https://json-schema.org/draft/2020-12/schema";
  class c extends r.default {
    constructor(g = {}) {
      super({
        ...g,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: g, meta: v } = this.opts;
      v && (o.default.call(this, g), this.refs["http://json-schema.org/schema"] = a);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(a) ? a : void 0);
    }
  }
  t.Ajv2020 = c, e.exports = t = c, e.exports.Ajv2020 = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var l = dt;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var d = Z;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var u = Wn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = cn;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Jo, Jo.exports);
var K_ = Jo.exports, sa = { exports: {} }, Ld = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(K, B) {
    return { validate: K, compare: B };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(o, a),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(l(!0), d),
    "date-time": t(b(!0), g),
    "iso-time": t(l(), u),
    "iso-date-time": t(b(), v),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: m,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: we,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: O,
    // signed 32 bit integer
    int32: { type: "number", validate: H },
    // signed 64 bit integer
    int64: { type: "number", validate: Y },
    // C-type float
    float: { type: "number", validate: pe },
    // C-type double
    double: { type: "number", validate: pe },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, a),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, g),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, u),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, v),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function r(K) {
    return K % 4 === 0 && (K % 100 !== 0 || K % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function o(K) {
    const B = n.exec(K);
    if (!B)
      return !1;
    const ie = +B[1], J = +B[2], de = +B[3];
    return J >= 1 && J <= 12 && de >= 1 && de <= (J === 2 && r(ie) ? 29 : s[J]);
  }
  function a(K, B) {
    if (K && B)
      return K > B ? 1 : K < B ? -1 : 0;
  }
  const c = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(K) {
    return function(ie) {
      const J = c.exec(ie);
      if (!J)
        return !1;
      const de = +J[1], Re = +J[2], D = +J[3], C = J[4], V = J[5] === "-" ? -1 : 1, P = +(J[6] || 0), p = +(J[7] || 0);
      if (P > 23 || p > 59 || K && !C)
        return !1;
      if (de <= 23 && Re <= 59 && D < 60)
        return !0;
      const S = Re - p * V, $ = de - P * V - (S < 0 ? 1 : 0);
      return ($ === 23 || $ === -1) && (S === 59 || S === -1) && D < 61;
    };
  }
  function d(K, B) {
    if (!(K && B))
      return;
    const ie = (/* @__PURE__ */ new Date("2020-01-01T" + K)).valueOf(), J = (/* @__PURE__ */ new Date("2020-01-01T" + B)).valueOf();
    if (ie && J)
      return ie - J;
  }
  function u(K, B) {
    if (!(K && B))
      return;
    const ie = c.exec(K), J = c.exec(B);
    if (ie && J)
      return K = ie[1] + ie[2] + ie[3], B = J[1] + J[2] + J[3], K > B ? 1 : K < B ? -1 : 0;
  }
  const h = /t|\s/i;
  function b(K) {
    const B = l(K);
    return function(J) {
      const de = J.split(h);
      return de.length === 2 && o(de[0]) && B(de[1]);
    };
  }
  function g(K, B) {
    if (!(K && B))
      return;
    const ie = new Date(K).valueOf(), J = new Date(B).valueOf();
    if (ie && J)
      return ie - J;
  }
  function v(K, B) {
    if (!(K && B))
      return;
    const [ie, J] = K.split(h), [de, Re] = B.split(h), D = a(ie, de);
    if (D !== void 0)
      return D || d(J, Re);
  }
  const _ = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(K) {
    return _.test(K) && y.test(K);
  }
  const w = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function O(K) {
    return w.lastIndex = 0, w.test(K);
  }
  const I = -2147483648, R = 2 ** 31 - 1;
  function H(K) {
    return Number.isInteger(K) && K <= R && K >= I;
  }
  function Y(K) {
    return Number.isInteger(K);
  }
  function pe() {
    return !0;
  }
  const ye = /[^\\]\\Z/;
  function we(K) {
    if (ye.test(K))
      return !1;
    try {
      return new RegExp(K), !0;
    } catch {
      return !1;
    }
  }
})(Ld);
var Vd = {}, oa = { exports: {} }, zd = {}, ft = {}, sn = {}, Yn = {}, te = {}, Bn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(w) {
      if (super(), !e.IDENTIFIER.test(w))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(w) {
      super(), this._items = typeof w == "string" ? [w] : w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const w = this._items[0];
      return w === "" || w === '""';
    }
    get str() {
      var w;
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((O, I) => `${O}${I}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((O, I) => (I instanceof r && (O[I.str] = (O[I.str] || 0) + 1), O), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const O = [m[0]];
    let I = 0;
    for (; I < w.length; )
      c(O, w[I]), O.push(m[++I]);
    return new n(O);
  }
  e._ = s;
  const o = new n("+");
  function a(m, ...w) {
    const O = [g(m[0])];
    let I = 0;
    for (; I < w.length; )
      O.push(o), c(O, w[I]), O.push(o, g(m[++I]));
    return l(O), new n(O);
  }
  e.str = a;
  function c(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(h(w));
  }
  e.addCodeArg = c;
  function l(m) {
    let w = 1;
    for (; w < m.length - 1; ) {
      if (m[w] === o) {
        const O = d(m[w - 1], m[w + 1]);
        if (O !== void 0) {
          m.splice(w - 1, 3, O);
          continue;
        }
        m[w++] = "+";
      }
      w++;
    }
  }
  function d(m, w) {
    if (w === '""')
      return m;
    if (m === '""')
      return w;
    if (typeof m == "string")
      return w instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof w != "string" ? `${m.slice(0, -1)}${w}"` : w[0] === '"' ? m.slice(0, -1) + w.slice(1) : void 0;
    if (typeof w == "string" && w[0] === '"' && !(m instanceof r))
      return `"${m}${w.slice(1)}`;
  }
  function u(m, w) {
    return w.emptyStr() ? m : m.emptyStr() ? w : a`${m}${w}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : g(Array.isArray(m) ? m.join(",") : m);
  }
  function b(m) {
    return new n(g(m));
  }
  e.stringify = b;
  function g(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = g;
  function v(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = v;
  function _(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = _;
  function y(m) {
    return new n(m.toString());
  }
  e.regexpCode = y;
})(Bn);
var aa = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Bn;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: u } = {}) {
      this._names = {}, this._prefixes = d, this._parent = u;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const u = this._names[d] || this._nameGroup(d);
      return `${d}${u.index++}`;
    }
    _nameGroup(d) {
      var u, h;
      if (!((h = (u = this._parent) === null || u === void 0 ? void 0 : u._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class o extends t.Name {
    constructor(d, u) {
      super(u), this.prefix = d;
    }
    setValue(d, { property: u, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(u)}[${h}]`;
    }
  }
  e.ValueScopeName = o;
  const a = (0, t._)`\n`;
  class c extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? a : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new o(d, this._newName(d));
    }
    value(d, u) {
      var h;
      if (u.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const b = this.toName(d), { prefix: g } = b, v = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let _ = this._values[g];
      if (_) {
        const w = _.get(v);
        if (w)
          return w;
      } else
        _ = this._values[g] = /* @__PURE__ */ new Map();
      _.set(v, b);
      const y = this._scope[g] || (this._scope[g] = []), m = y.length;
      return y[m] = u.ref, b.setValue(u, { property: g, itemIndex: m }), b;
    }
    getValue(d, u) {
      const h = this._values[d];
      if (h)
        return h.get(u);
    }
    scopeRefs(d, u = this._values) {
      return this._reduceValues(u, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, u, h) {
      return this._reduceValues(d, (b) => {
        if (b.value === void 0)
          throw new Error(`CodeGen: name "${b}" has no value`);
        return b.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, b) {
      let g = t.nil;
      for (const v in d) {
        const _ = d[v];
        if (!_)
          continue;
        const y = h[v] = h[v] || /* @__PURE__ */ new Map();
        _.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, n.Started);
          let w = u(m);
          if (w) {
            const O = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            g = (0, t._)`${g}${O} ${m} = ${w};${this.opts._n}`;
          } else if (w = b == null ? void 0 : b(m))
            g = (0, t._)`${g}${w}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return g;
    }
  }
  e.ValueScope = c;
})(aa);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Bn, r = aa;
  var n = Bn;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = aa;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class o {
    optimizeNodes() {
      return this;
    }
    optimizeNames(i, f) {
      return this;
    }
  }
  class a extends o {
    constructor(i, f, E) {
      super(), this.varKind = i, this.name = f, this.rhs = E;
    }
    render({ es5: i, _n: f }) {
      const E = i ? r.varKinds.var : this.varKind, j = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${j};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = J(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class c extends o {
    constructor(i, f, E) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = E;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = J(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return ie(i, this.rhs);
    }
  }
  class l extends c {
    constructor(i, f, E, j) {
      super(i, E, j), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class d extends o {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class u extends o {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends o {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class b extends o {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = J(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class g extends o {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, E) => f + E.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const E = i[f].optimizeNodes();
        Array.isArray(E) ? i.splice(f, 1, ...E) : E ? i[f] = E : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: E } = this;
      let j = E.length;
      for (; j--; ) {
        const T = E[j];
        T.optimizeNames(i, f) || (de(i, T.names), E.splice(j, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => B(i, f.names), {});
    }
  }
  class v extends g {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class _ extends g {
  }
  class y extends v {
  }
  y.kind = "else";
  class m extends v {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const E = f.optimizeNodes();
        f = this.else = Array.isArray(E) ? new y(E) : E;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(Re(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = J(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return ie(i, this.condition), this.else && B(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class w extends v {
  }
  w.kind = "for";
  class O extends w {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = J(this.iteration, i, f), this;
    }
    get names() {
      return B(super.names, this.iteration.names);
    }
  }
  class I extends w {
    constructor(i, f, E, j) {
      super(), this.varKind = i, this.name = f, this.from = E, this.to = j;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: E, from: j, to: T } = this;
      return `for(${f} ${E}=${j}; ${E}<${T}; ${E}++)` + super.render(i);
    }
    get names() {
      const i = ie(super.names, this.from);
      return ie(i, this.to);
    }
  }
  class R extends w {
    constructor(i, f, E, j) {
      super(), this.loop = i, this.varKind = f, this.name = E, this.iterable = j;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = J(this.iterable, i, f), this;
    }
    get names() {
      return B(super.names, this.iterable.names);
    }
  }
  class H extends v {
    constructor(i, f, E) {
      super(), this.name = i, this.args = f, this.async = E;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  H.kind = "func";
  class Y extends g {
    render(i) {
      return "return " + super.render(i);
    }
  }
  Y.kind = "return";
  class pe extends v {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var E, j;
      return super.optimizeNames(i, f), (E = this.catch) === null || E === void 0 || E.optimizeNames(i, f), (j = this.finally) === null || j === void 0 || j.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && B(i, this.catch.names), this.finally && B(i, this.finally.names), i;
    }
  }
  class ye extends v {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  ye.kind = "catch";
  class we extends v {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  we.kind = "finally";
  class K {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new _()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const E = this._extScope.value(i, f);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, E, j) {
      const T = this._scope.toName(f);
      return E !== void 0 && j && (this._constants[T.str] = E), this._leafNode(new a(i, T, E)), T;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, E) {
      return this._def(r.varKinds.const, i, f, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, E) {
      return this._def(r.varKinds.let, i, f, E);
    }
    // `var` declaration with optional assignment
    var(i, f, E) {
      return this._def(r.varKinds.var, i, f, E);
    }
    // assignment code
    assign(i, f, E) {
      return this._leafNode(new c(i, f, E));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new b(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [E, j] of i)
        f.length > 1 && f.push(","), f.push(E), (E !== j || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, j));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, E) {
      if (this._blockNode(new m(i)), f && E)
        this.code(f).else().code(E).endIf();
      else if (f)
        this.code(f).endIf();
      else if (E)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new y());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, y);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new O(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, E, j, T = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const L = this._scope.toName(i);
      return this._for(new I(T, L, f, E), () => j(L));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, E, j = r.varKinds.const) {
      const T = this._scope.toName(i);
      if (this.opts.es5) {
        const L = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${L}.length`, (z) => {
          this.var(T, (0, t._)`${L}[${z}]`), E(T);
        });
      }
      return this._for(new R("of", j, T, f), () => E(T));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, E, j = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, E);
      const T = this._scope.toName(i);
      return this._for(new R("in", j, T, f), () => E(T));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new u(i));
    }
    // `return` statement
    return(i) {
      const f = new Y();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Y);
    }
    // `try` statement
    try(i, f, E) {
      if (!f && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const j = new pe();
      if (this._blockNode(j), this.code(i), f) {
        const T = this.name("e");
        this._currNode = j.catch = new ye(T), f(T);
      }
      return E && (this._currNode = j.finally = new we(), this.code(E)), this._endBlockNode(ye, we);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const E = this._nodes.length - f;
      if (E < 0 || i !== void 0 && E !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, E, j) {
      return this._blockNode(new H(i, f, E)), j && this.code(j).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(H);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const E = this._currNode;
      if (E instanceof i || f && E instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = K;
  function B($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) + (i[f] || 0);
    return $;
  }
  function ie($, i) {
    return i instanceof t._CodeOrName ? B($, i.names) : $;
  }
  function J($, i, f) {
    if ($ instanceof t.Name)
      return E($);
    if (!j($))
      return $;
    return new t._Code($._items.reduce((T, L) => (L instanceof t.Name && (L = E(L)), L instanceof t._Code ? T.push(...L._items) : T.push(L), T), []));
    function E(T) {
      const L = f[T.str];
      return L === void 0 || i[T.str] !== 1 ? T : (delete i[T.str], L);
    }
    function j(T) {
      return T instanceof t._Code && T._items.some((L) => L instanceof t.Name && i[L.str] === 1 && f[L.str] !== void 0);
    }
  }
  function de($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) - (i[f] || 0);
  }
  function Re($) {
    return typeof $ == "boolean" || typeof $ == "number" || $ === null ? !$ : (0, t._)`!${S($)}`;
  }
  e.not = Re;
  const D = p(e.operators.AND);
  function C(...$) {
    return $.reduce(D);
  }
  e.and = C;
  const V = p(e.operators.OR);
  function P(...$) {
    return $.reduce(V);
  }
  e.or = P;
  function p($) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${$} ${S(f)}`;
  }
  function S($) {
    return $ instanceof t.Name ? $ : (0, t._)`(${$})`;
  }
})(te);
var F = {};
Object.defineProperty(F, "__esModule", { value: !0 });
F.checkStrictMode = F.getErrorPath = F.Type = F.useFunc = F.setEvaluated = F.evaluatedPropsToName = F.mergeEvaluated = F.eachItem = F.unescapeJsonPointer = F.escapeJsonPointer = F.escapeFragment = F.unescapeFragment = F.schemaRefOrVal = F.schemaHasRulesButRef = F.schemaHasRules = F.checkUnknownRules = F.alwaysValidSchema = F.toHash = void 0;
const le = te, q_ = Bn;
function G_(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
F.toHash = G_;
function H_(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Ud(e, t), !Kd(t, e.self.RULES.all));
}
F.alwaysValidSchema = H_;
function Ud(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const o in t)
    s[o] || Hd(e, `unknown keyword: "${o}"`);
}
F.checkUnknownRules = Ud;
function Kd(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
F.schemaHasRules = Kd;
function B_(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
F.schemaHasRulesButRef = B_;
function x_({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, le._)`${r}`;
  }
  return (0, le._)`${e}${t}${(0, le.getProperty)(n)}`;
}
F.schemaRefOrVal = x_;
function J_(e) {
  return qd(decodeURIComponent(e));
}
F.unescapeFragment = J_;
function W_(e) {
  return encodeURIComponent(Ui(e));
}
F.escapeFragment = W_;
function Ui(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
F.escapeJsonPointer = Ui;
function qd(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
F.unescapeJsonPointer = qd;
function X_(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
F.eachItem = X_;
function Sl({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, o, a, c) => {
    const l = a === void 0 ? o : a instanceof le.Name ? (o instanceof le.Name ? e(s, o, a) : t(s, o, a), a) : o instanceof le.Name ? (t(s, a, o), o) : r(o, a);
    return c === le.Name && !(l instanceof le.Name) ? n(s, l) : l;
  };
}
F.mergeEvaluated = {
  props: Sl({
    mergeNames: (e, t, r) => e.if((0, le._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, le._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, le._)`${r} || {}`).code((0, le._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, le._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, le._)`${r} || {}`), Ki(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Gd
  }),
  items: Sl({
    mergeNames: (e, t, r) => e.if((0, le._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, le._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, le._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, le._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Gd(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, le._)`{}`);
  return t !== void 0 && Ki(e, r, t), r;
}
F.evaluatedPropsToName = Gd;
function Ki(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, le._)`${t}${(0, le.getProperty)(n)}`, !0));
}
F.setEvaluated = Ki;
const Pl = {};
function Y_(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Pl[t.code] || (Pl[t.code] = new q_._Code(t.code))
  });
}
F.useFunc = Y_;
var ia;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(ia || (F.Type = ia = {}));
function Z_(e, t, r) {
  if (e instanceof le.Name) {
    const n = t === ia.Num;
    return r ? n ? (0, le._)`"[" + ${e} + "]"` : (0, le._)`"['" + ${e} + "']"` : n ? (0, le._)`"/" + ${e}` : (0, le._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, le.getProperty)(e).toString() : "/" + Ui(e);
}
F.getErrorPath = Z_;
function Hd(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
F.checkStrictMode = Hd;
var Et = {};
Object.defineProperty(Et, "__esModule", { value: !0 });
const Ae = te, Q_ = {
  // validation function arguments
  data: new Ae.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ae.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ae.Name("instancePath"),
  parentData: new Ae.Name("parentData"),
  parentDataProperty: new Ae.Name("parentDataProperty"),
  rootData: new Ae.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ae.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ae.Name("vErrors"),
  // null or array of validation errors
  errors: new Ae.Name("errors"),
  // counter of validation errors
  this: new Ae.Name("this"),
  // "globals"
  self: new Ae.Name("self"),
  scope: new Ae.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ae.Name("json"),
  jsonPos: new Ae.Name("jsonPos"),
  jsonLen: new Ae.Name("jsonLen"),
  jsonPart: new Ae.Name("jsonPart")
};
Et.default = Q_;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = te, r = F, n = Et;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, w, O) {
    const { it: I } = y, { gen: R, compositeRule: H, allErrors: Y } = I, pe = h(y, m, w);
    O ?? (H || Y) ? l(R, pe) : d(I, (0, t._)`[${pe}]`);
  }
  e.reportError = s;
  function o(y, m = e.keywordError, w) {
    const { it: O } = y, { gen: I, compositeRule: R, allErrors: H } = O, Y = h(y, m, w);
    l(I, Y), R || H || d(O, n.default.vErrors);
  }
  e.reportExtraError = o;
  function a(y, m) {
    y.assign(n.default.errors, m), y.if((0, t._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = a;
  function c({ gen: y, keyword: m, schemaValue: w, data: O, errsCount: I, it: R }) {
    if (I === void 0)
      throw new Error("ajv implementation error");
    const H = y.name("err");
    y.forRange("i", I, n.default.errors, (Y) => {
      y.const(H, (0, t._)`${n.default.vErrors}[${Y}]`), y.if((0, t._)`${H}.instancePath === undefined`, () => y.assign((0, t._)`${H}.instancePath`, (0, t.strConcat)(n.default.instancePath, R.errorPath))), y.assign((0, t._)`${H}.schemaPath`, (0, t.str)`${R.errSchemaPath}/${m}`), R.opts.verbose && (y.assign((0, t._)`${H}.schema`, w), y.assign((0, t._)`${H}.data`, O));
    });
  }
  e.extendErrors = c;
  function l(y, m) {
    const w = y.const("err", m);
    y.if((0, t._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), y.code((0, t._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: w, validateName: O, schemaEnv: I } = y;
    I.$async ? w.throw((0, t._)`new ${y.ValidationError}(${m})`) : (w.assign((0, t._)`${O}.errors`, m), w.return(!1));
  }
  const u = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h(y, m, w) {
    const { createErrors: O } = y.it;
    return O === !1 ? (0, t._)`{}` : b(y, m, w);
  }
  function b(y, m, w = {}) {
    const { gen: O, it: I } = y, R = [
      g(I, w),
      v(y, w)
    ];
    return _(y, m, R), O.object(...R);
  }
  function g({ errorPath: y }, { instancePath: m }) {
    const w = m ? (0, t.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
  }
  function v({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: O }) {
    let I = O ? m : (0, t.str)`${m}/${y}`;
    return w && (I = (0, t.str)`${I}${(0, r.getErrorPath)(w, r.Type.Str)}`), [u.schemaPath, I];
  }
  function _(y, { params: m, message: w }, O) {
    const { keyword: I, data: R, schemaValue: H, it: Y } = y, { opts: pe, propertyName: ye, topSchemaRef: we, schemaPath: K } = Y;
    O.push([u.keyword, I], [u.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), pe.messages && O.push([u.message, typeof w == "function" ? w(y) : w]), pe.verbose && O.push([u.schema, H], [u.parentSchema, (0, t._)`${we}${K}`], [n.default.data, R]), ye && O.push([u.propertyName, ye]);
  }
})(Yn);
Object.defineProperty(sn, "__esModule", { value: !0 });
sn.boolOrEmptySchema = sn.topBoolOrEmptySchema = void 0;
const ev = Yn, tv = te, rv = Et, nv = {
  message: "boolean schema is false"
};
function sv(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? Bd(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(rv.default.data) : (t.assign((0, tv._)`${n}.errors`, null), t.return(!0));
}
sn.topBoolOrEmptySchema = sv;
function ov(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), Bd(e)) : r.var(t, !0);
}
sn.boolOrEmptySchema = ov;
function Bd(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, ev.reportError)(s, nv, void 0, t);
}
var be = {}, jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
jr.getRules = jr.isJSONType = void 0;
const av = ["string", "number", "integer", "boolean", "null", "object", "array"], iv = new Set(av);
function cv(e) {
  return typeof e == "string" && iv.has(e);
}
jr.isJSONType = cv;
function lv() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
jr.getRules = lv;
var Tt = {};
Object.defineProperty(Tt, "__esModule", { value: !0 });
Tt.shouldUseRule = Tt.shouldUseGroup = Tt.schemaHasRulesForType = void 0;
function uv({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && xd(e, n);
}
Tt.schemaHasRulesForType = uv;
function xd(e, t) {
  return t.rules.some((r) => Jd(e, r));
}
Tt.shouldUseGroup = xd;
function Jd(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
Tt.shouldUseRule = Jd;
Object.defineProperty(be, "__esModule", { value: !0 });
be.reportTypeError = be.checkDataTypes = be.checkDataType = be.coerceAndCheckDataType = be.getJSONTypes = be.getSchemaTypes = be.DataType = void 0;
const dv = jr, fv = Tt, hv = Yn, ee = te, Wd = F;
var Yr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(Yr || (be.DataType = Yr = {}));
function mv(e) {
  const t = Xd(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
be.getSchemaTypes = mv;
function Xd(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(dv.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
be.getJSONTypes = Xd;
function pv(e, t) {
  const { gen: r, data: n, opts: s } = e, o = $v(t, s.coerceTypes), a = t.length > 0 && !(o.length === 0 && t.length === 1 && (0, fv.schemaHasRulesForType)(e, t[0]));
  if (a) {
    const c = qi(t, n, s.strictNumbers, Yr.Wrong);
    r.if(c, () => {
      o.length ? yv(e, t, o) : Gi(e);
    });
  }
  return a;
}
be.coerceAndCheckDataType = pv;
const Yd = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function $v(e, t) {
  return t ? e.filter((r) => Yd.has(r) || t === "array" && r === "array") : [];
}
function yv(e, t, r) {
  const { gen: n, data: s, opts: o } = e, a = n.let("dataType", (0, ee._)`typeof ${s}`), c = n.let("coerced", (0, ee._)`undefined`);
  o.coerceTypes === "array" && n.if((0, ee._)`${a} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, ee._)`${s}[0]`).assign(a, (0, ee._)`typeof ${s}`).if(qi(t, s, o.strictNumbers), () => n.assign(c, s))), n.if((0, ee._)`${c} !== undefined`);
  for (const d of r)
    (Yd.has(d) || d === "array" && o.coerceTypes === "array") && l(d);
  n.else(), Gi(e), n.endIf(), n.if((0, ee._)`${c} !== undefined`, () => {
    n.assign(s, c), gv(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, ee._)`${a} == "number" || ${a} == "boolean"`).assign(c, (0, ee._)`"" + ${s}`).elseIf((0, ee._)`${s} === null`).assign(c, (0, ee._)`""`);
        return;
      case "number":
        n.elseIf((0, ee._)`${a} == "boolean" || ${s} === null
              || (${a} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, ee._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, ee._)`${a} === "boolean" || ${s} === null
              || (${a} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, ee._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, ee._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, ee._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, ee._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, ee._)`${a} === "string" || ${a} === "number"
              || ${a} === "boolean" || ${s} === null`).assign(c, (0, ee._)`[${s}]`);
    }
  }
}
function gv({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, ee._)`${t} !== undefined`, () => e.assign((0, ee._)`${t}[${r}]`, n));
}
function ca(e, t, r, n = Yr.Correct) {
  const s = n === Yr.Correct ? ee.operators.EQ : ee.operators.NEQ;
  let o;
  switch (e) {
    case "null":
      return (0, ee._)`${t} ${s} null`;
    case "array":
      o = (0, ee._)`Array.isArray(${t})`;
      break;
    case "object":
      o = (0, ee._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      o = a((0, ee._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      o = a();
      break;
    default:
      return (0, ee._)`typeof ${t} ${s} ${e}`;
  }
  return n === Yr.Correct ? o : (0, ee.not)(o);
  function a(c = ee.nil) {
    return (0, ee.and)((0, ee._)`typeof ${t} == "number"`, c, r ? (0, ee._)`isFinite(${t})` : ee.nil);
  }
}
be.checkDataType = ca;
function qi(e, t, r, n) {
  if (e.length === 1)
    return ca(e[0], t, r, n);
  let s;
  const o = (0, Wd.toHash)(e);
  if (o.array && o.object) {
    const a = (0, ee._)`typeof ${t} != "object"`;
    s = o.null ? a : (0, ee._)`!${t} || ${a}`, delete o.null, delete o.array, delete o.object;
  } else
    s = ee.nil;
  o.number && delete o.integer;
  for (const a in o)
    s = (0, ee.and)(s, ca(a, t, r, n));
  return s;
}
be.checkDataTypes = qi;
const _v = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, ee._)`{type: ${e}}` : (0, ee._)`{type: ${t}}`
};
function Gi(e) {
  const t = vv(e);
  (0, hv.reportError)(t, _v);
}
be.reportTypeError = Gi;
function vv(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Wd.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
co.assignDefaults = void 0;
const Mr = te, wv = F;
function Ev(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      Ol(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, o) => Ol(e, o, s.default));
}
co.assignDefaults = Ev;
function Ol(e, t, r) {
  const { gen: n, compositeRule: s, data: o, opts: a } = e;
  if (r === void 0)
    return;
  const c = (0, Mr._)`${o}${(0, Mr.getProperty)(t)}`;
  if (s) {
    (0, wv.checkStrictMode)(e, `default is ignored for: ${c}`);
    return;
  }
  let l = (0, Mr._)`${c} === undefined`;
  a.useDefaults === "empty" && (l = (0, Mr._)`${l} || ${c} === null || ${c} === ""`), n.if(l, (0, Mr._)`${c} = ${(0, Mr.stringify)(r)}`);
}
var vt = {}, ne = {};
Object.defineProperty(ne, "__esModule", { value: !0 });
ne.validateUnion = ne.validateArray = ne.usePattern = ne.callValidateCode = ne.schemaProperties = ne.allSchemaProperties = ne.noPropertyInData = ne.propertyInData = ne.isOwnProperty = ne.hasPropFunc = ne.reportMissingProp = ne.checkMissingProp = ne.checkReportMissingProp = void 0;
const me = te, Hi = F, Lt = Et, bv = F;
function Sv(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(xi(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, me._)`${t}` }, !0), e.error();
  });
}
ne.checkReportMissingProp = Sv;
function Pv({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, me.or)(...n.map((o) => (0, me.and)(xi(e, t, o, r.ownProperties), (0, me._)`${s} = ${o}`)));
}
ne.checkMissingProp = Pv;
function Ov(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ne.reportMissingProp = Ov;
function Zd(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, me._)`Object.prototype.hasOwnProperty`
  });
}
ne.hasPropFunc = Zd;
function Bi(e, t, r) {
  return (0, me._)`${Zd(e)}.call(${t}, ${r})`;
}
ne.isOwnProperty = Bi;
function Nv(e, t, r, n) {
  const s = (0, me._)`${t}${(0, me.getProperty)(r)} !== undefined`;
  return n ? (0, me._)`${s} && ${Bi(e, t, r)}` : s;
}
ne.propertyInData = Nv;
function xi(e, t, r, n) {
  const s = (0, me._)`${t}${(0, me.getProperty)(r)} === undefined`;
  return n ? (0, me.or)(s, (0, me.not)(Bi(e, t, r))) : s;
}
ne.noPropertyInData = xi;
function Qd(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ne.allSchemaProperties = Qd;
function Iv(e, t) {
  return Qd(t).filter((r) => !(0, Hi.alwaysValidSchema)(e, t[r]));
}
ne.schemaProperties = Iv;
function Rv({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: o }, it: a }, c, l, d) {
  const u = d ? (0, me._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Lt.default.instancePath, (0, me.strConcat)(Lt.default.instancePath, o)],
    [Lt.default.parentData, a.parentData],
    [Lt.default.parentDataProperty, a.parentDataProperty],
    [Lt.default.rootData, Lt.default.rootData]
  ];
  a.opts.dynamicRef && h.push([Lt.default.dynamicAnchors, Lt.default.dynamicAnchors]);
  const b = (0, me._)`${u}, ${r.object(...h)}`;
  return l !== me.nil ? (0, me._)`${c}.call(${l}, ${b})` : (0, me._)`${c}(${b})`;
}
ne.callValidateCode = Rv;
const Tv = (0, me._)`new RegExp`;
function jv({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, o = s(r, n);
  return e.scopeValue("pattern", {
    key: o.toString(),
    ref: o,
    code: (0, me._)`${s.code === "new RegExp" ? Tv : (0, bv.useFunc)(e, s)}(${r}, ${n})`
  });
}
ne.usePattern = jv;
function kv(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, o = t.name("valid");
  if (s.allErrors) {
    const c = t.let("valid", !0);
    return a(() => t.assign(c, !1)), c;
  }
  return t.var(o, !0), a(() => t.break()), o;
  function a(c) {
    const l = t.const("len", (0, me._)`${r}.length`);
    t.forRange("i", 0, l, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: Hi.Type.Num
      }, o), t.if((0, me.not)(o), c);
    });
  }
}
ne.validateArray = kv;
function Av(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, Hi.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const a = t.let("valid", !1), c = t.name("_valid");
  t.block(() => r.forEach((l, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, c);
    t.assign(a, (0, me._)`${a} || ${c}`), e.mergeValidEvaluated(u, c) || t.if((0, me.not)(a));
  })), e.result(a, () => e.reset(), () => e.error(!0));
}
ne.validateUnion = Av;
Object.defineProperty(vt, "__esModule", { value: !0 });
vt.validateKeywordUsage = vt.validSchemaType = vt.funcKeywordCode = vt.macroKeywordCode = void 0;
const Ke = te, br = Et, Cv = ne, Dv = Yn;
function Mv(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: o, it: a } = e, c = t.macro.call(a.self, s, o, a), l = ef(r, n, c);
  a.opts.validateSchema !== !1 && a.self.validateSchema(c, !0);
  const d = r.name("valid");
  e.subschema({
    schema: c,
    schemaPath: Ke.nil,
    errSchemaPath: `${a.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
vt.macroKeywordCode = Mv;
function Fv(e, t) {
  var r;
  const { gen: n, keyword: s, schema: o, parentSchema: a, $data: c, it: l } = e;
  Vv(l, t);
  const d = !c && t.compile ? t.compile.call(l.self, o, a, l) : t.validate, u = ef(n, s, d), h = n.let("valid");
  e.block$data(h, b), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function b() {
    if (t.errors === !1)
      _(), t.modifying && Nl(e), y(() => e.error());
    else {
      const m = t.async ? g() : v();
      t.modifying && Nl(e), y(() => Lv(e, m));
    }
  }
  function g() {
    const m = n.let("ruleErrs", null);
    return n.try(() => _((0, Ke._)`await `), (w) => n.assign(h, !1).if((0, Ke._)`${w} instanceof ${l.ValidationError}`, () => n.assign(m, (0, Ke._)`${w}.errors`), () => n.throw(w))), m;
  }
  function v() {
    const m = (0, Ke._)`${u}.errors`;
    return n.assign(m, null), _(Ke.nil), m;
  }
  function _(m = t.async ? (0, Ke._)`await ` : Ke.nil) {
    const w = l.opts.passContext ? br.default.this : br.default.self, O = !("compile" in t && !c || t.schema === !1);
    n.assign(h, (0, Ke._)`${m}${(0, Cv.callValidateCode)(e, u, w, O)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, Ke.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
vt.funcKeywordCode = Fv;
function Nl(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Ke._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Lv(e, t) {
  const { gen: r } = e;
  r.if((0, Ke._)`Array.isArray(${t})`, () => {
    r.assign(br.default.vErrors, (0, Ke._)`${br.default.vErrors} === null ? ${t} : ${br.default.vErrors}.concat(${t})`).assign(br.default.errors, (0, Ke._)`${br.default.vErrors}.length`), (0, Dv.extendErrors)(e);
  }, () => e.error());
}
function Vv({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function ef(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Ke.stringify)(r) });
}
function zv(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
vt.validSchemaType = zv;
function Uv({ schema: e, opts: t, self: r, errSchemaPath: n }, s, o) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(o) : s.keyword !== o)
    throw new Error("ajv implementation error");
  const a = s.dependencies;
  if (a != null && a.some((c) => !Object.prototype.hasOwnProperty.call(e, c)))
    throw new Error(`parent schema must have dependencies of ${o}: ${a.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[o])) {
    const l = `keyword "${o}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
vt.validateKeywordUsage = Uv;
var Yt = {};
Object.defineProperty(Yt, "__esModule", { value: !0 });
Yt.extendSubschemaMode = Yt.extendSubschemaData = Yt.getSubschema = void 0;
const gt = te, tf = F;
function Kv(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: o, topSchemaRef: a }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const c = e.schema[t];
    return r === void 0 ? {
      schema: c,
      schemaPath: (0, gt._)`${e.schemaPath}${(0, gt.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: c[r],
      schemaPath: (0, gt._)`${e.schemaPath}${(0, gt.getProperty)(t)}${(0, gt.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, tf.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || o === void 0 || a === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: a,
      errSchemaPath: o
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Yt.getSubschema = Kv;
function qv(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: o, propertyName: a }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: c } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, b = c.let("data", (0, gt._)`${t.data}${(0, gt.getProperty)(r)}`, !0);
    l(b), e.errorPath = (0, gt.str)`${d}${(0, tf.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, gt._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof gt.Name ? s : c.let("data", s, !0);
    l(d), a !== void 0 && (e.propertyName = a);
  }
  o && (e.dataTypes = o);
  function l(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Yt.extendSubschemaData = qv;
function Gv(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: o }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), o !== void 0 && (e.allErrors = o), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Yt.extendSubschemaMode = Gv;
var Ie = {}, rf = { exports: {} }, Wt = rf.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  ks(t, n, s, e, "", e);
};
Wt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Wt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Wt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Wt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function ks(e, t, r, n, s, o, a, c, l, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, o, a, c, l, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Wt.arrayKeywords)
          for (var b = 0; b < h.length; b++)
            ks(e, t, r, h[b], s + "/" + u + "/" + b, o, s, u, n, b);
      } else if (u in Wt.propsKeywords) {
        if (h && typeof h == "object")
          for (var g in h)
            ks(e, t, r, h[g], s + "/" + u + "/" + Hv(g), o, s, u, n, g);
      } else (u in Wt.keywords || e.allKeys && !(u in Wt.skipKeywords)) && ks(e, t, r, h, s + "/" + u, o, s, u, n);
    }
    r(n, s, o, a, c, l, d);
  }
}
function Hv(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Bv = rf.exports;
Object.defineProperty(Ie, "__esModule", { value: !0 });
Ie.getSchemaRefs = Ie.resolveUrl = Ie.normalizeId = Ie._getFullPath = Ie.getFullPath = Ie.inlineRef = void 0;
const xv = F, Jv = to, Wv = Bv, Xv = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Yv(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !la(e) : t ? nf(e) <= t : !1;
}
Ie.inlineRef = Yv;
const Zv = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function la(e) {
  for (const t in e) {
    if (Zv.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(la) || typeof r == "object" && la(r))
      return !0;
  }
  return !1;
}
function nf(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Xv.has(r) && (typeof e[r] == "object" && (0, xv.eachItem)(e[r], (n) => t += nf(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function sf(e, t = "", r) {
  r !== !1 && (t = Zr(t));
  const n = e.parse(t);
  return of(e, n);
}
Ie.getFullPath = sf;
function of(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Ie._getFullPath = of;
const Qv = /#\/?$/;
function Zr(e) {
  return e ? e.replace(Qv, "") : "";
}
Ie.normalizeId = Zr;
function ew(e, t, r) {
  return r = Zr(r), e.resolve(t, r);
}
Ie.resolveUrl = ew;
const tw = /^[a-z_][-a-z0-9._]*$/i;
function rw(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Zr(e[r] || t), o = { "": s }, a = sf(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return Wv(e, { allKeys: !0 }, (h, b, g, v) => {
    if (v === void 0)
      return;
    const _ = a + b;
    let y = o[v];
    typeof h[r] == "string" && (y = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), o[b] = y;
    function m(O) {
      const I = this.opts.uriResolver.resolve;
      if (O = Zr(y ? I(y, O) : O), l.has(O))
        throw u(O);
      l.add(O);
      let R = this.refs[O];
      return typeof R == "string" && (R = this.refs[R]), typeof R == "object" ? d(h, R.schema, O) : O !== Zr(_) && (O[0] === "#" ? (d(h, c[O], O), c[O] = h) : this.refs[O] = _), O;
    }
    function w(O) {
      if (typeof O == "string") {
        if (!tw.test(O))
          throw new Error(`invalid anchor "${O}"`);
        m.call(this, `#${O}`);
      }
    }
  }), c;
  function d(h, b, g) {
    if (b !== void 0 && !Jv(h, b))
      throw u(g);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Ie.getSchemaRefs = rw;
Object.defineProperty(ft, "__esModule", { value: !0 });
ft.getData = ft.KeywordCxt = ft.validateFunctionCode = void 0;
const af = sn, Il = be, Ji = Tt, Js = be, nw = co, zn = vt, ko = Yt, G = te, X = Et, sw = Ie, jt = F, bn = Yn;
function ow(e) {
  if (uf(e) && (df(e), lf(e))) {
    cw(e);
    return;
  }
  cf(e, () => (0, af.topBoolOrEmptySchema)(e));
}
ft.validateFunctionCode = ow;
function cf({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, o) {
  s.code.es5 ? e.func(t, (0, G._)`${X.default.data}, ${X.default.valCxt}`, n.$async, () => {
    e.code((0, G._)`"use strict"; ${Rl(r, s)}`), iw(e, s), e.code(o);
  }) : e.func(t, (0, G._)`${X.default.data}, ${aw(s)}`, n.$async, () => e.code(Rl(r, s)).code(o));
}
function aw(e) {
  return (0, G._)`{${X.default.instancePath}="", ${X.default.parentData}, ${X.default.parentDataProperty}, ${X.default.rootData}=${X.default.data}${e.dynamicRef ? (0, G._)`, ${X.default.dynamicAnchors}={}` : G.nil}}={}`;
}
function iw(e, t) {
  e.if(X.default.valCxt, () => {
    e.var(X.default.instancePath, (0, G._)`${X.default.valCxt}.${X.default.instancePath}`), e.var(X.default.parentData, (0, G._)`${X.default.valCxt}.${X.default.parentData}`), e.var(X.default.parentDataProperty, (0, G._)`${X.default.valCxt}.${X.default.parentDataProperty}`), e.var(X.default.rootData, (0, G._)`${X.default.valCxt}.${X.default.rootData}`), t.dynamicRef && e.var(X.default.dynamicAnchors, (0, G._)`${X.default.valCxt}.${X.default.dynamicAnchors}`);
  }, () => {
    e.var(X.default.instancePath, (0, G._)`""`), e.var(X.default.parentData, (0, G._)`undefined`), e.var(X.default.parentDataProperty, (0, G._)`undefined`), e.var(X.default.rootData, X.default.data), t.dynamicRef && e.var(X.default.dynamicAnchors, (0, G._)`{}`);
  });
}
function cw(e) {
  const { schema: t, opts: r, gen: n } = e;
  cf(e, () => {
    r.$comment && t.$comment && hf(e), hw(e), n.let(X.default.vErrors, null), n.let(X.default.errors, 0), r.unevaluated && lw(e), ff(e), $w(e);
  });
}
function lw(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, G._)`${r}.evaluated`), t.if((0, G._)`${e.evaluated}.dynamicProps`, () => t.assign((0, G._)`${e.evaluated}.props`, (0, G._)`undefined`)), t.if((0, G._)`${e.evaluated}.dynamicItems`, () => t.assign((0, G._)`${e.evaluated}.items`, (0, G._)`undefined`));
}
function Rl(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, G._)`/*# sourceURL=${r} */` : G.nil;
}
function uw(e, t) {
  if (uf(e) && (df(e), lf(e))) {
    dw(e, t);
    return;
  }
  (0, af.boolOrEmptySchema)(e, t);
}
function lf({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function uf(e) {
  return typeof e.schema != "boolean";
}
function dw(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && hf(e), mw(e), pw(e);
  const o = n.const("_errs", X.default.errors);
  ff(e, o), n.var(t, (0, G._)`${o} === ${X.default.errors}`);
}
function df(e) {
  (0, jt.checkUnknownRules)(e), fw(e);
}
function ff(e, t) {
  if (e.opts.jtd)
    return Tl(e, [], !1, t);
  const r = (0, Il.getSchemaTypes)(e.schema), n = (0, Il.coerceAndCheckDataType)(e, r);
  Tl(e, r, !n, t);
}
function fw(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, jt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function hw(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, jt.checkStrictMode)(e, "default is ignored in the schema root");
}
function mw(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, sw.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function pw(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function hf({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const o = r.$comment;
  if (s.$comment === !0)
    e.code((0, G._)`${X.default.self}.logger.log(${o})`);
  else if (typeof s.$comment == "function") {
    const a = (0, G.str)`${n}/$comment`, c = e.scopeValue("root", { ref: t.root });
    e.code((0, G._)`${X.default.self}.opts.$comment(${o}, ${a}, ${c}.schema)`);
  }
}
function $w(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: o } = e;
  r.$async ? t.if((0, G._)`${X.default.errors} === 0`, () => t.return(X.default.data), () => t.throw((0, G._)`new ${s}(${X.default.vErrors})`)) : (t.assign((0, G._)`${n}.errors`, X.default.vErrors), o.unevaluated && yw(e), t.return((0, G._)`${X.default.errors} === 0`));
}
function yw({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof G.Name && e.assign((0, G._)`${t}.props`, r), n instanceof G.Name && e.assign((0, G._)`${t}.items`, n);
}
function Tl(e, t, r, n) {
  const { gen: s, schema: o, data: a, allErrors: c, opts: l, self: d } = e, { RULES: u } = d;
  if (o.$ref && (l.ignoreKeywordsWithRef || !(0, jt.schemaHasRulesButRef)(o, u))) {
    s.block(() => $f(e, "$ref", u.all.$ref.definition));
    return;
  }
  l.jtd || gw(e, t), s.block(() => {
    for (const b of u.rules)
      h(b);
    h(u.post);
  });
  function h(b) {
    (0, Ji.shouldUseGroup)(o, b) && (b.type ? (s.if((0, Js.checkDataType)(b.type, a, l.strictNumbers)), jl(e, b), t.length === 1 && t[0] === b.type && r && (s.else(), (0, Js.reportTypeError)(e)), s.endIf()) : jl(e, b), c || s.if((0, G._)`${X.default.errors} === ${n || 0}`));
  }
}
function jl(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, nw.assignDefaults)(e, t.type), r.block(() => {
    for (const o of t.rules)
      (0, Ji.shouldUseRule)(n, o) && $f(e, o.keyword, o.definition, t.type);
  });
}
function gw(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (_w(e, t), e.opts.allowUnionTypes || vw(e, t), ww(e, e.dataTypes));
}
function _w(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      mf(e.dataTypes, r) || Wi(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), bw(e, t);
  }
}
function vw(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Wi(e, "use allowUnionTypes to allow union type keyword");
}
function ww(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Ji.shouldUseRule)(e.schema, s)) {
      const { type: o } = s.definition;
      o.length && !o.some((a) => Ew(t, a)) && Wi(e, `missing type "${o.join(",")}" for keyword "${n}"`);
    }
  }
}
function Ew(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function mf(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function bw(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    mf(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Wi(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, jt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class pf {
  constructor(t, r, n) {
    if ((0, zn.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, jt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", yf(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, zn.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", X.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, G.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, G.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, G._)`${r} !== undefined && (${(0, G.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? bn.reportExtraError : bn.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, bn.reportError)(this, this.def.$dataError || bn.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, bn.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = G.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = G.nil, r = G.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: o, def: a } = this;
    n.if((0, G.or)((0, G._)`${s} === undefined`, r)), t !== G.nil && n.assign(t, !0), (o.length || a.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== G.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: o } = this;
    return (0, G.or)(a(), c());
    function a() {
      if (n.length) {
        if (!(r instanceof G.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, G._)`${(0, Js.checkDataTypes)(l, r, o.opts.strictNumbers, Js.DataType.Wrong)}`;
      }
      return G.nil;
    }
    function c() {
      if (s.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, G._)`!${l}(${r})`;
      }
      return G.nil;
    }
  }
  subschema(t, r) {
    const n = (0, ko.getSubschema)(this.it, t);
    (0, ko.extendSubschemaData)(n, this.it, t), (0, ko.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return uw(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = jt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = jt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, G.Name)), !0;
  }
}
ft.KeywordCxt = pf;
function $f(e, t, r, n) {
  const s = new pf(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, zn.funcKeywordCode)(s, r) : "macro" in r ? (0, zn.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, zn.funcKeywordCode)(s, r);
}
const Sw = /^\/(?:[^~]|~0|~1)*$/, Pw = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function yf(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, o;
  if (e === "")
    return X.default.rootData;
  if (e[0] === "/") {
    if (!Sw.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, o = X.default.rootData;
  } else {
    const d = Pw.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(l("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(l("data", u));
    if (o = r[t - u], !s)
      return o;
  }
  let a = o;
  const c = s.split("/");
  for (const d of c)
    d && (o = (0, G._)`${o}${(0, G.getProperty)((0, jt.unescapeJsonPointer)(d))}`, a = (0, G._)`${a} && ${o}`);
  return a;
  function l(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
ft.getData = yf;
var Zn = {};
Object.defineProperty(Zn, "__esModule", { value: !0 });
class Ow extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
Zn.default = Ow;
var mn = {};
Object.defineProperty(mn, "__esModule", { value: !0 });
const Ao = Ie;
class Nw extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Ao.resolveUrl)(t, r, n), this.missingSchema = (0, Ao.normalizeId)((0, Ao.getFullPath)(t, this.missingRef));
  }
}
mn.default = Nw;
var Je = {};
Object.defineProperty(Je, "__esModule", { value: !0 });
Je.resolveSchema = Je.getCompilingSchema = Je.resolveRef = Je.compileSchema = Je.SchemaEnv = void 0;
const ot = te, Iw = Zn, pr = Et, ut = Ie, kl = F, Rw = ft;
class lo {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, ut.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Je.SchemaEnv = lo;
function Xi(e) {
  const t = gf.call(this, e);
  if (t)
    return t;
  const r = (0, ut.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: o } = this.opts, a = new ot.CodeGen(this.scope, { es5: n, lines: s, ownProperties: o });
  let c;
  e.$async && (c = a.scopeValue("Error", {
    ref: Iw.default,
    code: (0, ot._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = a.scopeName("validate");
  e.validateName = l;
  const d = {
    gen: a,
    allErrors: this.opts.allErrors,
    data: pr.default.data,
    parentData: pr.default.parentData,
    parentDataProperty: pr.default.parentDataProperty,
    dataNames: [pr.default.data],
    dataPathArr: [ot.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: a.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, ot.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: ot.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, ot._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, Rw.validateFunctionCode)(d), a.optimize(this.opts.code.optimize);
    const h = a.toString();
    u = `${a.scopeRefs(pr.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const g = new Function(`${pr.default.self}`, `${pr.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: g }), g.errors = null, g.schema = e.schema, g.schemaEnv = e, e.$async && (g.$async = !0), this.opts.code.source === !0 && (g.source = { validateName: l, validateCode: h, scopeValues: a._values }), this.opts.unevaluated) {
      const { props: v, items: _ } = d;
      g.evaluated = {
        props: v instanceof ot.Name ? void 0 : v,
        items: _ instanceof ot.Name ? void 0 : _,
        dynamicProps: v instanceof ot.Name,
        dynamicItems: _ instanceof ot.Name
      }, g.source && (g.source.evaluated = (0, ot.stringify)(g.evaluated));
    }
    return e.validate = g, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Je.compileSchema = Xi;
function Tw(e, t, r) {
  var n;
  r = (0, ut.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let o = Aw.call(this, e, r);
  if (o === void 0) {
    const a = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    a && (o = new lo({ schema: a, schemaId: c, root: e, baseId: t }));
  }
  if (o !== void 0)
    return e.refs[r] = jw.call(this, o);
}
Je.resolveRef = Tw;
function jw(e) {
  return (0, ut.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Xi.call(this, e);
}
function gf(e) {
  for (const t of this._compilations)
    if (kw(t, e))
      return t;
}
Je.getCompilingSchema = gf;
function kw(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Aw(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || uo.call(this, e, t);
}
function uo(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, ut._getFullPath)(this.opts.uriResolver, r);
  let s = (0, ut.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Co.call(this, r, e);
  const o = (0, ut.normalizeId)(n), a = this.refs[o] || this.schemas[o];
  if (typeof a == "string") {
    const c = uo.call(this, e, a);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Co.call(this, r, c);
  }
  if (typeof (a == null ? void 0 : a.schema) == "object") {
    if (a.validate || Xi.call(this, a), o === (0, ut.normalizeId)(t)) {
      const { schema: c } = a, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, ut.resolveUrl)(this.opts.uriResolver, s, d)), new lo({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Co.call(this, r, a);
  }
}
Je.resolveSchema = uo;
const Cw = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Co(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, kl.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Cw.has(c) && d && (t = (0, ut.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let o;
  if (typeof r != "boolean" && r.$ref && !(0, kl.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, ut.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    o = uo.call(this, n, c);
  }
  const { schemaId: a } = this.opts;
  if (o = o || new lo({ schema: r, schemaId: a, root: n, baseId: t }), o.schema !== o.root.schema)
    return o;
}
const Dw = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Mw = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Fw = "object", Lw = [
  "$data"
], Vw = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, zw = !1, Uw = {
  $id: Dw,
  description: Mw,
  type: Fw,
  required: Lw,
  properties: Vw,
  additionalProperties: zw
};
var Yi = {};
Object.defineProperty(Yi, "__esModule", { value: !0 });
const _f = Nd;
_f.code = 'require("ajv/dist/runtime/uri").default';
Yi.default = _f;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = ft;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = te;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = Zn, s = mn, o = jr, a = Je, c = te, l = Ie, d = be, u = F, h = Uw, b = Yi, g = (P, p) => new RegExp(P, p);
  g.code = "new RegExp";
  const v = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), y = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, w = 200;
  function O(P) {
    var p, S, $, i, f, E, j, T, L, z, se, We, er, tr, rr, nr, sr, or, ar, ir, cr, lr, ur, dr, fr;
    const nt = P.strict, hr = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, yn = hr === !0 || hr === void 0 ? 1 : hr || 0, gn = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : g, _o = (i = P.uriResolver) !== null && i !== void 0 ? i : b.default;
    return {
      strictSchema: (E = (f = P.strictSchema) !== null && f !== void 0 ? f : nt) !== null && E !== void 0 ? E : !0,
      strictNumbers: (T = (j = P.strictNumbers) !== null && j !== void 0 ? j : nt) !== null && T !== void 0 ? T : !0,
      strictTypes: (z = (L = P.strictTypes) !== null && L !== void 0 ? L : nt) !== null && z !== void 0 ? z : "log",
      strictTuples: (We = (se = P.strictTuples) !== null && se !== void 0 ? se : nt) !== null && We !== void 0 ? We : "log",
      strictRequired: (tr = (er = P.strictRequired) !== null && er !== void 0 ? er : nt) !== null && tr !== void 0 ? tr : !1,
      code: P.code ? { ...P.code, optimize: yn, regExp: gn } : { optimize: yn, regExp: gn },
      loopRequired: (rr = P.loopRequired) !== null && rr !== void 0 ? rr : w,
      loopEnum: (nr = P.loopEnum) !== null && nr !== void 0 ? nr : w,
      meta: (sr = P.meta) !== null && sr !== void 0 ? sr : !0,
      messages: (or = P.messages) !== null && or !== void 0 ? or : !0,
      inlineRefs: (ar = P.inlineRefs) !== null && ar !== void 0 ? ar : !0,
      schemaId: (ir = P.schemaId) !== null && ir !== void 0 ? ir : "$id",
      addUsedSchema: (cr = P.addUsedSchema) !== null && cr !== void 0 ? cr : !0,
      validateSchema: (lr = P.validateSchema) !== null && lr !== void 0 ? lr : !0,
      validateFormats: (ur = P.validateFormats) !== null && ur !== void 0 ? ur : !0,
      unicodeRegExp: (dr = P.unicodeRegExp) !== null && dr !== void 0 ? dr : !0,
      int32range: (fr = P.int32range) !== null && fr !== void 0 ? fr : !0,
      uriResolver: _o
    };
  }
  class I {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = /* @__PURE__ */ Object.create(null), this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...O(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: _, es5: S, lines: $ }), this.logger = B(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, o.getRules)(), R.call(this, y, p, "NOT SUPPORTED"), R.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = we.call(this), p.formats && pe.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && ye.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: $ } = this.opts;
      let i = h;
      $ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[$], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let $;
      if (typeof p == "string") {
        if ($ = this.getSchema(p), !$)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        $ = this.compile(p);
      const i = $(S);
      return "$async" in $ || (this.errors = $.errors), i;
    }
    compile(p, S) {
      const $ = this._addSchema(p, S);
      return $.validate || this._compileSchemaEnv($);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: $ } = this.opts;
      return i.call(this, p, S);
      async function i(z, se) {
        await f.call(this, z.$schema);
        const We = this._addSchema(z, se);
        return We.validate || E.call(this, We);
      }
      async function f(z) {
        z && !this.getSchema(z) && await i.call(this, { $ref: z }, !0);
      }
      async function E(z) {
        try {
          return this._compileSchemaEnv(z);
        } catch (se) {
          if (!(se instanceof s.default))
            throw se;
          return j.call(this, se), await T.call(this, se.missingSchema), E.call(this, z);
        }
      }
      function j({ missingSchema: z, missingRef: se }) {
        if (this.refs[z])
          throw new Error(`AnySchema ${z} is loaded but ${se} cannot be resolved`);
      }
      async function T(z) {
        const se = await L.call(this, z);
        this.refs[z] || await f.call(this, se.$schema), this.refs[z] || this.addSchema(se, z, S);
      }
      async function L(z) {
        const se = this._loading[z];
        if (se)
          return se;
        try {
          return await (this._loading[z] = $(z));
        } finally {
          delete this._loading[z];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, $, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const E of p)
          this.addSchema(E, void 0, $, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: E } = this.opts;
        if (f = p[E], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, $, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, $ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, $), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let $;
      if ($ = p.$schema, $ !== void 0 && typeof $ != "string")
        throw new Error("$schema must be a string");
      if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate($, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = H.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: $ } = this.opts, i = new a.SchemaEnv({ schema: {}, schemaId: $ });
        if (S = a.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = H.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let $ = p[this.opts.schemaId];
          return $ && ($ = (0, l.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let $;
      if (typeof p == "string")
        $ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = $);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, $ = S.keyword, Array.isArray($) && !$.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (J.call(this, $, S), !S)
        return (0, u.eachItem)($, (f) => de.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)($, i.type.length === 0 ? (f) => de.call(this, f, i) : (f) => i.type.forEach((E) => de.call(this, f, i, E))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const $ of S.rules) {
        const i = $.rules.findIndex((f) => f.keyword === p);
        i >= 0 && $.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: $ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${$}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const $ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let E = p;
        for (const j of f)
          E = E[j];
        for (const j in $) {
          const T = $[j];
          if (typeof T != "object")
            continue;
          const { $data: L } = T.definition, z = E[j];
          L && z && (E[j] = V(z));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const $ in p) {
        const i = p[$];
        (!S || S.test($)) && (typeof i == "string" ? delete p[$] : i && !i.meta && (this._cache.delete(i.schema), delete p[$]));
      }
    }
    _addSchema(p, S, $, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let E;
      const { schemaId: j } = this.opts;
      if (typeof p == "object")
        E = p[j];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let T = this._cache.get(p);
      if (T !== void 0)
        return T;
      $ = (0, l.normalizeId)(E || $);
      const L = l.getSchemaRefs.call(this, p, $);
      return T = new a.SchemaEnv({ schema: p, schemaId: j, meta: S, baseId: $, localRefs: L }), this._cache.set(T.schema, T), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = T), i && this.validateSchema(p, !0), T;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : a.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        a.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  I.ValidationError = n.default, I.MissingRefError = s.default, e.default = I;
  function R(P, p, S, $ = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[$](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function H(P) {
    return P = (0, l.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function Y() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function pe() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function ye(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function we() {
    const P = { ...this.opts };
    for (const p of v)
      delete P[p];
    return P;
  }
  const K = { log() {
  }, warn() {
  }, error() {
  } };
  function B(P) {
    if (P === !1)
      return K;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const ie = /^[a-z_$][a-z0-9_$:-]*$/i;
  function J(P, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(P, ($) => {
      if (S.keywords[$])
        throw new Error(`Keyword ${$} is already defined`);
      if (!ie.test($))
        throw new Error(`Keyword ${$} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function de(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let E = i ? f.post : f.rules.find(({ type: T }) => T === S);
    if (E || (E = { type: S, rules: [] }, f.rules.push(E)), f.keywords[P] = !0, !p)
      return;
    const j = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? Re.call(this, E, j, p.before) : E.rules.push(j), f.all[P] = j, ($ = p.implements) === null || $ === void 0 || $.forEach((T) => this.addKeyword(T));
  }
  function Re(P, p, S) {
    const $ = P.rules.findIndex((i) => i.keyword === S);
    $ >= 0 ? P.rules.splice($, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = V(p)), P.validateSchema = this.compile(p, !0));
  }
  const C = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function V(P) {
    return { anyOf: [P, C] };
  }
})(zd);
var Zi = {}, Qi = {}, ec = {};
Object.defineProperty(ec, "__esModule", { value: !0 });
const Kw = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ec.default = Kw;
var kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.callRef = kr.getValidate = void 0;
const qw = mn, Al = ne, He = te, Fr = Et, Cl = Je, ls = F, Gw = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: o, validateName: a, opts: c, self: l } = n, { root: d } = o;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = Cl.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new qw.default(n.opts.uriResolver, s, r);
    if (u instanceof Cl.SchemaEnv)
      return b(u);
    return g(u);
    function h() {
      if (o === d)
        return As(e, a, o, o.$async);
      const v = t.scopeValue("root", { ref: d });
      return As(e, (0, He._)`${v}.validate`, d, d.$async);
    }
    function b(v) {
      const _ = vf(e, v);
      As(e, _, v, v.$async);
    }
    function g(v) {
      const _ = t.scopeValue("schema", c.code.source === !0 ? { ref: v, code: (0, He.stringify)(v) } : { ref: v }), y = t.name("valid"), m = e.subschema({
        schema: v,
        dataTypes: [],
        schemaPath: He.nil,
        topSchemaRef: _,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function vf(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, He._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
kr.getValidate = vf;
function As(e, t, r, n) {
  const { gen: s, it: o } = e, { allErrors: a, schemaEnv: c, opts: l } = o, d = l.passContext ? Fr.default.this : He.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, He._)`await ${(0, Al.callValidateCode)(e, t, d)}`), g(t), a || s.assign(v, !0);
    }, (_) => {
      s.if((0, He._)`!(${_} instanceof ${o.ValidationError})`, () => s.throw(_)), b(_), a || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, Al.callValidateCode)(e, t, d), () => g(t), () => b(t));
  }
  function b(v) {
    const _ = (0, He._)`${v}.errors`;
    s.assign(Fr.default.vErrors, (0, He._)`${Fr.default.vErrors} === null ? ${_} : ${Fr.default.vErrors}.concat(${_})`), s.assign(Fr.default.errors, (0, He._)`${Fr.default.vErrors}.length`);
  }
  function g(v) {
    var _;
    if (!o.opts.unevaluated)
      return;
    const y = (_ = r == null ? void 0 : r.validate) === null || _ === void 0 ? void 0 : _.evaluated;
    if (o.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (o.props = ls.mergeEvaluated.props(s, y.props, o.props));
      else {
        const m = s.var("props", (0, He._)`${v}.evaluated.props`);
        o.props = ls.mergeEvaluated.props(s, m, o.props, He.Name);
      }
    if (o.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (o.items = ls.mergeEvaluated.items(s, y.items, o.items));
      else {
        const m = s.var("items", (0, He._)`${v}.evaluated.items`);
        o.items = ls.mergeEvaluated.items(s, m, o.items, He.Name);
      }
  }
}
kr.callRef = As;
kr.default = Gw;
Object.defineProperty(Qi, "__esModule", { value: !0 });
const Hw = ec, Bw = kr, xw = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Hw.default,
  Bw.default
];
Qi.default = xw;
var tc = {}, rc = {};
Object.defineProperty(rc, "__esModule", { value: !0 });
const Ws = te, Vt = Ws.operators, Xs = {
  maximum: { okStr: "<=", ok: Vt.LTE, fail: Vt.GT },
  minimum: { okStr: ">=", ok: Vt.GTE, fail: Vt.LT },
  exclusiveMaximum: { okStr: "<", ok: Vt.LT, fail: Vt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Vt.GT, fail: Vt.LTE }
}, Jw = {
  message: ({ keyword: e, schemaCode: t }) => (0, Ws.str)`must be ${Xs[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Ws._)`{comparison: ${Xs[e].okStr}, limit: ${t}}`
}, Ww = {
  keyword: Object.keys(Xs),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Jw,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Ws._)`${r} ${Xs[t].fail} ${n} || isNaN(${r})`);
  }
};
rc.default = Ww;
var nc = {};
Object.defineProperty(nc, "__esModule", { value: !0 });
const Un = te, Xw = {
  message: ({ schemaCode: e }) => (0, Un.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Un._)`{multipleOf: ${e}}`
}, Yw = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Xw,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, o = s.opts.multipleOfPrecision, a = t.let("res"), c = o ? (0, Un._)`Math.abs(Math.round(${a}) - ${a}) > 1e-${o}` : (0, Un._)`${a} !== parseInt(${a})`;
    e.fail$data((0, Un._)`(${n} === 0 || (${a} = ${r}/${n}, ${c}))`);
  }
};
nc.default = Yw;
var sc = {}, oc = {};
Object.defineProperty(oc, "__esModule", { value: !0 });
function wf(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
oc.default = wf;
wf.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(sc, "__esModule", { value: !0 });
const Sr = te, Zw = F, Qw = oc, eE = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Sr.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Sr._)`{limit: ${e}}`
}, tE = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: eE,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, o = t === "maxLength" ? Sr.operators.GT : Sr.operators.LT, a = s.opts.unicode === !1 ? (0, Sr._)`${r}.length` : (0, Sr._)`${(0, Zw.useFunc)(e.gen, Qw.default)}(${r})`;
    e.fail$data((0, Sr._)`${a} ${o} ${n}`);
  }
};
sc.default = tE;
var ac = {};
Object.defineProperty(ac, "__esModule", { value: !0 });
const rE = ne, nE = F, Jr = te, sE = {
  message: ({ schemaCode: e }) => (0, Jr.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Jr._)`{pattern: ${e}}`
}, oE = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: sE,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: o, it: a } = e, c = a.opts.unicodeRegExp ? "u" : "";
    if (n) {
      const { regExp: l } = a.opts.code, d = l.code === "new RegExp" ? (0, Jr._)`new RegExp` : (0, nE.useFunc)(t, l), u = t.let("valid");
      t.try(() => t.assign(u, (0, Jr._)`${d}(${o}, ${c}).test(${r})`), () => t.assign(u, !1)), e.fail$data((0, Jr._)`!${u}`);
    } else {
      const l = (0, rE.usePattern)(e, s);
      e.fail$data((0, Jr._)`!${l}.test(${r})`);
    }
  }
};
ac.default = oE;
var ic = {};
Object.defineProperty(ic, "__esModule", { value: !0 });
const Kn = te, aE = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Kn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Kn._)`{limit: ${e}}`
}, iE = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: aE,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Kn.operators.GT : Kn.operators.LT;
    e.fail$data((0, Kn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
ic.default = iE;
var cc = {};
Object.defineProperty(cc, "__esModule", { value: !0 });
const Sn = ne, qn = te, cE = F, lE = {
  message: ({ params: { missingProperty: e } }) => (0, qn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, qn._)`{missingProperty: ${e}}`
}, uE = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: lE,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: o, it: a } = e, { opts: c } = a;
    if (!o && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (a.allErrors ? d() : u(), c.strictRequired) {
      const g = e.parentSchema.properties, { definedProperties: v } = e.it;
      for (const _ of r)
        if ((g == null ? void 0 : g[_]) === void 0 && !v.has(_)) {
          const y = a.schemaEnv.baseId + a.errSchemaPath, m = `required property "${_}" is not defined at "${y}" (strictRequired)`;
          (0, cE.checkStrictMode)(a, m, a.opts.strictRequired);
        }
    }
    function d() {
      if (l || o)
        e.block$data(qn.nil, h);
      else
        for (const g of r)
          (0, Sn.checkReportMissingProp)(e, g);
    }
    function u() {
      const g = t.let("missing");
      if (l || o) {
        const v = t.let("valid", !0);
        e.block$data(v, () => b(g, v)), e.ok(v);
      } else
        t.if((0, Sn.checkMissingProp)(e, r, g)), (0, Sn.reportMissingProp)(e, g), t.else();
    }
    function h() {
      t.forOf("prop", n, (g) => {
        e.setParams({ missingProperty: g }), t.if((0, Sn.noPropertyInData)(t, s, g, c.ownProperties), () => e.error());
      });
    }
    function b(g, v) {
      e.setParams({ missingProperty: g }), t.forOf(g, n, () => {
        t.assign(v, (0, Sn.propertyInData)(t, s, g, c.ownProperties)), t.if((0, qn.not)(v), () => {
          e.error(), t.break();
        });
      }, qn.nil);
    }
  }
};
cc.default = uE;
var lc = {};
Object.defineProperty(lc, "__esModule", { value: !0 });
const Gn = te, dE = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Gn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Gn._)`{limit: ${e}}`
}, fE = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: dE,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Gn.operators.GT : Gn.operators.LT;
    e.fail$data((0, Gn._)`${r}.length ${s} ${n}`);
  }
};
lc.default = fE;
var uc = {}, Qn = {};
Object.defineProperty(Qn, "__esModule", { value: !0 });
const Ef = to;
Ef.code = 'require("ajv/dist/runtime/equal").default';
Qn.default = Ef;
Object.defineProperty(uc, "__esModule", { value: !0 });
const Do = be, Oe = te, hE = F, mE = Qn, pE = {
  message: ({ params: { i: e, j: t } }) => (0, Oe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Oe._)`{i: ${e}, j: ${t}}`
}, $E = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: pE,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: o, schemaCode: a, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = o.items ? (0, Do.getSchemaTypes)(o.items) : [];
    e.block$data(l, u, (0, Oe._)`${a} === false`), e.ok(l);
    function u() {
      const v = t.let("i", (0, Oe._)`${r}.length`), _ = t.let("j");
      e.setParams({ i: v, j: _ }), t.assign(l, !0), t.if((0, Oe._)`${v} > 1`, () => (h() ? b : g)(v, _));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function b(v, _) {
      const y = t.name("item"), m = (0, Do.checkDataTypes)(d, y, c.opts.strictNumbers, Do.DataType.Wrong), w = t.const("indices", (0, Oe._)`{}`);
      t.for((0, Oe._)`;${v}--;`, () => {
        t.let(y, (0, Oe._)`${r}[${v}]`), t.if(m, (0, Oe._)`continue`), d.length > 1 && t.if((0, Oe._)`typeof ${y} == "string"`, (0, Oe._)`${y} += "_"`), t.if((0, Oe._)`typeof ${w}[${y}] == "number"`, () => {
          t.assign(_, (0, Oe._)`${w}[${y}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Oe._)`${w}[${y}] = ${v}`);
      });
    }
    function g(v, _) {
      const y = (0, hE.useFunc)(t, mE.default), m = t.name("outer");
      t.label(m).for((0, Oe._)`;${v}--;`, () => t.for((0, Oe._)`${_} = ${v}; ${_}--;`, () => t.if((0, Oe._)`${y}(${r}[${v}], ${r}[${_}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
uc.default = $E;
var dc = {};
Object.defineProperty(dc, "__esModule", { value: !0 });
const ua = te, yE = F, gE = Qn, _E = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, ua._)`{allowedValue: ${e}}`
}, vE = {
  keyword: "const",
  $data: !0,
  error: _E,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: o } = e;
    n || o && typeof o == "object" ? e.fail$data((0, ua._)`!${(0, yE.useFunc)(t, gE.default)}(${r}, ${s})`) : e.fail((0, ua._)`${o} !== ${r}`);
  }
};
dc.default = vE;
var fc = {};
Object.defineProperty(fc, "__esModule", { value: !0 });
const In = te, wE = F, EE = Qn, bE = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, In._)`{allowedValues: ${e}}`
}, SE = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: bE,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: o, it: a } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= a.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, wE.useFunc)(t, EE.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const g = t.const("vSchema", o);
      u = (0, In.or)(...s.map((v, _) => b(g, _)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", o, (g) => t.if((0, In._)`${d()}(${r}, ${g})`, () => t.assign(u, !0).break()));
    }
    function b(g, v) {
      const _ = s[v];
      return typeof _ == "object" && _ !== null ? (0, In._)`${d()}(${r}, ${g}[${v}])` : (0, In._)`${r} === ${_}`;
    }
  }
};
fc.default = SE;
Object.defineProperty(tc, "__esModule", { value: !0 });
const PE = rc, OE = nc, NE = sc, IE = ac, RE = ic, TE = cc, jE = lc, kE = uc, AE = dc, CE = fc, DE = [
  // number
  PE.default,
  OE.default,
  // string
  NE.default,
  IE.default,
  // object
  RE.default,
  TE.default,
  // array
  jE.default,
  kE.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  AE.default,
  CE.default
];
tc.default = DE;
var hc = {}, pn = {};
Object.defineProperty(pn, "__esModule", { value: !0 });
pn.validateAdditionalItems = void 0;
const Pr = te, da = F, ME = {
  message: ({ params: { len: e } }) => (0, Pr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Pr._)`{limit: ${e}}`
}, FE = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: ME,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, da.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    bf(e, n);
  }
};
function bf(e, t) {
  const { gen: r, schema: n, data: s, keyword: o, it: a } = e;
  a.items = !0;
  const c = r.const("len", (0, Pr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Pr._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, da.alwaysValidSchema)(a, n)) {
    const d = r.var("valid", (0, Pr._)`${c} <= ${t.length}`);
    r.if((0, Pr.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: o, dataProp: u, dataPropType: da.Type.Num }, d), a.allErrors || r.if((0, Pr.not)(d), () => r.break());
    });
  }
}
pn.validateAdditionalItems = bf;
pn.default = FE;
var mc = {}, $n = {};
Object.defineProperty($n, "__esModule", { value: !0 });
$n.validateTuple = void 0;
const Dl = te, Cs = F, LE = ne, VE = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Sf(e, "additionalItems", t);
    r.items = !0, !(0, Cs.alwaysValidSchema)(r, t) && e.ok((0, LE.validateArray)(e));
  }
};
function Sf(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: o, keyword: a, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = Cs.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, Dl._)`${o}.length`);
  r.forEach((h, b) => {
    (0, Cs.alwaysValidSchema)(c, h) || (n.if((0, Dl._)`${d} > ${b}`, () => e.subschema({
      keyword: a,
      schemaProp: b,
      dataProp: b
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: b, errSchemaPath: g } = c, v = r.length, _ = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (b.strictTuples && !_) {
      const y = `"${a}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${g}"`;
      (0, Cs.checkStrictMode)(c, y, b.strictTuples);
    }
  }
}
$n.validateTuple = Sf;
$n.default = VE;
Object.defineProperty(mc, "__esModule", { value: !0 });
const zE = $n, UE = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, zE.validateTuple)(e, "items")
};
mc.default = UE;
var pc = {};
Object.defineProperty(pc, "__esModule", { value: !0 });
const Ml = te, KE = F, qE = ne, GE = pn, HE = {
  message: ({ params: { len: e } }) => (0, Ml.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ml._)`{limit: ${e}}`
}, BE = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: HE,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, KE.alwaysValidSchema)(n, t) && (s ? (0, GE.validateAdditionalItems)(e, s) : e.ok((0, qE.validateArray)(e)));
  }
};
pc.default = BE;
var $c = {};
Object.defineProperty($c, "__esModule", { value: !0 });
const tt = te, us = F, xE = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, tt.str)`must contain at least ${e} valid item(s)` : (0, tt.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, tt._)`{minContains: ${e}}` : (0, tt._)`{minContains: ${e}, maxContains: ${t}}`
}, JE = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: xE,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: o } = e;
    let a, c;
    const { minContains: l, maxContains: d } = n;
    o.opts.next ? (a = l === void 0 ? 1 : l, c = d) : a = 1;
    const u = t.const("len", (0, tt._)`${s}.length`);
    if (e.setParams({ min: a, max: c }), c === void 0 && a === 0) {
      (0, us.checkStrictMode)(o, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && a > c) {
      (0, us.checkStrictMode)(o, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, us.alwaysValidSchema)(o, r)) {
      let _ = (0, tt._)`${u} >= ${a}`;
      c !== void 0 && (_ = (0, tt._)`${_} && ${u} <= ${c}`), e.pass(_);
      return;
    }
    o.items = !0;
    const h = t.name("valid");
    c === void 0 && a === 1 ? g(h, () => t.if(h, () => t.break())) : a === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, tt._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
    function b() {
      const _ = t.name("_valid"), y = t.let("count", 0);
      g(_, () => t.if(_, () => v(y)));
    }
    function g(_, y) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: us.Type.Num,
          compositeRule: !0
        }, _), y();
      });
    }
    function v(_) {
      t.code((0, tt._)`${_}++`), c === void 0 ? t.if((0, tt._)`${_} >= ${a}`, () => t.assign(h, !0).break()) : (t.if((0, tt._)`${_} > ${c}`, () => t.assign(h, !1).break()), a === 1 ? t.assign(h, !0) : t.if((0, tt._)`${_} >= ${a}`, () => t.assign(h, !0)));
    }
  }
};
$c.default = JE;
var Pf = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = te, r = F, n = ne;
  e.error = {
    message: ({ params: { property: l, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${l},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${u}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [d, u] = o(l);
      a(l, d), c(l, u);
    }
  };
  function o({ schema: l }) {
    const d = {}, u = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const b = Array.isArray(l[h]) ? d : u;
      b[h] = l[h];
    }
    return [d, u];
  }
  function a(l, d = l.schema) {
    const { gen: u, data: h, it: b } = l;
    if (Object.keys(d).length === 0)
      return;
    const g = u.let("missing");
    for (const v in d) {
      const _ = d[v];
      if (_.length === 0)
        continue;
      const y = (0, n.propertyInData)(u, h, v, b.opts.ownProperties);
      l.setParams({
        property: v,
        depsCount: _.length,
        deps: _.join(", ")
      }), b.allErrors ? u.if(y, () => {
        for (const m of _)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${y} && (${(0, n.checkMissingProp)(l, _, g)})`), (0, n.reportMissingProp)(l, g), u.else());
    }
  }
  e.validatePropertyDeps = a;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: b, it: g } = l, v = u.name("valid");
    for (const _ in d)
      (0, r.alwaysValidSchema)(g, d[_]) || (u.if(
        (0, n.propertyInData)(u, h, _, g.opts.ownProperties),
        () => {
          const y = l.subschema({ keyword: b, schemaProp: _ }, v);
          l.mergeValidEvaluated(y, v);
        },
        () => u.var(v, !0)
        // TODO var
      ), l.ok(v));
  }
  e.validateSchemaDeps = c, e.default = s;
})(Pf);
var yc = {};
Object.defineProperty(yc, "__esModule", { value: !0 });
const Of = te, WE = F, XE = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Of._)`{propertyName: ${e.propertyName}}`
}, YE = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: XE,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, WE.alwaysValidSchema)(s, r))
      return;
    const o = t.name("valid");
    t.forIn("key", n, (a) => {
      e.setParams({ propertyName: a }), e.subschema({
        keyword: "propertyNames",
        data: a,
        dataTypes: ["string"],
        propertyName: a,
        compositeRule: !0
      }, o), t.if((0, Of.not)(o), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(o);
  }
};
yc.default = YE;
var fo = {};
Object.defineProperty(fo, "__esModule", { value: !0 });
const ds = ne, it = te, ZE = Et, fs = F, QE = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, it._)`{additionalProperty: ${e.additionalProperty}}`
}, eb = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: QE,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: o, it: a } = e;
    if (!o)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = a;
    if (a.props = !0, l.removeAdditional !== "all" && (0, fs.alwaysValidSchema)(a, r))
      return;
    const d = (0, ds.allSchemaProperties)(n.properties), u = (0, ds.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, it._)`${o} === ${ZE.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(b(y), () => v(y));
      });
    }
    function b(y) {
      let m;
      if (d.length > 8) {
        const w = (0, fs.schemaRefOrVal)(a, n.properties, "properties");
        m = (0, ds.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, it.or)(...d.map((w) => (0, it._)`${y} === ${w}`)) : m = it.nil;
      return u.length && (m = (0, it.or)(m, ...u.map((w) => (0, it._)`${(0, ds.usePattern)(e, w)}.test(${y})`))), (0, it.not)(m);
    }
    function g(y) {
      t.code((0, it._)`delete ${s}[${y}]`);
    }
    function v(y) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        g(y);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: y }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, fs.alwaysValidSchema)(a, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (_(y, m, !1), t.if((0, it.not)(m), () => {
          e.reset(), g(y);
        })) : (_(y, m), c || t.if((0, it.not)(m), () => t.break()));
      }
    }
    function _(y, m, w) {
      const O = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: fs.Type.Str
      };
      w === !1 && Object.assign(O, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(O, m);
    }
  }
};
fo.default = eb;
var gc = {};
Object.defineProperty(gc, "__esModule", { value: !0 });
const tb = ft, Fl = ne, Mo = F, Ll = fo, rb = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: o } = e;
    o.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Ll.default.code(new tb.KeywordCxt(o, Ll.default, "additionalProperties"));
    const a = (0, Fl.allSchemaProperties)(r);
    for (const h of a)
      o.definedProperties.add(h);
    o.opts.unevaluated && a.length && o.props !== !0 && (o.props = Mo.mergeEvaluated.props(t, (0, Mo.toHash)(a), o.props));
    const c = a.filter((h) => !(0, Mo.alwaysValidSchema)(o, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, Fl.propertyInData)(t, s, h, o.opts.ownProperties)), u(h), o.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function d(h) {
      return o.opts.useDefaults && !o.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
gc.default = rb;
var _c = {};
Object.defineProperty(_c, "__esModule", { value: !0 });
const Vl = ne, hs = te, zl = F, Ul = F, nb = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: o } = e, { opts: a } = o, c = (0, Vl.allSchemaProperties)(r), l = c.filter((_) => (0, zl.alwaysValidSchema)(o, r[_]));
    if (c.length === 0 || l.length === c.length && (!o.opts.unevaluated || o.props === !0))
      return;
    const d = a.strictSchema && !a.allowMatchingProperties && s.properties, u = t.name("valid");
    o.props !== !0 && !(o.props instanceof hs.Name) && (o.props = (0, Ul.evaluatedPropsToName)(t, o.props));
    const { props: h } = o;
    b();
    function b() {
      for (const _ of c)
        d && g(_), o.allErrors ? v(_) : (t.var(u, !0), v(_), t.if(u));
    }
    function g(_) {
      for (const y in d)
        new RegExp(_).test(y) && (0, zl.checkStrictMode)(o, `property ${y} matches pattern ${_} (use allowMatchingProperties)`);
    }
    function v(_) {
      t.forIn("key", n, (y) => {
        t.if((0, hs._)`${(0, Vl.usePattern)(e, _)}.test(${y})`, () => {
          const m = l.includes(_);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: _,
            dataProp: y,
            dataPropType: Ul.Type.Str
          }, u), o.opts.unevaluated && h !== !0 ? t.assign((0, hs._)`${h}[${y}]`, !0) : !m && !o.allErrors && t.if((0, hs.not)(u), () => t.break());
        });
      });
    }
  }
};
_c.default = nb;
var vc = {};
Object.defineProperty(vc, "__esModule", { value: !0 });
const sb = F, ob = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, sb.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
vc.default = ob;
var wc = {};
Object.defineProperty(wc, "__esModule", { value: !0 });
const ab = ne, ib = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: ab.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
wc.default = ib;
var Ec = {};
Object.defineProperty(Ec, "__esModule", { value: !0 });
const Ds = te, cb = F, lb = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Ds._)`{passingSchemas: ${e.passing}}`
}, ub = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: lb,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const o = r, a = t.let("valid", !1), c = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: c }), t.block(d), e.result(a, () => e.reset(), () => e.error(!0));
    function d() {
      o.forEach((u, h) => {
        let b;
        (0, cb.alwaysValidSchema)(s, u) ? t.var(l, !0) : b = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, Ds._)`${l} && ${a}`).assign(a, !1).assign(c, (0, Ds._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(a, !0), t.assign(c, h), b && e.mergeEvaluated(b, Ds.Name);
        });
      });
    }
  }
};
Ec.default = ub;
var bc = {};
Object.defineProperty(bc, "__esModule", { value: !0 });
const db = F, fb = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((o, a) => {
      if ((0, db.alwaysValidSchema)(n, o))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: a }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
bc.default = fb;
var Sc = {};
Object.defineProperty(Sc, "__esModule", { value: !0 });
const Ys = te, Nf = F, hb = {
  message: ({ params: e }) => (0, Ys.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Ys._)`{failingKeyword: ${e.ifClause}}`
}, mb = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: hb,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Nf.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Kl(n, "then"), o = Kl(n, "else");
    if (!s && !o)
      return;
    const a = t.let("valid", !0), c = t.name("_valid");
    if (l(), e.reset(), s && o) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(c, d("then", u), d("else", u));
    } else s ? t.if(c, d("then")) : t.if((0, Ys.not)(c), d("else"));
    e.pass(a, () => e.error(!0));
    function l() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const b = e.subschema({ keyword: u }, c);
        t.assign(a, c), e.mergeValidEvaluated(b, a), h ? t.assign(h, (0, Ys._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Kl(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Nf.alwaysValidSchema)(e, r);
}
Sc.default = mb;
var Pc = {};
Object.defineProperty(Pc, "__esModule", { value: !0 });
const pb = F, $b = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, pb.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Pc.default = $b;
Object.defineProperty(hc, "__esModule", { value: !0 });
const yb = pn, gb = mc, _b = $n, vb = pc, wb = $c, Eb = Pf, bb = yc, Sb = fo, Pb = gc, Ob = _c, Nb = vc, Ib = wc, Rb = Ec, Tb = bc, jb = Sc, kb = Pc;
function Ab(e = !1) {
  const t = [
    // any
    Nb.default,
    Ib.default,
    Rb.default,
    Tb.default,
    jb.default,
    kb.default,
    // object
    bb.default,
    Sb.default,
    Eb.default,
    Pb.default,
    Ob.default
  ];
  return e ? t.push(gb.default, vb.default) : t.push(yb.default, _b.default), t.push(wb.default), t;
}
hc.default = Ab;
var Oc = {}, Nc = {};
Object.defineProperty(Nc, "__esModule", { value: !0 });
const ve = te, Cb = {
  message: ({ schemaCode: e }) => (0, ve.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, ve._)`{format: ${e}}`
}, Db = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Cb,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: o, schemaCode: a, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? b() : g();
    function b() {
      const v = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), _ = r.const("fDef", (0, ve._)`${v}[${a}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, ve._)`typeof ${_} == "object" && !(${_} instanceof RegExp)`, () => r.assign(y, (0, ve._)`${_}.type || "string"`).assign(m, (0, ve._)`${_}.validate`), () => r.assign(y, (0, ve._)`"string"`).assign(m, _)), e.fail$data((0, ve.or)(w(), O()));
      function w() {
        return l.strictSchema === !1 ? ve.nil : (0, ve._)`${a} && !${m}`;
      }
      function O() {
        const I = u.$async ? (0, ve._)`(${_}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, ve._)`${m}(${n})`, R = (0, ve._)`(typeof ${m} == "function" ? ${I} : ${m}.test(${n}))`;
        return (0, ve._)`${m} && ${m} !== true && ${y} === ${t} && !${R}`;
      }
    }
    function g() {
      const v = h.formats[o];
      if (!v) {
        w();
        return;
      }
      if (v === !0)
        return;
      const [_, y, m] = O(v);
      _ === t && e.pass(I());
      function w() {
        if (l.strictSchema === !1) {
          h.logger.warn(R());
          return;
        }
        throw new Error(R());
        function R() {
          return `unknown format "${o}" ignored in schema at path "${d}"`;
        }
      }
      function O(R) {
        const H = R instanceof RegExp ? (0, ve.regexpCode)(R) : l.code.formats ? (0, ve._)`${l.code.formats}${(0, ve.getProperty)(o)}` : void 0, Y = r.scopeValue("formats", { key: o, ref: R, code: H });
        return typeof R == "object" && !(R instanceof RegExp) ? [R.type || "string", R.validate, (0, ve._)`${Y}.validate`] : ["string", R, Y];
      }
      function I() {
        if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, ve._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, ve._)`${m}(${n})` : (0, ve._)`${m}.test(${n})`;
      }
    }
  }
};
Nc.default = Db;
Object.defineProperty(Oc, "__esModule", { value: !0 });
const Mb = Nc, Fb = [Mb.default];
Oc.default = Fb;
var on = {};
Object.defineProperty(on, "__esModule", { value: !0 });
on.contentVocabulary = on.metadataVocabulary = void 0;
on.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
on.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Zi, "__esModule", { value: !0 });
const Lb = Qi, Vb = tc, zb = hc, Ub = Oc, ql = on, Kb = [
  Lb.default,
  Vb.default,
  (0, zb.default)(),
  Ub.default,
  ql.metadataVocabulary,
  ql.contentVocabulary
];
Zi.default = Kb;
var Ic = {}, ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
ho.DiscrError = void 0;
var Gl;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Gl || (ho.DiscrError = Gl = {}));
Object.defineProperty(Ic, "__esModule", { value: !0 });
const Ur = te, fa = ho, Hl = Je, qb = mn, Gb = F, Hb = {
  message: ({ params: { discrError: e, tagName: t } }) => e === fa.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, Ur._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, Bb = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Hb,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: o } = e, { oneOf: a } = s;
    if (!o.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const c = n.propertyName;
    if (typeof c != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!a)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), d = t.const("tag", (0, Ur._)`${r}${(0, Ur.getProperty)(c)}`);
    t.if((0, Ur._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: fa.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const g = b();
      t.if(!1);
      for (const v in g)
        t.elseIf((0, Ur._)`${d} === ${v}`), t.assign(l, h(g[v]));
      t.else(), e.error(!1, { discrError: fa.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h(g) {
      const v = t.name("valid"), _ = e.subschema({ keyword: "oneOf", schemaProp: g }, v);
      return e.mergeEvaluated(_, Ur.Name), v;
    }
    function b() {
      var g;
      const v = {}, _ = m(s);
      let y = !0;
      for (let I = 0; I < a.length; I++) {
        let R = a[I];
        if (R != null && R.$ref && !(0, Gb.schemaHasRulesButRef)(R, o.self.RULES)) {
          const Y = R.$ref;
          if (R = Hl.resolveRef.call(o.self, o.schemaEnv.root, o.baseId, Y), R instanceof Hl.SchemaEnv && (R = R.schema), R === void 0)
            throw new qb.default(o.opts.uriResolver, o.baseId, Y);
        }
        const H = (g = R == null ? void 0 : R.properties) === null || g === void 0 ? void 0 : g[c];
        if (typeof H != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        y = y && (_ || m(R)), w(H, I);
      }
      if (!y)
        throw new Error(`discriminator: "${c}" must be required`);
      return v;
      function m({ required: I }) {
        return Array.isArray(I) && I.includes(c);
      }
      function w(I, R) {
        if (I.const)
          O(I.const, R);
        else if (I.enum)
          for (const H of I.enum)
            O(H, R);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function O(I, R) {
        if (typeof I != "string" || I in v)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        v[I] = R;
      }
    }
  }
};
Ic.default = Bb;
const xb = "http://json-schema.org/draft-07/schema#", Jb = "http://json-schema.org/draft-07/schema#", Wb = "Core schema meta-schema", Xb = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Yb = [
  "object",
  "boolean"
], Zb = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, Qb = {
  $schema: xb,
  $id: Jb,
  title: Wb,
  definitions: Xb,
  type: Yb,
  properties: Zb,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = zd, n = Zi, s = Ic, o = Qb, a = ["/properties"], c = "http://json-schema.org/draft-07/schema";
  class l extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((v) => this.addVocabulary(v)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const v = this.opts.$data ? this.$dataMetaSchema(o, a) : o;
      this.addMetaSchema(v, c, !1), this.refs["http://json-schema.org/schema"] = c;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
    }
  }
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var d = ft;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = te;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return u._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return u.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return u.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return u.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return u.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return u.CodeGen;
  } });
  var h = Zn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var b = mn;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return b.default;
  } });
})(oa, oa.exports);
var eS = oa.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = eS, r = te, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, o = {
    message: ({ keyword: c, schemaCode: l }) => (0, r.str)`should be ${s[c].okStr} ${l}`,
    params: ({ keyword: c, schemaCode: l }) => (0, r._)`{comparison: ${s[c].okStr}, limit: ${l}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: o,
    code(c) {
      const { gen: l, data: d, schemaCode: u, keyword: h, it: b } = c, { opts: g, self: v } = b;
      if (!g.validateFormats)
        return;
      const _ = new t.KeywordCxt(b, v.RULES.all.format.definition, "format");
      _.$data ? y() : m();
      function y() {
        const O = l.scopeValue("formats", {
          ref: v.formats,
          code: g.code.formats
        }), I = l.const("fmt", (0, r._)`${O}[${_.schemaCode}]`);
        c.fail$data((0, r.or)((0, r._)`typeof ${I} != "object"`, (0, r._)`${I} instanceof RegExp`, (0, r._)`typeof ${I}.compare != "function"`, w(I)));
      }
      function m() {
        const O = _.schema, I = v.formats[O];
        if (!I || I === !0)
          return;
        if (typeof I != "object" || I instanceof RegExp || typeof I.compare != "function")
          throw new Error(`"${h}": format "${O}" does not define "compare" function`);
        const R = l.scopeValue("formats", {
          key: O,
          ref: I,
          code: g.code.formats ? (0, r._)`${g.code.formats}${(0, r.getProperty)(O)}` : void 0
        });
        c.fail$data(w(R));
      }
      function w(O) {
        return (0, r._)`${O}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const a = (c) => (c.addKeyword(e.formatLimitDefinition), c);
  e.default = a;
})(Vd);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Ld, n = Vd, s = te, o = new s.Name("fullFormats"), a = new s.Name("fastFormats"), c = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return l(d, u, r.fullFormats, o), d;
    const [h, b] = u.mode === "fast" ? [r.fastFormats, a] : [r.fullFormats, o], g = u.formats || r.formatNames;
    return l(d, g, h, b), u.keywords && (0, n.default)(d), d;
  };
  c.get = (d, u = "full") => {
    const b = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!b)
      throw new Error(`Unknown format "${d}"`);
    return b;
  };
  function l(d, u, h, b) {
    var g, v;
    (g = (v = d.opts.code).formats) !== null && g !== void 0 || (v.formats = (0, s._)`require("ajv-formats/dist/formats").${b}`);
    for (const _ of u)
      d.addFormat(_, h[_]);
  }
  e.exports = t = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
})(sa, sa.exports);
var tS = sa.exports;
const rS = /* @__PURE__ */ ju(tS), nS = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), o = Object.getOwnPropertyDescriptor(t, r);
  !sS(s, o) && n || Object.defineProperty(e, r, o);
}, sS = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, oS = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, aS = (e, t) => `/* Wrapped ${e}*/
${t}`, iS = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), cS = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), lS = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = aS.bind(null, n, t.toString());
  Object.defineProperty(s, "name", cS);
  const { writable: o, enumerable: a, configurable: c } = iS;
  Object.defineProperty(e, "toString", { value: s, writable: o, enumerable: a, configurable: c });
};
function uS(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    nS(e, t, s, r);
  return oS(e, t), lS(e, t, n), e;
}
const Bl = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: s = !1,
    after: o = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!s && !o)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let a, c, l;
  const d = function(...u) {
    const h = this, b = () => {
      a = void 0, c && (clearTimeout(c), c = void 0), o && (l = e.apply(h, u));
    }, g = () => {
      c = void 0, a && (clearTimeout(a), a = void 0), o && (l = e.apply(h, u));
    }, v = s && !a;
    return clearTimeout(a), a = setTimeout(b, r), n > 0 && n !== Number.POSITIVE_INFINITY && !c && (c = setTimeout(g, n)), v && (l = e.apply(h, u)), l;
  };
  return uS(d, e), d.cancel = () => {
    a && (clearTimeout(a), a = void 0), c && (clearTimeout(c), c = void 0);
  }, d;
};
var ha = { exports: {} };
const dS = "2.0.0", If = 256, fS = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, hS = 16, mS = If - 6, pS = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var es = {
  MAX_LENGTH: If,
  MAX_SAFE_COMPONENT_LENGTH: hS,
  MAX_SAFE_BUILD_LENGTH: mS,
  MAX_SAFE_INTEGER: fS,
  RELEASE_TYPES: pS,
  SEMVER_SPEC_VERSION: dS,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const $S = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var mo = $S;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = es, o = mo;
  t = e.exports = {};
  const a = t.re = [], c = t.safeRe = [], l = t.src = [], d = t.safeSrc = [], u = t.t = {};
  let h = 0;
  const b = "[a-zA-Z0-9-]", g = [
    ["\\s", 1],
    ["\\d", s],
    [b, n]
  ], v = (y) => {
    for (const [m, w] of g)
      y = y.split(`${m}*`).join(`${m}{0,${w}}`).split(`${m}+`).join(`${m}{1,${w}}`);
    return y;
  }, _ = (y, m, w) => {
    const O = v(m), I = h++;
    o(y, I, m), u[y] = I, l[I] = m, d[I] = O, a[I] = new RegExp(m, w ? "g" : void 0), c[I] = new RegExp(O, w ? "g" : void 0);
  };
  _("NUMERICIDENTIFIER", "0|[1-9]\\d*"), _("NUMERICIDENTIFIERLOOSE", "\\d+"), _("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${b}*`), _("MAINVERSION", `(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})`), _("MAINVERSIONLOOSE", `(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASEIDENTIFIER", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIER]})`), _("PRERELEASEIDENTIFIERLOOSE", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASE", `(?:-(${l[u.PRERELEASEIDENTIFIER]}(?:\\.${l[u.PRERELEASEIDENTIFIER]})*))`), _("PRERELEASELOOSE", `(?:-?(${l[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[u.PRERELEASEIDENTIFIERLOOSE]})*))`), _("BUILDIDENTIFIER", `${b}+`), _("BUILD", `(?:\\+(${l[u.BUILDIDENTIFIER]}(?:\\.${l[u.BUILDIDENTIFIER]})*))`), _("FULLPLAIN", `v?${l[u.MAINVERSION]}${l[u.PRERELEASE]}?${l[u.BUILD]}?`), _("FULL", `^${l[u.FULLPLAIN]}$`), _("LOOSEPLAIN", `[v=\\s]*${l[u.MAINVERSIONLOOSE]}${l[u.PRERELEASELOOSE]}?${l[u.BUILD]}?`), _("LOOSE", `^${l[u.LOOSEPLAIN]}$`), _("GTLT", "((?:<|>)?=?)"), _("XRANGEIDENTIFIERLOOSE", `${l[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), _("XRANGEIDENTIFIER", `${l[u.NUMERICIDENTIFIER]}|x|X|\\*`), _("XRANGEPLAIN", `[v=\\s]*(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:${l[u.PRERELEASE]})?${l[u.BUILD]}?)?)?`), _("XRANGEPLAINLOOSE", `[v=\\s]*(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:${l[u.PRERELEASELOOSE]})?${l[u.BUILD]}?)?)?`), _("XRANGE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAIN]}$`), _("XRANGELOOSE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAINLOOSE]}$`), _("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), _("COERCE", `${l[u.COERCEPLAIN]}(?:$|[^\\d])`), _("COERCEFULL", l[u.COERCEPLAIN] + `(?:${l[u.PRERELEASE]})?(?:${l[u.BUILD]})?(?:$|[^\\d])`), _("COERCERTL", l[u.COERCE], !0), _("COERCERTLFULL", l[u.COERCEFULL], !0), _("LONETILDE", "(?:~>?)"), _("TILDETRIM", `(\\s*)${l[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", _("TILDE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAIN]}$`), _("TILDELOOSE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAINLOOSE]}$`), _("LONECARET", "(?:\\^)"), _("CARETTRIM", `(\\s*)${l[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", _("CARET", `^${l[u.LONECARET]}${l[u.XRANGEPLAIN]}$`), _("CARETLOOSE", `^${l[u.LONECARET]}${l[u.XRANGEPLAINLOOSE]}$`), _("COMPARATORLOOSE", `^${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]})$|^$`), _("COMPARATOR", `^${l[u.GTLT]}\\s*(${l[u.FULLPLAIN]})$|^$`), _("COMPARATORTRIM", `(\\s*)${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]}|${l[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", _("HYPHENRANGE", `^\\s*(${l[u.XRANGEPLAIN]})\\s+-\\s+(${l[u.XRANGEPLAIN]})\\s*$`), _("HYPHENRANGELOOSE", `^\\s*(${l[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[u.XRANGEPLAINLOOSE]})\\s*$`), _("STAR", "(<|>)?=?\\s*\\*"), _("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), _("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(ha, ha.exports);
var ts = ha.exports;
const yS = Object.freeze({ loose: !0 }), gS = Object.freeze({}), _S = (e) => e ? typeof e != "object" ? yS : e : gS;
var Rc = _S;
const xl = /^[0-9]+$/, Rf = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const r = xl.test(e), n = xl.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, vS = (e, t) => Rf(t, e);
var Tf = {
  compareIdentifiers: Rf,
  rcompareIdentifiers: vS
};
const ms = mo, { MAX_LENGTH: Jl, MAX_SAFE_INTEGER: ps } = es, { safeRe: $s, t: ys } = ts, wS = Rc, { compareIdentifiers: ma } = Tf, ES = (e, t) => {
  const r = t.split(".");
  if (r.length > e.length)
    return !1;
  for (let n = 0; n < r.length; n++)
    if (ma(e[n], r[n]) !== 0)
      return !1;
  return !0;
};
let bS = class pt {
  constructor(t, r) {
    if (r = wS(r), t instanceof pt) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > Jl)
      throw new TypeError(
        `version is longer than ${Jl} characters`
      );
    ms("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? $s[ys.LOOSE] : $s[ys.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > ps || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > ps || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > ps || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const o = +s;
        if (o >= 0 && o < ps)
          return o;
      }
      return s;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (ms("SemVer.compare", this.version, this.options, t), !(t instanceof pt)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new pt(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof pt || (t = new pt(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof pt || (t = new pt(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (ms("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return ma(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof pt || (t = new pt(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (ms("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return ma(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? $s[ys.PRERELEASELOOSE] : $s[ys.PRERELEASE]);
        if (!s || s[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const s = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [s];
        else {
          let o = this.prerelease.length;
          for (; --o >= 0; )
            typeof this.prerelease[o] == "number" && (this.prerelease[o]++, o = -2);
          if (o === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(s);
          }
        }
        if (r) {
          let o = [r, s];
          if (n === !1 && (o = [r]), ES(this.prerelease, r)) {
            const a = this.prerelease[r.split(".").length];
            isNaN(a) && (this.prerelease = o);
          } else
            this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Le = bS;
const Wl = Le, SS = (e, t, r = !1) => {
  if (e instanceof Wl)
    return e;
  try {
    return new Wl(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Ar = SS;
const PS = Ar, OS = (e, t) => {
  const r = PS(e, t);
  return r ? r.version : null;
};
var NS = OS;
const IS = Ar, RS = (e, t) => {
  const r = IS(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var TS = RS;
const Xl = Le, jS = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new Xl(
      e instanceof Xl ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var kS = jS;
const Yl = Ar, AS = (e, t) => {
  const r = Yl(e, null, !0), n = Yl(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const o = s > 0, a = o ? r : n, c = o ? n : r, l = !!a.prerelease.length;
  if (!!c.prerelease.length && !l) {
    if (!c.patch && !c.minor)
      return "major";
    if (c.compareMain(a) === 0)
      return c.minor && !c.patch ? "minor" : "patch";
  }
  const u = l ? "pre" : "";
  return r.major !== n.major ? u + "major" : r.minor !== n.minor ? u + "minor" : r.patch !== n.patch ? u + "patch" : "prerelease";
};
var CS = AS;
const DS = Le, MS = (e, t) => new DS(e, t).major;
var FS = MS;
const LS = Le, VS = (e, t) => new LS(e, t).minor;
var zS = VS;
const US = Le, KS = (e, t) => new US(e, t).patch;
var qS = KS;
const GS = Ar, HS = (e, t) => {
  const r = GS(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var BS = HS;
const Zl = Le, xS = (e, t, r) => new Zl(e, r).compare(new Zl(t, r));
var ht = xS;
const JS = ht, WS = (e, t, r) => JS(t, e, r);
var XS = WS;
const YS = ht, ZS = (e, t) => YS(e, t, !0);
var QS = ZS;
const Ql = Le, e1 = (e, t, r) => {
  const n = new Ql(e, r), s = new Ql(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var Tc = e1;
const t1 = Tc, r1 = (e, t) => e.sort((r, n) => t1(r, n, t));
var n1 = r1;
const s1 = Tc, o1 = (e, t) => e.sort((r, n) => s1(n, r, t));
var a1 = o1;
const i1 = ht, c1 = (e, t, r) => i1(e, t, r) > 0;
var po = c1;
const l1 = ht, u1 = (e, t, r) => l1(e, t, r) < 0;
var jc = u1;
const d1 = ht, f1 = (e, t, r) => d1(e, t, r) === 0;
var jf = f1;
const h1 = ht, m1 = (e, t, r) => h1(e, t, r) !== 0;
var kf = m1;
const p1 = ht, $1 = (e, t, r) => p1(e, t, r) >= 0;
var kc = $1;
const y1 = ht, g1 = (e, t, r) => y1(e, t, r) <= 0;
var Ac = g1;
const _1 = jf, v1 = kf, w1 = po, E1 = kc, b1 = jc, S1 = Ac, P1 = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return _1(e, r, n);
    case "!=":
      return v1(e, r, n);
    case ">":
      return w1(e, r, n);
    case ">=":
      return E1(e, r, n);
    case "<":
      return b1(e, r, n);
    case "<=":
      return S1(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Af = P1;
const O1 = Le, N1 = Ar, { safeRe: gs, t: _s } = ts, I1 = (e, t) => {
  if (e instanceof O1)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? gs[_s.COERCEFULL] : gs[_s.COERCE]);
  else {
    const l = t.includePrerelease ? gs[_s.COERCERTLFULL] : gs[_s.COERCERTL];
    let d;
    for (; (d = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), l.lastIndex = d.index + d[1].length + d[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", o = r[4] || "0", a = t.includePrerelease && r[5] ? `-${r[5]}` : "", c = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return N1(`${n}.${s}.${o}${a}${c}`, t);
};
var R1 = I1;
const T1 = Ar, j1 = es, k1 = Le, A1 = (e, t, r) => {
  if (!j1.RELEASE_TYPES.includes(t))
    return null;
  const n = C1(e, r);
  return n && D1(n, t);
}, C1 = (e, t) => {
  const r = e instanceof k1 ? e.version : e;
  return T1(r, t);
}, D1 = (e, t) => {
  if (M1(t))
    return e.version;
  switch (e.prerelease = [], t) {
    case "major":
      e.minor = 0, e.patch = 0;
      break;
    case "minor":
      e.patch = 0;
      break;
  }
  return e.format();
}, M1 = (e) => e.startsWith("pre");
var F1 = A1;
class L1 {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const s = this.map.keys().next().value;
        this.delete(s);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var V1 = L1, Fo, eu;
function mt() {
  if (eu) return Fo;
  eu = 1;
  const e = /\s+/g;
  class t {
    constructor(C, V) {
      if (V = s(V), C instanceof t)
        return C.loose === !!V.loose && C.includePrerelease === !!V.includePrerelease ? C : new t(C.raw, V);
      if (C instanceof o)
        return this.raw = C.value, this.set = [[C]], this.formatted = void 0, this;
      if (this.options = V, this.loose = !!V.loose, this.includePrerelease = !!V.includePrerelease, this.raw = C.trim().replace(e, " "), this.set = this.raw.split("||").map((P) => this.parseRange(P.trim())).filter((P) => P.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const P = this.set[0];
        if (this.set = this.set.filter((p) => !m(p[0])), this.set.length === 0)
          this.set = [P];
        else if (this.set.length > 1) {
          for (const p of this.set)
            if (p.length === 1 && w(p[0])) {
              this.set = [p];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let C = 0; C < this.set.length; C++) {
          C > 0 && (this.formatted += "||");
          const V = this.set[C];
          for (let P = 0; P < V.length; P++)
            P > 0 && (this.formatted += " "), this.formatted += V[P].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(C) {
      C = C.replace(y, "");
      const P = ((this.options.includePrerelease && v) | (this.options.loose && _)) + ":" + C, p = n.get(P);
      if (p)
        return p;
      const S = this.options.loose, $ = S ? l[u.HYPHENRANGELOOSE] : l[u.HYPHENRANGE];
      C = C.replace($, de(this.options.includePrerelease)), a("hyphen replace", C), C = C.replace(l[u.COMPARATORTRIM], h), a("comparator trim", C), C = C.replace(l[u.TILDETRIM], b), a("tilde trim", C), C = C.replace(l[u.CARETTRIM], g), a("caret trim", C);
      let i = C.split(" ").map((T) => I(T, this.options)).join(" ").split(/\s+/).map((T) => J(T, this.options));
      S && (i = i.filter((T) => (a("loose invalid filter", T, this.options), !!T.match(l[u.COMPARATORLOOSE])))), a("range list", i);
      const f = /* @__PURE__ */ new Map(), E = i.map((T) => new o(T, this.options));
      for (const T of E) {
        if (m(T))
          return [T];
        f.set(T.value, T);
      }
      f.size > 1 && f.has("") && f.delete("");
      const j = [...f.values()];
      return n.set(P, j), j;
    }
    intersects(C, V) {
      if (!(C instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((P) => O(P, V) && C.set.some((p) => O(p, V) && P.every((S) => p.every(($) => S.intersects($, V)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(C) {
      if (!C)
        return !1;
      if (typeof C == "string")
        try {
          C = new c(C, this.options);
        } catch {
          return !1;
        }
      for (let V = 0; V < this.set.length; V++)
        if (Re(this.set[V], C, this.options))
          return !0;
      return !1;
    }
  }
  Fo = t;
  const r = V1, n = new r(), s = Rc, o = $o(), a = mo, c = Le, {
    safeRe: l,
    src: d,
    t: u,
    comparatorTrimReplace: h,
    tildeTrimReplace: b,
    caretTrimReplace: g
  } = ts, { FLAG_INCLUDE_PRERELEASE: v, FLAG_LOOSE: _ } = es, y = new RegExp(d[u.BUILD], "g"), m = (D) => D.value === "<0.0.0-0", w = (D) => D.value === "", O = (D, C) => {
    let V = !0;
    const P = D.slice();
    let p = P.pop();
    for (; V && P.length; )
      V = P.every((S) => p.intersects(S, C)), p = P.pop();
    return V;
  }, I = (D, C) => (D = D.replace(l[u.BUILD], ""), a("comp", D, C), D = ye(D, C), a("caret", D), D = Y(D, C), a("tildes", D), D = K(D, C), a("xrange", D), D = ie(D, C), a("stars", D), D), R = (D) => !D || D.toLowerCase() === "x" || D === "*", H = (D, C, V) => R(D) && !R(C) || R(C) && V && !R(V), Y = (D, C) => D.trim().split(/\s+/).map((V) => pe(V, C)).join(" "), pe = (D, C) => {
    const V = C.loose ? l[u.TILDELOOSE] : l[u.TILDE], P = C.includePrerelease ? "-0" : "";
    return D.replace(V, (p, S, $, i, f) => {
      a("tilde", D, p, S, $, i, f);
      let E;
      return R(S) ? E = "" : R($) ? E = `>=${S}.0.0${P} <${+S + 1}.0.0-0` : R(i) ? E = `>=${S}.${$}.0${P} <${S}.${+$ + 1}.0-0` : f ? (a("replaceTilde pr", f), E = `>=${S}.${$}.${i}-${f} <${S}.${+$ + 1}.0-0`) : E = `>=${S}.${$}.${i} <${S}.${+$ + 1}.0-0`, a("tilde return", E), E;
    });
  }, ye = (D, C) => D.trim().split(/\s+/).map((V) => we(V, C)).join(" "), we = (D, C) => {
    a("caret", D, C);
    const V = C.loose ? l[u.CARETLOOSE] : l[u.CARET], P = C.includePrerelease ? "-0" : "";
    return D.replace(V, (p, S, $, i, f) => {
      a("caret", D, p, S, $, i, f);
      let E;
      return R(S) ? E = "" : R($) ? E = `>=${S}.0.0${P} <${+S + 1}.0.0-0` : R(i) ? S === "0" ? E = `>=${S}.${$}.0${P} <${S}.${+$ + 1}.0-0` : E = `>=${S}.${$}.0${P} <${+S + 1}.0.0-0` : f ? (a("replaceCaret pr", f), S === "0" ? $ === "0" ? E = `>=${S}.${$}.${i}-${f} <${S}.${$}.${+i + 1}-0` : E = `>=${S}.${$}.${i}-${f} <${S}.${+$ + 1}.0-0` : E = `>=${S}.${$}.${i}-${f} <${+S + 1}.0.0-0`) : (a("no pr"), S === "0" ? $ === "0" ? E = `>=${S}.${$}.${i} <${S}.${$}.${+i + 1}-0` : E = `>=${S}.${$}.${i} <${S}.${+$ + 1}.0-0` : E = `>=${S}.${$}.${i} <${+S + 1}.0.0-0`), a("caret return", E), E;
    });
  }, K = (D, C) => (a("replaceXRanges", D, C), D.split(/\s+/).map((V) => B(V, C)).join(" ")), B = (D, C) => {
    D = D.trim();
    const V = C.loose ? l[u.XRANGELOOSE] : l[u.XRANGE];
    return D.replace(V, (P, p, S, $, i, f) => {
      if (a("xRange", D, P, p, S, $, i, f), H(S, $, i))
        return D;
      const E = R(S), j = E || R($), T = j || R(i), L = T;
      return p === "=" && L && (p = ""), f = C.includePrerelease ? "-0" : "", E ? p === ">" || p === "<" ? P = "<0.0.0-0" : P = "*" : p && L ? (j && ($ = 0), i = 0, p === ">" ? (p = ">=", j ? (S = +S + 1, $ = 0, i = 0) : ($ = +$ + 1, i = 0)) : p === "<=" && (p = "<", j ? S = +S + 1 : $ = +$ + 1), p === "<" && (f = "-0"), P = `${p + S}.${$}.${i}${f}`) : j ? P = `>=${S}.0.0${f} <${+S + 1}.0.0-0` : T && (P = `>=${S}.${$}.0${f} <${S}.${+$ + 1}.0-0`), a("xRange return", P), P;
    });
  }, ie = (D, C) => (a("replaceStars", D, C), D.trim().replace(l[u.STAR], "")), J = (D, C) => (a("replaceGTE0", D, C), D.trim().replace(l[C.includePrerelease ? u.GTE0PRE : u.GTE0], "")), de = (D) => (C, V, P, p, S, $, i, f, E, j, T, L) => (R(P) ? V = "" : R(p) ? V = `>=${P}.0.0${D ? "-0" : ""}` : R(S) ? V = `>=${P}.${p}.0${D ? "-0" : ""}` : $ ? V = `>=${V}` : V = `>=${V}${D ? "-0" : ""}`, R(E) ? f = "" : R(j) ? f = `<${+E + 1}.0.0-0` : R(T) ? f = `<${E}.${+j + 1}.0-0` : L ? f = `<=${E}.${j}.${T}-${L}` : D ? f = `<${E}.${j}.${+T + 1}-0` : f = `<=${f}`, `${V} ${f}`.trim()), Re = (D, C, V) => {
    for (let P = 0; P < D.length; P++)
      if (!D[P].test(C))
        return !1;
    if (C.prerelease.length && !V.includePrerelease) {
      for (let P = 0; P < D.length; P++)
        if (a(D[P].semver), D[P].semver !== o.ANY && D[P].semver.prerelease.length > 0) {
          const p = D[P].semver;
          if (p.major === C.major && p.minor === C.minor && p.patch === C.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Fo;
}
var Lo, tu;
function $o() {
  if (tu) return Lo;
  tu = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(u, h) {
      if (h = r(h), u instanceof t) {
        if (u.loose === !!h.loose)
          return u;
        u = u.value;
      }
      u = u.trim().split(/\s+/).join(" "), a("comparator", u, h), this.options = h, this.loose = !!h.loose, this.parse(u), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, a("comp", this);
    }
    parse(u) {
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], b = u.match(h);
      if (!b)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = b[1] !== void 0 ? b[1] : "", this.operator === "=" && (this.operator = ""), b[2] ? this.semver = new c(b[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (a("Comparator.test", u, this.options.loose), this.semver === e || u === e)
        return !0;
      if (typeof u == "string")
        try {
          u = new c(u, this.options);
        } catch {
          return !1;
        }
      return o(u, this.operator, this.semver, this.options);
    }
    intersects(u, h) {
      if (!(u instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(u.value, h).test(this.value) : u.operator === "" ? u.value === "" ? !0 : new l(this.value, h).test(u.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || u.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || u.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && u.operator.startsWith(">") || this.operator.startsWith("<") && u.operator.startsWith("<") || this.semver.version === u.semver.version && this.operator.includes("=") && u.operator.includes("=") || o(this.semver, "<", u.semver, h) && this.operator.startsWith(">") && u.operator.startsWith("<") || o(this.semver, ">", u.semver, h) && this.operator.startsWith("<") && u.operator.startsWith(">")));
    }
  }
  Lo = t;
  const r = Rc, { safeRe: n, t: s } = ts, o = Af, a = mo, c = Le, l = mt();
  return Lo;
}
const z1 = mt(), U1 = (e, t, r) => {
  try {
    t = new z1(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var yo = U1;
const K1 = mt(), q1 = (e, t) => new K1(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var G1 = q1;
const H1 = Le, B1 = mt(), x1 = (e, t, r) => {
  let n = null, s = null, o = null;
  try {
    o = new B1(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || s.compare(a) === -1) && (n = a, s = new H1(n, r));
  }), n;
};
var J1 = x1;
const W1 = Le, X1 = mt(), Y1 = (e, t, r) => {
  let n = null, s = null, o = null;
  try {
    o = new X1(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || s.compare(a) === 1) && (n = a, s = new W1(n, r));
  }), n;
};
var Z1 = Y1;
const Vo = Le, Q1 = mt(), ru = po, eP = (e, t) => {
  e = new Q1(e, t);
  let r = new Vo("0.0.0");
  if (e.test(r) || (r = new Vo("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let o = null;
    s.forEach((a) => {
      const c = new Vo(a.semver.version);
      switch (a.operator) {
        case ">":
          c.prerelease.length === 0 ? c.patch++ : c.prerelease.push(0), c.raw = c.format();
        case "":
        case ">=":
          (!o || ru(c, o)) && (o = c);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${a.operator}`);
      }
    }), o && (!r || ru(r, o)) && (r = o);
  }
  return r && e.test(r) ? r : null;
};
var tP = eP;
const rP = mt(), nP = (e, t) => {
  try {
    return new rP(e, t).range || "*";
  } catch {
    return null;
  }
};
var sP = nP;
const oP = Le, Cf = $o(), { ANY: aP } = Cf, iP = mt(), cP = yo, nu = po, su = jc, lP = Ac, uP = kc, dP = (e, t, r, n) => {
  e = new oP(e, n), t = new iP(t, n);
  let s, o, a, c, l;
  switch (r) {
    case ">":
      s = nu, o = lP, a = su, c = ">", l = ">=";
      break;
    case "<":
      s = su, o = uP, a = nu, c = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (cP(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, b = null;
    if (u.forEach((g) => {
      g.semver === aP && (g = new Cf(">=0.0.0")), h = h || g, b = b || g, s(g.semver, h.semver, n) ? h = g : a(g.semver, b.semver, n) && (b = g);
    }), h.operator === c || h.operator === l || (!b.operator || b.operator === c) && o(e, b.semver))
      return !1;
    if (b.operator === l && a(e, b.semver))
      return !1;
  }
  return !0;
};
var Cc = dP;
const fP = Cc, hP = (e, t, r) => fP(e, t, ">", r);
var mP = hP;
const pP = Cc, $P = (e, t, r) => pP(e, t, "<", r);
var yP = $P;
const ou = mt(), gP = (e, t, r) => (e = new ou(e, r), t = new ou(t, r), e.intersects(t, r));
var _P = gP;
const vP = yo, wP = ht;
var EP = (e, t, r) => {
  const n = [];
  let s = null, o = null;
  const a = e.sort((u, h) => wP(u, h, r));
  for (const u of a)
    vP(u, t, r) ? (o = u, s || (s = u)) : (o && n.push([s, o]), o = null, s = null);
  s && n.push([s, null]);
  const c = [];
  for (const [u, h] of n)
    u === h ? c.push(u) : !h && u === a[0] ? c.push("*") : h ? u === a[0] ? c.push(`<=${h}`) : c.push(`${u} - ${h}`) : c.push(`>=${u}`);
  const l = c.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < d.length ? l : t;
};
const au = mt(), Dc = $o(), { ANY: zo } = Dc, Uo = yo, Mc = ht, bP = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new au(e, r), t = new au(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const o of t.set) {
      const a = PP(s, o, r);
      if (n = n || a !== null, a)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, SP = [new Dc(">=0.0.0-0")], iu = [new Dc(">=0.0.0")], PP = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === zo) {
    if (t.length === 1 && t[0].semver === zo)
      return !0;
    r.includePrerelease ? e = SP : e = iu;
  }
  if (t.length === 1 && t[0].semver === zo) {
    if (r.includePrerelease)
      return !0;
    t = iu;
  }
  const n = /* @__PURE__ */ new Set();
  let s, o;
  for (const g of e)
    g.operator === ">" || g.operator === ">=" ? s = cu(s, g, r) : g.operator === "<" || g.operator === "<=" ? o = lu(o, g, r) : n.add(g.semver);
  if (n.size > 1)
    return null;
  let a;
  if (s && o) {
    if (a = Mc(s.semver, o.semver, r), a > 0)
      return null;
    if (a === 0 && (s.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const g of n) {
    if (s && !Uo(g, String(s), r) || o && !Uo(g, String(o), r))
      return null;
    for (const v of t)
      if (!Uo(g, String(v), r))
        return !1;
    return !0;
  }
  let c, l, d, u, h = o && !r.includePrerelease && o.semver.prerelease.length ? o.semver : !1, b = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && o.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const g of t) {
    if (u = u || g.operator === ">" || g.operator === ">=", d = d || g.operator === "<" || g.operator === "<=", s) {
      if (b && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === b.major && g.semver.minor === b.minor && g.semver.patch === b.patch && (b = !1), g.operator === ">" || g.operator === ">=") {
        if (c = cu(s, g, r), c === g && c !== s)
          return !1;
      } else if (s.operator === ">=" && !g.test(s.semver))
        return !1;
    }
    if (o) {
      if (h && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === h.major && g.semver.minor === h.minor && g.semver.patch === h.patch && (h = !1), g.operator === "<" || g.operator === "<=") {
        if (l = lu(o, g, r), l === g && l !== o)
          return !1;
      } else if (o.operator === "<=" && !g.test(o.semver))
        return !1;
    }
    if (!g.operator && (o || s) && a !== 0)
      return !1;
  }
  return !(s && d && !o && a !== 0 || o && u && !s && a !== 0 || b || h);
}, cu = (e, t, r) => {
  if (!e)
    return t;
  const n = Mc(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, lu = (e, t, r) => {
  if (!e)
    return t;
  const n = Mc(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var OP = bP;
const Ko = ts, uu = es, NP = Le, du = Tf, IP = Ar, RP = NS, TP = TS, jP = kS, kP = CS, AP = FS, CP = zS, DP = qS, MP = BS, FP = ht, LP = XS, VP = QS, zP = Tc, UP = n1, KP = a1, qP = po, GP = jc, HP = jf, BP = kf, xP = kc, JP = Ac, WP = Af, XP = R1, YP = F1, ZP = $o(), QP = mt(), eO = yo, tO = G1, rO = J1, nO = Z1, sO = tP, oO = sP, aO = Cc, iO = mP, cO = yP, lO = _P, uO = EP, dO = OP;
var fO = {
  parse: IP,
  valid: RP,
  clean: TP,
  inc: jP,
  diff: kP,
  major: AP,
  minor: CP,
  patch: DP,
  prerelease: MP,
  compare: FP,
  rcompare: LP,
  compareLoose: VP,
  compareBuild: zP,
  sort: UP,
  rsort: KP,
  gt: qP,
  lt: GP,
  eq: HP,
  neq: BP,
  gte: xP,
  lte: JP,
  cmp: WP,
  coerce: XP,
  truncate: YP,
  Comparator: ZP,
  Range: QP,
  satisfies: eO,
  toComparators: tO,
  maxSatisfying: rO,
  minSatisfying: nO,
  minVersion: sO,
  validRange: oO,
  outside: aO,
  gtr: iO,
  ltr: cO,
  intersects: lO,
  simplifyRange: uO,
  subset: dO,
  SemVer: NP,
  re: Ko.re,
  src: Ko.src,
  tokens: Ko.t,
  SEMVER_SPEC_VERSION: uu.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: uu.RELEASE_TYPES,
  compareIdentifiers: du.compareIdentifiers,
  rcompareIdentifiers: du.rcompareIdentifiers
};
const rt = /* @__PURE__ */ ju(fO), hO = Object.prototype.toString, mO = "[object Uint8Array]", pO = "[object ArrayBuffer]";
function Df(e, t, r) {
  return e ? e.constructor === t ? !0 : hO.call(e) === r : !1;
}
function $O(e) {
  return Df(e, Uint8Array, mO);
}
function Mf(e) {
  return Df(e, ArrayBuffer, pO);
}
function yO(e) {
  return $O(e) || Mf(e);
}
function gO(e) {
  return Mf(e) ? new Uint8Array(e) : e;
}
function Ff(e) {
  if (!yO(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function qo(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, o) => s + o.byteLength, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (let s of e)
    Ff(s), s = gO(s), r.set(s, n), n += s.length;
  return r;
}
const vs = {
  utf8: new globalThis.TextDecoder("utf8")
};
function ws(e, t = "utf8") {
  return Ff(e), vs[t] ?? (vs[t] = new globalThis.TextDecoder(t)), vs[t].decode(e);
}
new globalThis.TextEncoder();
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const fu = "aes-256-cbc", Es = 4095, _O = (e) => {
  if (e != null) {
    if (typeof e == "number") {
      if (!Number.isInteger(e) || e < 0 || e > Es)
        throw new TypeError(`The \`configFileMode\` option must be a whole number between 0 and ${Es}, got ${e}`);
      return e;
    }
    if (typeof e == "string" && /^[0-7]+$/.test(e)) {
      const t = Number.parseInt(e, 8);
      if (t > Es)
        throw new TypeError(`The \`configFileMode\` option must be a whole number between 0 and ${Es}, got \`${e}\``);
      return t;
    }
    throw new TypeError(`The \`configFileMode\` option must be a number or a string of octal digits, got ${typeof e == "string" ? `\`${e}\`` : typeof e}`);
  }
}, Go = (e, t) => {
  if (t != null && typeof t != "object")
    throw new TypeError(`The \`${e}\` option must be an object.`);
}, vO = (e) => {
  if (e != null) {
    if (typeof e != "object" || Array.isArray(e))
      throw new TypeError("The `migrations` option must be an object whose keys are the versions to migrate and whose values are the steps to run.");
    for (const [t, r] of Object.entries(e))
      if (typeof r != "function")
        throw new TypeError(`The \`migrations\` option must be an object of steps, got ${r === null ? "null" : typeof r} for the version \`${t}\`.`);
  }
}, hu = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]);
class bs extends Error {
}
class Ho extends Error {
}
const xe = () => /* @__PURE__ */ Object.create(null), Ms = (e) => {
  const t = Object.getPrototypeOf(e), r = Object.assign(xe(), e);
  return t !== null && Object.setPrototypeOf(r, t), r;
}, Ss = (e) => Object.assign(xe(), Object.fromEntries(Object.entries(e).filter(([, t]) => t !== void 0))), pa = (e) => e === null || typeof e != "object" || Array.isArray(e) ? xe() : e, $a = (e) => e !== void 0, wO = (e) => {
  const t = Object.assign(xe(), pa(e));
  return typeof t.toJSON == "function" && delete t.toJSON, t;
};
function* EO(e) {
  for (const t of Object.keys(e)) {
    const r = e[t];
    $a(r) && (yield [t, r]);
  }
}
const bO = /* @__PURE__ */ new Set([
  "undefined",
  "symbol",
  "function"
]), go = 1e3, Fc = (e, t, r, n = 0) => {
  if (n > go)
    return { at: t.join("."), type: "deep", value: e };
  if (typeof e == "bigint")
    return { at: t.join("."), type: "bigint", value: e };
  if (!(e === null || typeof e != "object") && Lc(e)) {
    if (r.has(e))
      return { at: t.join("."), type: "cycle", value: e };
    r.add(e);
    try {
      for (const [s, o] of Object.entries(e)) {
        const a = Fc(o, [...t, s], r, n + 1);
        if (a !== void 0)
          return a;
      }
    } finally {
      r.delete(e);
    }
  }
}, Pn = (e, t, r) => {
  const n = typeof t;
  if (bO.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
  if (!r)
    return;
  const s = Fc(t, [], /* @__PURE__ */ new Set());
  s !== void 0 && Lf(e, s);
}, SO = (e) => {
  if (!(e === null || typeof e != "object"))
    for (const [t, r] of Object.entries(e)) {
      const n = Fc(r, [], /* @__PURE__ */ new Set());
      (n == null ? void 0 : n.type) === "deep" && Lf(t, n);
    }
}, Lf = (e, t) => {
  const r = t.at === "" ? "" : ` at \`${t.at}\``;
  throw t.type === "bigint" ? new TypeError(`Setting a value of type \`bigint\` for key \`${e}\`${r} is not allowed as it's not supported by JSON`) : t.type === "deep" ? new TypeError(`Setting a value for key \`${e}\` is not allowed as a value nested more than \`${go}\` levels deep is not one the store can hold`) : new TypeError(`Setting a value for key \`${e}\`${r} is not allowed as a value that holds itself is not supported by JSON, which refuses one as a circular structure`);
}, Lr = (e) => {
  if (typeof e != "string")
    throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof e}`);
}, Ye = "__internal__", Vr = `${Ye}.migrations.version`, mu = `${Ye}.migrations.completedRanges`, pu = ":".codePointAt(0), Ce = Symbol("missingKey"), Rn = (e) => {
  var t, r;
  if (!((t = U.lstatSync(e, { throwIfNoEntry: !1 })) != null && t.isSymbolicLink()))
    return e;
  try {
    return U.realpathSync(e);
  } catch {
    let n = e;
    const s = /* @__PURE__ */ new Set();
    for (; !s.has(n) && (s.add(n), !!((r = U.lstatSync(n, { throwIfNoEntry: !1 })) != null && r.isSymbolicLink())); ) {
      const o = U.readlinkSync(n);
      n = x.resolve(U.realpathSync(x.dirname(n)), o);
    }
    return U.existsSync(n) ? n : x.join(Rn(x.dirname(n)), x.basename(n));
  }
}, wt = (e, t = /* @__PURE__ */ new Map(), r = 0) => {
  if (typeof e != "object" || e === null || r > go)
    return e;
  if (t.has(e))
    return t.get(e);
  if (Array.isArray(e)) {
    const o = [];
    o.length = e.length, t.set(e, o);
    for (const [a, c] of e.entries())
      a in e && (o[a] = wt(c, t, r + 1));
    return o;
  }
  const n = Object.getPrototypeOf(e);
  if (n !== Object.prototype && n !== null)
    return e;
  const s = n === null ? xe() : {};
  t.set(e, s);
  for (const o of Object.keys(e)) {
    const a = wt(e[o], t, r + 1);
    o === "__proto__" ? Object.defineProperty(s, o, {
      value: a,
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : s[o] = a;
  }
  return s;
}, Vf = (e, t = 0, r = /* @__PURE__ */ new Set()) => {
  if (typeof e != "object" || e === null || t > go || r.has(e))
    return e;
  const n = Object.getPrototypeOf(e);
  if (!Array.isArray(e) && n !== Object.prototype && n !== null)
    return e;
  r.add(e), Object.freeze(e);
  for (const s of Object.values(e))
    Vf(s, t + 1, r);
  return e;
}, Zt = (e, t) => e === null || typeof e != "object" ? !1 : Object.prototype.propertyIsEnumerable.call(e, t), St = (e, t) => {
  if (e === null || typeof e != "object")
    return e;
  if (!t)
    return wt(e);
  let r;
  try {
    r = JSON.stringify(e);
  } catch {
    return wt(e);
  }
  return r === void 0 ? wt(e) : JSON.parse(r);
}, PO = (e) => e.slice(1).replaceAll(/~([01])/g, (t, r) => r === "0" ? "~" : "/"), OO = ({ instancePath: e, params: t }) => {
  const { additionalProperty: r, unevaluatedProperty: n, propertyName: s } = t, o = r ?? n ?? s, a = PO(e);
  return o === void 0 ? a : a === "" ? o : `${a}/${o}`;
}, Bo = (e) => e.map((t) => typeof t == "number" ? String(t) : t.replaceAll(/[\\.[\]]/g, String.raw`\$&`)).join("."), rs = (e) => {
  try {
    const t = Iu(e);
    return t.length > 0 ? t : void 0;
  } catch {
    throw new TypeError(`The key \`${e}\` is not a key a value can be written to.`);
  }
}, Ot = (e) => {
  try {
    return rs(e);
  } catch {
    return;
  }
}, ya = "which is not a key a value can be written to.", NO = (e) => {
  const t = Ot(e);
  if (!((t == null ? void 0 : t.length) === 1 && String(t[0]) === e))
    return t === void 0 ? ya : "which is not a key of its own. Use the `properties` of a key for the keys below the root.";
}, Lc = (e) => e === null || typeof e != "object" ? !1 : typeof e.toJSON != "function", Ps = (e, t, r = 0) => {
  const n = Ot(t);
  if (n === void 0)
    return;
  let s = e, o = r > 0 ? n[r - 1] : void 0;
  for (const [a, c] of n.entries())
    if (!(a < r)) {
      if (Array.isArray(s) && typeof c != "number")
        return o;
      if (a === n.length - 1 || !Zt(s, c))
        return;
      if (o = c, s = s[c], !Lc(s))
        return o;
    }
}, $u = (e) => {
  const t = Ms(e), r = /* @__PURE__ */ new Map();
  for (const n of Object.keys(t))
    t[n] = wt(t[n], r);
  return t;
}, yu = /* @__PURE__ */ new Map(), IO = (e, t) => {
  const r = e == null ? void 0 : e.patternProperties;
  return !r || typeof r != "object" ? !1 : Object.keys(r).some((n) => {
    let s = yu.get(n);
    return s || (s = new RegExp(n), yu.set(n, s)), s.test(t);
  });
}, gu = (e, t) => {
  const { additionalProperties: r, unevaluatedProperties: n } = e ?? {};
  return IO(e, t) || r !== void 0 && r !== !1 || n !== void 0 && n !== !1;
}, zf = (e, t) => {
  const r = new rt.Range(e).set.map((n) => n.map(String).join(" "));
  return r.length < 2 ? e : r.find((n) => rt.satisfies(t, n)) ?? e;
}, Uf = (e, t) => {
  const r = zf(e, t);
  return r === e ? e : JSON.stringify([e, r]);
}, _u = (e, t) => {
  var s;
  const r = Object.entries(e);
  if (!t)
    return r;
  const n = /* @__PURE__ */ new Map();
  for (const [o] of r)
    n.set(o, ((s = Ot(o)) == null ? void 0 : s.length) ?? 0);
  return r.toSorted(([o], [a]) => n.get(o) - n.get(a));
}, RO = (e, t) => {
  try {
    const r = U.lstatSync(e), n = U.lstatSync(t);
    return r.dev === n.dev && r.ino === n.ino;
  } catch {
    return !1;
  }
}, vu = (e, t) => t === void 0 || an(t) || rt.gt(e, t), TO = (e, t) => {
  var r;
  return an(e) ? ((r = rt.minVersion(zf(e, t))) == null ? void 0 : r.version) ?? t : e;
}, an = (e) => rt.valid(e) === null, jO = (e, t, r) => an(e) ? rt.satisfies(r, e) ? t === void 0 ? !0 : rt.gt(r, t) && !rt.satisfies(t, e) : !1 : !(t !== void 0 && rt.lte(e, t) || rt.gt(e, r)), kO = (e, t, r) => an(e) && r.has(Uf(e, t)), zt = (e, t, r) => {
  const n = rs(t);
  if (n === void 0)
    return r;
  let s = e;
  for (const o of n) {
    if (!Zt(s, o))
      return r;
    s = s[o];
  }
  return s === void 0 ? r : s;
}, $r = (e, t, r, n = !1) => {
  const s = rs(t);
  if (s === void 0)
    return;
  const o = s.length - 1;
  let a = e;
  for (const [c, l] of s.entries()) {
    if (Array.isArray(a) && typeof l != "number")
      throw new TypeError(`The key \`${t}\` only holds the elements of an array, so \`${l}\` cannot be set on it`);
    if (c === o) {
      a[l] = r;
      return;
    }
    const d = Zt(a, l) ? a[l] : void 0;
    if (d !== null && typeof d == "object") {
      if (!Lc(d))
        throw new TypeError(`The key \`${t}\` cannot be set, since the value the store holds for it cannot be written through.`);
      a = d;
      continue;
    }
    const u = s[c + 1], h = !n && typeof u == "number" ? [] : {};
    a[l] = h, a = h;
  }
}, AO = (e, t) => {
  const r = rs(t);
  if (r === void 0)
    return;
  const n = r.length - 1;
  let s = e;
  for (const [o, a] of r.entries()) {
    if (o === n) {
      if (Array.isArray(s)) {
        typeof a == "number" && s.splice(a, 1);
        return;
      }
      if (!Zt(s, a))
        return;
      delete s[a];
      return;
    }
    const c = Zt(s, a) ? s[a] : void 0;
    if (c === null || typeof c != "object")
      return;
    s = c;
  }
}, CO = (e, t) => {
  let r = e;
  for (const n of t.slice(0, -1)) {
    const s = r[n];
    if (s === null || typeof s != "object")
      return;
    if (Array.isArray(s)) {
      delete r[n];
      return;
    }
    r = s;
  }
};
var $t, Qr, qt, ue, Gt, Or, ze, Ht, Qe, Nr, en, Bt, Nt, tn, N, yr, Pt, ct, ga, Fs, _a, va, xt, xn, Kr, Tn, jn, wa, Ea, Kf, ba, qf, kn, Sa, An, Cn, Ls, qr, Pa, Ve, Gr, Gf, Hf, Bf, xf, Jf, Wf, Vs, Xf, Oa, gr, Yf, Zf, Qf, eh, Na, th, rh;
class DO {
  constructor(t = {}) {
    Se(this, N);
    /**
    Get the path to the config file.
    */
    vo(this, "path");
    /**
    Dispatches a `change` event on every write of this instance, and when the `watch` option reports a change to the config file. `onDidChange()` and `onDidAnyChange()` listen on it, and you can also listen to it directly.
    */
    vo(this, "events");
    Se(this, $t);
    Se(this, Qr);
    Se(this, qt);
    Se(this, ue);
    // The entries of the `defaults` option in the order they are written, which every write fills in, so they are ordered once rather than on every write. An option set to `undefined` is the same as one that is not passed, so a key set to it is not among them, and what the store holds stands for it.
    Se(this, Gt);
    /**
    The mode the config file is given, with the process umask already applied to it. Absent when the caller gives no mode, which leaves the mode of a file the write creates to the kernel.
    */
    Se(this, Or);
    // A plain object would answer for the names `Object.prototype` has, such as `toString`, so `reset()` would read a function as the default.
    Se(this, ze, xe());
    Se(this, Ht);
    Se(this, Qe, !1);
    // A watcher for the directory a file is in, keyed by the file. One watcher for a directory is told about the events of every file in it and answers for the name of one of them, so the config path and the file a link at it points at are each given one.
    Se(this, Nr, /* @__PURE__ */ new Map());
    // The bytes the config file is last known to hold, which the watcher gives up on every change it sees, so a write of this store is the only change it does not report.
    Se(this, en);
    Se(this, Bt);
    Se(this, Nt);
    // Whether a clearing of a damaged config file is in hand, which is the state a read made while the write that made it, the change it dispatched and the read that followed it are in flight finds, so that read reports the file rather than clearing it again.
    Se(this, tn, !1);
    // A text editor can save a file with a byte order mark, which is not part of the JSON. `JSON.parse` refuses it, while a JSON reader that takes a file is expected to skip it, so it is skipped here.
    Se(this, xt, (t) => {
      const r = t.replace(/^\uFEFF/, "");
      try {
        return JSON.parse(r);
      } catch {
        throw new SyntaxError(`The config file \`${this.path}\` is not valid JSON.`);
      }
    });
    Se(this, xn, (t) => JSON.stringify(t, void 0, "	"));
    const r = k(this, N, Bf).call(this, t);
    $e(this, ue, r), $e(this, Gt, _u(r.defaults ?? {}, r.accessPropertiesByDotNotation)), k(this, N, xf).call(this, r), k(this, N, Zf).call(this, r), this.events = new EventTarget(), $e(this, Qr, r.encryptionKey), $e(this, qt, r.encryptionAlgorithm ?? fu);
    const n = _O(r.configFileMode);
    if (n !== void 0) {
      const s = fe.umask();
      if ($e(this, Or, n & ~s), !(A(this, Or) & 256))
        throw new TypeError(`The \`configFileMode\` option must give the file a mode its owner can read, since a file its owner cannot read is not one the store that wrote it can read back. ${JSON.stringify(r.configFileMode)} leaves the file at mode \`0o${A(this, Or).toString(8)}\`, which has no owner read bit.`);
    }
    this.path = k(this, N, Qf).call(this, r), k(this, N, th).call(this, r), r.watch && k(this, N, Kf).call(this);
  }
  get(t, r) {
    return Lr(t), k(this, N, Pt).call(this, k(this, N, Gr).call(this), t, r);
  }
  set(t, r) {
    if (t === null || typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${t === null ? "null" : typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (k(this, N, kn).call(this, t), typeof t == "object")
      for (const [s, o] of Object.entries(t))
        k(this, N, qr).call(this, s), Pn(s, o, A(this, N, Ve));
    else
      k(this, N, qr).call(this, t), Pn(t, r, A(this, N, Ve));
    const n = k(this, N, ct).call(this);
    if (typeof t == "object")
      for (const [s, o] of _u(t, A(this, ue).accessPropertiesByDotNotation))
        k(this, N, Ls).call(this, n, s, wt(o));
    else
      k(this, N, Ls).call(this, n, t, wt(r));
    k(this, N, yr).call(this, n, !0);
  }
  has(t) {
    return Lr(t), k(this, N, Pt).call(this, k(this, N, Gr).call(this), t, Ce) !== Ce;
  }
  appendToArray(t, r) {
    Lr(t), Pn(t, r, A(this, N, Ve)), k(this, N, kn).call(this, t), k(this, N, qr).call(this, t);
    const n = k(this, N, ct).call(this), s = k(this, N, Pt).call(this, n, t, []);
    if (!Array.isArray(s))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    k(this, N, Ls).call(this, n, t, [...s, wt(r)]), k(this, N, yr).call(this, n, !0);
  }
  reset(...t) {
    for (const r of t)
      Lr(r), k(this, N, qr).call(this, r);
    for (const r of t) {
      const n = k(this, N, Pt).call(this, A(this, ze), r);
      $a(n) && this.set(r, n);
    }
  }
  delete(t) {
    Lr(t), k(this, N, kn).call(this, t), k(this, N, qr).call(this, t);
    const r = k(this, N, ct).call(this);
    A(this, ue).accessPropertiesByDotNotation ? AO(r, t) : delete r[t], k(this, N, yr).call(this, r, !0);
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option. The `default` values of the `schema` option are not used when `ajvOptions.useDefaults` is `false`.
      */
  clear() {
    this.store = xe();
  }
  onDidChange(t, r) {
    if (Lr(t), typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return k(this, N, va).call(this, () => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      A change noticed while the config file cannot be read, for example while another process is writing it, is not reported.
  
      `oldValue` and `newValue` will be the config object before and after the change, respectively. You must compare `oldValue` to `newValue` to find out what changed.
  
      @param callback - A callback function that is called on any changes.
      @returns A function that unsubscribes when called.
  
      @example
      ```
      const unsubscribe = config.onDidAnyChange(callback);
  
      unsubscribe();
      ```
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return k(this, N, va).call(this, () => this.store, t);
  }
  /**
  Get the item count.
  */
  get size() {
    const t = k(this, N, Gr).call(this);
    let r = 0;
    for (const n of Object.keys(t))
      $a(t[n]) && r++;
    return r;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> [Object: null prototype] {name: 'John', age: 30}
      ```
  
      Unlike `set()`, a whole-store write drops a function or a symbol, like `JSON.stringify` does, instead of throwing. A `bigint` still throws, unless you use a custom `serialize`.
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    return k(this, N, Gr).call(this);
  }
  set store(t) {
    k(this, N, yr).call(this, t, !1);
  }
  *[Symbol.iterator]() {
    yield* EO(k(this, N, Gr).call(this));
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    var t;
    for (const r of A(this, Nr).values())
      r.close();
    A(this, Nr).clear(), A(this, Bt) && (U.unwatchFile(this.path, A(this, Bt)), $e(this, Bt, void 0)), (t = A(this, Nt)) == null || t.cancel(), $e(this, Nt, void 0), $e(this, Ht, void 0);
  }
}
$t = new WeakMap(), Qr = new WeakMap(), qt = new WeakMap(), ue = new WeakMap(), Gt = new WeakMap(), Or = new WeakMap(), ze = new WeakMap(), Ht = new WeakMap(), Qe = new WeakMap(), Nr = new WeakMap(), en = new WeakMap(), Bt = new WeakMap(), Nt = new WeakMap(), tn = new WeakMap(), N = new WeakSet(), /**
    Write the store to the config file.

    `isFromFile` says the value was read from the config file, so the bookkeeping it holds is the file's own, which is neither taken off it nor looked up in the file again. A write reads the file for itself, so that a change made by another process is not lost, and reading it once more only to bring back the bookkeeping it already has is a second parse of the whole file, and for an encrypted store a second key derivation, on every single write.
    */
yr = function(t, r) {
  if (k(this, N, Tn).call(this), t = pa(t), A(this, N, Ve) && typeof t.toJSON == "function") {
    const n = JSON.stringify(t);
    t = pa(n === void 0 ? void 0 : JSON.parse(n));
  }
  if (!r && !A(this, Qe) && k(this, N, Sa).call(this, t) && (t = Ms(t), k(this, N, Fs).call(this, t)), !r && !Zt(t, Ye))
    try {
      const n = k(this, N, Pa).call(this);
      Zt(n, Ye) && (t = Ms(t), $r(t, Ye, n[Ye]));
    } catch {
    }
  t = k(this, N, gr).call(this, t), !A(this, Qe) && A(this, $t) && (r || (t = $u(t)), k(this, N, Kr).call(this, t)), !r && A(this, N, Ve) && SO(t), k(this, N, jn).call(this, t), this.events.dispatchEvent(new Event("change"));
}, /**
    The item a store holds under a key, or `fallback` where it holds none. A key is read the way the mode writes it: as the path it names with dot notation, and as the key itself without it, which is also how the defaults a key is reset to are recorded.

    An own key can hold `undefined`, which a custom deserializer can hand back where JSON cannot, and that counts as missing in both modes.
    */
Pt = function(t, r, n) {
  if (A(this, ue).accessPropertiesByDotNotation)
    return zt(t, r, n);
  const s = t[r];
  return s === void 0 ? n : s;
}, /**
    The store a read of the config file makes, which is a store the `defaults` option and the `default`s of its schema make where there is no file to read.

    A read made while a clearing is in hand does not clear the file again, whichever method made it, since the write of the cleared store can leave it as unreadable as the read that cleared it found it, which is what a `serialize` of the caller's that a `deserialize` does not read back does. Clearing it again would be a store that is written and cleared over and over until the stack runs out, so the read reports what it cannot read instead.
    */
ct = function(t = !0) {
  var n;
  let r;
  try {
    const s = wO(k(this, N, Pa).call(this));
    return r = s, t && !A(this, Qe) && k(this, N, Kr).call(this, s), s;
  } catch (s) {
    if ((s == null ? void 0 : s.code) === "ENOENT") {
      if (k(this, N, Tn).call(this), !t || A(this, Qe))
        return xe();
      const o = k(this, N, gr).call(this, xe());
      return (n = A(this, $t)) == null || n.call(this, o), o;
    }
    if (A(this, ue).clearInvalidConfig && !A(this, tn) && (s instanceof Ho || s instanceof bs || (s == null ? void 0 : s.name) === "SyntaxError"))
      return k(this, N, Hf).call(this, r);
    throw s;
  }
}, /**
The store as the user sees it. The keys this module keeps for its own bookkeeping are removed, so they never reach the public API.
*/
ga = function() {
  const t = k(this, N, ct).call(this);
  return k(this, N, Fs).call(this, t), t;
}, /**
Remove the keys this module reserves for its own bookkeeping and return them, so the schema validator and the public API never see them. The passed store is changed in place, and every caller passes an object.
*/
Fs = function(t) {
  const r = xe();
  for (const n of Object.keys(t))
    k(this, N, An).call(this, n) && (r[n] = t[n], delete t[n]);
  return r;
}, /**
The plaintext of an encrypted config file. Only the legacy key salt is tried when `legacySaltOnly` is set, which `#readConfigFile()` uses for its second attempt.
*/
_a = function(t, r, n = !1) {
  const s = A(this, qt);
  if (t[16] !== pu) {
    if (s === "aes-256-cbc")
      return ws(t);
    throw new bs("Failed to decrypt config data.");
  }
  const o = t.slice(0, 16);
  let a = t.slice(17), c;
  if (s === "aes-256-gcm") {
    const d = a.length - 16;
    if (d < 0)
      throw new bs("Failed to decrypt config data.");
    c = a.slice(d), a = a.slice(0, d);
  }
  const l = n ? [o.toString()] : [o, o.toString()];
  for (const d of l)
    try {
      const u = _n.pbkdf2Sync(r, d, 1e4, 32, "sha512"), h = _n.createDecipheriv(s, u, o);
      return c && h.setAuthTag(c), ws(qo([h.update(a), h.final()]));
    } catch {
    }
  if (s === "aes-256-cbc")
    return ws(t);
  throw new bs("Failed to decrypt config data.");
}, va = function(t, r) {
  let n;
  try {
    n = t();
  } catch {
  }
  const s = () => {
    let o;
    try {
      o = t();
    } catch {
      return;
    }
    const a = n;
    bo(o, a) || (n = o, r.call(this, o, a));
  };
  return this.events.addEventListener("change", s), () => {
    this.events.removeEventListener("change", s);
  };
}, xt = new WeakMap(), xn = new WeakMap(), Kr = function(t) {
  if (!A(this, $t))
    return;
  const r = k(this, N, Fs).call(this, t), n = A(this, $t).call(this, t), { errors: s } = A(this, $t);
  if (Object.assign(t, r), n || !s)
    return;
  const o = s.map((a) => `\`${OO(a)}\` ${a.message ?? ""}`);
  throw new Ho("Config schema violation: " + o.join("; "));
}, Tn = function() {
  U.mkdirSync(x.dirname(this.path), { recursive: !0 });
}, jn = function(t) {
  $e(this, Ht, void 0);
  const r = A(this, xn).call(this, t);
  if (typeof r != "string" && !(r instanceof Uint8Array))
    throw new TypeError(`The \`serialize\` option must return a string or a \`Uint8Array\`, got ${r === null ? "null" : typeof r}`);
  let n = r;
  const s = A(this, Qr);
  if (s) {
    const o = _n.randomBytes(16), a = _n.pbkdf2Sync(s, o, 1e4, 32, "sha512"), c = _n.createCipheriv(A(this, qt), a, o), l = qo([c.update(n), c.final()]), d = [o, Uint8Array.of(pu), l];
    A(this, qt) === "aes-256-gcm" && d.push(c.getAuthTag()), n = qo(d);
  }
  k(this, N, wa).call(this, n, A(this, Or)), A(this, ue).watch && $e(this, en, n);
}, /**
Write the given bytes to the config file, atomically where the platform allows it. A `mode` is given to the file, and without one a file that is already there keeps the mode it has.
*/
wa = function(t, r) {
  if (fe.env.SNAP)
    k(this, N, Ea).call(this, t, r);
  else
    try {
      Tu(Rn(this.path), t, { mode: r });
    } catch (n) {
      if ((n == null ? void 0 : n.code) !== "EXDEV")
        throw n;
      k(this, N, Ea).call(this, t, r);
    }
}, /**
    Write the store without the temporary file and the rename, which the Snap workaround and the `EXDEV` fallback do.

    The write gives the mode to a file it creates, where the kernel reduces it, and leaves the mode of a file that is already there alone. A mode the caller gives is set on the second as well, since the option names the mode the file is given.
    */
Ea = function(t, r) {
  var a;
  U.mkdirSync(x.dirname(Rn(this.path)), { recursive: !0 });
  const n = (a = U.statSync(this.path, { throwIfNoEntry: !1 })) == null ? void 0 : a.mode, s = n !== void 0 && (n & 128) === 0;
  s && U.chmodSync(this.path, n | 128);
  let o = !1;
  try {
    U.writeFileSync(this.path, t, { mode: r }), o = !0;
  } finally {
    U.existsSync(this.path) && (o && r !== void 0 ? U.chmodSync(this.path, r) : s && U.chmodSync(this.path, n));
  }
}, Kf = function() {
  k(this, N, Tn).call(this), U.existsSync(this.path) || k(this, N, jn).call(this, xe());
  const t = () => {
    $e(this, Ht, void 0);
    const r = A(this, en);
    $e(this, en, void 0), !(r !== void 0 && k(this, N, Gf).call(this, r)) && this.events.dispatchEvent(new Event("change"));
  };
  if (fe.platform === "win32" || fe.platform === "darwin") {
    $e(this, Nt, Bl(t, { wait: 100 })), k(this, N, ba).call(this, Rn(this.path)), k(this, N, ba).call(this, this.path);
    return;
  }
  $e(this, Nt, Bl(t, { wait: 1e3 })), $e(this, Bt, () => {
    var r;
    (r = A(this, Nt)) == null || r.call(this);
  }), U.watchFile(this.path, { persistent: !1, interval: 500 }, A(this, Bt));
}, /**
    Watch the directory one of the files the config is read from is in, so that a change to either of them is reported however the file itself was written. A file that already has a watcher is left as it is, since one watcher for a directory is told about the events of every file in it and answers for the name of only one of them.

    The name the watcher reports is compared as the bytes it stands for rather than as text, since a name holding half of a surrogate pair is written to the file system as a replacement character and read back as one, so the string that comes back is not the string the file was written under and every change to the file is then taken for a change to a file beside it.

    A name that is not the bytes the path was written with is still a name the file system may be holding this file under, since a volume is free to spell a name with a case and a form of its own, so the file system is asked whether the two are one file.
    */
ba = function(t) {
  if (A(this, Nr).has(t))
    return;
  const r = x.dirname(t), n = Eo.from(x.basename(t));
  U.mkdirSync(r, { recursive: !0 }), A(this, Nr).set(t, U.watch(r, { persistent: !1, encoding: "buffer" }, (s, o) => {
    var a;
    o && !o.equals(n) && !RO(x.join(r, o.toString("utf8")), t) || (a = A(this, Nt)) == null || a.call(this);
  }));
}, /**
Run the steps the store has not run yet. `storedData` is the store as the file holds it, bookkeeping included, which the caller has just read.
*/
qf = function(t, r, n, s) {
  const o = zt(s, Vr), a = zt(s, mu), c = new Set(Array.isArray(a) ? a.filter((v) => typeof v == "string") : []), l = o === void 0 || an(o) ? void 0 : o, d = Object.keys(t).filter((v) => jO(v, l, r) && !kO(v, r, c)).map((v) => ({ version: v, toVersion: TO(v, r) })).sort((v, _) => rt.compare(v.toVersion, _.toVersion)), u = d.map(({ toVersion: v }) => v);
  let h = l ?? "0.0.0", b = s;
  for (const { version: v, toVersion: _ } of d) {
    let y;
    try {
      n && n(this, {
        fromVersion: h,
        toVersion: _,
        finalVersion: r,
        // A copy, since the context is the hook's own and a hook that changes the list it is given is not telling the step after it something the pass does not run, the same way a change it makes to `fromVersion` or `toVersion` is not one.
        versions: [...u]
      });
      const m = t[v];
      if (m == null || m(this), h = _, an(v))
        c.add(Uf(v, r)), y = k(this, N, Cn).call(this, mu, [...c], k(this, N, ct).call(this));
      else {
        const w = k(this, N, ct).call(this), O = zt(w, Vr);
        y = vu(v, O) ? k(this, N, Cn).call(this, Vr, v, w) : w;
      }
      b = y;
    } catch (m) {
      k(this, N, yr).call(this, b, !0);
      const w = m instanceof Error ? m.message : String(m);
      throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${w}`);
    }
  }
  const g = d.length > 0 ? k(this, N, ct).call(this) : s;
  vu(r, zt(g, Vr)) && k(this, N, Cn).call(this, Vr, r, g);
}, kn = function(t) {
  if (k(this, N, Sa).call(this, t))
    throw new TypeError(`Please don't use the ${Ye} key, as it's used to manage this module internal operations.`);
}, Sa = function(t) {
  return typeof t == "string" ? k(this, N, An).call(this, t) : !t || typeof t != "object" ? !1 : Object.keys(t).some((r) => k(this, N, An).call(this, r));
}, /**
Whether a key that is passed to `set()` or `delete()` reaches the key this module keeps its bookkeeping under, which both refuse, and whether a key of the store is that bookkeeping itself, which `#detachReservedKeys()` takes out of the caller's view. `dot-prop` normalizes a dot-notation key before it writes, so a key such as `\__internal__` or `__internal__[0]` reaches it as well. Without dot notation the key is used as it is, so only the exact key is the module's own there, and a literal `__internal__.foo` is the caller's data.
*/
An = function(t) {
  var s;
  if (!A(this, ue).accessPropertiesByDotNotation || !t.includes(".") && !t.includes("[") && !t.includes("]") && !t.includes("\\"))
    return t === Ye;
  const r = Ot(t);
  if (r === void 0)
    return !1;
  const [n] = r;
  return n === Ye || ((s = Ot(String(n))) == null ? void 0 : s[0]) === Ye;
}, /**
    Write a key of the module's own bookkeeping into a store the caller has read, and put that store in the file. The store is taken as an argument so that a caller which has already read the file does not read it again only to write back what it has. The store it returns is the one the write was given, which is what the file holds afterwards except where the `defaults` option filled a key into it and the write filled that into a copy instead.

    A file can hold anything under the key this module reserves for itself, and an array along the path of a bookkeeping key cannot hold the key. Such a value is no bookkeeping at all, since it holds neither the `migrations` nor the `version` to read it out of, so it is taken away first rather than refusing every write for the rest of the life of the file.
    */
Cn = function(t, r, n) {
  return CO(n, Iu(t)), $r(n, t, r), k(this, N, yr).call(this, n, !0), n;
}, /**
Write one key into a store the caller has already read and is going to write back. It is what `set()` and `appendToArray()` both write through, so that the array an append reads and the one it writes are the same store rather than two reads of a file that another process can change in between.
*/
Ls = function(t, r, n) {
  if (A(this, ue).accessPropertiesByDotNotation) {
    $r(t, r, n);
    return;
  }
  t[r] = n;
}, /**
Refuse a key the path parser cannot read, which is a question about the key and not about the store, so `set()` asks it before the file is read rather than leaving it to the write below, which has already read a file that a read may have cleared. `reset()`, `delete()` and `appendToArray()` ask the same question the same way, for the same reason. Without dot notation no key is read as a path, so there is no path for the parser to refuse.
*/
qr = function(t) {
  A(this, ue).accessPropertiesByDotNotation && rs(t);
}, /**
The store as it is held in the config file. A wrong key salt does not always throw, since the cipher can also decrypt to data with valid padding, so a plaintext that does not deserialize is tried again with the legacy key salt.
*/
Pa = function() {
  const t = A(this, Qr);
  if (!t)
    return A(this, xt).call(this, U.readFileSync(this.path, "utf8"));
  const r = U.readFileSync(this.path), n = k(this, N, _a).call(this, r, t);
  try {
    return A(this, xt).call(this, n);
  } catch (s) {
    try {
      return A(this, xt).call(this, k(this, N, _a).call(this, r, t, !0));
    } catch {
      if (A(this, qt) === "aes-256-cbc")
        try {
          return A(this, xt).call(this, ws(r));
        } catch {
        }
      throw s;
    }
  }
}, Ve = function() {
  return !A(this, ue).serialize;
}, /**
The store the reads answer from, which is the cache itself where the `cache` option keeps one. The cache is frozen, so a caller that changes what it was handed is told so rather than changing the cache, which every later read would then be wrong about. Freezing it once costs about what one read of the file does, where a copy on every read would cost that on every read.
*/
Gr = function() {
  return A(this, ue).cache ? (A(this, Ht) ?? $e(this, Ht, Vf(k(this, N, ga).call(this))), A(this, Ht)) : k(this, N, ga).call(this);
}, /**
Whether the config file still holds the given bytes, which is what a write of this store put in it and already dispatched a change for.
*/
Gf = function(t) {
  try {
    const r = U.readFileSync(this.path);
    return r.length === Eo.byteLength(t) && r.equals(Eo.from(t));
  } catch {
    return !1;
  }
}, /**
An empty store, written over a file that is damaged, so the damage is not read as an empty store again on every read and the file is left as a store. Nothing is written from a migration, where the file is what the migrations repair.
*/
Hf = function(t) {
  var s;
  const r = k(this, N, gr).call(this, xe());
  A(this, Qe) ? (s = A(this, $t)) == null || s.call(this, r) : k(this, N, Kr).call(this, r);
  const n = t == null ? void 0 : t[Ye];
  if (n !== void 0 && (r[Ye] = n), !A(this, Qe)) {
    k(this, N, Tn).call(this), $e(this, tn, !0);
    try {
      return k(this, N, jn).call(this, r), this.events.dispatchEvent(new Event("change")), k(this, N, ct).call(this);
    } finally {
      $e(this, tn, !1);
    }
  }
  return r;
}, Bf = function(t) {
  const r = Ss(t), n = {
    ...r,
    configName: r.configName ?? "config",
    fileExtension: r.fileExtension ?? "json",
    projectSuffix: r.projectSuffix ?? "nodejs",
    clearInvalidConfig: r.clearInvalidConfig ?? !1,
    accessPropertiesByDotNotation: r.accessPropertiesByDotNotation ?? !0
  };
  if (n.defaults !== void 0 && n.defaults !== null) {
    const s = Object.entries(Ss(n.defaults));
    for (const [o, a] of s)
      Pn(o, a, !n.serialize);
    n.defaults = Object.fromEntries(s.map(([o, a]) => [o, St(a, !n.serialize)]));
  }
  if (n.encryptionAlgorithm ?? (n.encryptionAlgorithm = fu), !hu.has(n.encryptionAlgorithm))
    throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...hu].join(", ")}`);
  if ("encryptionKey" in n && n.encryptionKey !== null && !n.encryptionKey)
    throw new TypeError("The `encryptionKey` option must not be empty, since an empty key leaves the store in plain text.");
  if (vO(n.migrations), !n.cwd) {
    if (!n.projectName)
      throw new Error("Please specify the `projectName` option.");
    n.cwd = wh(n.projectName, { suffix: n.projectSuffix }).config;
  }
  return n;
}, xf = function(t) {
  var c;
  if (Go("schema", t.schema), Go("rootSchema", t.rootSchema), Go("ajvOptions", t.ajvOptions), !(t.schema ?? t.ajvOptions ?? t.rootSchema)) {
    k(this, N, Oa).call(this, t);
    return;
  }
  if (t.rootSchema && "properties" in t.rootSchema)
    throw new TypeError("The `rootSchema` option must not contain a `properties` key. Use the `schema` option for properties.");
  const r = (c = t.rootSchema) == null ? void 0 : c.type;
  if (r !== void 0 && !(Array.isArray(r) ? r : [r]).includes("object"))
    throw new TypeError(`The \`rootSchema\` option must not name a \`type\` other than \`object\`, since a store is always an object, got \`${JSON.stringify(r)}\`.`);
  const n = Ss(t.ajvOptions ?? {}), s = rS.default, o = new K_.Ajv2020({
    allErrors: !0,
    useDefaults: !0,
    ...n
  });
  s(o), k(this, N, Vs).call(this, t.schema, "", n.useDefaults !== !1), k(this, N, Oa).call(this, t), k(this, N, Vs).call(this, t.schema, "", n.useDefaults !== !1);
  const a = {
    ...t.rootSchema,
    type: "object",
    properties: k(this, N, Wf).call(this, t.schema)
  };
  $e(this, $t, o.compile(a));
}, /**
The keys along a `defaults` path, named in the `properties` of the schema so a rule that covers the keys the schema does not know does not take the path for one of them. Naming a key says nothing about the value it holds, which is what keeps a store that holds something else there from being reported over a default the store could not write, and only the keys on the way to the one the path names are named, since those are the ones such a rule would take. The path is filled in by the `defaults` option and not by the validator, so none of the keys on the way is given a `default`, and a key the schema already names keeps what it says about it. The last key is given the value the option gives it as its `default`, so a `default` the schema gives it does not win where the validator fills one in. A key a rule of the level says what the value under it has to be is left to that rule instead, which checks it the way it checks a `set()` of the same value.
*/
Jf = function(t, r, n, s) {
  for (const [o, a] of n.entries()) {
    const c = String(a);
    if (r[c] === void 0) {
      if (gu(t, c))
        return;
      r[c] = !0;
    }
    let l = r[c];
    if (o === n.length - 1) {
      l !== !1 && (r[c] = l === !0 ? { default: s } : { ...l, default: s });
      return;
    }
    if (typeof l != "object" || l === null)
      return;
    if (l.default !== void 0) {
      const v = Bo(n.slice(0, o + 1));
      l = { ...l, default: St(k(this, N, Pt).call(this, A(this, ze), v), A(this, N, Ve)) }, r[c] = l;
    }
    const d = typeof l.properties == "object" && l.properties !== null && !Array.isArray(l.properties) ? l.properties : void 0, { additionalProperties: u, unevaluatedProperties: h } = l;
    if (d === void 0 && !(u === !1 || h === !1))
      return;
    const g = Object.assign(xe(), d);
    t = { ...l, properties: g }, r[c] = t, r = g;
  }
}, /**
    The `properties` of the schema, where the `default` of a key the `defaults` option covers is the value the option gives it.

    The option overwrites the `default` of the schema, and the validator inserts that default for a key the store does not hold, which happens before the option is merged in. The option's value is what it inserts instead, so that key reads as the option says. The default is given a value rather than taken away, since the validator applies it before it checks a rule the default satisfies, such as `required`.
    */
Wf = function(t) {
  if (!A(this, ue).defaults)
    return t ?? void 0;
  const r = Ss(t ?? {});
  for (const [n, s] of A(this, Gt)) {
    const o = A(this, ue).accessPropertiesByDotNotation ? Ot(n) : [n];
    if (o === void 0)
      continue;
    if (A(this, ue).accessPropertiesByDotNotation && o.length > 1) {
      k(this, N, Jf).call(this, A(this, ue).rootSchema, r, o, s);
      continue;
    }
    const a = A(this, ue).accessPropertiesByDotNotation ? String(o[0]) : n;
    if (r[a] === !1 || r[a] === void 0 && gu(A(this, ue).rootSchema, a))
      continue;
    const c = r[a];
    r[a] = c === !0 || c === void 0 ? { default: s } : { ...c, default: s };
  }
  return r;
}, /**
    The `default` of every key of the schema, which is what a `reset()` or a `clear()` writes back for it.

    With dot notation the properties below the root are known by the path to them, so a `default` that sits below the root is captured under that path and a reset of it restores the value, the same as for a `default` at the root. An optional object omitted from a parent default must have a default of its own for its descendants to be captured. Without dot notation a key below the root has no key of its own to be reset through, so only the root is looked at.
    */
Vs = function(t, r, n) {
  var a;
  const s = r === "" ? Ce : k(this, N, Pt).call(this, A(this, ze), r, Ce), o = Object.entries(t ?? {});
  for (const [c, l] of o) {
    if (!l || typeof l != "object")
      continue;
    const d = r === "" ? c : `${r}.${Bo([c])}`;
    if (r === "" && k(this, N, An).call(this, c))
      throw new TypeError(`The \`schema\` option must not contain the key \`${d}\`, which is the one this module keeps its bookkeeping under.`);
    if (A(this, ue).accessPropertiesByDotNotation) {
      const _ = r === "" ? NO(c) : Ot(d) === void 0 ? ya : void 0;
      if (_ !== void 0)
        throw new TypeError(`The \`schema\` option must not contain the key \`${d}\`, ${_}`);
    }
    const { default: u, properties: h } = l;
    Object.hasOwn(l, "default") && u !== void 0 && ((a = A(this, ue).ajvOptions) == null ? void 0 : a.useDefaults) !== !1 && (Pn(d, u, A(this, N, Ve)), n && k(this, N, Xf).call(this, d, u));
    const g = k(this, N, Pt).call(this, A(this, ze), d, Ce), v = g === Ce || typeof g == "object" && g !== null;
    if (A(this, ue).accessPropertiesByDotNotation && typeof h == "object" && h !== null && !Array.isArray(h)) {
      const _ = n && v && (s === Ce || g !== Ce);
      k(this, N, Vs).call(this, h, d, _);
    }
  }
}, /**
    A `default` of the schema stored under the key the item is known by.

    With dot notation the key names a path, and a path write below it, from a `defaults` key such as `a.b`, merges into an object stored here, so an object is stored as its own copy and the write cannot reach into the schema the caller gave.
    */
Xf = function(t, r) {
  if (k(this, N, Pt).call(this, A(this, ze), t, Ce) === Ce) {
    if (!A(this, ue).accessPropertiesByDotNotation) {
      A(this, ze)[t] = St(r, A(this, N, Ve));
      return;
    }
    Ps(A(this, ze), t) === void 0 && $r(A(this, ze), t, St(r, A(this, N, Ve)), !0);
  }
}, Oa = function(t) {
  if (t.defaults) {
    if (k(this, N, kn).call(this, t.defaults), A(this, ue).accessPropertiesByDotNotation) {
      for (const [r, n] of A(this, Gt)) {
        if (Ot(r) === void 0)
          throw new TypeError(`The \`defaults\` option cannot hold the key \`${r}\`, ${ya}`);
        Ps(A(this, ze), r) === void 0 && $r(A(this, ze), r, St(n, A(this, N, Ve)));
      }
      return;
    }
    Object.assign(A(this, ze), Object.fromEntries(A(this, Gt).map(([r, n]) => [r, St(n, A(this, N, Ve))])));
  }
}, /**
    A copy of the given value with the `defaults` option applied for the keys it covers that the value does not hold, which is what a store that is written whole looks like.

    With dot notation the key of a default names a path, so it is looked for and written the way `get()` and `set()` take it. The copy is only made when a default is filled in, and it keeps the prototype of the value, since `JSON.stringify` uses a `toJSON` the value inherits from it. The given value is never changed, but it is returned as it is when no default is filled in, so a caller that validates the result, which writes into it, and still needs the original passes a copy in.
    */
gr = function(t) {
  const r = A(this, ue).accessPropertiesByDotNotation;
  let n;
  for (const [s, o] of A(this, Gt)) {
    if (!(r ? zt(t, s, Ce) === Ce : !Zt(t, s) || t[s] === void 0))
      continue;
    const c = n ?? t;
    if (r) {
      if (Ps(c, s) !== void 0 || (n ?? (n = $u(t)), !k(this, N, Yf).call(this, n, s)))
        continue;
      $r(n, s, St(o, A(this, N, Ve)));
    } else
      n ?? (n = Ms(t)), Object.defineProperty(n, s, {
        value: St(o, A(this, N, Ve)),
        writable: !0,
        enumerable: !0,
        configurable: !0
      });
  }
  return n ?? t;
}, /**
    Prepare the given store for a `defaults` key, and say whether the key can be written into it.

    A path below a key the schema gives a `default` to is written into that default, since the validator skips a key the store already holds and would leave the rest of the default out. The rest of the path is asked of that default on its own, rather than the default being written in first, so a path the default cannot take leaves the store exactly as it was. During migrations, only the `defaults` option is applied, since schema defaults are added after the migrations have run.
    */
Yf = function(t, r) {
  if (A(this, Qe))
    return !0;
  const n = Ot(r) ?? [];
  for (const [s, o] of n.entries()) {
    if (s === 0)
      continue;
    const a = Bo(n.slice(0, s));
    if (zt(t, a, Ce) !== Ce)
      continue;
    const c = zt(A(this, ze), a, Ce);
    if (c === Ce)
      continue;
    const l = St(c, A(this, N, Ve));
    return l === null || typeof l != "object" || Ps(l, r, s) !== void 0 ? !1 : ($r(t, a, l), !0);
  }
  return !0;
}, Zf = function(t) {
  t.serialize && $e(this, xn, t.serialize), t.deserialize && $e(this, xt, t.deserialize);
}, Qf = function(t) {
  const r = x.resolve(t.cwd), n = typeof t.fileExtension == "string" ? t.fileExtension.replace(/^\.+/, "") : "", s = n === "" ? "" : `.${n}`, o = `${t.configName ?? "config"}${s}`, a = x.resolve(r, o);
  if (o.includes("\0"))
    throw new TypeError(`The \`configName\` and \`fileExtension\` options must not hold a NUL byte, got \`${o.replaceAll("\0", String.raw`\0`)}\`.`);
  const c = x.relative(r, a);
  if (c === "" || c === ".." || c.startsWith(`..${x.sep}`) || x.isAbsolute(c))
    throw new TypeError(`The \`configName\` and \`fileExtension\` options must name a file inside \`cwd\`, got \`${o}\`, which resolves to \`${a}\`.`);
  return a;
}, /**
What the config file holds, so it can be put back after a construction that cannot finish. `'absent'` is a file that does not exist yet, and `undefined` is one that cannot be read, which is left alone rather than replaced with something else.
*/
eh = function() {
  try {
    return U.readFileSync(this.path);
  } catch {
    return U.existsSync(this.path) ? void 0 : "absent";
  }
}, /**
The config file put back to the state `#snapshotFile()` found it in.
*/
Na = function(t) {
  if (t === "absent") {
    U.rmSync(Rn(this.path), { force: !0 });
    return;
  }
  t !== void 0 && k(this, N, wa).call(this, t, void 0);
}, th = function(t) {
  const r = t.migrations ? k(this, N, eh).call(this) : void 0;
  k(this, N, rh).call(this, t);
  const n = k(this, N, ct).call(this, !1), s = k(this, N, gr).call(this, wt(n));
  try {
    k(this, N, Kr).call(this, s);
  } catch (o) {
    if (!t.clearInvalidConfig || !(o instanceof Ho))
      throw k(this, N, Na).call(this, r), o;
    try {
      const a = k(this, N, gr).call(this, xe());
      k(this, N, Kr).call(this, a), this.store = a;
    } catch (a) {
      throw k(this, N, Na).call(this, r), a;
    }
    return;
  }
  bo(n, s) || (this.store = n);
}, rh = function(t) {
  const { migrations: r, projectVersion: n } = t;
  if (r) {
    if (!n)
      throw new Error("Please specify the `projectVersion` option.");
    if (rt.valid(n) === null)
      throw new Error(`The \`projectVersion\` option must be a valid semantic version, got \`${n}\``);
    $e(this, Qe, !0);
    try {
      const s = !U.existsSync(this.path), o = k(this, N, ct).call(this), a = k(this, N, gr).call(this, o);
      if (s) {
        k(this, N, Cn).call(this, Vr, n, a);
        return;
      }
      bo(o, a) || k(this, N, jn).call(this, a), k(this, N, qf).call(this, r, n, t.beforeEachMigration, a);
    } finally {
      $e(this, Qe, !1);
    }
  }
};
const { app: zs, ipcMain: Ia, shell: MO } = bu;
let wu = !1;
const Eu = () => {
  if (!Ia || !zs)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: zs.getPath("userData"),
    appVersion: zs.getVersion()
  };
  return wu || (Ia.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), wu = !0), e;
};
class FO extends DO {
  static initRenderer() {
    Eu();
  }
  constructor(t) {
    let r, n;
    if (fe.type === "renderer") {
      const s = bu.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else if (Ia && zs)
      ({ defaultCwd: r, appVersion: n } = Eu());
    else if (!(t != null && t.cwd) || !x.isAbsolute(t.cwd))
      throw new Error("Electron Store: You can only use this module from the Electron main process or the renderer process, unless you pass an absolute `cwd`.");
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = x.isAbsolute(t.cwd) ? t.cwd : x.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  async openInEditor() {
    const t = await MO.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const LO = [
  "#2F3137",
  // 黑灰（默认）
  "#4DABF7",
  // 天空蓝
  "#51CF66",
  // 薄荷绿
  "#FFA94D",
  // 暖橙
  "#FF6B6B",
  // 珊瑚红
  "#9775FA",
  // 薰衣草紫
  "#F783AC",
  // 樱花粉
  "#FFD43B"
  // 柠檬黄
], VO = LO[0], zO = "tag-work", UO = [{ id: zO, name: "工作", color: VO }], KO = {
  autoLaunch: !0,
  alwaysOnTop: !0,
  expanded: !0,
  expandedBounds: { width: 380, height: 560 },
  collapsedBounds: { width: 220, height: 64 },
  supabaseUserId: null
}, ae = new FO({
  name: "schedule-data",
  defaults: {
    tasks: [],
    settings: KO,
    tags: UO
  }
});
function Qt() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function qO() {
  const e = ae.get("tasks");
  let t = !1;
  const r = { schedule: 0, longterm: 0 }, n = [...e].sort((s, o) => (s.createdAt ?? "").localeCompare(o.createdAt ?? ""));
  for (const s of n)
    s.section || (s.section = "schedule", t = !0), typeof s.order != "number" && (s.order = r[s.section], t = !0), typeof s.tagId > "u" && (s.tagId = null, t = !0), Array.isArray(s.titleMarks) || (s.titleMarks = [], t = !0), typeof s.parentId > "u" && (s.parentId = null, t = !0), typeof s.bgColor > "u" && (s.bgColor = null, t = !0), r[s.section] = Math.max(r[s.section], s.order + 1);
  t && ae.set("tasks", e);
}
qO();
function GO() {
  return ae.get("tasks").filter((e) => !e.deletedAt);
}
function HO(e) {
  const t = e.section ?? "schedule", r = e.parentId ?? null, n = ae.get("tasks"), s = n.filter(
    (a) => !a.deletedAt && a.parentId === r && (r !== null || a.section === t)
  ).length, o = {
    id: Pu(),
    title: e.title,
    titleMarks: [],
    parentId: r,
    dueAt: e.dueAt,
    color: e.color,
    bgColor: null,
    section: t,
    order: s,
    tagId: e.tagId ?? null,
    completed: !1,
    createdAt: Qt(),
    updatedAt: Qt(),
    deletedAt: null,
    dirty: !0,
    notifiedAt: null
  };
  return n.push(o), ae.set("tasks", n), o;
}
function BO(e, t) {
  const r = ae.get("tasks"), n = r.findIndex((s) => s.id === e);
  return n === -1 ? null : (r[n] = { ...r[n], ...t, updatedAt: Qt(), dirty: !0 }, ae.set("tasks", r), r[n]);
}
function xO(e) {
  const t = ae.get("tasks"), r = [], n = /* @__PURE__ */ new Set([e]);
  let s = !0;
  for (; s; ) {
    s = !1;
    for (const o of t)
      o.parentId && n.has(o.parentId) && !n.has(o.id) && (n.add(o.id), s = !0);
  }
  for (const o of t)
    n.has(o.id) && !o.deletedAt && (o.deletedAt = Qt(), o.updatedAt = Qt(), o.dirty = !0, r.push(o));
  return r.length > 0 && ae.set("tasks", t), r;
}
function JO() {
  return ae.get("tasks").filter((e) => !!e.deletedAt).sort((e, t) => (t.deletedAt ?? "").localeCompare(e.deletedAt ?? ""));
}
function WO(e) {
  const t = ae.get("tasks"), r = t.findIndex((n) => n.id === e);
  r !== -1 && (t.splice(r, 1), ae.set("tasks", t));
}
function XO(e) {
  const t = ae.get("tasks"), r = t.find((a) => a.id === e);
  if (!r) return [];
  const n = /* @__PURE__ */ new Set([e]);
  let s = r;
  for (; s.parentId; ) {
    const a = t.find((c) => c.id === s.parentId);
    if (!a || !a.deletedAt) break;
    n.add(a.id), s = a;
  }
  const o = [];
  for (const a of t)
    n.has(a.id) && a.deletedAt && (a.deletedAt = null, a.updatedAt = Qt(), a.dirty = !0, o.push(a));
  return o.length > 0 && ae.set("tasks", t), o;
}
function YO(e) {
  ae.set("tasks", e);
}
function ZO() {
  return ae.get("tasks").filter((e) => e.dirty);
}
function QO(e) {
  const t = ae.get("tasks"), r = t.filter(
    (n) => !n.deletedAt && !n.completed && !n.notifiedAt && n.dueAt && n.dueAt <= e
  );
  for (const n of r)
    n.notifiedAt = e;
  return r.length > 0 && ae.set("tasks", t), r;
}
function eN(e) {
  const t = ae.get("tasks"), r = new Set(e);
  for (const n of t)
    r.has(n.id) && (n.dirty = !1);
  ae.set("tasks", t);
}
function tN(e) {
  const t = ae.get("tasks"), r = new Map(e.map((n) => [n.id, n]));
  for (const n of t) {
    const s = r.get(n.id);
    s && (n.section = s.section, n.order = s.order, n.updatedAt = Qt(), n.dirty = !0);
  }
  ae.set("tasks", t);
}
function Zs() {
  return ae.get("settings");
}
function Qs(e) {
  const t = { ...ae.get("settings"), ...e };
  return ae.set("settings", t), t;
}
function rN() {
  return ae.get("tags");
}
function nN(e) {
  const t = ae.get("tags"), r = { id: Pu(), name: e.name, color: e.color };
  return t.push(r), ae.set("tags", t), r;
}
function sN(e, t) {
  const r = ae.get("tags"), n = r.findIndex((s) => s.id === e);
  return n === -1 ? null : (r[n] = { ...r[n], ...t }, ae.set("tags", r), r[n]);
}
function oN(e) {
  const t = ae.get("tags"), r = t.findIndex((o) => o.id === e);
  if (r === -1) return;
  t.splice(r, 1), ae.set("tags", t);
  const n = ae.get("tasks");
  let s = !1;
  for (const o of n)
    o.tagId === e && (o.tagId = null, o.updatedAt = Qt(), o.dirty = !0, s = !0);
  s && ae.set("tasks", n);
}
const nh = x.dirname(hh(import.meta.url));
process.env.APP_ROOT = x.join(nh, "..");
const Ra = process.env.VITE_DEV_SERVER_URL, PN = x.join(process.env.APP_ROOT, "dist-electron"), sh = x.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Ra ? x.join(process.env.APP_ROOT, "public") : sh;
let oe = null, Os = null, Ta = null;
const oh = x.join(process.env.VITE_PUBLIC, "icon.png");
function ah() {
  const e = Zs(), { width: t } = uh.getPrimaryDisplay().workAreaSize, r = e.expanded ? e.expandedBounds : e.collapsedBounds;
  oe = new Su({
    width: r.width,
    height: r.height,
    x: t - r.width - 24,
    y: 24,
    frame: !1,
    transparent: !0,
    hasShadow: !1,
    resizable: !0,
    minWidth: 220,
    minHeight: 64,
    alwaysOnTop: e.alwaysOnTop,
    skipTaskbar: !0,
    show: !1,
    icon: xo.createFromPath(oh),
    webPreferences: {
      preload: x.join(nh, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1,
      sandbox: !0
    }
  }), e.alwaysOnTop && oe.setAlwaysOnTop(!0, "screen-saver"), oe.once("ready-to-show", () => {
    oe == null || oe.show();
  }), Ra ? oe.loadURL(Ra) : oe.loadFile(x.join(sh, "index.html")), oe.on("resize", () => {
    if (!oe) return;
    const [n, s] = oe.getSize();
    Zs().expanded ? Qs({ expandedBounds: { width: n, height: s } }) : Qs({ collapsedBounds: { width: n, height: s } });
  }), oe.on("closed", () => {
    oe = null;
  });
}
function aN() {
  const e = xo.createFromPath(oh);
  Os = new dh(e.isEmpty() ? xo.createEmpty() : e), Os.setToolTip("悬浮计划表");
  const t = fh.buildFromTemplate([
    {
      label: "显示/隐藏",
      click: () => {
        oe && (oe.isVisible() ? oe.hide() : oe.show());
      }
    },
    {
      label: "退出",
      click: () => {
        Ir.quit();
      }
    }
  ]);
  Os.setContextMenu(t), Os.on("click", () => {
    oe && (oe.isVisible() ? oe.hide() : oe.show());
  });
}
function ih(e) {
  Ir.setLoginItemSettings({
    openAtLogin: e,
    path: process.execPath
  });
}
function iN() {
  Ta = setInterval(() => {
    const e = QO((/* @__PURE__ */ new Date()).toISOString());
    if (e.length !== 0) {
      for (const t of e)
        zc.isSupported() && new zc({
          title: "日程提醒",
          body: t.title,
          silent: !1
        }).show();
      oe == null || oe.webContents.send("tasks:due", e);
    }
  }, 3e4);
}
function cN() {
  ge.handle("tasks:list", () => GO()), ge.handle("tasks:create", (e, t) => HO(t)), ge.handle("tasks:update", (e, t, r) => BO(t, r)), ge.handle("tasks:delete", (e, t) => xO(t)), ge.handle("tasks:listDeleted", () => JO()), ge.handle("tasks:purge", (e, t) => WO(t)), ge.handle("tasks:restore", (e, t) => XO(t)), ge.handle("tasks:getDirty", () => ZO()), ge.handle("tasks:clearDirty", (e, t) => eN(t)), ge.handle("tasks:replaceAll", (e, t) => YO(t)), ge.handle(
    "tasks:reorder",
    (e, t) => tN(t)
  ), ge.handle("tags:list", () => rN()), ge.handle("tags:create", (e, t) => nN(t)), ge.handle(
    "tags:update",
    (e, t, r) => sN(t, r)
  ), ge.handle("tags:delete", (e, t) => oN(t)), ge.handle("settings:get", () => Zs()), ge.handle("settings:set", (e, t) => {
    const r = Qs(t);
    return typeof t.autoLaunch == "boolean" && ih(t.autoLaunch), typeof t.alwaysOnTop == "boolean" && (oe == null || oe.setAlwaysOnTop(t.alwaysOnTop, "screen-saver")), r;
  }), ge.handle("window:toggleCollapse", (e, t) => {
    if (!oe) return;
    const r = Qs({ expanded: t }), n = t ? r.expandedBounds : r.collapsedBounds;
    oe.setBounds({ ...oe.getBounds(), width: n.width, height: n.height });
  }), ge.handle("window:setIgnoreMouseEvents", (e, t, r) => {
    oe == null || oe.setIgnoreMouseEvents(t, { forward: r });
  }), ge.handle("window:hide", () => oe == null ? void 0 : oe.hide()), ge.handle("window:quit", () => Ir.quit());
}
Ir.whenReady().then(() => {
  cN(), ah(), aN(), iN(), ih(Zs().autoLaunch);
});
Ir.on("window-all-closed", () => {
  Ta && clearInterval(Ta), process.platform !== "darwin" && Ir.quit();
});
Ir.on("activate", () => {
  Su.getAllWindows().length === 0 && ah();
});
export {
  PN as MAIN_DIST,
  sh as RENDERER_DIST,
  Ra as VITE_DEV_SERVER_URL
};
