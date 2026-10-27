import { createElement as h, useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, defaultTheme, Picker, Item } from "@adobe/react-spectrum";

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
let start = 0;
let frames = [];
let observer;

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("[data-picker] button")) return;
  start = performance.now();
  frames = [];
  observer = new PerformanceObserver((list) => frames.push(...list.getEntries().map((f) => f.duration)));
  observer.observe({ type: "long-animation-frame" });
}, true);

function App() {
  const [count, setCount] = useState(250);
  const [results, setResults] = useState([]);
  const items = Array.from({ length: count }, (_, i) => ({ id: `item-${i}`, name: `Item ${i}` }));

  async function onOpenChange(isOpen) {
    if (!isOpen) return;
    await nextFrame();
    await nextFrame();
    const ms = performance.now() - start;
    await new Promise((resolve) => setTimeout(resolve, 100));
    observer?.disconnect();
    const longest = Math.max(0, ...frames);
    setResults((r) => [...r, { count, ms, longest }]);
    window.__opened = (window.__opened ?? 0) + 1;
  }

  return h(Provider, { theme: defaultTheme, colorScheme: "light" },
    h("p", null,
      [125, 250].map((n) => h("button", { key: n, "data-count": n, onClick: () => setCount(n), style: { marginRight: 8 } }, `Use ${n} items`))),
    h("div", { "data-picker": true },
      h(Picker, { key: count, label: `Country (${count} items)`, items, onOpenChange }, (item) => h(Item, { key: item.id }, item.name))),
    h("table", null,
      h("thead", null, h("tr", null, h("th", null, "Items"), h("th", null, "Time to open"), h("th", null, "Longest frame"))),
      h("tbody", null, results.map((r, i) => h("tr", { key: i },
        h("td", null, r.count),
        h("td", null, `${Math.round(r.ms)}ms`),
        h("td", null, r.longest > 0 ? `${Math.round(r.longest)}ms` : "under 50ms"))))));
}

createRoot(document.getElementById("root")).render(h(App));
