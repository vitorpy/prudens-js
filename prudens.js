/*
DATA STRUCTURE:
kb = [
    {
        name: "rule_0",
        "body": [
            {
                name: "fatherOf",
                sign: true,
                isJS: false,
                isEquality: false,
                isInequality: false,
                args: [
                    {
                        index: 0,
                        name: "Var1",
                        isAssigned: false,
                        value: undefined,
                        muted: false,
                    },
                    {
                        index: 1,
                        name: "Var2",
                        isAssigned: true,
                        value: "val",
                        muted: false,
                    }
                ],
                arity: 2,
            },
            { another literal },
        ],
        "head": {
            name: "head",
            sign: false,
            isAction: false,
            args: [ list of arguments ],
            arity: 1,
        },
    },
]
*/

/*
Get all substitutions:
1. For each literal in body:
    a. For each sub in substitutions:
        i. Apply sub to literal;
        ii. For each fact in facts that unifies with literal:
            A. Check if sub can be extended according to fact; // You are here!
            B. If yes, extend it, else continue;
        iii. If no extension is possible, delete this sub and proceed to next;
    b. If substitutions is empty and it is not the first iteration, return [];
*/

function getSubstitutions(body, facts, code) {
    let substitutions = [undefined]; // If it contains only undefined in the end, then all body literals are propositional symbols and are all included in facts.
    const jsLiterals = [];
    for (const literal of body) {
        if (literal["arity"] === 0 && !deepIncludes(literal, facts)) { // In case you have a propositional literal, check whether it is included in facts and if not return [].
            return [];
        }
        if (literal["arity"] === 0) {
            continue;
        }
        if (literal["isJS"]) {
            jsLiterals.push(literal);
            continue;
        }
        if (substitutions.includes(undefined)) {
            substitutions = extendByFacts(literal, facts);
        }
        const toBeRemoved = [];
        const toBePushed = [];
        for (const sub of substitutions) {
            // console.log("Sub:");
            // console.log(sub);
            const instance = {};
            for (const key of Object.keys(literal)) {
                instance[key] = literal[key];
            }
            instance["args"] = apply(sub, literal["args"]);
            // let instance = {
            //     name: body[i]["name"],
            //     sign: body[i]["sign"],
            //     isJS: body[i]["isJS"],
            //     isEquality: body[i]["isEquality"],
            //     isInequality: body[i]["isInequality"],
            //     args: apply(sub, body[i]["args"]),
            //     arity: body[i]["arity"],
            // }
            // console.log("Substituted literal:");
            // console.log(instance);
            let extended = false;
            for (const fact of facts) {
                // console.log("literal/Fact:");
                // console.log(instance);
                // console.log(fact);
                const unifier = unify(instance, fact);
                // console.log("Unifier:");
                // console.log(unifier);
                if (unifier != undefined) {
                    const extension = extend(sub, unifier);
                    // console.log("Extension");
                    // debugger;
                    if (unifier != undefined && extension != undefined) {
                        toBePushed.push(extension);
                        extended = true;
                        if (!toBeRemoved.includes(sub)) {
                            toBeRemoved.push(sub);
                        }
                    }
                }
            }
            if (!extended) {
                toBeRemoved.push(sub);
            }
        }
        substitutions = removeAll(substitutions, toBeRemoved);
        substitutions.push(...toBePushed);
        if (substitutions.length === 0) {
            // console.log("Zero length");
            return [];
        }
    }
    const subs = [];
    for (const sub of substitutions) {
        const jsEval = jsEvaluation(jsLiterals, sub, code);
        if (jsEval["isValid"]) {
            subs.push(jsEval["sub"]);
        }
    }
    return subs;
}

