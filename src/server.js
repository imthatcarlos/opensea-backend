import app from './app';
import redis from 'redis';
import annotate from './annotate';

const PORT = process.env.PORT || 8081;

/*
 * Start the server, listening on the given port
 */
app.listen(PORT, () => {
  console.log('express listening on port:' + PORT);
});

/*
 * PUT /names/:name
 * @param url
 */
app.put('/names/:name', (req, res) => {
  req.app.locals.redis.set(req.params.name, req.body.url);
  req.app.locals.redis.sadd('names', [req.params.name]);
  res.status(200).send();
});

/*
* GET /names/:name
*/
app.get('/names/:name', (req, res) => {
  req.app.locals.redis.get(req.params.name, (err, data) => {
    if (data && !err) {
      res.status(200).send({ name: req.params.name, url: data });
    } else {
      data === null ? res.status(404).send() : res.status(500).send();
    }
  });
});

/*
* DELETE /names/
*/
app.delete('/names', (req, res) => {
  req.app.locals.redis.flushdb((err, success) => {
    const status = success ? 200 : 500;
    res.status(status).send();
  });
});

/*
* POST /annotate
* for all root nodes in the tree
    DFS on all nodes
*     if node is hyperlink, skip it and all its children
      get node as text
      scan text for occurances of names
      replace text with hyperlink and url
      set content of node to replaced text
*/
app.post('/annotate', (req, res) => {
  // don't need atomicity, otherwise would've used multi().exec()
  req.app.locals.redis.smembers('names', (err, names) => {
    req.app.locals.redis.mget(names, async (err, urls) => {
      annotate(req.body, names, urls, (textResponse) => {
        textResponse ? res.status(200).send(textResponse) : res.status(500).send();
      });
    });
  });
})
