#!/usr/bin/env node
const swarm = require('discovery-swarm');
const hypercore = require('hypercore');
const ram = require('random-access-memory');
const defaults = require('dat-swarm-defaults');
const readLine = require('readline');
const userName = require('os').userInfo().username;
const crypto = require('crypto');
const bufferAlloc = require('buffer-alloc-unsafe');
const sodium = require('sodium-universal');
const channelName = process.argv[2];
const peerFeeds = {}
const channelFeeds = {};
const channelHash = crypto.createHash('sha256').update(channelName, 'utf8').digest().toString('hex');
const discoverySwarm = swarm(defaults({}));
discoverySwarm.listen();
discoverySwarm.join(channelHash);
discoverySwarm.on('connection', (stream, info) => {
    if (channelFeeds[info.id.toString('hex')]) {
        return;
    }
    const swarmId = channelHash + info.id.toString('hex');
    const publicKey = derivePublicKey(swarmId);
    const channelFeed = hypercore((filename) => {
        return ram();
    }, publicKey);

    channelFeeds[info.id.toString('hex')] = channelFeed;

    channelFeed.ready(() => {
        channelSwarm = swarm(defaults({
            stream: () => {
                return channelFeed.replicate({ live: true } );
            }
        }));
        channelSwarm.listen();
        channelSwarm.join(swarmId);
        const stream = channelFeed.createReadStream({ live: true } );
        readLine
        .createInterface({input: stream, crlfDelay: Infinity})
        .on('line', line => {
          console.info(`\r${line}`)
          user.prompt(true)
        })
    });
});
const myChannelFeed = hypercore((filename) => {
    return ram();
}, { seed: channelHash + discoverySwarm.id.toString('hex') });
myChannelFeed.ready(() => {
    const myChannelSwarm = swarm(defaults({
        stream: () => {
            return myChannelFeed.replicate({ live: true });
        }
    }))
    myChannelSwarm.listen();
    myChannelSwarm.join(channelHash + discoverySwarm.id.toString('hex'))
});
const myWriteStream = myChannelFeed.createWriteStream();
//jjjjjjmyWriteStream.write('hello world');
const user = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${userName}> `
});
user.on('line', line => {
    if (line.trim().length > 0) {
        myWriteStream.write(`${userName}> ${line}\r\n`);
    }
    user.prompt(true);
});
user.prompt(true);

derivePublicKey = function (seed) {
    var publicKey = bufferAlloc(sodium.crypto_sign_PUBLICKEYBYTES)
    var secretKey = bufferAlloc(sodium.crypto_sign_SECRETKEYBYTES)

    if (seed) {
      // sha256 the seed to make sure the seed is the right number of bytes
      seed = crypto.createHash('sha256').update(seed, 'utf8').digest()
      sodium.crypto_sign_seed_keypair(publicKey, secretKey, seed)
    }

    return publicKey;

}
