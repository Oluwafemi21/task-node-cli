#!/usr/bin/env node

const fs = require('fs');
const readline = require("readline");

// function generateId = () => {
//     return
// }

/**
 * @param {Object[]} arr 
 * @param {string} id 
 */
function findTaskByIndex(arr, id) {
    return arr.findIndex(task => task.id === parseInt(id))
}

/**
 * @param {Object[]} arr 
 * @param {string} id 
 */
function findTaskById(arr, id) {
    return arr.find(task => task.id === parseInt(id))
}

/**
 * @param {Object[]} arr 
 * @param {string} id 
 * @param {string} taskDescription 
 */
function findTaskAndUpdate(arr, data) {
    let id = data[0] // task id is the first argument
    let taskDescription = data[1] // task description is the second argument
    let taskIndex = findTaskByIndex(arr, id)
    let task = findTaskById(arr, id)
    if (!task) {
        console.log('Task not found')
    }

    task.description = taskDescription
    task.updatedAt = new Date().toISOString();

    arr.splice(taskIndex, 1, task)
    return arr;
}

const uniqueId = (arr) => {
    if (arr.length > 0) {
        return arr[arr.length - 1].id + 1
    }
    return 1
}

/**
 * @param {Object[]} arr 
 * @param {string} id 
 */
function addTask(arr, description) {
    let id = uniqueId(arr)
    arr.push({
        id,
        description,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    })
    console.log(`Task added successfully (ID: ${id})`)
    return arr
}


/**
 * @param {Object[]} arr 
 * @param {string} id 
 */
function deleteTask(arr, id) {
    let tasks = [...arr];
    let taskIndex = findTaskByIndex(arr, id)
    if (taskIndex === -1) {
        console.log('Task does not exist')
    }

    tasks.splice(taskIndex, 1)
    return tasks
}

/**
 * @param {string} status 
 * @param {Object[]} arr 
 * @param {string} id 
 */
function updateStatus(status, arr, data) {
    let id = data[0] // task id is the first argument
    let taskIndex = findTaskByIndex(arr, id)
    let task = findTaskById(arr, id)
    if (!task) {
        console.log('Task not found')
        return arr
    }

    task.status = status
    task.updatedAt = new Date().toISOString();

    arr.splice(taskIndex, 1, task)
    return arr;
}


function listTasks(arr, data) {
    const filterStatus = data[0]
    if (filterStatus && arr.length > 0) {
        return arr.filter(task => task.status === filterStatus)
    } else {
        return arr
    }
}

function readFile(filePath) {
    const raw = fs.readFileSync(filePath, { encoding: "utf8", flag: "a+" });

    if (!raw) {
        return { data: [], filePath }
    }
    const config = JSON.parse(raw);

    return { data: config, filePath }
}


function updateConfig(data, filePath, fn, input) {

    // handle updates here depending on the fn type
    let action = fn
    let update;

    switch (action) {
        case 'add':
            update = addTask(data, input[0]);
            break
        case 'update':
            update = findTaskAndUpdate(data, input)
            break
        case 'delete':
            update = deleteTask(data, input)
            break
        case 'mark-in-progress':
            update = updateStatus('in-progress', data, input)
            break
        case 'mark-done':
            update = updateStatus('done', data, input)
            break
        case 'list':
            update = listTasks(data, input)
            console.log(update)
            break
        default:
            console.log("Invalid action");
            process.exit(1);
    }

    if (action !== 'list') {
        fs.writeFileSync(filePath, JSON.stringify(update, null, 2))
    }

}



// Read args from the terminal
// Parsing flags
let features = [
    'add',
    'update',
    'delete',
    'mark-in-progress',
    'mark-done',
    'list'
];

function parseArgs(argv) {
    const flags = {};

    const identifier = []
    const input = [];

    for (let i = 0; i < argv.length; i++) {

        const token = argv[i];

        if (token.startsWith('--')) {


            const [key, value] = token.slice(2).split('=');


            if (value !== undefined) {


                flags[key] = value;


            } else {


                const next = argv[i + 1];


                if (next && !next.startsWith('-')) {


                    flags[key] = next;


                    i++;


                } else {


                    flags[key] = true;


                }


            }


        } else if (token.startsWith('-')) {


            const letters = token.slice(1).split('');


            letters.forEach((l) => (flags[l] = true));


        } else if (features.includes(token)) {
            identifier.push(token);
        } else {
            input.push(token)
        }

    }

    return { identifier, input };

}


// Create an interface tied to stdin and stdout
const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Gracefully exit
prompt.on("SIGINT", () => {
    console.log("\nCanceled.");

    prompt.close();

    process.exit(130); // 128 + SIGINT
});



// auto-run cli
try {
    const { data, filePath } = readFile('./mini-db.json')

    const { identifier, input } = parseArgs(process.argv.slice(2));

    let functionName = identifier[0];
    let inputValue = input;

    updateConfig(data, filePath, functionName, inputValue);

    process.exit(1)

} catch (err) {

    console.error('Failed to update config:', err);

    process.exit(1);

}




