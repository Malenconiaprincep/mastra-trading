import { M as MastraError } from './chunk-MCOVMKIS.mjs';
import { M as MastraBase } from './chunk-6GF5M4GX.mjs';
import { R as RegisteredLogger, C as ConsoleLogger, L as LogLevel } from './chunk-X3GXU6TZ.mjs';

// src/ai-tracing/no-op.ts
var NoOpAISpan = class _NoOpAISpan {
  id;
  name;
  type;
  attributes;
  parent;
  traceId;
  startTime;
  endTime;
  isEvent;
  aiTracing;
  input;
  output;
  errorInfo;
  metadata;
  constructor(options, aiTracing) {
    this.id = "no-op";
    this.name = options.name;
    this.type = options.type;
    this.attributes = options.attributes || {};
    this.metadata = options.metadata;
    this.parent = options.parent;
    this.traceId = "no-op-trace";
    this.startTime = /* @__PURE__ */ new Date();
    this.aiTracing = aiTracing;
    this.input = options.input;
    this.output = options.isEvent ? options.output : void 0;
    this.isEvent = options.isEvent;
  }
  end(_options) {
  }
  error(_options) {
  }
  createChildSpan(options) {
    return new _NoOpAISpan({ ...options, parent: this, isEvent: false }, this.aiTracing);
  }
  createEventSpan(options) {
    return new _NoOpAISpan({ ...options, parent: this, isEvent: true }, this.aiTracing);
  }
  update(_options) {
  }
  get isRootSpan() {
    return !this.parent;
  }
};

// src/ai-tracing/types.ts
var AISpanType = /* @__PURE__ */ ((AISpanType2) => {
  AISpanType2["AGENT_RUN"] = "agent_run";
  AISpanType2["GENERIC"] = "generic";
  AISpanType2["LLM_GENERATION"] = "llm_generation";
  AISpanType2["LLM_CHUNK"] = "llm_chunk";
  AISpanType2["MCP_TOOL_CALL"] = "mcp_tool_call";
  AISpanType2["TOOL_CALL"] = "tool_call";
  AISpanType2["WORKFLOW_RUN"] = "workflow_run";
  AISpanType2["WORKFLOW_STEP"] = "workflow_step";
  AISpanType2["WORKFLOW_CONDITIONAL"] = "workflow_conditional";
  AISpanType2["WORKFLOW_CONDITIONAL_EVAL"] = "workflow_conditional_eval";
  AISpanType2["WORKFLOW_PARALLEL"] = "workflow_parallel";
  AISpanType2["WORKFLOW_LOOP"] = "workflow_loop";
  AISpanType2["WORKFLOW_SLEEP"] = "workflow_sleep";
  AISpanType2["WORKFLOW_WAIT_EVENT"] = "workflow_wait_event";
  return AISpanType2;
})(AISpanType || {});

