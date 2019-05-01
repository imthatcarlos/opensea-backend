### Setup
Make sure redis is installed on your machine, and have running on another terminal
```
$ brew install redis
$ redis-server
```

Install dependencies and run (port 8081)
```
$ npm i
$ npm run start
```

### Summary
The CRUD endpoints are pretty simple, I used redis to store URLs for names, and keep track of all added names in a set in order to avoid using the `KEYS` property of the cache (not recommended for production).

The `/annotate` endpoint was the biggest chunk of work, mostly because it isn't trivial how to parse the given HTML and traverse the nodes in order to find/replace strings. I ended up using a recursive function to traverse the parsed html tree in a depth-first fashion, only processing nodes that contained pure text, and simply doing a lookup with regex to find strings that needed to be replaced. I should note that the library I used to parse html `node-html-parser` uses regex under the hood to parse the html. As I understood, the instructions mentioned not to use regex on the document to do the lookup, but to actually traverse the nodes in the tree.

To improve efficiency, I initially tried wrapping some functionality in promises, for example I wanted to process a node's children asynchronously since the output of that processing wouldn't be dependent on each other, however it became a mess when trying to re-create or modify the tree so everything is done synchronously.

### Complexities
For all of these, N is the number of names

- `PUT /names/:name` has a space complexity of O(n+1) as its space increases linearly and we are keeping track of all names under a `names` key. Time complexity is O(2) for this reason

- `GET /names/:name` has a space complexity of O(n+1) for the reason above and time complexity of O(1) since we are only retrieving one key

- `DELETE /names` has a space complexity of O(n+1) for the same reason and time complexity of O(n+1) for the same reason

- `POST /annotate` recursive functions generally have a space complexity of O(recursion depth), and I use DFS algo to traverse html nodes so it would be O(N) where N is the number of html elements processed (that are not `<a>` tags or children of `<a>` tags). Time complexity is also O(N)
