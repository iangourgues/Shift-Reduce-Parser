// hard-coded shift-reduce table
const actionTable = {
    "0": {"id": "S5", "(": "S4"},
    "1": {"+": "S6", "$": "accept"},
    "2": {"+": "R2", "*": "S7", ")": "R2", "$": "R2"},
    "3": {"+": "R4", "*": "R4", ")": "R4", "$": "R4"},
    "4": {"id": "S5", "(": "S4"},
    "5": {"+": "R6", "*": "R6", ")": "R6", "$": "R6"},
    "6": {"id": "S5", "(": "S4"},
    "7": {"id": "S5", "(": "S4"},
    "8": {"+": "S6", ")": "S11"},
    "9": {"+": "R1", "*": "S7", ")": "R1", "$": "R1"},
    "10": {"+": "R3", "*": "R3", ")": "R3", "$": "R3"},
    "11": {"+": "R5", "*": "R5", ")": "R5", "$": "R5"}
};

//gotoTable for next state after reduction
const gotoTable = {
    "0": {"E": 1, "T": 2, "F": 3},
    "4": {"E": 8, "T": 2, "F": 3},
    "6": {"T": 9, "F": 3},
    "7": {"F": 10}
};

//parsing function
function parse() {
    //get the input from webpage and trim the whitespace
    let input = document.getElementById('expression').value.trim().replace(/\s+/g, '') + '$';
    let tokens = tokenize(input);
    // start stack at state 0
    let stack = ['0'];
    let index = 0;
    let step = 0;

    const stepsTable = document.getElementById('steps');
    stepsTable.innerHTML = '';  // clears the previous steps

    //proccess all tockens until end of input
    while (index < tokens.length) {
        const state = stack[stack.length - 1];
        const token = tokens[index];
        const action = actionTable[state] && actionTable[state][token];

        //create new row and show parsing steps
        const row = stepsTable.insertRow();
        row.insertCell().innerText = ++step;
        row.insertCell().innerText = stack.join(' ');
        row.insertCell().innerText = tokens.slice(index).join(' ');
        row.insertCell().innerText = action || "error";

        //handle each action on the action table
        if (!action) {
            alert("Error in parsing process. No valid action for token '" + token + "' in state " + state);
            break;
        } else if (action.startsWith('S')) {
            //push token and state
            stack.push(token);
            stack.push(action.substring(1));
            index++;
        } else if (action.startsWith('R')) {
            //apply grammar rule and update
            const ruleNumber = parseInt(action.substring(1), 10);
            let lhs, popCount;
            switch (ruleNumber) {
                case 1: case 2: lhs = "E"; popCount = ruleNumber === 1 ? 3 : 1; break;
                case 3: case 4: lhs = "T"; popCount = ruleNumber === 3 ? 3 : 1; break;
                case 5: case 6: lhs = "F"; popCount = ruleNumber === 5 ? 3 : 1; break;
            }
            stack.splice(-2 * popCount, 2 * popCount);
            stack.push(lhs);
            const newState = gotoTable[stack[stack.length - 2]][lhs];
            stack.push(newState);
        } else if (action === 'accept') {
            alert("Parsing successful!");
            break;
        }
    }
}

//tokenize function
function tokenize(input) {
    const regex = /id|[+*()]|\$+/g;
    return input.match(regex) || [];
}