// src/ai-tracing/base.ts
var MastraAITracing = class extends MastraBase {
  config;
  constructor(config) {
    super({ component: RegisteredLogger.AI_TRACING, name: config.serviceName });
    this.config = {
      serviceName: config.serviceName,
      instanceName: config.instanceName,
      sampling: config.sampling ?? { type: "always" /* ALWAYS */ },
      exporters: config.exporters ?? [],
      processors: config.processors ?? []
    };
  }
  /**
   * Override setLogger to add AI tracing specific initialization log
   */
  __setLogger(logger) {
    super.__setLogger(logger);
    this.logger.debug(
      `[AI Tracing] Initialized [service=${this.config.serviceName}] [instance=${this.config.instanceName}] [sampling=${this.config.sampling.type}]`
    );
  }
  // ============================================================================
  // Protected getters for clean config access
  // ============================================================================
  get exporters() {
    return this.config.exporters || [];
  }
  get processors() {
    return this.config.processors || [];
  }
  // ============================================================================
  // Public API - Single type-safe span creation method
  // ============================================================================
  /**
   * Start a new span of a specific AISpanType
   */
  startSpan(options) {
    const { type, name, input, output, attributes, metadata, parent, startOptions, isEvent } = options;
    const { runtimeContext } = startOptions || {};
    if (!this.shouldSample({ runtimeContext })) {
      return new NoOpAISpan(
        { type, name, input, output, attributes, metadata, parent, isEvent: isEvent === true },
        this
      );
    }
    const spanOptions = {
      type,
      name,
      input,
      output,
      attributes,
      metadata,
      parent,
      isEvent: isEvent === true
    };
    const span = this.createSpan(spanOptions);
    if (span.isEvent) {
      this.emitSpanEnded(span);
    } else {
      this.wireSpanLifecycle(span);
      this.emitSpanStarted(span);
    }
    return span;
  }
  // ============================================================================
  // Configuration Management
  // ============================================================================
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  // ============================================================================
  // Plugin Access
  // ============================================================================
  /**
   * Get all exporters
   */
  getExporters() {
    return [...this.exporters];
  }
  /**
   * Get all processors
   */
  getProcessors() {
    return [...this.processors];
  }
  /**
   * Get the logger instance (for exporters and other components)
   */
  getLogger() {
    return this.logger;
  }
  // ============================================================================
  // Span Lifecycle Management
  // ============================================================================
  /**
   * Automatically wires up AI tracing lifecycle events for any span
   * This ensures all spans emit events regardless of implementation
   */
  wireSpanLifecycle(span) {
    const originalEnd = span.end.bind(span);
    const originalUpdate = span.update.bind(span);
    span.end = (options) => {
      originalEnd(options);
      this.emitSpanEnded(span);
    };
    span.update = (options) => {
      originalUpdate(options);
      this.emitSpanUpdated(span);
    };
  }
  // ============================================================================
  // Utility Methods
  // ============================================================================
  /**
   * Check if an AI trace should be sampled
   */
  shouldSample(traceContext) {
    const { sampling } = this.config;
    switch (sampling.type) {
      case "always" /* ALWAYS */:
        return true;
      case "never" /* NEVER */:
        return false;
      case "ratio" /* RATIO */:
        if (sampling.probability === void 0 || sampling.probability < 0 || sampling.probability > 1) {
          this.logger.warn(
            `Invalid sampling probability: ${sampling.probability}. Expected value between 0 and 1. Defaulting to no sampling.`
          );
          return false;
        }
        return Math.random() < sampling.probability;
      case "custom" /* CUSTOM */:
        return sampling.sampler(traceContext);
      default:
        throw new Error(`Sampling strategy type not implemented: ${sampling.type}`);
    }
  }
  /**
   * Process a span through all processors
   */
  processSpan(span) {
    let processedSpan = span;
    for (const processor of this.processors) {
      if (!processedSpan) {
        break;
      }
      try {
        processedSpan = processor.process(processedSpan);
      } catch (error) {
        this.logger.error(`[AI Tracing] Processor error [name=${processor.name}]`, error);
      }
    }
    return processedSpan;
  }
  // ============================================================================
  // Event-driven Export Methods
  // ============================================================================
  /**
   * Emit a span started event
   */
  emitSpanStarted(span) {
    const processedSpan = this.processSpan(span);
    if (processedSpan) {
      this.exportEvent({ type: "span_started" /* SPAN_STARTED */, span: processedSpan }).catch((error) => {
        this.logger.error("[AI Tracing] Failed to export span_started event", error);
      });
    }
  }
  /**
   * Emit a span ended event (called automatically when spans end)
   */
  emitSpanEnded(span) {
    const processedSpan = this.processSpan(span);
    if (processedSpan) {
      this.exportEvent({ type: "span_ended" /* SPAN_ENDED */, span: processedSpan }).catch((error) => {
        this.logger.error("[AI Tracing] Failed to export span_ended event", error);
      });
    }
  }
  /**
   * Emit a span updated event
   */
  emitSpanUpdated(span) {
    const processedSpan = this.processSpan(span);
    if (processedSpan) {
      this.exportEvent({ type: "span_updated" /* SPAN_UPDATED */, span: processedSpan }).catch((error) => {
        this.logger.error("[AI Tracing] Failed to export span_updated event", error);
      });
    }
  }
  /**
   * Export tracing event through all exporters (realtime mode)
   */
  async exportEvent(event) {
    const exportPromises = this.exporters.map(async (exporter) => {
      try {
        if (exporter.exportEvent) {
          await exporter.exportEvent(event);
          this.logger.debug(`[AI Tracing] Event exported [exporter=${exporter.name}] [type=${event.type}]`);
        }
      } catch (error) {
        this.logger.error(`[AI Tracing] Export error [exporter=${exporter.name}]`, error);
      }
    });
    await Promise.allSettled(exportPromises);
  }
  // ============================================================================
  // Lifecycle Management
  // ============================================================================
  /**
   * Initialize AI tracing (called by Mastra during component registration)
   */
  init() {
    this.logger.debug(`[AI Tracing] Initialization started [name=${this.name}]`);
    this.logger.info(`[AI Tracing] Initialized successfully [name=${this.name}]`);
  }
  /**
   * Shutdown AI tracing and clean up resources
   */
  async shutdown() {
    this.logger.debug(`[AI Tracing] Shutdown started [name=${this.name}]`);
    const shutdownPromises = [...this.exporters.map((e) => e.shutdown()), ...this.processors.map((p) => p.shutdown())];
    await Promise.allSettled(shutdownPromises);
    this.logger.info(`[AI Tracing] Shutdown completed [name=${this.name}]`);
  }
};

