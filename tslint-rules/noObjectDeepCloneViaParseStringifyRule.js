"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var utils = require("tsutils");
var Lint = require("tslint");
var ts = require("typescript");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, walk);
    };
    Rule.FAILURE_STRING = "Avoid Using JSON.parse(JSON.stringify(<object>)), instead use lodash cloneDeep.";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function walk(context) {
    ts.forEachChild(context.sourceFile, function cb(node) {
        if (utils.isCallExpression(node)) {
            var functionExpressionString = node.getText().replace(/\s+/g, '');
            if (functionExpressionString.indexOf("JSON.parse(JSON.stringify(") === 0) { // index 0 refers to starts with
                addFailureAtNode(node);
            }
        }
        else {
            ts.forEachChild(node, cb);
        }
    });
    function addFailureAtNode(node) {
        context.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
}
