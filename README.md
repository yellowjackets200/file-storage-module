# file-storage-module

A simple file storage application using **Node.js**, **MongoDB**, **Express**, and **Mongoose**.

## Installation

Make sure you have:

1. [Node.js](https://nodejs.org/) installed.
2. A local [MongoDB] (https://www.mongodb.com) instance running.

Clone the repo and open the directory:

```sh
git clone https://github.com/yellowjackets200/file-storage-module.git
cd file-storage-module/
```

Then, install and start the application:

```sh
npm install
npm start
```

It will be listening to requests at [`http://localhost:3000/`] (http://localhost:3000/).

## API Reference

To start exploring the API and to easily create HTTP Requests, you can install [Postman] (https://www.getpostman.com).

### Upload

```
POST /file/
```

To upload a file, create a POST HTTP Request with a `multipart/form-data` content-type as following:

```
hostName: localFileSystem
file: <file-to-be-uploaded>
```

If the upload was successful, the application will return the SHA-1 hash of the document; otherwise, an error message.

### Get file

```
GET /file/:hash
```

The application will return the document; otherwise, an error message.

### Get list

```
GET /file/all
```

The application will return the list of documents uploaded so far; otherwise, an error message.

```
[
  {
    "fileName": "testfile1",
    "storageProvider": "localFileSystem",
    "hash": "6fd8377f4311c3c4cf1cb9193f57433ea270044f",
    "date": "Fri, 05 Aug 2016 18:06:18 GMT"
  },
  {
    "fileName": "testfile2",
    "storageProvider": "localFileSystem",
    "hash": "86ae0f2dd8574055495d67b88082d7a7333c7974",
    "date": "Fri, 05 Aug 2016 18:06:25 GMT"
  },
  {
    "fileName": "testfile3",
    "storageProvider": "localFileSystem",
    "hash": "cdc1625c4182bd17b4e259f6551f85fa7a4a7748",
    "date": "Fri, 05 Aug 2016 18:06:29 GMT"
  }
]
```

### Delete

```
DELETE /file/:hash
```

The application will return a message with the result.

## MongoDB Schema

Files are automatically stored in the `files` collection in the `files-db` database.

The `files` schema is the following:

```
hash: { type: String, unique: true },
storageProvider: {
  hostName: String,
  hostedId: String
},
fileName: String,
size: Number,
lastModifiedMs: Number
  ```

If you need to update a file, just upload the new version with the same name; a history will be kept using its hash.

## Note

These examples are for local storage. Additional controllers can be implemented to handle requests to third-party storage providers.
