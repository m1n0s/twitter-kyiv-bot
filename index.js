const Twit = require('twit');
const mongoose = require('mongoose');

// Upload .env variables into process.env
require('dotenv').config();

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  ACCESS_TOKEN,
  ACCESS_TOKEN_SECRET,
  MONGO_CONNECT,
} = process.env;

mongoose.connect(MONGO_CONNECT, { useMongoClient: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;
const Tweet = mongoose.model('Tweet', { data: Object });

db.once('open', () => console.log('connection to DB established'));

const bot = new Twit({
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  access_token: ACCESS_TOKEN,
  access_token_secret: ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
});

const likeTweet = (tweet) => {
  const { id_str: id } = tweet;

  bot.post('favorites/create', { id }).then((res) => {
    const { errors } = res.data;

    if (errors) {
      console.log(errors);
    } else {
      const tweetRecord = new Tweet({ data: tweet });

      tweetRecord.save().then(() => console.log('tweet saved'));
    }
  });
};

const stream = bot.stream('statuses/filter', { track: ['Kyiv', 'Kiev'].join() });
const re = /\b(Kyiv|Kiev)\b/i;

stream.on('tweet', (tweet) => {
  const { text = '', extended_tweet } = tweet;
  let fullText;

  if (extended_tweet) {
    fullText = extended_tweet.full_text || '';
  }

  if (re.test(text) || re.test(fullText)) {
    likeTweet(tweet);
  }
});