// src/ai-tracing/exporters/console.ts
var ConsoleExporter = class {
  name = "tracing-console-exporter";
  logger;
  constructor(logger) {
    if (logger) {
      this.logger = logger;
    } else {
      this.logger = new ConsoleLogger({ level: LogLevel.INFO });
    }
  }
  async exportEvent(event) {
    const span = event.span;
    const formatAttributes = (attributes) => {
      try {
        return JSON.stringify(attributes, null, 2);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown formatting error";
        return `[Unable to serialize attributes: ${errMsg}]`;
      }
    };
    const formatDuration = (startTime, endTime) => {
      if (!endTime) return "N/A";
      const duration = endTime.getTime() - startTime.getTime();
      return `${duration}ms`;
    };
    switch (event.type) {
      case "span_started" /* SPAN_STARTED */:
        this.logger.info(`\u{1F680} SPAN_STARTED`);
        this.logger.info(`   Type: ${span.type}`);
        this.logger.info(`   Name: ${span.name}`);
        this.logger.info(`   ID: ${span.id}`);
        this.logger.info(`   Trace ID: ${span.traceId}`);
        if (span.input !== void 0) {
          this.logger.info(`   Input: ${formatAttributes(span.input)}`);
        }
        this.logger.info(`   Attributes: ${formatAttributes(span.attributes)}`);
        this.logger.info("\u2500".repeat(80));
        break;
      case "span_ended" /* SPAN_ENDED */:
        const duration = formatDuration(span.startTime, span.endTime);
        this.logger.info(`\u2705 SPAN_ENDED`);
        this.logger.info(`   Type: ${span.type}`);
        this.logger.info(`   Name: ${span.name}`);
        this.logger.info(`   ID: ${span.id}`);
        this.logger.info(`   Duration: ${duration}`);
        this.logger.info(`   Trace ID: ${span.traceId}`);
        if (span.input !== void 0) {
          this.logger.info(`   Input: ${formatAttributes(span.input)}`);
        }
        if (span.output !== void 0) {
          this.logger.info(`   Output: ${formatAttributes(span.output)}`);
        }
        if (span.errorInfo) {
          this.logger.info(`   Error: ${formatAttributes(span.errorInfo)}`);
        }
        this.logger.info(`   Attributes: ${formatAttributes(span.attributes)}`);
        this.logger.info("\u2500".repeat(80));
        break;
      case "span_updated" /* SPAN_UPDATED */:
        this.logger.info(`\u{1F4DD} SPAN_UPDATED`);
        this.logger.info(`   Type: ${span.type}`);
        this.logger.info(`   Name: ${span.name}`);
        this.logger.info(`   ID: ${span.id}`);
        this.logger.info(`   Trace ID: ${span.traceId}`);
        if (span.input !== void 0) {
          this.logger.info(`   Input: ${formatAttributes(span.input)}`);
        }
        if (span.output !== void 0) {
          this.logger.info(`   Output: ${formatAttributes(span.output)}`);
        }
        if (span.errorInfo) {
          this.logger.info(`   Error: ${formatAttributes(span.errorInfo)}`);
        }
        this.logger.info(`   Updated Attributes: ${formatAttributes(span.attributes)}`);
        this.logger.info("\u2500".repeat(80));
        break;
      default:
        this.logger.warn(`Tracing event type not implemented: ${event.type}`);
    }
  }
  async shutdown() {
    this.logger.info("ConsoleExporter shutdown");
  }
};

