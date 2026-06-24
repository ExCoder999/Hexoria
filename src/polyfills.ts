// React Native's JS runtime does not expose ReadableStream / WritableStream.
// socket.io-client v4 (via engine.io-client) references these globals at import
// time even when using the websocket-only transport. Stub them so the import
// succeeds; they are never actually exercised on the websocket code path.
if (typeof global.ReadableStream === 'undefined') {
  (global as any).ReadableStream = class ReadableStream {
    constructor(_src?: unknown, _strategy?: unknown) {}
    cancel() { return Promise.resolve(); }
    getReader() { return { read: () => Promise.resolve({ done: true, value: undefined }), releaseLock: () => {} }; }
    pipeTo() { return Promise.resolve(); }
    pipeThrough(transform: any) { return transform.readable ?? this; }
    tee(): [any, any] { return [this, this]; }
    [Symbol.asyncIterator]() { return { next: () => Promise.resolve({ done: true, value: undefined }) }; }
  };
}

if (typeof global.WritableStream === 'undefined') {
  (global as any).WritableStream = class WritableStream {
    constructor(_sink?: unknown, _strategy?: unknown) {}
    abort() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
    getWriter() { return { write: () => Promise.resolve(), close: () => Promise.resolve(), abort: () => Promise.resolve(), releaseLock: () => {} }; }
  };
}

if (typeof global.TransformStream === 'undefined') {
  (global as any).TransformStream = class TransformStream {
    readable: any;
    writable: any;
    constructor() {
      this.readable = new (global as any).ReadableStream();
      this.writable = new (global as any).WritableStream();
    }
  };
}
