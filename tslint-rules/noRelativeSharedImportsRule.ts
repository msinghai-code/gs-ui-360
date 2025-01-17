import * as Lint from "tslint";
import * as ts from "typescript";
import * as utils from "tsutils";

export class Rule extends Lint.Rules.AbstractRule {

  public static metadata: {
    ruleName: 'no-relative-shared-imports';
    type: 'maintainability';
    description: `To avoid directly importing shared libraries`;
    descriptionDetails: `To avoid directly importing shared libraries and encourage using alias '@gs' to access shared libraries`;
    optionsDescription: `List of library import pattern strings`;
    options:string[];
    typescriptOnly: false;
    codeExamples: [{
      config:'',
      description:'',
      pass: ' import {folders} from "@gs/shared"; '
      fail: ' import "../../libs/shared/src/lib/folders"; '
    }];
  };

  public static FAILURE_STRING = "importing shared lib with relative path forbidden, use '@gs/shared' or '@gs/cdp-libs' alias instead";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, this.ruleArguments);
  }
}
function walk(context: Lint.WalkContext<string[]>): void {
  ts.forEachChild(context.sourceFile, function cb(node): void {
    if (utils.isImportDeclaration(node)) {
        const isInvalidImport = (context.options || []).some(option => -1 !== node.getText().indexOf(option))
      if(isInvalidImport){
        addFailureAt(node);
      }
    } else {
      ts.forEachChild(node, cb);
    }
  });

  function addFailureAt(node: ts.ImportDeclaration) {
    context.addFailureAtNode(node, Rule.FAILURE_STRING);
  }
}
