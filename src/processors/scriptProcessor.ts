import { HTMLElement } from 'node-html-parser'
import ts from 'typescript'
import { SimpContext } from './processor'

export function processScriptNode(node: HTMLElement, ctx: SimpContext): string {
    return processScript(node.text, ctx)
}

export function processScript(script: string, ctx: SimpContext): string {
    const processedScript = ts.transpileModule(script, {
        compilerOptions: {
            module: ts.ModuleKind.ES2015,
            target: ts.ScriptTarget.ES2015,
        },
        transformers: {
            before: [(context) => transformerFactory(ctx, context)],
        },
    })
    
    return processedScript.outputText.trim()
}

function transformerFactory(ctx: SimpContext, context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
    return (sourceFile: ts.SourceFile) => {
        const visitor = (node: ts.Node): ts.Node => {
            return transformNode(node, ctx, context)
        }

        return ts.visitNode(sourceFile, visitor) as ts.SourceFile
    }
}

function transformNode(node: ts.Node, ctx: SimpContext, context: ts.TransformationContext): ts.Node {
    if (ts.isVariableDeclarationList(node) && node.flags === ts.NodeFlags.Let) {
        return transformVariableDeclarationList(node, ctx)
    }

    if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.FirstAssignment &&
        ctx.reactives.has(node.left.getText())
    ) {
        return transformReactiveAssignment(node, ctx, context)
    }

    if (ts.isIdentifier(node) && ctx.reactives.has(node.getText())) {
        return transformReactiveIdentifier(node)
    }

    return ts.visitEachChild(node, (childNode) => transformNode(childNode, ctx, context), context)
}

function transformVariableDeclarationList(
    node: ts.VariableDeclarationList,
    ctx: SimpContext,
): ts.VariableDeclarationList {
    return ts.factory.updateVariableDeclarationList(
        node,
        node.declarations.map((declaration) => {
            if (declaration.initializer !== undefined) {
                ctx.reactives.add(declaration.name.getText())
                return transformReactiveVariableDeclaration(declaration)
            }
            return declaration
        }),
    )
}

function transformReactiveVariableDeclaration(declaration: ts.VariableDeclaration): ts.VariableDeclaration {
    // new ReactiveVariable('name', value)
    const reactiveInitializer = ts.factory.createNewExpression(
        ts.factory.createIdentifier('ReactiveVariable'),
        undefined,
        [ts.factory.createStringLiteral(declaration.name.getText()), declaration.initializer!],
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
    ctx: SimpContext,
    context: ts.TransformationContext,
): ts.CallExpression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(node.left.getText()),
            ts.factory.createIdentifier('set'),
        ),
        undefined,
        [transformNode(node.right, ctx, context) as ts.Expression],
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
