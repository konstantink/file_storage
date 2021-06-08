# File storage
### Description
This is a simple web app that allows you to upload files. It uses AWS services such as DynamoDB to store user and files
data and S3 where files are actually stored.
### What can be improved
* Implement sign up/logout functionality. At the moment users should be manually added to DB
* Improve error handling in UI part
* Provide better feedback to the user of what is going on
* Use Cognito to user management
* Use some UI framework to make it look prettier
## How to run
Use latest version of Python.
To run backend part go to the root folder and run following commands:
```bash
pip install -r requirements.txt
cd api.com
export APIDOTCOM_SECRET_KEY=<SOME_RANDOM_STRING>
uvicorn app:app
```

To run frontend part from the root folder run:
```bash
cd web
yarn start
```

Once everything is up and running you should be able to access the app via `http://localhost:3000`.