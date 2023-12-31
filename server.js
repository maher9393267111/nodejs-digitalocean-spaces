const dotenv = require("dotenv");
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const formidable = require('formidable');
const AWS3 = require('@aws-sdk/client-s3');

const uploadDirectory = "Uploads";
dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const secretAccessKey ='AHAWvMCo/iM0/VI/vE6nJoX12AqswoyrntOYFBpm0iE'; //API PAGE get THIS
const accessKeyId = 'DO00BQV46GPKDM9HFMVA';   //API page get This
const endpoint = 'https://nyc3.digitaloceanspaces.com';   // withOUt bucket name
const region = 'us-east-1';   //region

const clientParams = {
    endpoint: endpoint,
    region: region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
};
console.log(clientParams);
const s3Client = new AWS3.S3Client(clientParams);

app.use(express.static('public'));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
});

app.get("/success", function (request, response) {
    response.sendFile(__dirname + '/public/success.html');
});

app.get("/error", function (request, response) {
    response.sendFile(__dirname + '/public/error.html');
});

app.post("/upload", function (request, response) {
    const form = new formidable.IncomingForm();
    form.parse(request, async function (err, fields, files) {
        if (!files.upload) {
            return response.redirect("/error");
        }
        try {

            const fileName = `${uploadDirectory}/${Date.now()}-${files.upload.originalFilename}`;

            let uploadParams = {
                Key: `${fileName}`, //save in ....
                Bucket: 'three',
                ACL: "public-read",
                //create folder  /Uploads/...{imageFile}
                Body: fs.createReadStream(files.upload.filepath)   // ...imageData
            };
            const command = new AWS3.PutObjectCommand(uploadParams);
            const s3response = await s3Client.send(command);

            console.log('S3 Response :' + s3response);

            if (s3response.$metadata.httpStatusCode === 200) {

//find image from space
const url = `${endpoint}/${uploadDirectory}/${fileName}`


                console.log('File uploaded successfully.');
                response.status(200).json({image:url});
              //  response.redirect("/success");
            }
        } catch (error) {
            console.log(error);
            return response.redirect("/error");
        }
    });
});

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});