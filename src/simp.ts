/**
 *
 * Each simp file represents a single ui component.
 *
 * It consists of a common HTML tags, but with a few special treatments:
 * 1. script tag is treated as a script block, it is processed by simp preprocessors to enable reactivity.
 * 2. style tag is treated as a style block, it is processed by simp preprocessors to enable reactivity.
 * 3. other tags are compiled to a js code that creates the DOM tree and enables reactivity.
 *
 * A whole simp file is compiled to a single js file that can be included in a web page.
 */
import * as fs from 'fs'
import { HTMLElement, NodeType, parse } from 'node-html-parser'
import * as path from 'path'
import { processScript, ScriptProcessor } from './processors/scriptProcessor'
import { HtmlProcessor, processHtml } from './processors/htmlProcessor'

const INDEX_HTML = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simp</title>
    </head>
    <body>
        <script src="index.js" type="module"></script>
    </body>
</html>
`

const JS_HEADER = `
import { ReactiveVariable } from './runtime.js';

const root = document.createElement('div');
`

const JS_FOOTER = `
document.body.appendChild(root);
`

function buildIndexJs(simpSource: string): string {
    const scriptProcessor: ScriptProcessor = {
        reactive: new Set(),
    }

    const htmlProcessor: HtmlProcessor = {
        elementsCounter: 0,
        indent: 0,
    }

    const root = parse(simpSource)

    let jsOutput = JS_HEADER

    for (const child of root.childNodes) {
        if (child.nodeType === NodeType.ELEMENT_NODE) {
            const element = child as HTMLElement
            if (element.rawTagName === 'script') {
                jsOutput += processScript(scriptProcessor, element.text)
            } else if (element.rawTagName === 'style') {
                // process other tags
            } else {
                const {nodeName, nodeDeclaration} = processHtml(htmlProcessor, element)
                const indent = '    '.repeat(htmlProcessor.indent)
                jsOutput += `${indent}${nodeDeclaration}\n`
                jsOutput += `${indent}root.appendChild(${nodeName});\n`
            }
        }
    }

    jsOutput += 'addEventListener("load", () => {\n'
    for (const reactiveVariable of scriptProcessor.reactive) {
        jsOutput += `    ${reactiveVariable}.invoke();\n`
    }
    jsOutput += '});\n'

    jsOutput += JS_FOOTER
    return jsOutput
}

const OUT_DIR = 'simpDist'

function main() {
    if (process.argv.length < 3) {
        console.log('Usage: simp <simp-file>')
        process.exit(1)
    }

    const simpFile = process.argv[2]!

    const simpSource = fs.readFileSync(simpFile, 'utf-8')

    const jsOutput = buildIndexJs(simpSource)

    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR)
    }

    const jsFile = path.join(OUT_DIR, 'index.js')
    fs.writeFileSync(jsFile, jsOutput)

    const htmlFile = path.join(OUT_DIR, 'index.html')
    fs.writeFileSync(htmlFile, INDEX_HTML)

    console.log(`Output written to ${jsFile}`)
}

main()