// function getSubstitutions(body, facts) {
//     "use strict";
//     // console.log("Body:");
//     // console.log(body);
//     let substitutions = extendByFacts(body[0], facts);
//     // console.log("Init Subs:");
//     // console.log(substitutions);
//     // substitutions = substitutions.filter((element) => {return element !== undefined});
//     // console.log("Subs Init:");
//     // console.log(substitutions);
//     // debugger;
//     const jsLiterals = [];
//     const propositionalLiterals = [];
//     for (let i=1; i<body.length; i++) {
//         if (body[i]["isJS"]) {
//             jsLiterals.push(body[i]);
//             // console.log("JS Literals:");
//             // console.log(jsLiterals);
//             continue;
//         }
//         // console.log(i);
//         if (body[i]["arity"] === 0) {
//             propositionalLiterals.push(body[i]);
//             // console.log("Props:");
//             // console.log(propositionalLiterals);
//             continue;
//         }
//         const toBeRemoved = [];
//         const toBePushed = [];
//         for (const sub of substitutions) {
//             // console.log("Sub:");
//             // console.log(sub);
//             let literal = {
//                 name: body[i]["name"],
//                 sign: body[i]["sign"],
//                 isJS: body[i]["isJS"],
//                 isEquality: body[i]["isEquality"],
//                 isInequality: body[i]["isInequality"],
//                 args: apply(sub, body[i]["args"]),
//                 arity: body[i]["arity"],
//             }
//             // console.log("Substituted literal:");
//             // console.log(literal);
//             let extended = false;
//             for (const fact of facts) {
//                 // console.log("literal/Fact:");
//                 // console.log(literal);
//                 // console.log(fact);
//                 const unifier = unify(literal, fact);
//                 // console.log("Unifier:");
//                 // console.log(unifier);
//                 if (unifier != undefined) {
//                     const extension = extend(sub, unifier);
//                     // console.log("Extension");
//                     // debugger;
//                     if (unifier != undefined && extension != undefined) {
//                         toBePushed.push(extension);
//                         extended = true;
//                         if (!toBeRemoved.includes(sub)) {
//                             toBeRemoved.push(sub);
//                         }
//                     }
//                 }
//             }
//             if (!extended) {
//                 toBeRemoved.push(sub);
//             }
//         }
//         substitutions = removeAll(substitutions, toBeRemoved);
//         substitutions.push(...toBePushed);
//         if (substitutions.length === 0) {
//             // console.log("Zero length");
//             return [];
//         }
//     }
//     // console.log("subs:");
//     // console.log(substitutions);
//     return {
//         "subs": substitutions,
//         "propositions": propositionalLiterals,
//     };
// }

function extendByFacts(literal, facts) {
    "use strict";
    const subs = [];
    for (const fact of facts) {
        if (fact["arity"] !== 0) {
            const unifier = unify(literal, fact);
            (unifier != undefined) && subs.push(unifier);
        }
    }
    return subs;
}

// Substitution = {varname1: val1, varname2: val2, ...}

function apply(sub, args) {
    "use strict";
    if (args === undefined) {
        return undefined;
    }
    // console.log(args);
    // console.log(sub);
    const localArguments = [];
    for (const argument of args) {
        if (!argument["isAssigned"] && Object.keys(sub).includes(argument["name"])) {
            localArguments.push({
                index: argument["index"],
                name: argument["name"],
                isAssigned: true,
                value: sub[argument["name"]],
                muted: argument["muted"],
            });
        } else {
            localArguments.push(argument);
        }
    }
    return localArguments;
}

function unify(x, y) { // x, y are literals. Assymetric unification since y is assumed variable-free!
    "use strict";
    if (x["name"] != y["name"] || x["arity"] != y["arity"] || x["sign"] != y["sign"]) {
        return undefined;
    }
    const xArgs = x["args"];
    const yArgs = y["args"];
    const unifier = {};
    for (let i=0; i<x["arity"]; i++) {
        let xArg = xArgs[i];
        let yArg = yArgs[i];
        if (xArg["isAssigned"] && xArg["value"] != yArg["value"]) {
            // console.log("Here?");
            // console.log(xArg);
            // console.log(yArg);
            // debugger;
            return undefined;
        }
        if (xArg["muted"] || yArg["muted"] || (xArg["name"] === undefined && yArg["name"] === undefined)) {
            continue;
        }
        if (Object.keys(unifier).length > 0 && Object.keys(unifier).includes(xArg["name"]) && unifier[xArg["name"]] != yArg["value"]) {
            return undefined;
        }
        // console.log("Here?");
        // console.log(xArg);
        // console.log(yArg);
        // debugger;
        unifier[xArg["name"]] = yArg["value"];
    }
    return unifier;
}

