const reactiveClosurePattern = /^{{ ([^}]+) }}$/

export function extractReactiveClosure(value: string): string | null {
    const matches = value.match(reactiveClosurePattern)
    return matches && matches[1] ? matches[1] : null
}

const variableNamePattern = /[a-zA-Z_$][a-zA-Z_$0-9]*/g

export function extractClosureReactives(closure: string, reactives: Set<string>): string[] {
    const matches = closure.match(variableNamePattern)
    if (!matches) {
        return []
    }
    return matches.filter((match) => reactives.has(match))
}
