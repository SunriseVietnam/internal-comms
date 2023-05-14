import {createModal} from "./modalFilesEdit.js";
import {currentUser, executorsList} from "./data.js";
import "./headerProfile.js";

let currentDate = new Date;
currentDate.setTime(Date.now());
document.getElementById('expires').min = currentDate.toISOString().slice(0, 10);

let currentFiles = [];
let currentExecutors = [];

const modalWinFiles = createModal('edit-files');
const modalWinPeople = createModal('edit-executors');

editButtonsLogic(modalWinFiles, currentFiles);
editExecutorsButtons(modalWinPeople);

var targets = document.querySelectorAll('.modal');
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function () {
        updateFilesList();
        updateExecutorsList();
        validateForm();
    });
});
var config = {attributes: true};
targets.forEach(target => observer.observe(target, config));
createExecutorsList();

const minLengthDescr = 50;
const maxLengthDescr = 1000;
const minLengthName = 10;

const textarea = document.querySelector('textarea');
textarea.maxLength = maxLengthDescr;
document.getElementById('max-desc-length').textContent = maxLengthDescr;
textarea.oninput = function () {
    document.getElementById('desc-length').textContent = this.value.length
    if (this.value.length >= minLengthDescr) {
        document.getElementById('desc-length').classList.remove('invalid');
    } else {
        document.getElementById('desc-length').classList.add('invalid');
    }
};

const serverURL = 'http://localhost:8080/tasks'; //'https://jsonplaceholder.typicode.com/posts';

const submitButton = document.getElementById('submit-button');
submitButton.onclick = async function () {
    try {
        const project = {
            name: document.getElementById('name').value,
            priority: document.getElementById('prior-range').value,
            deadline: document.getElementById('expires').value,
            description: document.getElementById('description').value,
            //files: currentFiles,
            groups: currentExecutors,
            owner: currentUser
        };
        console.log(JSON.stringify(project));
        let response = (await fetch(serverURL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(project),
            headers: {'Content-Type': 'application/json'}
        })).json();
        console.log(response);
    }catch (error) {
        console.error('Error: ', error);
    }
};

// functions

function validateForm () {
    const projectName = document.getElementById('name').value;
    const deadline = document.getElementById('expires').value;
    const description = document.getElementById('description').value;
    document.getElementById('submit-button').disabled = !(projectName.length >= minLengthName && deadline !== "" && description.length >= minLengthDescr && currentExecutors.length > 0);
}

// EXECUTORS PART ---------------------------------------------------
function updateExecutorsList() {
    const listSpan = document.querySelector('.project-executors__list');
    listSpan.textContent = '';
    currentExecutors.forEach(employee => {
        var element = document.createElement('li');
        element.textContent = `${employee.name} | ${employee.group}, `;
        listSpan.appendChild(element);
    });
}

function createExecutorsList() {
    const optList = document.getElementById('load-executors');
    console.log(optList);
    for (const employee of executorsList) {
        var option = document.createElement('option');
        option.value = JSON.stringify(employee);
        option.textContent = `${employee.name} | ${employee.group}`;
        optList.appendChild(option);
    }
}

function editExecutorsButtons(modalWin) {
    const executorsEditButton = document.querySelector('.action-file.executors');
    executorsEditButton.addEventListener('click',
        function () {
            modalWin.show();
            const inputExecutor = document.getElementById('load-executors');
            inputExecutor.onchange = function () {
                const employeeObj = JSON.parse(inputExecutor.value);
                if (currentExecutors.every(value => {return value.name != employeeObj.name || value.group != employeeObj.group})) {
                    currentExecutors.push(employeeObj);
                    drawExecutorsListAdd();
                }
                this.value = '';
            };
            drawExecutorsListAdd();
        });
}

function drawExecutorsListAdd() {
    const list = document.querySelector('.modal__body .executors-list');
    list.innerHTML = '';
    for (const employee of currentExecutors) {
        const element = document.createElement('li');
        element.classList.add('file');
        element.innerHTML = `<span class="executor">${employee.name} | ${employee.group}</span><span class="executor-delete">удалить</span>`;
        element.querySelector('.executor-delete').onclick = function () {
            currentExecutors = currentExecutors.filter(value => {return value.name != employee.name || value.group != employee.group});
            drawExecutorsListAdd();
        };
        list.appendChild(element);
        console.log(list);
    }
}

// FILES PART -----------------------------------------------------------
function updateFilesList() {
    const listSpan = document.querySelector('.project-files__list');
    listSpan.textContent = '';
    namesOfFiles(currentFiles).forEach(value => {
        var element = document.createElement('a');
        element.classList.add('project-files__list-item');
        element.textContent = `${value}, `;
        listSpan.appendChild(element);
    });
}

function namesOfFiles(files) {
    let names = [];
    for (let file of files) {
        names.push(file[0].name);
    }
    return names;
}

function delFileByName(name) {
    console.log(currentFiles);
    let result = [];
    for (let file of currentFiles) {
        if (file[0].name !== name) {
            result.push(file);
        }
        else{
            console.log(`deleted ${file[0].name}`);
        }
    }
    currentFiles = result;
    console.log(`after ${currentFiles}`);
}

function editButtonsLogic(modalWin) {
    const fileEditButton = document.querySelector('.action-file.edit');
    fileEditButton.addEventListener('click',
        function () {
            modalWin.show();
            const inputFile = document.getElementById('load-file');
            inputFile.onchange = function () {
                if (namesOfFiles(currentFiles).every(value => inputFile.files[0].name != value)) {
                    currentFiles.push(inputFile.files);
                }
                console.log(currentFiles.length);
                drawFileListAdd();
            };
            drawFileListAdd();
        });
}

function drawFileListAdd() {
    let fileNames = namesOfFiles(currentFiles);
    const list = document.querySelector('.modal__body .file-list');
    list.innerHTML = '';
    for (let name of fileNames) {
        const element = document.createElement('li');
        element.classList.add('file');
        element.innerHTML = `<span class="file-download">${name}</span><span class="file-delete">удалить</span>`;
        element.querySelector('.file-delete').onclick = function () {
            console.log(this.parentElement.querySelector('.file-download').textContent);
            delFileByName(element.querySelector('.file-download').textContent)
            drawFileListAdd();
        };
        list.appendChild(element);
    }
}