function extend(sub, unifier) {
    "use strict";
    // console.log("Unifier in extend():");
    // console.log(unifier);
    const extendedSub = deepCopy(sub);
    // console.log("Sub:");
    // console.log(extendedSub);
    for (const key of Object.keys(unifier)) {
        if (Object.keys(extendedSub).includes(key) && extendedSub[key] != unifier[key]) {
            return undefined;
        } else if (!Object.keys(extendedSub).includes(key)) {
            extendedSub[key] = unifier[key];
        }
    }
    return extendedSub;
}

/*
Inference algorithm:
Facts = list of certain inferences;
NewFacts = list of new inferences;

1. For each rule, with descending priority:
    a. Infer anything that may be inferred using rule and add it to NewFacts;
    b. If any inference leads to a conflict with something in Facts, remove it from NewFacts;
    c. Add all remaining NewFacts to Facts // Are there any chances that you can delete a rule?
2. Repeat 1 until nothing is added to Facts.
*/

function applyToLiteral(sub, literal) {
    if (sub === undefined) {
        const output = {}
        for (const key of Object.keys(literal)) {
            output[key] = literal[key];
        }
        return output;
    }
    const subLiteral = deepCopy(literal);
    // console.log("Sub-Literal:");
    // console.log(subLiteral);
    subLiteral["args"] = apply(sub, literal["args"])
    return subLiteral;
}

function applyToRule(sub, rule) {
    const subRule = {
        name: rule["name"],
    }
    const newBody = [];
    for (const literal of rule["body"]) {
        // console.log(literal);
        newBody.push(applyToLiteral(sub, literal));
    }
    subRule["body"] = newBody;
    subRule["head"] = applyToLiteral(sub, rule["head"]);
    return subRule;
}

function filterBody(body) {
    props = [];
    fols = [];
    for (let i=0; i<body.length; i++) {
        if (body[i].arity === 0) {
            props.push(body[i]);
        } else {
            fols.push(body[i]);
        }
    }
    return {
        propositions: props,
        fols: fols,
    };
}

function getPriorities(kb) { // Linear order induced priorities.
    priorities = {};
    for (let i=0; i<kb.length; i++) {
        // console.log(kb);
        priorities[ruleToString(kb[i])] = i
    }
    return priorities;
}

function updateGraph(newLiteralString, newLiteralRule, oldLiteralString, graph, priorities) {
    const toBeRemoved = [];
    console.log(priorities);
    for (const rule of graph[oldLiteralString]) { // rule here is already stringified!
        // console.log(rule);
        // console.log(ruleToString(newLiteralRule));
        if (priorities[rule] > priorities[ruleToString(newLiteralRule)]) {
            toBeRemoved.push(rule);
        }
    }
        // console.log(toBeRemoved);
        // debugger;
    for (let i=0; i<graph[oldLiteralString].length; i++) {
        if (toBeRemoved.includes(graph[oldLiteralString][i])) {
            graph[oldLiteralString].splice(i, 1);
            i--;
        }
    }
    let isPrior = false;
    if (graph[oldLiteralString].length === 0) {
        graph[newLiteralString] = [ruleToString(newLiteralRule)];
        isPrior = true;
        delete graph[oldLiteralString];
        // console.log(graph);
    }
    return {
        graph: graph,
        isPrior: isPrior,
    };
}

