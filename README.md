## Auth0 REST Server

### Running RestFlex Server

The easiest way to run RestFlex is with Docker. For example, if you were developing an application that needed a repository for recipes, you would first create a MongoDB instance to hold your data:

```bash
docker run --name projects-db \
  -p 27017:27017 \
  --network digituz \
  -d mongo
```

Then, you would run a dockerized instance of RestFlex as follows:

```bash
DOMAIN=projects

docker run --name $DOMAIN-api \
  -e "DOMAIN=$DOMAIN" \
  -e "MONGODB_URL=$DOMAIN-db:27017/$DOMAIN" \
  -e "AUTH0_DOMAIN=digituz-corp.auth0.com" \
  -e "AUTH0_AUDIENCE=https://$DOMAIN.digituz.com.br" \
  --network digituz \
  -p 3001:80 \
  -d digituz/rest-flex
```

You can find an explanation to the environment variables set above here:

- `DOMAIN`: This variable defines the domain that RestFlex will use to validate scopes. That is, if you set `recipes` here, RestFlex will accept only `access_tokens` with `get:recipes`, `delete:recipes`, `post:recipes`, and `put:recipes`.
- `AUTH0_DOMAIN`: [This is the domain of your Auth0 account](https://manage.auth0.com/). For example: `digituz-corp.auth0.com`.
- `AUTH0_AUDIENCE`: [This is the audience/identifier that represents this API on Auth0](https://manage.auth0.com/#/apis). For example: `https://recipes.digituz.com.br`.
- `MONGODB_URL`: this variable defines the URL of a MogoDB instance to persist your data. You can host your own MongoDB locally or on the cloud (e.g. [mLab](https://mlab.com/)).

### What is RestFlex?

This is a flexible [Koa](koajs.com) REST API secured by Auth0. By flexible, I mean that you don't have to do anything to get a server capable of creating, updating, retrieving, and removing JSON objects. To be even more clear, let's say that you are going to start developing a new SPA with Angular that is going to enable users to manage (CRUD) recipes. As expected, this SPA app will need a backend to persist this data. And, of course, you need this data to be secure.

In this situation, what you could do is to tailor a backend to fulfill our needs, or you could use this project to hold your data. How does this works? Simple, you develop the Angular app and integrate it with an Auth0 Client to retrieve an `access_token` loaded with some scopes (e.g. `get:recipes delete:recipes`). After that, you can issue HTTP requests to this backend.

At this point, you might be wondering: how exactly Auth0 secures this data? That's also simple. It' based on conventions. In the example above, if you get an `access_token` loaded with both `get:recipes` and `delete:recipes` scopes, the backend will only accept `GET` and `DELETE` requests targeting the `/recipes` endpoint.

Another important characteristic of this REST server is that data is persisted on separated collections per user and entity. What this means is that if a user with id `1234` submits a JSON object to `recipes`, this objects will be persisted on a collection called `1234/contracts`. Note that this also means that users issuing `GET` requests to `recipes` will receive only their data.

### Summarizing

To summarize: a user with id `xyz123` and scopes `get:books`, `post:books`, and `delete:books` will be able to:

- `GET` all documents in the `xyz123/books` collection through the `http://localhost:3001/books` endpoint.
- `GET` one document, with id `987`, from the `xyz123/books` collection through the `http://localhost:3001/books/987` endpoint.
- `POST` a new document through `http://localhost:3001/books/`.
- `DELETE` the document with id `987` through `http://localhost:3001/books/987`.

This user would not be able to update a book because he doesn't have a token with the `put:books` scope.

### Running with Node.js

Another way to run RestFlex is through Node.js directly. To do this, just set the environment variables expected by RestFlex and issue `npm start` from this directory:

```bash
export DOMAIN=recipes
export AUTH0_DOMAIN=digituz-corp.auth0.com
export AUTH0_AUDIENCE=https://digituz-corp.auth0.com/recipes
export MONGODB_URL=localhost:27017

npm start
```

### Updating Docker Hub Image

There is a script that builds the image, generates the tag, and push it to Docker Hub:

```bash
./bin/docker-push.sh
```
