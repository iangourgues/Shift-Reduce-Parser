//hard-coded shift reduce table
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

let actions = [];
let currentActionIndex = 0;
let step = 0;

//parsing function
function parse() {
        //get the input from webpage and trim the whitespace
    let input = document.getElementById('expression').value.trim().replace(/\s+/g, '') + '$';
    let tokens = tokenize(input);
    let stack = ['0'];
    let index = 0;

    const stepsTable = document.getElementById('steps');
    stepsTable.innerHTML = ''; 

    clearHighlights();

    actions = [];
    currentActionIndex = 0;
    step = 0;

    actions.push({step: ++step, stack: stack.join(' '), input: tokens.slice(index).join(' '), logAction: "Start at state 0", state: "0", symbol: ""});

    //proccess all tockens until end of input
    while (index < tokens.length) {
        const state = stack[stack.length - 1];
        const token = tokens[index];
        const action = actionTable[state] && actionTable[state][token];
        let logAction = "";

        //handle each action on the action table
        if (!action) {
            alert("Error in parsing process. No valid action for token '" + token + "' in state " + state);
            logAction = "error";
            actions.push({step: ++step, stack: stack.join(' '), input: tokens.slice(index).join(' '), logAction, state, symbol: token});
            break;
        } else if (action.startsWith('S')) {
            //push token and state
            const nextState = action.substring(1);
            logAction = `Shift input. Go to state ${nextState}`;
            stack.push(token);
            stack.push(nextState);
            index++;
        } else if (action.startsWith('R')) {
            //apply grammar rule and update
            const ruleNumber = parseInt(action.substring(1), 10);
            let lhs, popCount;
            switch (ruleNumber) {
                case 1: lhs = "E"; popCount = 3; break;
                case 2: lhs = "E"; popCount = 1; break;
                case 3: lhs = "T"; popCount = 3; break;
                case 4: lhs = "T"; popCount = 1; break;
                case 5: lhs = "F"; popCount = 3; break;
                case 6: lhs = "F"; popCount = 1; break;
            }
            stack.splice(-2 * popCount, 2 * popCount); //pop the stack
            stack.push(lhs);
            const newState = gotoTable[stack[stack.length - 2]][lhs];
            stack.push(newState);
            logAction = `Reduce using production rule ${ruleNumber}. Go to state ${newState}`;
        } else if (action === 'accept') {
            logAction = "Accept the input.";
        }

        actions.push({step: ++step, stack: stack.join(' '), input: tokens.slice(index).join(' '), logAction, state, symbol: token});

        if (action === 'accept') {
            break;
        }
    }

    //navigation buttons
    document.getElementById("nextStepButton").disabled = false;
    document.getElementById("lastStepButton").disabled = false;
    document.getElementById("previousStepButton").disabled = true; 
    nextStep(); // start at first step
}

//update function
function updateStep(stepIndex) {
    clearHighlights(); 

    const stepsTable = document.getElementById('steps');
    stepsTable.innerHTML = ''; 

    for (let i = 0; i <= stepIndex; i++) {
        const {step, stack, input, logAction, state, symbol} = actions[i];

        //highlight cell
        highlightTable(state, symbol, logAction);

        const row = stepsTable.insertRow();
        row.insertCell().innerText = step;
        row.insertCell().innerText = stack;
        row.insertCell().innerText = input;
        row.insertCell().innerText = logAction;
    }

    document.getElementById("previousStepButton").disabled = (stepIndex === 0);
    document.getElementById("nextStepButton").disabled = (stepIndex === actions.length - 1);
    document.getElementById("lastStepButton").disabled = (stepIndex === actions.length - 1);
}

function nextStep() {
    if (currentActionIndex < actions.length - 1) {
        currentActionIndex++;
        updateStep(currentActionIndex);
    }
}

function previousStep() {
    if (currentActionIndex > 0) {
        currentActionIndex--;
        updateStep(currentActionIndex);
    }
}

function lastStep() {
    currentActionIndex = actions.length - 1;
    updateStep(currentActionIndex);
}

//tokenize function
function tokenize(input) {
    const regex = /id|[+*()]|\$+/g;
    return input.match(regex) || [];
}

function highlightTable(state, symbol, logAction) {
    clearHighlights();

    let cellId = `${state}-${symbol}`;
    let cell = document.getElementById(cellId);

    if (symbol === "" && state === "0") {
        return;
    }

    if (cell) {
        if (logAction === "Accept the input.") {
            cell.classList.add('highlight-green');
        } else if (logAction === "error") {
            cell.classList.add('highlight-red');
        } else {
            cell.classList.add('highlight');
        }
    } else {
        console.log("Failed to highlight cell with ID:", cellId);
    }
}

function clearHighlights() {
    document.querySelectorAll('.highlight, .highlight-green, .highlight-red').forEach(cell => {
        cell.classList.remove('highlight', 'highlight-green', 'highlight-red');
    });
}