function forwardChaining(kbObject, context) { //FIXME Huge inconsistency with DOCS! You need to change that from [rule1, ...] to KBObject.
    let facts = context;
    const kb = kbObject["kb"];
    // console.log(facts);
    let inferred = false;
    let graph = {};
    // console.log(kbObject);
    const code = kbObject["code"];
    const priorities = getPriorities(kb);
    // let i = 0;
    do {
        inferred = false;
        for (let i=0; i<kb.length; i++) {
            const rule = kb[i];
            // FIXME You have to fix the relational version in the same manner as the propositional!
            const subs = getSubstitutions(rule["body"], facts, code); // FIXME Not computing all substitutions --- actually none for: @KnowledgeBase
            for (let i=0; i<subs.length; i++) {
                const sub = subs[i];
                // console.log(sub);
                // console.log(code);
                // console.log("Rule head:");
                // console.log(rule["head"]);
                const inferredHead = applyToLiteral(sub, rule["head"]);
                // console.log("Facts:");
                // console.log(facts);
                // console.log(inferredHead);
                const literalString = literalToString(inferredHead);
                if (Object.keys(graph).includes(literalString)) {
                    if (!graph[literalString].includes(ruleToString(applyToRule(sub, rule)))) {
                        graph[literalString].push(ruleToString(applyToRule(sub, rule)));
                    }
                } else {
                    graph[literalString] = [ruleToString(applyToRule(sub, rule))];
                }
                if (!deepIncludes(inferredHead, facts)) { // Something's wrong regarding negation handling --- it is being ignored for some reason.
                    facts.push(inferredHead);
                    // console.log("Head:");
                    // console.log(inferredHead);
                    inferred = true;
                }
                const oppositeHead = {}
                for (const key of Object.keys(inferredHead)) {
                    oppositeHead[key] = inferredHead[key];
                }
                oppositeHead["sign"] = !oppositeHead["sign"];
                console.log(oppositeHead);
                console.log(facts);
                debugger;
                if (deepIncludes(oppositeHead, facts)) {
                    console.log("Here");
                    const updatedGraph = updateGraph(literalToString(inferredHead), rule, literalToString(oppositeHead), graph, priorities);
                    console.log(updatedGraph);
                    graph = updatedGraph["graph"];
                    if (updatedGraph["isPrior"]) {
                        facts = parseListOfLiterals(Object.keys(graph));
                    }
                }
            }
        }
        // i++;
    } while (inferred);
    return {
        facts: facts,
        graph: graph,
    }
}

function isConfictingWithList(x, facts) { // x is literal, facts is a list of literals.
    for (const fact of facts) {
        if (isConflicting(x, fact)) {
            return true;
        }
    }
    return false;
}

function isConflicting(x, y) { // x and y are literals.
    if (x["name"] != y["name"] || x["arity"] != y["arity"] || x["sign"] === y["sign"]) {
        return false;
    }
    const xArgs = x["args"];
    const yArgs = y["args"];
    for (let i=0; i<x["arity"]; i++) {
        if (!xArgs[i]["isAssigned"] || !yArgs[i]["isAssigned"] || xArgs[i]["value"] != yArgs[i]["value"]) {
            return false;
        }
    }
    return true;
}

function jsEvaluation(body, sub, code) { // Check whether, given a substitution, the corresponding JS predicates hold.
    let isValid = true;
    // console.log("Body:");
    // console.log(body);
    for (const literal of body) {
        if (literal["isEquality"]) {
            const equality = equalityCheck(literal, sub);
            // console.log("Equality:");
            // console.log(equality);
            if (equality["unifier"]) {
                sub = extend(sub, equality["unifier"]);
            }
            isValid = isValid && equality["isValid"];
        } else if (literal["isInequality"]) {
            isValid = isValid && inequalityCheck(literal, sub);
        } else { // On condition that only JS literals are passed here...
            // console.log("Hey!");
            // console.log(code);
            isValid = isValid && jsCheck(literal, sub, code);
        }
    }
    return {
        isValid: isValid,
        sub: sub,
    };
}

function equalityCheck(literal, sub) {
    let leftArg = literal["args"][0];
    let rightArg = literal["args"][1];
    // console.log("Args:");
    // console.log(leftArg);
    // console.log(rightArg);
    // console.log(rightArg["name"].match(jsRE));
    if (!leftArg["isAssigned"] && Object.keys(sub).includes(leftArg["name"])) {
        leftArg = {
            index: leftArg["index"],
            name: leftArg["name"],
            isAssigned: true,
            value: sub[leftArg["name"]],
            muted: leftArg["muted"],
        };
        // console.log("Assgn left");
    }
    if (!rightArg["isAssigned"] && Object.keys(sub).includes(rightArg["name"])) {
        rightArg = {
            index: rightArg["index"],
            name: rightArg["name"],
            isAssigned: true,
            value: sub[rightArg["name"]],
            muted: rightArg["muted"],
        };
        // console.log("Assgn right");
    }
    // console.log(rightArg["name"]);
    if (!leftArg["isAssigned"] && !rightArg["isAssigned"]) {
        // console.log("What?");
        return {
            isValid: false,
            unifier: undefined,
        };
    }
    if (leftArg["isAssigned"] && rightArg["isAssigned"]) {
        // const parser = ;
        // console.log(leftArg["value"] + " === " + rightArg["value"]);
        return {
            isValid: numParser(leftArg["value"] + " === " + rightArg["value"]).call(),
            unifier: undefined,
        };
    }
    if (leftArg["isAssigned"]) {
        const unifier = {};
        unifier[rightArg["name"]] = numParser(applyToString(leftArg["value"], sub)).call();
        // console.log(unifier);
        return {
            isValid: true,
            unifier: unifier,
        };
    }
    const unifier = {};
    // console.log("Here!");
    unifier[leftArg["name"]] = numParser(applyToString(rightArg["value"], sub)).call();
    // console.log("Equality sub:"); // TODO update equality so as to allow for operations with variables.
    // console.log(sub);
    // console.log(unifier);
    return {
        isValid: true,
        unifier: unifier,
    };
}

