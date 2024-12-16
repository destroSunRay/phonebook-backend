# Phonebook application

The public API of this project is at [https://phonebook-backend-ep6i.onrender.com](https://phonebook-backend-ep6i.onrender.com)

## Installation

To install the project dependencies, run the following command:

```bash
npm install
```

## Building the Frontend

To build the frontend, navigate to the frontend directory and run the build command:

```bash
cd ../fullStackOpen/part-2/phonebook
npm run build
```

Then, copy the build files to the project directory:

```bash
cp -r dist ../../../fullStackOpen2
```

Alternatively, you can use the provided script to build the frontend and copy the files:

```bash
npm run build:ui
```

## Running the Application

To start the application, use the following command:

```bash
npm start
```

For development purposes, you can use nodemon to automatically restart the server on file changes:

```bash
npm run dev
```

## Deployment

To deploy the full application, including building the frontend and pushing to the repository, use the following command:

```bash
npm run deploy:full
```

## Author

Surya

## License

This project is licensed under the MIT License.
