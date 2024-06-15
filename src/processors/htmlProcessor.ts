import { HTMLElement, NodeType } from 'node-html-parser'

export interface HtmlProcessor {
    elementsCounter: number
    indent: number
}

export function processHtml(
    processor: HtmlProcessor,
    node: HTMLElement,
): { nodeName: string; nodeDeclaration: string } {
    return processNode(processor, node)
}

const reactiveClosure = /{([^}]+)}/g

function processNode(
    processor: HtmlProcessor,
    node: HTMLElement,
): { nodeName: string; nodeDeclaration: string } {
    processor.elementsCounter += 1

    switch (node.nodeType) {
        case NodeType.TEXT_NODE:
            return convertTextNode(processor, node)
        case NodeType.ELEMENT_NODE:
            return convertElementNode(processor, node)
        default:
            throw new Error(`Unknown node type: ${node.nodeType}`)
    }
}

function convertTextNode(
    processor: HtmlProcessor,
    node: HTMLElement,
): { nodeName: string; nodeDeclaration: string } {
    const nodeName = `textNode${processor.elementsCounter}`
    let text = JSON.stringify(node.text)
    let nodeDeclaration = `const ${nodeName} = document.createTextNode(${text});`

    processor.indent += 1
    const reactiveClosureMatches = text.match(reactiveClosure)
    if (reactiveClosureMatches) {
        for (const closure of reactiveClosureMatches) {
            const reactiveVariableName = closure.slice(1, -1)
            text = text.replace(
                closure,
                `document.createTextNode(${reactiveVariableName}.get())`,
            )
            const indent = '    '.repeat(processor.indent)
            nodeDeclaration += `\n${indent}${reactiveVariableName}.subscribe((newValue) => ${nodeName}.textContent = newValue);`
        }
    }
    processor.indent -= 1
    return { nodeName, nodeDeclaration }
}

function convertElementNode(
    processor: HtmlProcessor,
    node: HTMLElement,
): { nodeName: string; nodeDeclaration: string } {
    const rawTagName = node.rawTagName || 'body'
    const nodeName = `${rawTagName}${processor.elementsCounter}`
    let nodeDeclaration = `const ${nodeName} = document.createElement("${rawTagName}");`

    processor.indent += 1

    for (const [attr, value] of Object.entries(node.rawAttributes)) {
        if (attr.startsWith('on')) {
            const eventName = attr.slice(2)
            const indent = '    '.repeat(processor.indent)
            nodeDeclaration += `\n${indent}${nodeName}.addEventListener("${eventName}", (event) => { ${value} });`
        } else {
            const reactiveClosureMatches = value.match(reactiveClosure)
            if (reactiveClosureMatches) {
                for (const closure of reactiveClosureMatches) {
                    const reactiveVariableName = closure.slice(1, -1)
                    const valueExpr = value.replace(
                        closure,
                        `${reactiveVariableName}.get()`,
                    )
                    const indent = '    '.repeat(processor.indent)
                    nodeDeclaration += `\n${indent}${reactiveVariableName}.subscribe((newValue) => ${nodeName}.setAttribute("${attr}", newValue));`
                    nodeDeclaration += `\n${indent}${nodeName}.setAttribute("${attr}", ${valueExpr});`
                }
            } else {
                const indent = '    '.repeat(processor.indent)
                nodeDeclaration += `\n${indent}${nodeName}.setAttribute("${attr}", ${JSON.stringify(
                    value,
                )});`
            }
        }
    }

    for (const child of node.childNodes) {
        const {
            nodeName: childNodeName,
            nodeDeclaration: childNodeDeclaration,
        } = processNode(processor, child as HTMLElement)
        const indent = '    '.repeat(processor.indent)
        nodeDeclaration += `\n${indent}${childNodeDeclaration}`
        nodeDeclaration += `\n${indent}${nodeName}.appendChild(${childNodeName});`
    }
    processor.indent -= 1
    return { nodeName, nodeDeclaration }
}
