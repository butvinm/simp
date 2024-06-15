import ts from 'typescript'


export type ScriptProcessor = {
    reactive: Set<string>
}

export function processScript(
    processor: ScriptProcessor,
    script: string,
): string {
    let result = ts.transpileModule(script, {
        compilerOptions: {
            module: ts.ModuleKind.ES2015,
            target: ts.ScriptTarget.ES2015,
        },
        transformers: {
            before: [(context) => transformerFactory(processor, context)],
        },
    })

    return result.outputText
}

function transformerFactory(
    processor: ScriptProcessor,
    context: ts.TransformationContext,
): ts.Transformer<ts.SourceFile> {
    return (sourceFile: ts.SourceFile) => {
        const visitor = (node: ts.Node): ts.Node => {
            return transformNode(processor, node, context)
        }

        return ts.visitNode(sourceFile, visitor) as ts.SourceFile
    }
}

function transformNode(
    processor: ScriptProcessor,
    node: ts.Node,
    context: ts.TransformationContext,
): ts.Node {
    if (ts.isVariableDeclarationList(node) && node.flags === ts.NodeFlags.Let) {
        return transformVariableDeclarationList(processor, node)
    }

    if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.FirstAssignment &&
        processor.reactive.has(node.left.getText())
    ) {
        return transformReactiveAssignment(node)
    }

    if (ts.isIdentifier(node) && processor.reactive.has(node.getText())) {
        return transformReactiveIdentifier(node)
    }

    return ts.visitEachChild(
        node,
        (childNode) => transformNode(processor, childNode, context),
        context,
    )
}

function transformVariableDeclarationList(
    processor: ScriptProcessor,
    node: ts.VariableDeclarationList,
): ts.VariableDeclarationList {
    return ts.factory.updateVariableDeclarationList(
        node,
        node.declarations.map((declaration) => {
            if (declaration.initializer !== undefined) {
                processor.reactive.add(declaration.name.getText())
                return transformReactiveVariableDeclaration(declaration)
            }
            return declaration
        }),
    )
}

function transformReactiveVariableDeclaration(
    declaration: ts.VariableDeclaration,
): ts.VariableDeclaration {
    // new ReactiveVariable('name', value)
    const reactiveInitializer = ts.factory.createNewExpression(
        ts.factory.createIdentifier('ReactiveVariable'),
        undefined,
        [
            ts.factory.createStringLiteral(declaration.name.getText()),
            declaration.initializer!
        ],
    )

    return ts.factory.updateVariableDeclaration(
        declaration,
        declaration.name,
        declaration.exclamationToken,
        declaration.type,
        reactiveInitializer,
    )
}

function transformReactiveAssignment(
    node: ts.BinaryExpression,
): ts.CallExpression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(node.left.getText()),
            ts.factory.createIdentifier('set'),
        ),
        undefined,
        [node.right],
    )
}

function transformReactiveIdentifier(node: ts.Identifier): ts.CallExpression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(node.getText()),
            ts.factory.createIdentifier('get'),
        ),
        undefined,
        [],
    )
}
