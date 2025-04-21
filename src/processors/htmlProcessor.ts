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
            return convertElementNode(node, ctx)
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
