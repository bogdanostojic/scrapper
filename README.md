# Glassdoor api scrapper


### How to run setup
_Requirements needed to be installed:_

- Docker
- Node 14 or higher
- Optional - VSCode

---
- `cd` to the repository
- run: `docker compose up -d` 
- _If you have VScode installed, double click on: `mistho_scraper.code-workspace` and run the `API Server & Worker` debugger profile and the app should be running_ 

- alternatevly, `cd` to `api` run `npm run ts:dev`. Same for `worker` directory to run the worker repo.

- rabbitmq managment: `http://localhost:15672/`
- username/password - guest

The express  server is setup on `localhost:3000` and the endpoints are
```JavaScript
/POST   /users/create?email=<email>&password=<password>
returns: // the profile that is created for the profile
/GET    /users/?email=<email>
response:    // information stored for that email
/GET    /users/
response:    // all profiles stored in the database
/GET    /resume/?email=<email>
response:   //downloads the pdf file
```
- The `worker` service communicates with the `api` service via `rabbitmq` and stores information to a shared `MongoDB` database when it finishes getting all the data.
- If there is a error, the headless browser should close and an rabbitMQ ack isn't sent back to rabbit mq so on a restart it will retry getting information for that job in the queu ( glassdoor user )
- The `worker` service runs a `chromium` browser via `playwright`


---

### *General flow*
- First you hit the `POST /users/create?email=<email>&password=<password>` endpoint
- It should in turn trigger all the neceserry events.
- get the needed data after the worker service finishes 

---
### improvements

- PDF saving could have been a different service, in reality it would push the pdfs to a S3 or similar storage.
- Security - currently the password is in plain text, it would be for the best to use some KMS solution from a cloud provider or a shared secret in order to encrypt the data so it would be stored encrypted, but we can decrypt it from a service that needs to use it.
