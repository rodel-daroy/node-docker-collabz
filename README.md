# Collabz API

## Docker-compose
If you're using Docker
```sh
$ docker-compose up
```

## Install Dependencies:

```
brew install mongod
brew install redis
```

```
npm install
```

## Prerequisite

Create nodemon.json (example values used by test suite):

```

```

Run nodemon to have the server restart after a file change.
```
npm install -g nodemon
nodemon
```


## Run the application:

Start the mongodb server
```
mongod
```
(or launch it using a background process)

Start the application server
```
nodemon
```

### Heroku
```
git remote add heroku git@heroku.com:collabz-api.git
git push heroku master

```

## Run the tests:
```
npm test
```
