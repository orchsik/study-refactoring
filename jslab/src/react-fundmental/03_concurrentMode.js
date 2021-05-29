const React = require('react');
const { JSDOM } = require('jsdom');
const { document } = new JSDOM().window;

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== 'children')
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  /**
   * 재귀호출이 문제임.
   * 렌더링 시작하면 모든 element tree를 렌더링 할 때까지 멈추지 않음.
   * element tree가 꽤 크면 메인 스레드의 동작이 오랫동안 멈춰있을꺼야.
   */
  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

const MyReact = {
  createElement,
  render,
};

/** @jsx MyReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

const container = document.getElementById('root');

MyReact.render(element, container);

/**
 * 고고 render 리팩토링 가자!
 * 작업을 더 작은 단위로 나누고, 브라우저가 작업이 필요한 경우, 렌더링 도중 끼어들수 있게 하자.
 */
