# aws-mongodb-to-s3
A NodeJS project that demonstrates how to make a backup file of a MongoDB database and store the file in a S3 bucket.

## Build

```
npm install --save
```

## Test
As the project is intended to be used in EC2 machines with a custom Role, you need to use your own credentials to test functionality in your computer
Use the following environment variables in a .env file:

```json
ENVIRONMENT_MODE=local
MONGODB_URL=url
MONGODB_DB=database
MONGODB_USER=user
MONGODB_PASSWORD=password
S3_BUCKET=name-of-your-bucket
AWS_KEY=AKIAIXXXXXXYOURKEY
AWS_SECRET_KEY=tpFaXPp2AU5wMTHERESTOFTHEKEY
AWS_REGION=eu-west-1
```


## Usage in AWS
Set the appropiate environment variables, but is NOT RECOMMENDED to use ``ENVIRONMENT_MODE=local, AWS_KEY and AWS_SECRET_KEY`` 
as EC2 instance should have an assigned AWS Role in order to access S3 Bucket in a more secure way

## To Do's:
- Simplify the code for cleaning up a backup file
- Handle irregular error from cleaning up a backup file
- Accept more than 1 MongoDB reaplica IP addresses
- Any other error handling logic

