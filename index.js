const Twit = require('twit');

// Upload .env variables into process.env
require('dotenv').config();

const {
    CONSUMER_KEY,
    CONSUMER_SECRET,
    ACCESS_TOKEN,
    ACCESS_TOKEN_SECRET,
} = process.env;

const bot = new Twit({
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    access_token: ACCESS_TOKEN,
    access_token_secret: ACCESS_TOKEN_SECRET,
    timeout_ms: 60*1000,
})

const likeTweet = (id) => {
    bot.post('favorites/create', { id }).then((res) => console.log(res.data.errors));
};

const stream = bot.stream('statuses/filter', { track: ['Kyiv', 'Kiev'].join() });
const re = /\b(Kyiv|Kiev)\b/i;

stream.on('tweet', (tweet) => {
    const { text = '', extended_tweet } = tweet;
    let fullText = '';

    if (extended_tweet) {
        fullText = extended_tweet.full_text || '';
    }

    if (re.test(text) || re.test(fullText)) {
        likeTweet(tweet.id_str);
    }
});
