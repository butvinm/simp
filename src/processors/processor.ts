import { HTMLElement } from 'node-html-parser'

export type SimpContext = {
    indent: number
    elements: number
    reactives: Set<string>
}

export type SimpProcessor = (node: HTMLElement, ctx: SimpContext) => string
