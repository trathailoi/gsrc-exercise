# Google Search Results Scraper (GSRS)

Note:
- There is a sample csv file located at [`<rootDir>/backend/sample/sample-keywords.csv`](backend/sample/sample-keywords.csv). You can use this one for testing, but any other csv files on your end with the same format should be fine also.
- You can signup from the web app UI as well as the API documentation. I am using cookie to store user session, so whether you login on the web app or API, you should be logged in on the other side.
- If you want to run this project on you local machine. Please follow the instructions below.

## Getting started

### Prerequisites
  - [NodeJs](https://nodejs.org) (>= 10.13.0, except for v13) (Mine is v17.8.0)
  - [Docker](https://www.docker.com) ([Docker Desktop](https://www.docker.com/products/docker-desktop) recommended)

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
- ... and other recommended extensions listed in [`<rootDir>/.vscode/extensions.json`](.vscode/extensions.json)
- Open the directory [`<rootDir>/backend`](backend) in a separate VSCode window to take advantage of ESLint config.

## Tasks and commands
***Note:** I'm on Mac, so those commands below may not work expectedly on Windows.*
### Frontend
- Installation & run
  1. (optional) `cp .env.development .env.development.local`
  2. `npm i`
  3. `npm run dev`
- Unit test: (*Not fully implemented yet*)
  ```bash
  npm run test:jest
  ```
- End-to-end test: *Not implemented yet, probably be using [Cypress](https://www.cypress.io/)*
- You can do the following steps to test production mode locally with virtual host:
  1. please add this line `127.0.0.1 gsrs.loi-tra` to your `/etc/hosts` (on MacOS) file
  2. run `npm run dev:docker`
     - This command will also spin up a backend container and a database container as well.
  3. open [http://gsrs.loi-tra](http://gsrs.loi-tra) on browser to see the production version locally on your machine.

### Backend (working directory: [`<rootDir>/backend`](backend))
  (*will give "**monorepo**" a try*)
- `cd <rootDir>/backend`
- Installation & run
  1. `cp .env.example .env`
  2. `npm i`
  3. start Docker on your machine
  4. `./setup.sh` --> this will check dependencies and set you up with the containers for PostgreSql, Redis and Tor
  5. `npm run start:dev`
  6. (optional) Seeding data: `npm run db:seed`.

***Note**: You can play around with the API endpoints via the swagger documentation at http://localhost:3000/api on your local machine, or https://gsrs.loitra.xyz/api/*

- Unit test:
  ```bash
  npm run test
  ```
  - this will be automatically run on Github Action on every git push or PR on branch `develop`. You can find the workflow at [https://github.com/trathailoi/gsrs-exercise/actions/workflows/unit-test.yml](https://github.com/trathailoi/gsrs-exercise/actions/workflows/unit-test.yml)
  - with coverage
  ```bash
  npm run test:cov
  ```
  find the coverage at [<rootDir>/backend/coverage/lcov-report/index.html](backend/coverage/lcov-report/index.html)
- Integration test:
  ```bash
  npm run test:e2e
  ```
  this command will spin up a new database dedicated for testing and will be completely terminated after finishing the tests.

## Commit message convention

- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `docs`: Documentation only changes
- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A code change that improves performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `test`: Adding missing tests or correcting existing tests,
- `revert`: Revert,
- `wip`: Work in progress, not finished yet