// src/ai-tracing/registry.ts
var AITracingRegistry = class {
  instances = /* @__PURE__ */ new Map();
  defaultInstance;
  selector;
  /**
   * Register a tracing instance
   */
  register(name, instance, isDefault = false) {
    if (this.instances.has(name)) {
      throw new Error(`AI Tracing instance '${name}' already registered`);
    }
    this.instances.set(name, instance);
    if (isDefault || !this.defaultInstance) {
      this.defaultInstance = instance;
    }
  }
  /**
   * Get a tracing instance by name
   */
  get(name) {
    return this.instances.get(name);
  }
  /**
   * Get the default tracing instance
   */
  getDefault() {
    return this.defaultInstance;
  }
  /**
   * Set the tracing selector function
   */
  setSelector(selector) {
    this.selector = selector;
  }
  /**
   * Get the selected tracing instance based on context
   */
  getSelected(context) {
    if (this.selector) {
      const selected = this.selector(context, this.instances);
      if (selected && this.instances.has(selected)) {
        return this.instances.get(selected);
      }
    }
    return this.defaultInstance;
  }
  /**
   * Unregister a tracing instance
   */
  unregister(name) {
    return this.instances.delete(name);
  }
  /**
   * Shutdown all instances and clear the registry
   */
  async shutdown() {
    const shutdownPromises = Array.from(this.instances.values()).map((instance) => instance.shutdown());
    await Promise.allSettled(shutdownPromises);
    this.instances.clear();
  }
  /**
   * Clear all instances without shutdown
   */
  clear() {
    this.instances.clear();
    this.defaultInstance = void 0;
    this.selector = void 0;
  }
  /**
   * Get all registered instances
   */
  getAll() {
    return new Map(this.instances);
  }
};
var aiTracingRegistry = new AITracingRegistry();
function registerAITracing(name, instance, isDefault = false) {
  aiTracingRegistry.register(name, instance, isDefault);
}
function setAITracingSelector(selector) {
  aiTracingRegistry.setSelector(selector);
}
function getSelectedAITracing(context) {
  return aiTracingRegistry.getSelected(context);
}
async function shutdownAITracingRegistry() {
  await aiTracingRegistry.shutdown();
}
function getAllAITracing() {
  return aiTracingRegistry.getAll();
}
function isAITracingInstance(obj) {
  return obj instanceof MastraAITracing;
}
function setupAITracing(config) {
  const entries = Object.entries(config.instances);
  entries.forEach(([name, tracingDef], index) => {
    const instance = isAITracingInstance(tracingDef) ? tracingDef : new DefaultAITracing({ ...tracingDef, instanceName: name });
    const isDefault = index === 0;
    registerAITracing(name, instance, isDefault);
  });
  if (config.selector) {
    setAITracingSelector(config.selector);
  }
}

// src/ai-tracing/utils.ts
function shallowCleanObject(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    try {
      JSON.stringify(value);
      cleaned[key] = value;
    } catch (error) {
      cleaned[key] = `[${error instanceof Error ? error.message : String(error)}]`;
    }
  }
  return cleaned;
}
function shallowCleanArray(arr) {
  return arr.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return shallowCleanObject(item);
    }
    try {
      JSON.stringify(item);
      return item;
    } catch (error) {
      return `[${error instanceof Error ? error.message : String(error)}]`;
    }
  });
}
function shallowClean(value) {
  if (value === null || value === void 0) {
    return value;
  }
  if (Array.isArray(value)) {
    return shallowCleanArray(value);
  }
  if (typeof value === "object") {
    return shallowCleanObject(value);
  }
  try {
    JSON.stringify(value);
    return value;
  } catch (error) {
    return `[${error instanceof Error ? error.message : String(error)}]`;
  }
}
function selectFields(obj, fields) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  const result = {};
  for (const field of fields) {
    const value = getNestedValue(obj, field);
    if (value !== void 0) {
      setNestedValue(result, field, value);
    }
  }
  return result;
}
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    return current && typeof current === "object" ? current[key] : void 0;
  }, obj);
}
function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  if (!lastKey) {
    return;
  }
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}
function getOrCreateSpan(options) {
  const { type, attributes, tracingContext, runtimeContext, ...rest } = options;
  if (tracingContext?.currentSpan) {
    return tracingContext.currentSpan.createChildSpan({
      type,
      attributes,
      ...rest
    });
  }
  const aiTracing = getSelectedAITracing({
    runtimeContext
  });
  return aiTracing?.startSpan({
    type,
    attributes,
    startOptions: {
      runtimeContext
    },
    ...rest
  });
}

