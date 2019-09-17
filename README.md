# Simple Blog on Prisma with Authentication & Permissions

This example shows how to implement a **GraphQL server with an email-password-based authentication workflow and authentication rules**, based on Prisma, [graphql-yoga](https://github.com/prisma/graphql-yoga), [graphql-shield](https://github.com/maticzav/graphql-shield) & [GraphQL Nexus](https://nexus.js.org/).

## How to use

### 1. Clone and install dependecies

```
git clone https://github.com/goodok21/prisma2-upload-files
cd prisma2-upload-files
yarn
```

### 2. Start and open Playground

```
yarn start
```

...and open your browser http://localhost:4000

### 3. Some GraphQL queries and mutations:

```
mutation SignUp {
  signup(
    name: "Name"
    email: "test@test.ru"
    password: "password"
  ) {
    user {
      id
      name
    }
    token
  }
}


mutation Auth {
  login(
    email: "emmx@mail.ru",
    password:"password"
  ) {
    user {
      id
      name
    }
    token
  }
}

# Set "Authorization: Bearer <token>" header in playground
query me {
  me {
    id
    name
    email
    posts {
      id
    }
  }
}

mutation publishPost {
  publish (
    id: "ck0mjbvzb0002ljpj72ygcuhd"
  ) {
    id
  }
}

mutation createPost {
  createDraft(
    title: "Title"
    content: "Content"
  ) {
    id
    published
    author {
      id
      name
      email
    }
  }
}
```

### 4. Upload files

To upload file use cURL:

```
curl localhost:4000/ \
  -F operations='{ "query": "mutation ($file: Upload!) { singleUpload(file: $file) { id } }", "variables": { "file": null } }' \
  -F map='{ "0": ["variables.file"] }' \
  -F 0=@file.png
```