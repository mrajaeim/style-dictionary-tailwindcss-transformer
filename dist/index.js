"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  getTailwindFormat: () => getTailwindFormat,
  makeSdTailwindConfig: () => makeSdTailwindConfig
});
module.exports = __toCommonJS(src_exports);

// node_modules/change-case/dist/index.js
var SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
var SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
var SPLIT_SEPARATE_NUMBER_RE = /(\d)\p{Ll}|(\p{L})\d/u;
var DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
var SPLIT_REPLACE_VALUE = "$1\0$2";
var DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";
function split(value) {
  let result = value.trim();
  result = result.replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE).replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);
  result = result.replace(DEFAULT_STRIP_REGEXP, "\0");
  let start = 0;
  let end = result.length;
  while (result.charAt(start) === "\0")
    start++;
  if (start === end)
    return [];
  while (result.charAt(end - 1) === "\0")
    end--;
  return result.slice(start, end).split(/\0/g);
}
function splitSeparateNumbers(value) {
  const words = split(value);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const match = SPLIT_SEPARATE_NUMBER_RE.exec(word);
    if (match) {
      const offset = match.index + (match[1] ?? match[2]).length;
      words.splice(i, 1, word.slice(0, offset), word.slice(offset));
    }
  }
  return words;
}
function camelCase(input, options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  const lower = lowerFactory(options?.locale);
  const upper = upperFactory(options?.locale);
  const transform = options?.mergeAmbiguousCharacters ? capitalCaseTransformFactory(lower, upper) : pascalCaseTransformFactory(lower, upper);
  return prefix + words.map((word, index) => {
    if (index === 0)
      return lower(word);
    return transform(word, index);
  }).join(options?.delimiter ?? "") + suffix;
}
function lowerFactory(locale) {
  return locale === false ? (input) => input.toLowerCase() : (input) => input.toLocaleLowerCase(locale);
}
function upperFactory(locale) {
  return locale === false ? (input) => input.toUpperCase() : (input) => input.toLocaleUpperCase(locale);
}
function capitalCaseTransformFactory(lower, upper) {
  return (word) => `${upper(word[0])}${lower(word.slice(1))}`;
}
function pascalCaseTransformFactory(lower, upper) {
  return (word, index) => {
    const char0 = word[0];
    const initial = index > 0 && char0 >= "0" && char0 <= "9" ? "_" + char0 : upper(char0);
    return initial + lower(word.slice(1));
  };
}
function splitPrefixSuffix(input, options = {}) {
  const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
  const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  let prefixIndex = 0;
  let suffixIndex = input.length;
  while (prefixIndex < input.length) {
    const char = input.charAt(prefixIndex);
    if (!prefixCharacters.includes(char))
      break;
    prefixIndex++;
  }
  while (suffixIndex > prefixIndex) {
    const index = suffixIndex - 1;
    const char = input.charAt(index);
    if (!suffixCharacters.includes(char))
      break;
    suffixIndex = index;
  }
  return [
    input.slice(0, prefixIndex),
    splitFn(input.slice(prefixIndex, suffixIndex)),
    input.slice(suffixIndex)
  ];
}

// src/utils.ts
var addHyphen = (str) => {
  return str.endsWith("-") ? str : `${str}-`;
};
var makeSdObject = (obj, keys, value) => {
  const lastIndex = keys.length - 1;
  for (let i = 0; i < lastIndex; ++i) {
    const key = camelCase(keys[i]);
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  if (keys[lastIndex] === "DEFAULT") {
    obj[keys[lastIndex]] = value;
  } else {
    obj[camelCase(keys[lastIndex])] = value;
  }
};
var getConfigValue = (value, defaultValue) => {
  if (value === void 0) {
    return defaultValue;
  }
  return value;
};
var joinSpace = (value, spaceNum, type) => {
  const space = " ".repeat(spaceNum);
  if (type !== "all") {
    return value;
  }
  return space + value;
};
var unquoteFromKeys = (json, type, spaceNum = 4) => {
  const result = json.replace(/"(\\[^]|[^\\"])*"\s*:?/g, (match) => {
    if (/[0-9]/.test(match) && /[a-zA-Z]/.test(match)) {
      return match;
    }
    if (/:$/.test(match)) {
      return joinSpace(match.replace(/^"|"(?=\s*:$)/g, ""), spaceNum, type);
    }
    return match;
  });
  return result.replace(/}/g, (match) => joinSpace(match, spaceNum, type));
};
var getTemplateConfigByType = (type, content, darkMode, tailwindContent, extend, plugins) => {
  const extendTheme = extend ? `theme: {
    extend: ${unquoteFromKeys(content, type, 4)},
  },` : `theme: ${unquoteFromKeys(content, type, 2)},`;
  const getTemplateConfig = () => {
    let config = `{
  mode: "jit",
  content: [${tailwindContent}],
  darkMode: "${darkMode}",
  ${extendTheme}`;
    if (plugins.length > 0) {
      config += `
  plugins: [${plugins}]`;
    }
    config += "\n}";
    return config;
  };
  const configs = `/** @type {import('tailwindcss').Config} */
module.exports = ${getTemplateConfig()}`;
  return configs;
};