// src/ai-tracing/default.ts
function generateSpanId() {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 8; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function generateTraceId() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
var DefaultAISpan = class {
  id;
  name;
  type;
  attributes;
  parent;
  traceId;
  startTime;
  endTime;
  isEvent;
  aiTracing;
  input;
  output;
  errorInfo;
  metadata;
  logger;
  constructor(options, aiTracing) {
    this.id = generateSpanId();
    this.name = options.name;
    this.type = options.type;
    this.attributes = shallowClean(options.attributes) || {};
    this.metadata = shallowClean(options.metadata);
    this.parent = options.parent;
    this.startTime = /* @__PURE__ */ new Date();
    this.aiTracing = aiTracing;
    this.input = shallowClean(options.input);
    this.isEvent = options.isEvent;
    this.logger = new ConsoleLogger({
      name: "default-ai-span",
      level: LogLevel.INFO
      // Set to INFO so that info() calls actually log
    });
    if (!options.parent) {
      this.traceId = generateTraceId();
    } else {
      this.traceId = options.parent.traceId;
    }
    if (this.isEvent) {
      this.output = shallowClean(options.output);
    }
  }
  end(options) {
    if (this.isEvent) {
      this.logger.warn(`End event is not available on event spans`);
      return;
    }
    this.endTime = /* @__PURE__ */ new Date();
    if (options?.output !== void 0) {
      this.output = shallowClean(options.output);
    }
    if (options?.attributes) {
      this.attributes = { ...this.attributes, ...shallowClean(options.attributes) };
    }
    if (options?.metadata) {
      this.metadata = { ...this.metadata, ...shallowClean(options.metadata) };
    }
  }
  error(options) {
    if (this.isEvent) {
      this.logger.warn(`Error event is not available on event spans`);
      return;
    }
    const { error, endSpan = true, attributes, metadata } = options;
    this.errorInfo = error instanceof MastraError ? {
      id: error.id,
      details: error.details,
      category: error.category,
      domain: error.domain,
      message: error.message
    } : {
      message: error.message
    };
    if (attributes) {
      this.attributes = { ...this.attributes, ...shallowClean(attributes) };
    }
    if (metadata) {
      this.metadata = { ...this.metadata, ...shallowClean(metadata) };
    }
    if (endSpan) {
      this.end();
    } else {
      this.update({});
    }
  }
  createChildSpan(options) {
    return this.aiTracing.startSpan({
      ...options,
      parent: this,
      isEvent: false
    });
  }
  createEventSpan(options) {
    return this.aiTracing.startSpan({
      ...options,
      parent: this,
      isEvent: true
    });
  }
  update(options) {
    if (this.isEvent) {
      this.logger.warn(`Update() is not available on event spans`);
      return;
    }
    if (options?.input !== void 0) {
      this.input = shallowClean(options.input);
    }
    if (options?.output !== void 0) {
      this.output = shallowClean(options.output);
    }
    if (options?.attributes) {
      this.attributes = { ...this.attributes, ...shallowClean(options.attributes) };
    }
    if (options?.metadata) {
      this.metadata = { ...this.metadata, ...shallowClean(options.metadata) };
    }
  }
  get isRootSpan() {
    return !this.parent;
  }
  async export() {
    return JSON.stringify({
      id: this.id,
      attributes: this.attributes,
      metadata: this.metadata,
      startTime: this.startTime,
      endTime: this.endTime,
      traceId: this.traceId
      // OpenTelemetry trace ID
    });
  }
};
var SensitiveDataFilter = class {
  name = "sensitive-data-filter";
  sensitiveFields;
  constructor(sensitiveFields) {
    this.sensitiveFields = (sensitiveFields || [
      "password",
      "token",
      "secret",
      "key",
      "apiKey",
      "auth",
      "authorization",
      "bearer",
      "jwt",
      "credential",
      "sessionId"
    ]).map((field) => field.toLowerCase());
  }
  process(span) {
    const deepFilter = (obj, seen = /* @__PURE__ */ new WeakSet()) => {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (seen.has(obj)) {
        return "[Circular Reference]";
      }
      seen.add(obj);
      if (Array.isArray(obj)) {
        return obj.map((item) => deepFilter(item, seen));
      }
      const filtered = {};
      Object.keys(obj).forEach((key) => {
        if (this.sensitiveFields.includes(key.toLowerCase())) {
          if (obj[key] && typeof obj[key] === "object") {
            filtered[key] = deepFilter(obj[key], seen);
          } else {
            filtered[key] = "[REDACTED]";
          }
        } else {
          filtered[key] = deepFilter(obj[key], seen);
        }
      });
      return filtered;
    };
    try {
      const filteredSpan = { ...span };
      filteredSpan.attributes = deepFilter(span.attributes);
      filteredSpan.metadata = deepFilter(span.metadata);
      filteredSpan.input = deepFilter(span.input);
      filteredSpan.output = deepFilter(span.output);
      filteredSpan.errorInfo = deepFilter(span.errorInfo);
      return filteredSpan;
    } catch (error) {
      const safeSpan = { ...span };
      safeSpan.attributes = {
        "[FILTERING_ERROR]": "Attributes were completely redacted due to filtering error",
        "[ERROR_MESSAGE]": error instanceof Error ? error.message : "Unknown filtering error"
      };
      return safeSpan;
    }
  }
  async shutdown() {
  }
};
var aiTracingDefaultConfig = {
  serviceName: "mastra-ai-service",
  instanceName: "default",
  sampling: { type: "always" /* ALWAYS */ },
  exporters: [new ConsoleExporter()],
  processors: [new SensitiveDataFilter()]
};
var DefaultAITracing = class extends MastraAITracing {
  constructor(config = aiTracingDefaultConfig) {
    super(config);
  }
  // ============================================================================
  // Abstract Method Implementations
  // ============================================================================
  createSpan(options) {
    return new DefaultAISpan(options, this);
  }
};

// src/ai-tracing/context.ts
var AGENT_GETTERS = ["getAgent", "getAgentById"];
var AGENT_METHODS_TO_WRAP = ["generate", "stream", "generateVNext", "streamVNext"];
var WORKFLOW_GETTERS = ["getWorkflow", "getWorkflowById"];
var WORKFLOW_METHODS_TO_WRAP = ["execute"];
function isNoOpSpan(span) {
  return span.constructor.name === "NoOpAISpan" || span.__isNoOp === true || !span.aiTracing;
}
function wrapMastra(mastra, tracingContext) {
  if (!tracingContext.currentSpan || isNoOpSpan(tracingContext.currentSpan)) {
    return mastra;
  }
  try {
    return new Proxy(mastra, {
      get(target, prop) {
        try {
          if (AGENT_GETTERS.includes(prop)) {
            return (...args) => {
              const agent = target[prop](...args);
              return wrapAgent(agent, tracingContext);
            };
          }
          if (WORKFLOW_GETTERS.includes(prop)) {
            return (...args) => {
              const workflow = target[prop](...args);
              return wrapWorkflow(workflow, tracingContext);
            };
          }
          const value = target[prop];
          return typeof value === "function" ? value.bind(target) : value;
        } catch (error) {
          console.warn("AI Tracing: Failed to wrap method, falling back to original", error);
          const value = target[prop];
          return typeof value === "function" ? value.bind(target) : value;
        }
      }
    });
  } catch (error) {
    console.warn("AI Tracing: Failed to create proxy, using original Mastra instance", error);
    return mastra;
  }
}
function wrapAgent(agent, tracingContext) {
  if (!tracingContext.currentSpan || isNoOpSpan(tracingContext.currentSpan)) {
    return agent;
  }
  try {
    return new Proxy(agent, {
      get(target, prop) {
        try {
          if (AGENT_METHODS_TO_WRAP.includes(prop)) {
            return (input, options = {}) => {
              return target[prop](input, {
                ...options,
                tracingContext
              });
            };
          }
          const value = target[prop];
          return typeof value === "function" ? value.bind(target) : value;
        } catch (error) {
          console.warn("AI Tracing: Failed to wrap agent method, falling back to original", error);
          const value = target[prop];
          return typeof value === "function" ? value.bind(target) : value;
        }
      }
    });
  } catch (error) {
    console.warn("AI Tracing: Failed to create agent proxy, using original instance", error);
    return agent;
  }
}
function wrapWorkflow(workflow, tracingContext) {
  if (!tracingContext.currentSpan || isNoOpSpan(tracingContext.currentSpan)) {
    return workflow;
  }
  try {
    return new Proxy(workflow, {
      get(target, prop) {
        try {
          if (WORKFLOW_METHODS_TO_WRAP.includes(prop)) {
            return (input, options = {}) => {
              return target[prop](input, {
                ...options,
                tracingContext
              });
            };
          }
          const value = target[prop];
          return typeof value === "function" ? value.bind(target) : value;
        } catch (error) {
          console.warn("AI Tracing: Failed to wrap workflow method, falling back to original", error);
          const value = target[prop];
          return typeof value === "function" ? value.bind(target) : value;
        }
      }
    });
  } catch (error) {
    console.warn("AI Tracing: Failed to create workflow proxy, using original instance", error);
    return workflow;
  }
}

export { AISpanType as A, shutdownAITracingRegistry as a, getOrCreateSpan as b, selectFields as c, getAllAITracing as g, setupAITracing as s, wrapMastra as w };
