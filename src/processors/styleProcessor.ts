import { HTMLElement } from 'node-html-parser'

import { SimpContext } from './processor'

export function processStyleNode(node: HTMLElement, ctx: SimpContext): string {
    const style = node.text

    let styleOutput = ''
    styleOutput += `const style = document.createElement('style');`
    styleOutput += `style.textContent = \`${style}\`;`
    styleOutput += `document.head.appendChild(style);`
    return styleOutput
}
