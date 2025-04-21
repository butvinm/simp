import { HTMLElement, NodeType } from 'node-html-parser'

import { SimpContext } from './processor'
import { extractReactiveClosure, extractClosureReactives } from '../parseUtils'
import { processScript } from './scriptProcessor'

export function processHtmlNode(node: HTMLElement, ctx: SimpContext): string {
    const result = processNode(node, ctx)
    if (!result) {
        return ''
    }

    let htmlOutput = result.nodeDeclaration + '\n'
    htmlOutput += `document.body.appendChild(${result.nodeName});`
    return htmlOutput
}

type NodeProcessorResult = { nodeName: string; nodeDeclaration: string }

function processNode(node: HTMLElement, ctx: SimpContext): NodeProcessorResult | null {
    ctx.elements += 1
    switch (node.nodeType) {
        case NodeType.TEXT_NODE:
            return convertTextNode(node, ctx)
        case NodeType.ELEMENT_NODE:
            if (node.rawTagName == 'foreach') {
                return convertForeachNode(node, ctx)
            } else {
                return convertElementNode(node, ctx)
            }
        default:
            return null
    }
}

function convertTextNode(node: HTMLElement, ctx: SimpContext): NodeProcessorResult {
    const nodeName = `textNode${ctx.elements}`
    let escapedText = JSON.stringify(node.text)
    let nodeDeclaration = `const ${nodeName} = document.createTextNode(${escapedText});`

    ctx.indent += 1
    const indent = '    '.repeat(ctx.indent)

    const reactiveClosure = extractReactiveClosure(node.text)
    if (reactiveClosure) {
        const processedClosure = processScript(reactiveClosure, ctx)
        const closureClosureReactives = extractClosureReactives(reactiveClosure, ctx.reactives)
        for (const reactive of closureClosureReactives) {
            nodeDeclaration += `\n${indent}${reactive}.subscribe((newValue) => { ${nodeName}.textContent = ${processedClosure} });`
        }
    }

    ctx.indent -= 1
    return { nodeName, nodeDeclaration }
}


function convertForeachNode(node: HTMLElement, ctx: SimpContext): NodeProcessorResult | null {
    const itemsAttr = node.rawAttributes["items"];
    if (itemsAttr == undefined) return null

    const itemAttr = node.rawAttributes["item"];
    if (itemAttr == undefined) return null

    const itemsClosure = extractReactiveClosure(itemsAttr)
    if (itemsClosure == null) return null
    const itemsReactives = extractClosureReactives(itemsClosure, ctx.reactives)
    const itemsReactive = itemsReactives[0]
    if (itemsReactive == undefined || itemsReactives.length != 1) return null

    const itemClosure = extractReactiveClosure(itemAttr)
    if (itemClosure == null) return null

    ctx.reactives.add(itemClosure)

    const nodeName = `foreach${ctx.elements}`

    ctx.indent += 2
    let indent = '    '.repeat(ctx.indent)

    let itemDeclaration = `\n${indent}let ${itemClosure} = new ReactiveVariable("${itemClosure}", ${itemClosure}_value);`
    for (const child of node.childNodes) {
        console.log('buidling foreach item constructor node')
        const result = processNode(child as HTMLElement, ctx)
        if (!result) continue

        itemDeclaration += `\n${indent}${result.nodeDeclaration}`
        itemDeclaration += `\n${indent}${nodeName}.appendChild(${result.nodeName});`
    }
    itemDeclaration += `\n${indent}${itemClosure}.invoke();`

    ctx.indent -= 2
    indent = '    '.repeat(ctx.indent)

    const itemConstructorName = `${nodeName}_createItem`;

    let nodeDeclaration = `
    ${indent}const ${nodeName} = document.createElement("div");
    ${indent}${nodeName}.setAttribute("style", "display: contents");
    ${indent}let ${itemClosure} = new ReactiveVariable("${itemClosure}", undefined);
    ${indent}const ${itemConstructorName} = (${itemClosure}_value) => {
    ${indent}${itemDeclaration}
    ${indent}};
    ${indent}${itemsReactive}.subscribe((newValue) => { ${nodeName}.innerHTML = ''; for (const item of newValue) ${itemConstructorName}(item) });
    `

    return { nodeName, nodeDeclaration }
}


function convertElementNode(node: HTMLElement, ctx: SimpContext): NodeProcessorResult {
    const rawTagName = node.rawTagName || 'body'
    const nodeName = `${rawTagName}${ctx.elements}`
    let nodeDeclaration = `const ${nodeName} = document.createElement("${rawTagName}");`

    ctx.indent += 1
    const indent = '    '.repeat(ctx.indent)

    for (const [attr, value] of Object.entries(node.rawAttributes)) {
        const reactiveClosure = extractReactiveClosure(value)
        if (reactiveClosure) {
            const processedClosure = processScript(reactiveClosure, ctx)

            if (attr.startsWith('on:')) {
                const eventName = attr.slice(3)
                nodeDeclaration += `\n${indent}${nodeName}.addEventListener("${eventName}", (event) => { ${processedClosure} });`
            } else if (attr.startsWith('bind:')) {
                const attrName = attr.slice(5);

                // Set initial value from the reactive to the element
                nodeDeclaration += `\n${indent}${reactiveClosure}.subscribe((newValue) => {
                    ${nodeName}["${attrName}"] = newValue;
                });`;

                // Add event listener to update the reactive when element changes
                // Use appropriate event based on the element type and attribute
                let eventType = "input"; // Default event for most input changes

                // For some specific cases, use different events
                if (rawTagName === "select" || (rawTagName === "input" &&
                    (node.rawAttributes["type"] === "checkbox" || node.rawAttributes["type"] === "radio"))) {
                    eventType = "change";
                }

                nodeDeclaration += `\n${indent}${nodeName}.addEventListener("${eventType}", (event) => {
                    const newValue = ${nodeName}["${attrName}"];
                    ${reactiveClosure}.set(newValue);
                });`;
            } else {
                const reactives = extractClosureReactives(reactiveClosure, ctx.reactives)
                for (const reactive of reactives) {
                    nodeDeclaration += `\n${indent}${reactive}.subscribe((newValue) => { ${nodeName}.setAttribute("${attr}", ${processedClosure}) });`
                }
            }
        } else {
            nodeDeclaration += `\n${indent}${nodeName}.setAttribute("${attr}", ${JSON.stringify(value)});`
        }
    }

    for (const child of node.childNodes) {
        const result = processNode(child as HTMLElement, ctx)
        if (!result) {
            continue
        }
        nodeDeclaration += `\n${indent}${result.nodeDeclaration}`
        nodeDeclaration += `\n${indent}${nodeName}.appendChild(${result.nodeName});`
    }

    ctx.indent -= 1
    return { nodeName, nodeDeclaration }
}
