"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // ../npm/qsharp/lib/web/qsc_wasm.js
  var qsc_wasm_exports = {};
  __export(qsc_wasm_exports, {
    DebugService: () => DebugService,
    LanguageService: () => LanguageService,
    ProjectLoader: () => ProjectLoader,
    StepResultId: () => StepResultId,
    check_exercise_solution: () => check_exercise_solution,
    default: () => qsc_wasm_default,
    generate_docs: () => generate_docs,
    get_ast: () => get_ast,
    get_circuit: () => get_circuit,
    get_estimates: () => get_estimates,
    get_hir: () => get_hir,
    get_library_source_content: () => get_library_source_content,
    get_qir: () => get_qir,
    get_rir: () => get_rir,
    git_hash: () => git_hash,
    initLogging: () => initLogging,
    initSync: () => initSync,
    run: () => run,
    runWithPauliNoise: () => runWithPauliNoise,
    setLogLevel: () => setLogLevel
  });
  var wasm;
  var heap = new Array(128).fill(void 0);
  heap.push(void 0, null, true, false);
  function getObject(idx) {
    return heap[idx];
  }
  var WASM_VECTOR_LEN = 0;
  var cachedUint8ArrayMemory0 = null;
  function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
      cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
  }
  var cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: () => {
    throw Error("TextEncoder not available");
  } };
  var encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  } : function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
  function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === void 0) {
      const buf = cachedTextEncoder.encode(arg);
      const ptr2 = malloc(buf.length, 1) >>> 0;
      getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
      WASM_VECTOR_LEN = buf.length;
      return ptr2;
    }
    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;
    const mem = getUint8ArrayMemory0();
    let offset = 0;
    for (; offset < len; offset++) {
      const code = arg.charCodeAt(offset);
      if (code > 127) break;
      mem[ptr + offset] = code;
    }
    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }
      ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
      const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);
      offset += ret.written;
      ptr = realloc(ptr, len, offset, 1) >>> 0;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
  }
  var cachedDataViewMemory0 = null;
  function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
      cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
  }
  var heap_next = heap.length;
  function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
  }
  function handleError(f, args) {
    try {
      return f.apply(this, args);
    } catch (e) {
      wasm.__wbindgen_export_2(addHeapObject(e));
    }
  }
  var cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: () => {
    throw Error("TextDecoder not available");
  } };
  if (typeof TextDecoder !== "undefined") {
    cachedTextDecoder.decode();
  }
  function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
  }
  function isLikeNone(x) {
    return x === void 0 || x === null;
  }
  function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
  }
  function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
  }
  var CLOSURE_DTORS = typeof FinalizationRegistry === "undefined" ? { register: () => {
  }, unregister: () => {
  } } : new FinalizationRegistry((state) => {
    wasm.__wbindgen_export_3.get(state.dtor)(state.a, state.b);
  });
  function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
      state.cnt++;
      const a = state.a;
      state.a = 0;
      try {
        return f(a, state.b, ...args);
      } finally {
        if (--state.cnt === 0) {
          wasm.__wbindgen_export_3.get(state.dtor)(a, state.b);
          CLOSURE_DTORS.unregister(state);
        } else {
          state.a = a;
        }
      }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
  }
  function debugString(val) {
    const type = typeof val;
    if (type == "number" || type == "boolean" || val == null) {
      return "".concat(val);
    }
    if (type == "string") {
      return '"'.concat(val, '"');
    }
    if (type == "symbol") {
      const description = val.description;
      if (description == null) {
        return "Symbol";
      } else {
        return "Symbol(".concat(description, ")");
      }
    }
    if (type == "function") {
      const name = val.name;
      if (typeof name == "string" && name.length > 0) {
        return "Function(".concat(name, ")");
      } else {
        return "Function";
      }
    }
    if (Array.isArray(val)) {
      const length = val.length;
      let debug = "[";
      if (length > 0) {
        debug += debugString(val[0]);
      }
      for (let i = 1; i < length; i++) {
        debug += ", " + debugString(val[i]);
      }
      debug += "]";
      return debug;
    }
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
      className = builtInMatches[1];
    } else {
      return toString.call(val);
    }
    if (className == "Object") {
      try {
        return "Object(" + JSON.stringify(val) + ")";
      } catch (_) {
        return "Object";
      }
    }
    if (val instanceof Error) {
      return "".concat(val.name, ": ").concat(val.message, "\n").concat(val.stack);
    }
    return className;
  }
  var stack_pointer = 128;
  function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error("out of js stack");
    heap[--stack_pointer] = obj;
    return stack_pointer;
  }
  var cachedUint32ArrayMemory0 = null;
  function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
      cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
  }
  function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
  }
  function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
      mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
  }
  function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
      result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
  }
  function initLogging(callback, level) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.initLogging(retptr, addHeapObject(callback), level);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  function setLogLevel(level) {
    wasm.setLogLevel(level);
  }
  function git_hash() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.git_hash(retptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export_4(deferred1_0, deferred1_1, 1);
    }
  }
  function get_qir(program) {
    let deferred2_0;
    let deferred2_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.get_qir(retptr, addHeapObject(program));
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export_4(deferred2_0, deferred2_1, 1);
    }
  }
  function get_estimates(program, params) {
    let deferred3_0;
    let deferred3_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(params, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      wasm.get_estimates(retptr, addHeapObject(program), ptr0, len0);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      var ptr2 = r0;
      var len2 = r1;
      if (r3) {
        ptr2 = 0;
        len2 = 0;
        throw takeObject(r2);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export_4(deferred3_0, deferred3_1, 1);
    }
  }
  function get_circuit(program, simulate, operation) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.get_circuit(retptr, addHeapObject(program), simulate, isLikeNone(operation) ? 0 : addHeapObject(operation));
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  function get_library_source_content(name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      wasm.get_library_source_content(retptr, ptr0, len0);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      let v2;
      if (r0 !== 0) {
        v2 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_export_4(r0, r1 * 1, 1);
      }
      return v2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  function get_ast(code, language_features, profile) {
    let deferred5_0;
    let deferred5_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(code, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passArrayJsValueToWasm0(language_features, wasm.__wbindgen_export_0);
      const len1 = WASM_VECTOR_LEN;
      const ptr2 = passStringToWasm0(profile, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len2 = WASM_VECTOR_LEN;
      wasm.get_ast(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      var ptr4 = r0;
      var len4 = r1;
      if (r3) {
        ptr4 = 0;
        len4 = 0;
        throw takeObject(r2);
      }
      deferred5_0 = ptr4;
      deferred5_1 = len4;
      return getStringFromWasm0(ptr4, len4);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export_4(deferred5_0, deferred5_1, 1);
    }
  }
  function get_hir(code, language_features, profile) {
    let deferred5_0;
    let deferred5_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(code, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passArrayJsValueToWasm0(language_features, wasm.__wbindgen_export_0);
      const len1 = WASM_VECTOR_LEN;
      const ptr2 = passStringToWasm0(profile, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len2 = WASM_VECTOR_LEN;
      wasm.get_hir(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      var ptr4 = r0;
      var len4 = r1;
      if (r3) {
        ptr4 = 0;
        len4 = 0;
        throw takeObject(r2);
      }
      deferred5_0 = ptr4;
      deferred5_1 = len4;
      return getStringFromWasm0(ptr4, len4);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export_4(deferred5_0, deferred5_1, 1);
    }
  }
  function get_rir(program) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.get_rir(retptr, addHeapObject(program));
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
      wasm.__wbindgen_export_4(r0, r1 * 4, 4);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  function run(program, expr, event_cb, shots) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(expr, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      wasm.run(retptr, addHeapObject(program), ptr0, len0, addBorrowedObject(event_cb), shots);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return r0 !== 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = void 0;
    }
  }
  function runWithPauliNoise(program, expr, event_cb, shots, pauliNoise) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(expr, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      wasm.runWithPauliNoise(retptr, addHeapObject(program), ptr0, len0, addBorrowedObject(event_cb), shots, addBorrowedObject(pauliNoise));
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return r0 !== 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = void 0;
      heap[stack_pointer++] = void 0;
    }
  }
  function check_exercise_solution(solution_code, exercise_sources_js, event_cb) {
    try {
      const ptr0 = passStringToWasm0(solution_code, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.check_exercise_solution(ptr0, len0, addHeapObject(exercise_sources_js), addBorrowedObject(event_cb));
      return ret !== 0;
    } finally {
      heap[stack_pointer++] = void 0;
    }
  }
  function generate_docs(additional_program) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.generate_docs(retptr, isLikeNone(additional_program) ? 0 : addHeapObject(additional_program));
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
      wasm.__wbindgen_export_4(r0, r1 * 4, 4);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  function __wbg_adapter_52(arg0, arg1, arg2) {
    wasm.__wbindgen_export_5(arg0, arg1, addHeapObject(arg2));
  }
  function __wbg_adapter_198(arg0, arg1, arg2, arg3) {
    wasm.__wbindgen_export_6(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
  }
  var StepResultId = Object.freeze({
    BreakpointHit: 0,
    "0": "BreakpointHit",
    Next: 1,
    "1": "Next",
    StepIn: 2,
    "2": "StepIn",
    StepOut: 3,
    "3": "StepOut",
    Return: 4,
    "4": "Return"
  });
  var DebugServiceFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
  }, unregister: () => {
  } } : new FinalizationRegistry((ptr) => wasm.__wbg_debugservice_free(ptr >>> 0, 1));
  var DebugService = class {
    __destroy_into_raw() {
      const ptr = this.__wbg_ptr;
      this.__wbg_ptr = 0;
      DebugServiceFinalization.unregister(this);
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_debugservice_free(ptr, 0);
    }
    constructor() {
      const ret = wasm.debugservice_new();
      this.__wbg_ptr = ret >>> 0;
      DebugServiceFinalization.register(this, this.__wbg_ptr, this);
      return this;
    }
    /**
     * @param {IProgramConfig} program
     * @param {string | null} [entry]
     * @returns {string}
     */
    load_program(program, entry) {
      let deferred2_0;
      let deferred2_1;
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = isLikeNone(entry) ? 0 : passStringToWasm0(entry, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        wasm.debugservice_load_program(retptr, this.__wbg_ptr, addHeapObject(program), ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred2_0 = r0;
        deferred2_1 = r1;
        return getStringFromWasm0(r0, r1);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_4(deferred2_0, deferred2_1, 1);
      }
    }
    /**
     * @returns {IQuantumStateList}
     */
    capture_quantum_state() {
      const ret = wasm.debugservice_capture_quantum_state(this.__wbg_ptr);
      return takeObject(ret);
    }
    /**
     * @returns {any}
     */
    get_circuit() {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.debugservice_get_circuit(retptr, this.__wbg_ptr);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
          throw takeObject(r1);
        }
        return takeObject(r0);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
     * @returns {IStackFrameList}
     */
    get_stack_frames() {
      const ret = wasm.debugservice_get_stack_frames(this.__wbg_ptr);
      return takeObject(ret);
    }
    /**
     * @param {Function} event_cb
     * @param {Uint32Array} ids
     * @returns {IStructStepResult}
     */
    eval_next(event_cb, ids) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray32ToWasm0(ids, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        wasm.debugservice_eval_next(retptr, this.__wbg_ptr, addBorrowedObject(event_cb), ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
          throw takeObject(r1);
        }
        return takeObject(r0);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = void 0;
      }
    }
    /**
     * @param {Function} event_cb
     * @param {Uint32Array} ids
     * @returns {IStructStepResult}
     */
    eval_continue(event_cb, ids) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray32ToWasm0(ids, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        wasm.debugservice_eval_continue(retptr, this.__wbg_ptr, addBorrowedObject(event_cb), ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
          throw takeObject(r1);
        }
        return takeObject(r0);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = void 0;
      }
    }
    /**
     * @param {Function} event_cb
     * @param {Uint32Array} ids
     * @returns {IStructStepResult}
     */
    eval_step_in(event_cb, ids) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray32ToWasm0(ids, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        wasm.debugservice_eval_step_in(retptr, this.__wbg_ptr, addBorrowedObject(event_cb), ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
          throw takeObject(r1);
        }
        return takeObject(r0);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = void 0;
      }
    }
    /**
     * @param {Function} event_cb
     * @param {Uint32Array} ids
     * @returns {IStructStepResult}
     */
    eval_step_out(event_cb, ids) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray32ToWasm0(ids, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        wasm.debugservice_eval_step_out(retptr, this.__wbg_ptr, addBorrowedObject(event_cb), ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
          throw takeObject(r1);
        }
        return takeObject(r0);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = void 0;
      }
    }
    /**
     * @param {string} path
     * @returns {IBreakpointSpanList}
     */
    get_breakpoints(path) {
      const ptr0 = passStringToWasm0(path, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.debugservice_get_breakpoints(this.__wbg_ptr, ptr0, len0);
      return takeObject(ret);
    }
    /**
     * @returns {IVariableList}
     */
    get_locals() {
      const ret = wasm.debugservice_get_locals(this.__wbg_ptr);
      return takeObject(ret);
    }
  };
  var LanguageServiceFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
  }, unregister: () => {
  } } : new FinalizationRegistry((ptr) => wasm.__wbg_languageservice_free(ptr >>> 0, 1));
  var LanguageService = class {
    __destroy_into_raw() {
      const ptr = this.__wbg_ptr;
      this.__wbg_ptr = 0;
      LanguageServiceFinalization.unregister(this);
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_languageservice_free(ptr, 0);
    }
    constructor() {
      const ret = wasm.languageservice_new();
      this.__wbg_ptr = ret >>> 0;
      LanguageServiceFinalization.register(this, this.__wbg_ptr, this);
      return this;
    }
    /**
     * @param {(uri: string, version: number | undefined, diagnostics: VSDiagnostic[]) => void} diagnostics_callback
     * @param {(callables: ITestDescriptor[]) => void} test_callables_callback
     * @param {IProjectHost} host
     * @returns {Promise<any>}
     */
    start_background_work(diagnostics_callback, test_callables_callback, host) {
      try {
        const ret = wasm.languageservice_start_background_work(this.__wbg_ptr, addBorrowedObject(diagnostics_callback), addBorrowedObject(test_callables_callback), addHeapObject(host));
        return takeObject(ret);
      } finally {
        heap[stack_pointer++] = void 0;
        heap[stack_pointer++] = void 0;
      }
    }
    stop_background_work() {
      wasm.languageservice_stop_background_work(this.__wbg_ptr);
    }
    /**
     * @param {IWorkspaceConfiguration} config
     */
    update_configuration(config) {
      wasm.languageservice_update_configuration(this.__wbg_ptr, addHeapObject(config));
    }
    /**
     * @param {string} uri
     * @param {number} version
     * @param {string} text
     */
    update_document(uri, version, text) {
      const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(text, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len1 = WASM_VECTOR_LEN;
      wasm.languageservice_update_document(this.__wbg_ptr, ptr0, len0, version, ptr1, len1);
    }
    /**
     * @param {string} uri
     */
    close_document(uri) {
      const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      wasm.languageservice_close_document(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} notebook_uri
     * @param {INotebookMetadata} notebook_metadata
     * @param {ICell[]} cells
     */
    update_notebook_document(notebook_uri, notebook_metadata, cells) {
      const ptr0 = passStringToWasm0(notebook_uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passArrayJsValueToWasm0(cells, wasm.__wbindgen_export_0);
      const len1 = WASM_VECTOR_LEN;
      wasm.languageservice_update_notebook_document(this.__wbg_ptr, ptr0, len0, addHeapObject(notebook_metadata), ptr1, len1);
    }
    /**
     * @param {string} notebook_uri
     */
    close_notebook_document(notebook_uri) {
      const ptr0 = passStringToWasm0(notebook_uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      wasm.languageservice_close_notebook_document(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} uri
     * @param {IRange} range
     * @returns {ICodeAction[]}
     */
    get_code_actions(uri, range) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.languageservice_get_code_actions(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(range));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_export_4(r0, r1 * 4, 4);
        return v2;
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
     * @param {string} uri
     * @param {IPosition} position
     * @returns {ICompletionList}
     */
    get_completions(uri, position) {
      const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.languageservice_get_completions(this.__wbg_ptr, ptr0, len0, addHeapObject(position));
      return takeObject(ret);
    }
    /**
     * @param {string} uri
     * @param {IPosition} position
     * @returns {ILocation | undefined}
     */
    get_definition(uri, position) {
      const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.languageservice_get_definition(this.__wbg_ptr, ptr0, len0, addHeapObject(position));
      return takeObject(ret);
    }
    /**
     * @param {string} uri
     * @param {IPosition} position
     * @param {boolean} include_declaration
     * @returns {ILocation[]}
     */
    get_references(uri, position, include_declaration) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.languageservice_get_references(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(position), include_declaration);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_export_4(r0, r1 * 4, 4);
        return v2;
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
     * @param {string} uri
     * @returns {ITextEdit[]}
     */
    get_format_changes(uri) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.languageservice_get_format_changes(retptr, this.__wbg_ptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_export_4(r0, r1 * 4, 4);
        return v2;
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
     * @param {string} uri
     * @param {IPosition} position
     * @returns {IHover | undefined}
     */
    get_hover(uri, position) {
      const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.languageservice_get_hover(this.__wbg_ptr, ptr0, len0, addHeapObject(position));
      return takeObject(ret);
    }
    /**
     * @param {string} uri
     * @param {IPosition} position
     * @returns {ISignatureHelp | undefined}
     */
    get_signature_help(uri, position) {
      const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.languageservice_get_signature_help(this.__wbg_ptr, ptr0, len0, addHeapObject(position));
      return takeObject(ret);
    }
    /**
     * @param {string} uri
     * @param {IPosition} position
     * @param {string} new_name
     * @returns {IWorkspaceEdit}
     */
    get_rename(uri, position, new_name) {
      const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(new_name, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len1 = WASM_VECTOR_LEN;
      const ret = wasm.languageservice_get_rename(this.__wbg_ptr, ptr0, len0, addHeapObject(position), ptr1, len1);
      return takeObject(ret);
    }
    /**
     * @param {string} uri
     * @param {IPosition} position
     * @returns {ITextEdit | undefined}
     */
    prepare_rename(uri, position) {
      const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.languageservice_prepare_rename(this.__wbg_ptr, ptr0, len0, addHeapObject(position));
      return takeObject(ret);
    }
    /**
     * @param {string} uri
     * @returns {ICodeLens[]}
     */
    get_code_lenses(uri) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(uri, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.languageservice_get_code_lenses(retptr, this.__wbg_ptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_export_4(r0, r1 * 4, 4);
        return v2;
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
  };
  var ProjectLoaderFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
  }, unregister: () => {
  } } : new FinalizationRegistry((ptr) => wasm.__wbg_projectloader_free(ptr >>> 0, 1));
  var ProjectLoader = class {
    __destroy_into_raw() {
      const ptr = this.__wbg_ptr;
      this.__wbg_ptr = 0;
      ProjectLoaderFinalization.unregister(this);
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_projectloader_free(ptr, 0);
    }
    /**
     * @param {IProjectHost} project_host
     */
    constructor(project_host) {
      const ret = wasm.projectloader_new(addHeapObject(project_host));
      this.__wbg_ptr = ret >>> 0;
      ProjectLoaderFinalization.register(this, this.__wbg_ptr, this);
      return this;
    }
    /**
     * @param {string} directory
     * @returns {Promise<IProjectConfig>}
     */
    load_project_with_deps(directory) {
      const ptr0 = passStringToWasm0(directory, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.projectloader_load_project_with_deps(this.__wbg_ptr, ptr0, len0);
      return takeObject(ret);
    }
  };
  async function __wbg_load(module2, imports) {
    if (typeof Response === "function" && module2 instanceof Response) {
      if (typeof WebAssembly.instantiateStreaming === "function") {
        try {
          return await WebAssembly.instantiateStreaming(module2, imports);
        } catch (e) {
          if (module2.headers.get("Content-Type") != "application/wasm") {
            console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
          } else {
            throw e;
          }
        }
      }
      const bytes = await module2.arrayBuffer();
      return await WebAssembly.instantiate(bytes, imports);
    } else {
      const instance = await WebAssembly.instantiate(module2, imports);
      if (instance instanceof WebAssembly.Instance) {
        return { instance, module: module2 };
      } else {
        return instance;
      }
    }
  }
  function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
      const ret = String(getObject(arg1));
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_buffer_aa30bbb65cb44323 = function(arg0) {
      const ret = getObject(arg0).buffer;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_41c7efaf6b1182f8 = function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_call_aff990758d3576e4 = function() {
      return handleError(function(arg0, arg1, arg2, arg3, arg4) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3), getObject(arg4));
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_call_c45d13337ffb12ac = function() {
      return handleError(function(arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_crypto_ed58b8e10a292839 = function(arg0) {
      const ret = getObject(arg0).crypto;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_done_362f78ab584a24b5 = function(arg0) {
      const ret = getObject(arg0).done;
      return ret;
    };
    imports.wbg.__wbg_entries_27a445ca6b702f8d = function(arg0) {
      const ret = Object.entries(getObject(arg0));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetchGithub_8d40e9b8dedfdb81 = function() {
      return handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        const ret = getObject(arg0).fetchGithub(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4), getStringFromWasm0(arg5, arg6), getStringFromWasm0(arg7, arg8));
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_findManifestDirectory_91ae20bc11401cd7 = function(arg0, arg1, arg2) {
      const ret = getObject(arg0).findManifestDirectory(getStringFromWasm0(arg1, arg2));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_from_b4bd31c02b6d179c = function(arg0) {
      const ret = Array.from(getObject(arg0));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_bcb4912f16000dc4 = function() {
      return handleError(function(arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
      }, arguments);
    };
    imports.wbg.__wbg_get_01203e6a4116a116 = function(arg0, arg1) {
      const ret = getObject(arg0)[arg1 >>> 0];
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_e7114b7bf3d9d5f5 = function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_getstacktracelimit_af8b40007957b07f = function() {
      const ret = Error.stackTraceLimit;
      return isLikeNone(ret) ? 4294967297 : ret >>> 0;
    };
    imports.wbg.__wbg_getwithrefkey_1dc361bd10053bfe = function(arg0, arg1) {
      const ret = getObject(arg0)[getObject(arg1)];
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_globalThis_856ff24a65e13540 = function() {
      return handleError(function() {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_global_fc813a897a497d26 = function() {
      return handleError(function() {
        const ret = global.global;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_8b96bf6c71691dc9 = function(arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof ArrayBuffer;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    };
    imports.wbg.__wbg_instanceof_Error_35d55cc64fb61630 = function(arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Error;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    };
    imports.wbg.__wbg_instanceof_Map_cd976ea4854c21db = function(arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Map;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_faa8901ba56cb8e9 = function(arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Uint8Array;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    };
    imports.wbg.__wbg_isArray_6836d46c89daf1b6 = function(arg0) {
      const ret = Array.isArray(getObject(arg0));
      return ret;
    };
    imports.wbg.__wbg_isSafeInteger_2fb2b4f942993af4 = function(arg0) {
      const ret = Number.isSafeInteger(getObject(arg0));
      return ret;
    };
    imports.wbg.__wbg_iterator_773e0b022e7009f4 = function() {
      const ret = Symbol.iterator;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_0a11127664108286 = function(arg0) {
      const ret = getObject(arg0).length;
      return ret;
    };
    imports.wbg.__wbg_length_9aaa2867670f533a = function(arg0) {
      const ret = getObject(arg0).length;
      return ret;
    };
    imports.wbg.__wbg_listDirectory_827a3459b52ecade = function(arg0, arg1, arg2) {
      const ret = getObject(arg0).listDirectory(getStringFromWasm0(arg1, arg2));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_message_b5668b9cb29859e1 = function(arg0) {
      const ret = getObject(arg0).message;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_0a36e2ec3a343d26 = function(arg0) {
      const ret = getObject(arg0).msCrypto;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_07527e5c188e7771 = function(arg0, arg1) {
      try {
        var state0 = { a: arg0, b: arg1 };
        var cb0 = (arg02, arg12) => {
          const a = state0.a;
          state0.a = 0;
          try {
            return __wbg_adapter_198(a, state0.b, arg02, arg12);
          } finally {
            state0.a = a;
          }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
      } finally {
        state0.a = state0.b = 0;
      }
    };
    imports.wbg.__wbg_new_4c16aab09d1eb450 = function() {
      const ret = new Object();
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_6e254ba4a466646d = function() {
      const ret = new Array();
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_820d2bbee2d13ba3 = function() {
      const ret = /* @__PURE__ */ new Map();
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_a774eb7503f03596 = function() {
      const ret = new Error();
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_db41cf29086ce106 = function(arg0) {
      const ret = new Uint8Array(getObject(arg0));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_29f93ce2db72cd07 = function(arg0, arg1) {
      const ret = new Function(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_c8ea72df7687880b = function(arg0, arg1, arg2) {
      const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_60b9d756f80003a6 = function(arg0) {
      const ret = new Uint8Array(arg0 >>> 0);
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_95ee887e1f50209d = function() {
      return handleError(function(arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_next_b2690a2dab163f0f = function(arg0) {
      const ret = getObject(arg0).next;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_02999533c4ea02e3 = function(arg0) {
      const ret = getObject(arg0).node;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_packageGraphSources_a4ff6a84f5812e15 = function(arg0) {
      const ret = getObject(arg0).packageGraphSources;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_5c1d670bc53614b8 = function(arg0) {
      const ret = getObject(arg0).process;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_profile_35b65d3ebe7ebbee = function(arg0, arg1) {
      const ret = getObject(arg1).profile;
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_queueMicrotask_98e746b9f850fe3d = function(arg0) {
      queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_queueMicrotask_c847cc8372bec908 = function(arg0) {
      const ret = getObject(arg0).queueMicrotask;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_ab2cfe79ebbf2740 = function() {
      return handleError(function(arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
      }, arguments);
    };
    imports.wbg.__wbg_readFile_69715ec88ba8893d = function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = getObject(arg0).readFile(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_require_79b1e9274cde3c87 = function() {
      return handleError(function() {
        const ret = module.require;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_resolvePath_589375b90e08e655 = function(arg0, arg1, arg2, arg3, arg4) {
      const ret = getObject(arg0).resolvePath(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_resolve_03bf127fbf612c20 = function(arg0) {
      const ret = Promise.resolve(getObject(arg0));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_799f153b0b6e0183 = function() {
      return handleError(function() {
        const ret = self.self;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_set_1f2956726252aaf4 = function(arg0, arg1, arg2) {
      const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
      getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_set_e1b9d9ffeee30338 = function(arg0, arg1, arg2) {
      getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_set_e97d203fd145cdae = function(arg0, arg1, arg2) {
      getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_setstacktracelimit_1055f99289ff0c7b = function(arg0) {
      Error.stackTraceLimit = arg0 >>> 0;
    };
    imports.wbg.__wbg_stack_ab46af82f81848ee = function(arg0, arg1) {
      const ret = getObject(arg1).stack;
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_subarray_a984c21c3cf98bbb = function(arg0, arg1, arg2) {
      const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_5c9c71165832b5a1 = function(arg0, arg1, arg2) {
      const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_d88c104795b9d5aa = function(arg0, arg1) {
      const ret = getObject(arg0).then(getObject(arg1));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_value_87c720f6568103d1 = function(arg0) {
      const ret = getObject(arg0).value;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c71aa1626a93e0a1 = function(arg0) {
      const ret = getObject(arg0).versions;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_window_cd65fa4478648b49 = function() {
      return handleError(function() {
        const ret = window.window;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
      const ret = +getObject(arg0);
      return ret;
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
      const ret = arg0;
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
      const ret = BigInt.asUintN(64, arg0);
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
      const v = getObject(arg1);
      const ret = typeof v === "bigint" ? v : void 0;
      getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
      const v = getObject(arg0);
      const ret = typeof v === "boolean" ? v ? 1 : 0 : 2;
      return ret;
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
      const obj = takeObject(arg0).original;
      if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
      }
      const ret = false;
      return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper954 = function(arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 377, __wbg_adapter_52);
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
      const ret = debugString(getObject(arg1));
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
      const ret = new Error(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
      const ret = getObject(arg0) in getObject(arg1);
      return ret;
    };
    imports.wbg.__wbindgen_is_array = function(arg0) {
      const ret = Array.isArray(getObject(arg0));
      return ret;
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
      const ret = typeof getObject(arg0) === "bigint";
      return ret;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
      const ret = typeof getObject(arg0) === "function";
      return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
      const val = getObject(arg0);
      const ret = typeof val === "object" && val !== null;
      return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
      const ret = typeof getObject(arg0) === "string";
      return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
      const ret = getObject(arg0) === void 0;
      return ret;
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
      const ret = getObject(arg0) === getObject(arg1);
      return ret;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
      const ret = getObject(arg0) == getObject(arg1);
      return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
      const ret = wasm.memory;
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
      const obj = getObject(arg1);
      const ret = typeof obj === "number" ? obj : void 0;
      getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
      const ret = arg0;
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
      const ret = getObject(arg0);
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
      takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
      const obj = getObject(arg1);
      const ret = typeof obj === "string" ? obj : void 0;
      var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    };
    return imports;
  }
  function __wbg_init_memory(imports, memory) {
  }
  function __wbg_finalize_init(instance, module2) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module2;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    return wasm;
  }
  function initSync(module2) {
    if (wasm !== void 0) return wasm;
    if (typeof module2 !== "undefined") {
      if (Object.getPrototypeOf(module2) === Object.prototype) {
        ({ module: module2 } = module2);
      } else {
        console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
      }
    }
    const imports = __wbg_get_imports();
    __wbg_init_memory(imports);
    if (!(module2 instanceof WebAssembly.Module)) {
      module2 = new WebAssembly.Module(module2);
    }
    const instance = new WebAssembly.Instance(module2, imports);
    return __wbg_finalize_init(instance, module2);
  }
  async function __wbg_init(module_or_path) {
    if (wasm !== void 0) return wasm;
    if (typeof module_or_path !== "undefined") {
      if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
        ({ module_or_path } = module_or_path);
      } else {
        console.warn("using deprecated parameters for the initialization function; pass a single object instead");
      }
    }
    if (typeof module_or_path === "undefined") {
      module_or_path = new URL("qsc_wasm_bg.wasm", document.URL);
    }
    const imports = __wbg_get_imports();
    if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
      module_or_path = fetch(module_or_path);
    }
    __wbg_init_memory(imports);
    const { instance, module: module2 } = await __wbg_load(await module_or_path, imports);
    return __wbg_finalize_init(instance, module2);
  }
  var qsc_wasm_default = __wbg_init;

  // ../npm/qsharp/dist/log.js
  var telemetryCollector = null;
  var levels = ["off", "error", "warn", "info", "debug", "trace"];
  var logLevel = 0;
  var log = {
    setLogLevel(level) {
      var _a;
      if (typeof level === "string") {
        const lowerLevel = level.toLowerCase();
        let newLevel = 0;
        levels.forEach((name, idx) => {
          if (name === lowerLevel)
            newLevel = idx;
        });
        logLevel = newLevel;
      } else {
        logLevel = level;
      }
      (_a = this.onLevelChanged) == null ? void 0 : _a.call(this, logLevel);
    },
    onLevelChanged: null,
    getLogLevel() {
      return logLevel;
    },
    error(...args) {
      if (logLevel >= 1)
        console.error(...args);
    },
    warn(...args) {
      if (logLevel >= 2)
        console.warn(...args);
    },
    info(...args) {
      if (logLevel >= 3)
        console.info(...args);
    },
    debug(...args) {
      if (logLevel >= 4)
        console.debug(...args);
    },
    trace(...args) {
      if (logLevel >= 5)
        console.debug(...args);
    },
    never(val) {
      log.error("Exhaustive type checking didn't account for: %o", val);
    },
    /**
     * @param level - A number indicating severity: 1 = Error, 2 = Warn, 3 = Info, 4 = Debug, 5 = Trace
     * @param target - The area or component sending the messsage, e.g. "parser" (useful for filtering)
     * @param args - The format string and args to log, e.g. ["Index of %s is %i", str, index]
     */
    logWithLevel(level, target, ...args) {
      const [firstArg, ...trailingArgs] = args;
      const outArgs = ["[".concat(target || "", "] ").concat(firstArg), ...trailingArgs];
      switch (level) {
        case 1:
          log.error(...outArgs);
          break;
        case 2:
          log.warn(...outArgs);
          break;
        case 3:
          log.info(...outArgs);
          break;
        case 4:
          log.debug(...outArgs);
          break;
        case 5:
          log.trace(...outArgs);
          break;
        default:
          log.error("Invalid logLevel: ", level);
      }
    },
    setTelemetryCollector(handler) {
      telemetryCollector = handler;
    },
    logTelemetry(event) {
      telemetryCollector == null ? void 0 : telemetryCollector(event);
    },
    isTelemetryEnabled() {
      return !!telemetryCollector;
    }
  };
  globalThis.qscLog = log;

  // ../npm/qsharp/dist/workers/common.js
  function createDispatcher(postMessage, service, methods, eventNames) {
    log.debug("Worker: Constructing WorkerEventHandler");
    function logAndPost(msg) {
      log.debug("Worker: Sending %s message from worker: %o", msg.messageType, msg);
      postMessage(msg);
    }
    const eventTarget = new EventTarget();
    eventNames.forEach((eventName) => {
      eventTarget.addEventListener(eventName, (ev) => {
        logAndPost({
          messageType: "event",
          type: ev.type,
          detail: ev.detail
        });
      });
      if (service.addEventListener) {
        service.addEventListener(eventName, (ev) => {
          logAndPost({
            messageType: "event",
            type: ev.type,
            detail: ev.detail
          });
        });
      }
    });
    return function invokeMethod(req) {
      return service[req.type].call(service, ...req.args, methods[req.type] === "requestWithProgress" ? eventTarget : void 0).then((result) => logAndPost({
        messageType: "response",
        type: req.type,
        result: { success: true, result }
      })).catch((err) => logAndPost({
        // If this happens then the wasm code likely threw an exception/panicked rather than
        // completing gracefully and fullfilling the promise. Communicate to the client
        // that there was an error and it should reject the current request
        messageType: "response",
        type: req.type,
        result: { success: false, error: err }
      }));
    };
  }
  function initService(postMessage, serviceProtocol, wasm2, qscLogLevel) {
    function postTelemetryMessage(telemetry) {
      postMessage({
        messageType: "common-event",
        type: "telemetry-event",
        detail: telemetry
      });
    }
    function postLogMessage(level, target, ...args) {
      if (log.getLogLevel() < level) {
        return;
      }
      let data = args;
      try {
        structuredClone(args);
      } catch (e) {
        data = ["unsupported log data " + String(args)];
      }
      postMessage({
        messageType: "common-event",
        type: "log",
        detail: { level, target, data }
      });
    }
    log.error = (...args) => postLogMessage(1, "worker", ...args);
    log.warn = (...args) => postLogMessage(2, "worker", ...args);
    log.info = (...args) => postLogMessage(3, "worker", ...args);
    log.debug = (...args) => postLogMessage(4, "worker", ...args);
    log.trace = (...args) => postLogMessage(5, "worker", ...args);
    if (qscLogLevel !== void 0) {
      log.setLogLevel(qscLogLevel);
    }
    log.onLevelChanged = (level) => wasm2.setLogLevel(level);
    log.setTelemetryCollector(postTelemetryMessage);
    wasm2.initLogging(postLogMessage, log.getLogLevel());
    const service = new serviceProtocol.class(wasm2);
    return createDispatcher(postMessage, service, serviceProtocol.methods, serviceProtocol.eventNames);
  }

  // ../npm/qsharp/dist/workers/browser.js
  function createWorker(serviceProtocol) {
    let invokeService = null;
    return function messageHandler2(e) {
      const data = e.data;
      if (!data.type || typeof data.type !== "string") {
        log.error("Unrecognized msg: ".concat(data));
        return;
      }
      switch (data.type) {
        case "init":
          {
            initSync({ module: data.wasmModule });
            invokeService = initService(self.postMessage.bind(self), serviceProtocol, qsc_wasm_exports, data.qscLogLevel);
          }
          break;
        default:
          if (!invokeService) {
            log.error("Received message before the service was initialized: %o", data);
          } else {
            invokeService(data);
          }
      }
    };
  }

  // ../npm/qsharp/dist/language-service/language-service.js
  var QSharpLanguageService = class {
    constructor(wasm2, host = {
      readFile: async () => null,
      listDirectory: async () => [],
      resolvePath: async () => null,
      fetchGithub: async () => "",
      findManifestDirectory: async () => null
    }) {
      this.wasm = wasm2;
      this.eventHandler = new EventTarget();
      log.info("Constructing a QSharpLanguageService instance");
      this.languageService = new wasm2.LanguageService();
      this.backgroundWork = this.languageService.start_background_work(this.onDiagnostics.bind(this), this.onTestCallables.bind(this), host);
    }
    async updateConfiguration(config) {
      this.languageService.update_configuration(config);
    }
    async updateDocument(documentUri, version, code) {
      this.languageService.update_document(documentUri, version, code);
    }
    async updateNotebookDocument(notebookUri, version, metadata, cells) {
      this.languageService.update_notebook_document(notebookUri, metadata, cells);
    }
    async closeDocument(documentUri) {
      this.languageService.close_document(documentUri);
    }
    async closeNotebookDocument(documentUri) {
      this.languageService.close_notebook_document(documentUri);
    }
    async getCodeActions(documentUri, range) {
      return this.languageService.get_code_actions(documentUri, range);
    }
    async getCompletions(documentUri, position) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return this.languageService.get_completions(documentUri, position);
    }
    async getFormatChanges(documentUri) {
      return this.languageService.get_format_changes(documentUri);
    }
    async getHover(documentUri, position) {
      return this.languageService.get_hover(documentUri, position);
    }
    async getDefinition(documentUri, position) {
      return this.languageService.get_definition(documentUri, position);
    }
    async getReferences(documentUri, position, includeDeclaration) {
      return this.languageService.get_references(documentUri, position, includeDeclaration);
    }
    async getSignatureHelp(documentUri, position) {
      return this.languageService.get_signature_help(documentUri, position);
    }
    async getRename(documentUri, position, newName) {
      return this.languageService.get_rename(documentUri, position, newName);
    }
    async prepareRename(documentUri, position) {
      return this.languageService.prepare_rename(documentUri, position);
    }
    async getCodeLenses(documentUri) {
      return this.languageService.get_code_lenses(documentUri);
    }
    async dispose() {
      this.languageService.stop_background_work();
      await this.backgroundWork;
      this.languageService.free();
    }
    addEventListener(type, listener) {
      this.eventHandler.addEventListener(type, listener);
    }
    removeEventListener(type, listener) {
      this.eventHandler.removeEventListener(type, listener);
    }
    async onDiagnostics(uri, version, diagnostics) {
      try {
        const event = new Event("diagnostics");
        event.detail = {
          uri,
          version: version != null ? version : 0,
          diagnostics
        };
        this.eventHandler.dispatchEvent(event);
      } catch (e) {
        log.error("Error in onDiagnostics", e);
      }
    }
    async onTestCallables(callables) {
      try {
        const event = new Event("testCallables");
        event.detail = {
          callables
        };
        this.eventHandler.dispatchEvent(event);
      } catch (e) {
        log.error("Error in onTestCallables", e);
      }
    }
  };
  var languageServiceProtocol = {
    class: QSharpLanguageService,
    methods: {
      updateConfiguration: "request",
      updateDocument: "request",
      updateNotebookDocument: "request",
      closeDocument: "request",
      closeNotebookDocument: "request",
      getCodeActions: "request",
      getCompletions: "request",
      getFormatChanges: "request",
      getHover: "request",
      getDefinition: "request",
      getReferences: "request",
      getSignatureHelp: "request",
      getRename: "request",
      prepareRename: "request",
      getCodeLenses: "request",
      dispose: "request",
      addEventListener: "addEventListener",
      removeEventListener: "removeEventListener"
    },
    eventNames: ["diagnostics"]
  };

  // ../npm/qsharp/dist/language-service/worker-browser.js
  var messageHandler = createWorker(languageServiceProtocol);

  // src/language-service-worker.ts
  self.onmessage = messageHandler;
})();
//# sourceMappingURL=language-service-worker.js.map
