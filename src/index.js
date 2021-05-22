const app = require('express')();

const faunadb = require('faunadb');
const client = new faunadb.Client({
  secret: 'fnAEJgnNlBACAb28qyasCcPnnB3Jb_oXZr-0lOxG',
});

const {
  Ref,
  Select,
  Paginate,
  Get,
  Match,
  Index,
  Create,
  Collection,
  Join,
  Call,
  Function: Fn,
} = faunadb.query;

// get tweets from tweets collection (table) base on user
app.get('/tweet/:id', async (req, res) => {
  const doc = await client.query(Get(Ref(Collection('tweets'), req.params.id)));

  res.send(doc);
});

// get user by email
app.get('/tweet/', async (req, res) => {
  const doc = await client.query(
    Get(Match(Index('users_by_email'), 'rajan.moses.s@hotmail.com'))
  );

  res.send(doc);
});
//Get(Match(Index("users_by_name"), "moses rajan"))
// post the data to tweets by user, users_by_name index to users collection (table)
app.post('/tweetByuser', async (req, res) => {
  const data = {
    // Original code extracted to Fauna Function
    // Select('ref', Get(Match(Index('users_by_name'), 'fireship_dev')))
    user: Select('ref', Get(Match(Index('users_by_name'), 'rishwanth'))),
    //user: Call(Fn('getUser'), 'fireship_dev'),
    text: 'Hello Everyone, This is rishwanth2 tweet text !',
  };

  const doc = await client.query(Create(Collection('tweets'), { data }));

  res.send(doc);
});
// get tweets of particular user
app.get('/getTweetsOfUser', async (req, res) => {
  const docs = await client.query(
    Paginate(
      Match(
        Index('tweets_by_user'),
        Call(Fn('getUser'), 'rishwanth')
        //Select('ref', Get(Match(Index('users_by_name'), 'rajeev')))
      )
    )
  );

  res.send(docs);
});

app.post('/relationship', async (req, res) => {
  const data = {
    follower: Call(Fn('getUser'), 'bob'),
    followee: Call(Fn('getUser'), 'fireship_dev'),
  };
  const doc = await client.query(Create(Collection('relationships'), { data }));

  res.send(doc);
});

app.get('/feed', async (req, res) => {
  const docs = await client.query(
    Paginate(
      Join(
        Match(Index('followees_by_follower'), Call(Fn('getUser'), 'bob')),
        Index('tweets_by_user')
      )
    )
  );

  res.send(docs);
});

app.listen(5000, () => console.log('API on http://localhost:5000'));