// src/index.ts
var formatTokens = (tokens, type, isVariables, prefix) => {
  const allTokenObj = tokens.reduce((acc, cur) => {
    if (cur.attributes === void 0) {
      throw new Error(`Token ${cur.name} has no attributes`);
    }
    if (cur.attributes.category === type || type === "all") {
      if (isVariables && cur.attributes.category !== "screens") {
        acc[Object.values(cur.attributes).join(".")] = prefix ? `var(--${addHyphen(prefix) + cur.name})` : `var(--${cur.name})`;
      } else {
        acc[Object.values(cur.attributes).join(".")] = cur["$value"] || cur["value"];
      }
    }
    return acc;
  }, {});
  const result = {};
  Object.keys(allTokenObj).forEach((key) => {
    const keys = key.split(".").filter((k) => k !== type);
    makeSdObject(result, keys, allTokenObj[key]);
  });
  return JSON.stringify(result, null, 2);
};
var getTailwindFormat = ({
  dictionary: { allTokens },
  type,
  isVariables,
  prefix,
  extend,
  tailwind
}) => {
  const content = formatTokens(allTokens, type, isVariables, prefix);
  if (type === "all") {
    const darkMode = getConfigValue(tailwind?.darkMode, "class");
    const tailwindContent = getConfigValue(
      Array.isArray(tailwind?.content) ? tailwind?.content.map((content2) => `"${content2}"`) : tailwind?.content,
      [`"./src/**/*.{ts,tsx}"`]
    );
    const plugins = getConfigValue(
      tailwind?.plugins?.map((plugin) => {
        return `require("@tailwindcss/${plugin}")`;
      }),
      []
    );
    const configs = getTemplateConfigByType(
      type,
      content,
      darkMode,
      tailwindContent,
      extend,
      plugins
    );
    return configs;
  } else {
    return `module.exports = ${unquoteFromKeys(content)}`;
  }
};
var makeSdTailwindConfig = ({
  type,
  formatType = "js",
  isVariables = false,
  extend = true,
  source,
  transforms,
  buildPath,
  prefix,
  tailwind,
  preprocessors
}) => {
  if (type === void 0) {
    throw new Error("type is required");
  }
  if (formatType !== "js" && formatType !== "cjs") {
    throw new Error('formatType must be "js" or "cjs"');
  }
  return {
    preprocessors,
    source: getConfigValue(source, ["tokens/**/*.json"]),
    hooks: {
      formats: {
        tailwindFormat: ({ dictionary }) => {
          return getTailwindFormat({
            dictionary,
            formatType,
            isVariables,
            extend,
            prefix,
            type,
            tailwind
          });
        }
      }
    },
    platforms: {
      [type !== "all" ? `tailwind/${type}` : "tailwind"]: {
        transforms: getConfigValue(transforms, [
          "attribute/cti",
          "name/kebab"
        ]),
        buildPath: getConfigValue(buildPath, "build/web/"),
        files: [
          {
            destination: type !== "all" ? `${type}.tailwind.js` : `tailwind.config.${formatType}`,
            format: "tailwindFormat"
          }
        ]
      }
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getTailwindFormat,
  makeSdTailwindConfig
});
//# sourceMappingURL=index.js.map