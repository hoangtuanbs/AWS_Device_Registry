## CI environment (deploy to ci)
WORK dir is ./device-registry:

**NOTE**: aws-cli must be installed and configured it with Gfarming aws account
```bash
# THEN:
npm update
npm install -g serverless // install serverless frame work
serverless deploy          => deploy
serverless remove          => remove deployment
```

## Development environment
**Install**

First time:
```
// install dependency
npm install
// install serverless framework
npm install -g serverless
// install local dynamodb for this project, do it once
serverless dynamodb install
```
**Run**

```bash
serverless offline start
```
or
```
serverless offline start --host YOUR_LOCAL_HOST_IP_ADDR
```

**Stop** 

```bash
Ctrl + D
```

## Current endpoint


```
endpoints:
  POST - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/users
  GET - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/users/authenticate
  GET - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/users/email/{email}
  GET - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/users/phoneNumber/{phone_number}
  PUT - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/users
  POST - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/devices
  GET - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/devices/{device_id}
  PUT - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/devices/{device_id}/controller/{controller_id}
  PUT - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/devices/{device_id}/user/{owner_id}
  GET - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/devices/controller/{controller_id}
  GET - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/devices/user/{owner_id}
  POST - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/controllers
  GET - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/controllers/{controller_id}
  PUT - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/controllers/{controller_id}
  GET - https://vb5qlrcrj4.execute-api.eu-central-1.amazonaws.com/dev/controllers
```

#Summary of all available resources:

/users

    /validate
    
        POST: validate user
            body: 
                {
                    "user_id" : "hoangsymai",
                    "password" : "hoanggay"
                }
            res: 
                {
                    "valid": boolean
                }
    /
        POST: 
            Body
                {
                        "id": "nguyenhaidang",
                        "first_name": "dang",
                        "last_name": "nuygne",
                        "password": "asdjaskhqwe",
                        "email" ? : "129379fkjjh@gmail.com",
                        "phone_number" ?: "0465672648",   // 10-11 digits
                }
            Response:
                400: bad request
                200: success
                    {   
                        message: ""
                        user: {
                            "first_name": "dang",
                            "last_name": "nuygne",
                            "password": "asdjaskhqwe",
                            "email" ? : "129379fkjjh@gmail.com",
                            "phone_number" ?: "0465672648"
                        }
                    }
                500: resource conflict
    /emails/{email}
        GET: get all users with given email
    /phoneNumber/{phone_number}
        GET: get all users with given phone
    /{user_id}
        GET: get user info with given id
        PUT: update user, only present param with be validaded and updated
            req
                body
                    {
                        "first_name"? : "first_name",
                        "last_name"?  : "last_name",
                        "password"?   : "password",
                        "email"?       : "email",
                        "phone_number"? : "phoen_number"
                    }
    
/devices

    /
        POST:
            body:
                {
                    "owner_id" : "dangnguyen",
                    "device_id" : "a-sA-S0-9"
                }
            res:
                400: invalid owner_id, device_id
                200: success
    /controllers/{controller_id}
        GET: get all devices managed by given controller
            res:
                200
                    [
                        {
                            "id": "hoangsymai",
                            "controller_id": "cfba4218-f05d-48b0-a014-98eff22651e1",
                            "owner_id": "maisyhoang"
                        }
                    ]

    /users/{owner_id}
        GET: get all devices for user
            res:
                200
                    [
                        {
                            "id": "hoangsymai",
                            "controller_id": "cfba4218-f05d-48b0-a014-98eff22651e1",
                            "owner_id": "maisyhoang"
                        }
                    ]


    /{device_id}/controller/{controller_id}
        PUT: update controller for device
            res:
                200:
                    {
                        "id": "hoangsymai",
                        "controller_id": "cfba4218-f05d-48b0-a014-98eff22651e1",
                        "owner_id": "maisyhoang"
                    }
                400: invalid controller_id or device_id

    
/controllers

    /
        POST:register controllers
            req:
                body
                    {
                        "ipv4"
                    }
            res:
                400: dump ipv4
                200: 
                    {
                        "id" : "uuid",
                        "ipv4" : "127.0.0.1"
                    }
        GET: get all controllers
            res:
                200: 
                    [
                        {
                            "id" : "uuid",
                            "ipv4" : "127.0.0.1"                       
                        }
                    ]
    /{controller_id}
        GET: get controller by id
        POST: update controller
            req
                body
                    {
                        "ipv4" : "192.168.1.1"
                    }
            res 
                400: dump ip
                200: 
                    {
                        "id" : "uuid",
                        "ipv4" : "127.0.0.1"                       
                    }
```
