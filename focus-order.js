const { createRule } = require("@acot/core");

module.exports = createRule({
  immutable: true,
  meta: {
    help:
      "https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-focus-order.html",
  },

  test: async (context) => {
    const stack = [];
    while (true) {
      await context.page.keyboard.press("Tab");
      const focusedElement = await getActiveElement(context.page);
      if (!focusedElement) {
        break;
      }

      const focusData = await getFocusData(focusedElement);
      if (stack.find((data) => data.id === focusData.id)) {
        // Regarded it as went one around.
        break;
      }

      const prevFoucsData = stack[stack.length - 1];
      stack.push(focusData);
      if (!prevFoucsData) {
        continue;
      }

      if (prevFoucsData.y > focusData.y) {
        await context.report({
          node: focusedElement,
          message: "The tab focus moved to above.",
        });
        break;
      }

      if (prevFoucsData.y === focusData.y && prevFoucsData.x > focusData.x) {
        await context.report({
          node: focusedElement,
          message: "The tab focus moved to left.",
        });
        break;
      }
    }

    // console.log(stack);
  },
});

/**
 *
 * @param {import("puppeteer-core").ElementHandle<Element>} node
 */
async function getFocusData(node) {
  return await node.evaluate(async (el) => {
    const { x, y, width, height } = el.getBoundingClientRect();
    const index = Array.from(el.parentElement.children).findIndex(
      (child) => child === el
    );
    const id = `${el.nodeName}${el.textContent.trim().replace(/\s/gi, "")}${
      el.className
    }${x}${y}${width}${height}${index}`;
    return {
      id,
      x,
      y,
      width,
      height,
    };
  });
}

/**
 *
 * @param {import("puppeteer-core").Page} page
 */
async function getActiveElement(page) {
  /**
   * @type {import("puppeteer-core").ElementHandle<Element>}
   */
  const node = await page.evaluateHandle(() => {
    return document.activeElement;
  });
  return node;
}
