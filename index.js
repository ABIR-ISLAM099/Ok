console.clear();
const { spawn } = require("child_process");
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const semver = require('semver');
const readline = require('readline');
const { exec } = require('child_process');

function startBot(message) {
    (message) ? console.info(chalk.blue(message.toUpperCase())) : "";

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "--no-warnings", "main.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        if (codeExit != 0 || global.countRestart && global.countRestart < 5) {
            startBot("restarting server");
            global.countRestart += 1;
            return;
        } else return;
    });

    child.on("error", function(error) {
        console.error("an error occurred : " + JSON.stringify(error));
    });
}

startBot();

const currentVersion = '1.1.1';
let isApiEnabled = true; // Flag to track if API is enabled

async function checkForUpdates() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/ABIR-ISLAM099/Ok/main/package.json');
        const data = response.data;
        const latestVersion = data.version;

        if (semver.gt(latestVersion, currentVersion)) {
            console.log('New update available!');
            const userResponse = await askUserForUpdate(); // Ask user for update
            if (userResponse === 'yes') {
                isApiEnabled = false; // Disable API
                await applyUpdate(); // Apply update
                isApiEnabled = true; // Enable API after update
            } else {
                console.log('User did not want to update.!');
            }
        } else if (semver.lt(latestVersion, currentVersion)) {
            console.log('Your version is newer than GitHub.');
            isApiEnabled = false; // Disable API
        } else {
            console.log('You are using the latest version.');
            isApiEnabled = true; // Keep API enabled
        }
    } catch (error) {
        console.error('There was a problem checking for updates.:', error.message);
        isApiEnabled = false; // Disable API on error
    }
}

function askUserForUpdate() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('New update found! Update? (Yes/No): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase());
        });
    });
}

async function applyUpdate() {
    console.log('Applying update...');

    try {
        const repoUrl = 'https://github.com/ABIR-ISLAM099/Ok.git';
        const repoDir = path.join(__dirname, 'temp-repo');

        if (fs.existsSync(repoDir)) {
            await executeCommand(`git -C ${repoDir} pull`);
        } else {
            await executeCommand(`git clone ${repoUrl} ${repoDir}`);
        }

        await executeCommand(`cp -r ${repoDir}/* ${__dirname}`);

        await executeCommand(`rm -rf ${repoDir}`);

        console.log('The update was applied successfully.');
    } catch (error) {
        console.error('There was a problem applying the update.:', error.message);
    }
}

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

setInterval(checkForUpdates, 5 * 60 * 1000);

checkForUpdates();
