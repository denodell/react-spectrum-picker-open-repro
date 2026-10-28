import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "node_modules", "react-aria", "dist", "private", "virtualizer");

function edit(file, find, replace, importLine) {
  const path = join(dir, file);
  let source = readFileSync(path, "utf8");
  if (source.includes(importLine)) return;
  if (!source.includes(find)) throw new Error(`Couldn't find the code to change in ${file}`);
  writeFileSync(path, importLine + "\n" + source.replace(find, replace));
}

copyFileSync(join(here, "useVirtualizer.mjs"), join(dir, "useVirtualizer.mjs"));

edit(
  "useVirtualizerItem.mjs",
  "if (layoutInfo?.estimatedSize) updateSizeEvent();",
  "if (layoutInfo && ref.current) $itemMap.set(layoutInfo, ref.current);",
  'import {itemMap as $itemMap} from "./useVirtualizer.mjs";'
);

edit(
  "Virtualizer.mjs",
  "    let onVisibleRectChange = (0, $d5eNm$useCallback)",
  "    $useVirtualizer({}, state, ref);\n    let onVisibleRectChange = (0, $d5eNm$useCallback)",
  'import {useVirtualizer as $useVirtualizer} from "./useVirtualizer.mjs";'
);

console.log("Applied the changes from adobe/react-spectrum#10886 to react-aria.");
