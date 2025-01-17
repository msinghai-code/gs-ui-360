import * as utils from "tsutils";
import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {

  public static metadata: {
    ruleName: 'no-object-deep-clone-via-parse-stringify';
    type: 'maintainability';
    description: `Performance impact on using JSON.parse and JSON.stringify for cloning objects`;
    descriptionDetails: `
      Using JSON.pares and JSON.stringify to clone object is much slower
      and recommended to use 'cloneDeep' method from 'lodash' library
    `;
    optionsDescription: `boolean to either enable or disable rule`;
    options:boolean;
    typescriptOnly: false;
    codeExamples: [{
      config:'',
      description:'',
      pass: ' _.cloneDeep( objectsList ) ',
      fail: '  JSON.parse(JSON.stringify( objectsList )) '
    }];
  };

  public static FAILURE_STRING = "Avoid Using JSON.parse(JSON.stringify(<object>)), instead use lodash cloneDeep.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

function walk(context: Lint.WalkContext): void {
  ts.forEachChild(context.sourceFile, function cb(node): void {
    if (utils.isCallExpression(node)) {
      const functionExpressionString = node.getText().replace(/\s+/g,'');
      if(functionExpressionString.indexOf("JSON.parse(JSON.stringify(") === 0){ // index 0 refers to starts with
        addFailureAtNode(node);
      }
    } else {
      ts.forEachChild(node, cb);
    }
  });

  function addFailureAtNode(node: ts.CallExpression) {
    context.addFailureAtNode(node, Rule.FAILURE_STRING);
  }

}