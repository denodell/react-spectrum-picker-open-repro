import {isElementVisible} from "../utils/isElementVisible.mjs";
import {useLayoutEffect} from "../utils/useLayoutEffect.mjs";
import {Size} from "react-stately/useVirtualizerState";

export const itemMap = new WeakMap();

export function useVirtualizer(props, state, ref) {
  useLayoutEffect(() => {
    let views = [...state.visibleViews];
    let layoutInfos = [];
    let nodes = [];
    let heights = [];
    for (let view of views) {
      views.push(...view.children);
      let layoutInfo = view.layoutInfo;
      let node = itemMap.get(layoutInfo);
      if (node && layoutInfo.estimatedSize) {
        layoutInfos.push(layoutInfo);
        nodes.push(node);
        heights.push(node.style.height);
        node.style.height = '';
      }
    }
    let sizes = nodes.map(node => isElementVisible(node) ? new Size(node.scrollWidth, node.scrollHeight) : null);
    nodes.forEach((node, i) => {
      node.style.height = heights[i];
      let size = sizes[i];
      if (size) state.virtualizer.updateItemSize(layoutInfos[i].key, size);
    });
  });
}
