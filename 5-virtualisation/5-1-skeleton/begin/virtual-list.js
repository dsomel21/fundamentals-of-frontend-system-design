import { intersectionObserver } from "../../../utils/observer.js";

/**
 * Standard Margin between cards
 * @type {number}
 */
const MARGIN = 16;

/**
 * Returns top and bottom observer elements
 * @returns {[HTMLElement,HTMLElement]}
 */
const getObservers = () => [
  document.getElementById("top-observer"),
  document.getElementById("bottom-observer"),
];

/**
 * Returns a virtual list container
 * @returns {HTMLElement}
 */
function getVirtualList() {
  return document.getElementById("virtual-list");
}

/**
 * Returns a main app container
 * @returns {HTMLElement}
 */
function getContainer() {
  return document.getElementById("container");
}

/**
 * Returns `data-y` attribute of the HTMLElement, if value is provided
 * additionally updates the attribute
 *
 * @param element {HTMLElement}
 * @param value {string | number}
 * @returns {?number}
 */
function y(element, value = undefined) {
  if (value != null) {
    element?.setAttribute("data-y", value);
  }
  const y = element?.getAttribute("data-y");
  if (y !== "" && y != null && +y === +y) {
    return +y;
  }
  return null;
}

/**
 * Returns a CSS Transform Style string to Move Element by certain amount of pixels
 * @param value      - value in pixels
 * @returns {string}
 */
function translateY(value) {
  return `translateY(${value}px)`;
}

/**
 * Starter skeleton
 */
export class VirtualList {
  /**
   * @param root
   * @param props {{
   *     getPage: <T>(p: number) => Promise<T[]>,
   *     getTemplate: <T>(datum: T) => HTMLElement,
   *     updateTemplate: <T>(datum: T, element: HTMLElement) => HTMLElement,
   *     pageSize: number
   * }}
   */
  constructor(root, props) {
    this.props = { ...props };
    this.root = root;
    this.start = 0;
    this.end = 0;
    this.limit = this.props.pageSize * 2; // If we show 10 items per page, let's only render max 20 items at a time
    this.pool = [];
  }

  /**
   * Returns an HTML Representation of the component, should have the following structure:
   * #container>
   *    #top-observer+
   *    #virtual-list+
   *    #bottom-observer
   * @returns {string}
   */
  toHTML() {
    /**
     * Part 1 - App Skeleton
     *  @todo
     */
    return `<div id="container">
      <div id="top-observer">Top Observer</div>
      <div id="virtual-list"></div>
      <div id="bottom-observer">Bottom Observer</div>
    </div>`.trim();
  }

  /**
   * @returns void
   */
  #effect() {
    intersectionObserver(
      getObservers(),
      (entries) => this.#handleIntersectionObserver(entries),
      {
        threshold: 0.25,
      }
    );
  }

  /**
   * @returns void
   */
  render() {
    this.root.innerHTML = this.toHTML();
    this.#effect();
  }

  /**
   * Handles observer intersection entries
   * @param entries {IntersectionObserverEntry[]}
   */
  #handleIntersectionObserver(entries) {
    for (const entry of entries) {
      console.log(entry);
      if (entry.isIntersecting) {
        if (entry.target.id === "top-observer") {
          void this.#handleTopObserver();
        } else if (entry.target.id === "bottom-observer") {
          void this.#handleBottomObserver();
        }
      }
    }
  }

  async #handleBottomObserver() {
    const data = await this.props.getPage(this.end++);
    const list = getVirtualList();
    console.log("data is ", data);

    if (this.pool.length < this.limit) {
      const fragment = new DocumentFragment();
      for (const datum of data) {
        const card = this.props.getTemplate(datum);
        fragment.appendChild(card);
        this.pool.push(card);
      }
      list.appendChild(fragment);
    } else {
      // We are going to create two halves... and remove first half of it
      const [toRecycle, unchanged] = [
        this.pool.slice(0, this.props.pageSize),
        this.pool.slice(this.props.pageSize),
      ];

      debugger;
      this.pool = unchanged.concat(toRecycle);
      this.#updateData(toRecycle, data);
    }

    // Convert data to the HTML element
  }

  async #handleTopObserver() {}

  /**
   * Function uses `props.getTemplate` to update the html elements
   * using provided data
   *
   * @param elements {HTMLElement[]} - HTML Elements to update
   * @param data {T[]} - Data to use for update
   */
  #updateData(elements, data) {
    for (let i = 0; i < data.length; i++) {
      this.props.updateTemplate(data[i], elements[i]);
    }
  }
  /**
   * Move elements on the screen using CSS Transform
   *
   * @param direction {"top" | "down" }
   */
  #updateElementsPosition(direction) {
    const [top, bottom] = getObservers();
    if (direction === "down") {
    } else if (direction === "top") {
      // To implement
    }
  }
}
