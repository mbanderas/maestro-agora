const TYPE_CHECKS = {
  array: Array.isArray,
  integer: Number.isInteger,
  number: (value) => typeof value === "number" && Number.isFinite(value),
  object: (value) => value !== null && typeof value === "object" && !Array.isArray(value),
  string: (value) => typeof value === "string",
};

const SUPPORTED_KEYS = new Set([
  "$defs",
  "$id",
  "$ref",
  "$schema",
  "additionalProperties",
  "const",
  "description",
  "enum",
  "items",
  "maximum",
  "maxItems",
  "minItems",
  "minimum",
  "minLength",
  "minProperties",
  "pattern",
  "properties",
  "required",
  "title",
  "type",
  "uniqueItems",
]);

const valueAtPointer = (root, pointer) => {
  if (!pointer.startsWith("#/")) throw new Error(`unsupported non-local schema reference ${pointer}`);
  return pointer.slice(2).split("/").reduce((value, part) => {
    const key = part.replace(/~1/g, "/").replace(/~0/g, "~");
    return value?.[key];
  }, root);
};

const canonicalJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

const sameJson = (left, right) => canonicalJson(left) === canonicalJson(right);

const validateNode = ({ root, schema, value, path, errors, schemaPath }) => {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    throw new Error(`${schemaPath} must be a schema object`);
  }
  for (const key of Object.keys(schema)) {
    if (!SUPPORTED_KEYS.has(key)) throw new Error(`${schemaPath} uses unsupported keyword ${key}`);
  }
  if (schema.$ref) {
    const target = valueAtPointer(root, schema.$ref);
    if (!target) throw new Error(`${schemaPath} references missing schema ${schema.$ref}`);
    validateNode({ root, schema: target, value, path, errors, schemaPath: schema.$ref });
    return;
  }
  if (schema.type) {
    const check = TYPE_CHECKS[schema.type];
    if (!check) throw new Error(`${schemaPath} uses unsupported type ${schema.type}`);
    if (!check(value)) {
      errors.push(`${path} must be ${schema.type}`);
      return;
    }
  }
  if ("const" in schema && !sameJson(value, schema.const)) errors.push(`${path} must equal its schema constant`);
  if (schema.enum && !schema.enum.some((item) => sameJson(value, item))) {
    errors.push(`${path} must equal one of its schema enum values`);
  }
  if (typeof value === "string") {
    if (Number.isInteger(schema.minLength) && value.length < schema.minLength) {
      errors.push(`${path} must contain at least ${schema.minLength} characters`);
    }
    if (schema.pattern !== undefined) {
      let pattern;
      try {
        pattern = new RegExp(schema.pattern, "u");
      } catch (error) {
        throw new Error(`${schemaPath}.pattern is invalid: ${error.message}`);
      }
      if (!pattern.test(value)) errors.push(`${path} does not match its schema pattern`);
    }
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (typeof schema.minimum === "number" && value < schema.minimum) errors.push(`${path} is below its schema minimum`);
    if (typeof schema.maximum === "number" && value > schema.maximum) errors.push(`${path} exceeds its schema maximum`);
  }
  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) errors.push(`${path} has too few items`);
    if (Number.isInteger(schema.maxItems) && value.length > schema.maxItems) errors.push(`${path} has too many items`);
    if (schema.uniqueItems && new Set(value.map(canonicalJson)).size !== value.length) {
      errors.push(`${path} must contain unique items`);
    }
    if (schema.items) {
      value.forEach((item, index) => validateNode({
        root,
        schema: schema.items,
        value: item,
        path: `${path}[${index}]`,
        errors,
        schemaPath: `${schemaPath}.items`,
      }));
    }
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const properties = schema.properties ?? {};
    const required = schema.required ?? [];
    for (const key of required) {
      if (!(key in value)) errors.push(`${path}.${key} is required`);
    }
    if (Number.isInteger(schema.minProperties) && Object.keys(value).length < schema.minProperties) {
      errors.push(`${path} has too few properties`);
    }
    for (const [key, item] of Object.entries(value)) {
      if (key in properties) {
        validateNode({
          root,
          schema: properties[key],
          value: item,
          path: `${path}.${key}`,
          errors,
          schemaPath: `${schemaPath}.properties.${key}`,
        });
      } else if (schema.additionalProperties === false) {
        errors.push(`${path}.${key} is not allowed by the schema`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        validateNode({
          root,
          schema: schema.additionalProperties,
          value: item,
          path: `${path}.${key}`,
          errors,
          schemaPath: `${schemaPath}.additionalProperties`,
        });
      }
    }
  }
};

export function validateJsonSchema({ schema, value, label = "value" }) {
  const errors = [];
  validateNode({ root: schema, schema, value, path: label, errors, schemaPath: "schema" });
  return errors;
}
