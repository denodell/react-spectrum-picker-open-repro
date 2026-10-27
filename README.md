# React Spectrum Picker repro

When a React Spectrum `Picker` opens, the browser works out the page's styles and layout over and over, several times for each visible option, before the list can be drawn. The list is virtualized, so the number of items doesn't change this. It takes about the same amount of time to open with 125 items as with 250.

## Run it

```sh
npm install
npm start
```

Then open the page it serves, pick 125 or 250 items, and click the Picker to open it. The table shows how long it took from the click until the list had been drawn, and the longest frame while it opened.

## What to look for

Record the Picker opening in the Performance panel of Chrome's developer tools, with the CPU slowed down 4x:

- The main thread shows a long run of short **Recalculate style** and **Layout** events. In my recording, rendering 17 visible options took 133 layouts and about 150 style recalculations.
- In the Bottom-Up tab, `checkVisibility` is near the top, called from `isElementVisible` in `useVirtualizerItem`.

## Where it comes from

`useVirtualizerItem` measures each visible option in its own layout effect. For each one, `isElementVisible()` calls `checkVisibility()`, then `getSize()` clears `node.style.height`, reads `scrollWidth` and `scrollHeight`, and puts the height back. Because each option changes a style and then reads a size, the browser has to work out the styles and layout again, several times for every option.

Measuring the visible options in one pass would avoid this: clear the heights of all of them first, then read all their sizes, then put the heights back, so the browser only works out the layout once.

Versions: `@adobe/react-spectrum` 3.47.6, `react-aria` 3.53.0, React 19.3.0.
