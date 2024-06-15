import ts from "typescript";

function transformer(
    context: ts.TransformationContext
): ts.Transformer<ts.SourceFile> {
    return (sourceFile: ts.SourceFile) => {
        const reactive: Set<string> = new Set();

        const visitor = (node: ts.Node): ts.Node => {
            if (
                ts.isVariableDeclarationList(node) &&
                node.flags === ts.NodeFlags.Let
            ) {
                return ts.factory.updateVariableDeclarationList(
                    node,
                    node.declarations.map((declaration) => {
                        if (declaration.initializer !== undefined) {
                            reactive.add(declaration.name.getText());
                            return ts.factory.updateVariableDeclaration(
                                declaration,
                                declaration.name,
                                declaration.exclamationToken,
                                declaration.type,
                                ts.factory.createCallExpression(
                                    ts.factory.createIdentifier("reactive"),
                                    undefined,
                                    [declaration.initializer]
                                )
                            );
                        }
                        return declaration;
                    })
                );
            } else if (
                ts.isBinaryExpression(node) &&
                node.operatorToken.kind === ts.SyntaxKind.FirstAssignment &&
                reactive.has(node.left.getText())
            ) {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(node.left.getText()),
                        ts.factory.createIdentifier("set")
                    ),
                    undefined,
                    [node.right]
                );
            } else if (ts.isIdentifier(node) && reactive.has(node.getText())) {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(node.getText()),
                        ts.factory.createIdentifier("get")
                    ),
                    undefined,
                    []
                );
            }
            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
}

export function processScript(script: string): string {
    let result = ts.transpileModule(script, {
        compilerOptions: { module: ts.ModuleKind.ES2015, target: ts.ScriptTarget.ES2015 },
        transformers: {
            before: [transformer],
        },
    });

    return result.outputText;
}