function inequalityCheck(literal, sub) {
    let leftArg = literal["args"][0];
    let rightArg = literal["args"][1];
    if (!leftArg["isAssigned"] && Object.keys(sub).includes(leftArg["name"])) {
        leftArg = {
            index: leftArg["index"],
            name: leftArg["name"],
            isAssigned: true,
            value: sub[leftArg["name"]],
            muted: leftArg["muted"],
        };
    }
    if (!rightArg["isAssigned"] && Object.keys(sub).includes(rightArg["name"])) {
        rightArg = {
            index: rightArg["index"],
            name: rightArg["name"],
            isAssigned: true,
            value: sub[rightArg["name"]],
            muted: rightArg["muted"],
        };
    }
    if (!leftArg["isAssigned"] || !rightArg["isAssigned"]) {
        return false;
    }
    return numParser(leftArg["value"] + " < " + rightArg["value"]).call();
}

/*
How is a JS predicate executed?
1. Split the code part to chunks, where each chunk is a corresponding javascript function
2. When you have a sub available, go get each JS literal, apply sub and execute the corresponding function.

Assume you have a function like the one below:
function foo(arg1, arg2) {
    // crazy stuff
}
What you actually need to do is replace anywhere in "crazy stuff" the values provided by your substitution and then just define a function with that strings --- which will be called.

!!! This blocks calling a function from another function --- you may need to allow for this in some next release.

In order to replace an argument's name, say arg1, with its value, say x, you have to find and replace any substring 'arg1' that is not preceded by some \w --- and, naturally, no \w 
precedes it.
*/

function jsCheck(literal, sub, code) {
    const name = literal["name"].substring(1, literal["name"].length);
    const functionObject = code[name];
    if (literal["args"].length !== functionObject["args"].length) {
        return false;
    }
    let source = functionObject["source"];
    for (let i=0; i<literal["args"].length; i++) {
        const variable = literal["args"][i];
        // console.log(variable);
        // console.log(sub);
        if (variable["isAssigned"]) {
            source = "let " + functionObject["args"][i] + ' = "' + variable["value"] + '";\n' + source;
            continue;
        }
        if (!Object.keys(sub).includes(variable["name"])) {
            // console.log("Here");
            return false;
        }
        // const varRE = RegExp(String.raw`((?<!\w)(` + functionObject["args"][i] + String.raw`))(?!\w)`, "g");
        // console.log(varRE);
        // console.log(sub[variable["name"]]);
        // source = source.replaceAll(varRE, '"' + sub[variable["name"]] + '"');
        source = "let " + functionObject["args"][i] + ' = "' + sub[variable["name"]] + '";\n' + source;
    }
    // console.log(source);
    return Function(source).call();
}

function numParser(string) {
    // console.log(string);
    return Function('"use strict"; return (' + string + ');');
}

function applyToString(string, sub) {
    if (sub === undefined || Object.keys(sub).length === 0) {
        return "false";
    }
    string = string.trim();
    for (const variable of Object.keys(sub)) {
        const varRE = RegExp(String.raw`((?<!\w)(` + variable + String.raw`))(?!\w)`, "g");
        const oldString = string;
        string = string.replaceAll(varRE, sub[variable]);
        // console.log(string);
        if (string === oldString) {
            return "false;";
        }
    }
    // console.log(string);
    return string;
}