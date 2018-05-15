#!/usr/bin/env node
const swarm = require('discovery-swarm');
const defaults = require('dat-swarm-defaults');
const readLine = require('readline');
const userName = require('os').userInfo().username;
const PassThrough = require('stream').PassThrough;
const moment = require('moment');
const chalk = require('chalk');
const crypto = require('crypto');
const channelName = process.argv[2];
const channelHash = crypto.createHash('sha256').update(channelName, 'utf8').digest().toString('hex');
const myChannelFeed = new PassThrough({ objectMode: true });
const discoverySwarm = swarm(defaults());
discoverySwarm.listen();
discoverySwarm.join(channelHash);
discoverySwarm.on('connection', (stream) => {
    readLine
    .createInterface({input: stream, crlfDelay: Infinity})
    .on('line', line => {
        const msg = JSON.parse(line)
        const ts = chalk.green((moment(msg.ts)).format('ddd, hh:mm:ssA'))
        const from = chalk.yellow(userName)
        const body = chalk.white(msg.body)

        console.info(`\r[${ts}] ${from}: ${body}`)
        user.prompt(true)
    })
    myChannelFeed.pipe(stream);
});
const user = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${userName}> `
});
user.on('line', line => {
    if (line.trim().length > 0) {
        myChannelFeed.write(JSON.stringify({userName: userName, body: line, ts: moment().valueOf()}) + '\n');
    }
    user.prompt(true);
});
user.prompt(true);