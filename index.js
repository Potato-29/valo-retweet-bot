require('dotenv').config();
// const { data } = require('cheerio/lib/api/attributes.js');
// const { TwitterApi } = require("twitter-api-v2");
// const config = require("./config.js");
const fs = require("fs");
const path = require('path');
const twit = require('./twit');


const paramsPath = path.join(__dirname, 'params.json')


// const client = new TwitterApi(config)


function writeParams (data) {
    console.log("writing params file ", data);
    return fs.writeFileSync(paramsPath, JSON.stringify(data));
}


function readParams () {
    console.log("reading params");
    const data = fs.readFileSync(paramsPath);
    return JSON.parse(data.toString());
}

function getTweets (since_id) {
    return new Promise((resolve, reject) => {
        let params = {
            q: "#ValorantClips",
            count: 10,
        };
        if (since_id) {
            params.since_id = since_id;
        }
        console.log("getting the tweets", params)
        twit.get('search/tweets', params, (err, data) => {
            if(err) {
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

function postRetweet (id) {
    return new Promise((resolve, reject) => {
        let params = {
            id,
        };
        twit.post('statuses/retweet/:id', params, (err, data) =>{
            if(err) {
                return reject(err)
            } else {
                return resolve(data)
            }
        })
    });
}


async function main () {
    try {
        const params = readParams();
        const data = await getTweets(params.since_id);
        const tweets = data.statuses;
        console.log('we got ', tweets.length);
        for await (let tweet of tweets) {
            try {
                await postRetweet(tweet.id_str);
                console.log("retweet done " + tweet.id_str)
            } catch(e) {
                console.log("unsuccessful ", + tweet.id_str)
            }
            params.since_id = tweet.id_str;
        }
        writeParams(params);
    } catch(e) {
        console.error(e);
    }
}


console.log("bot starting")
setInterval(main, 10000)