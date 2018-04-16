# Running on AWS Lambda

Instructions on how to run `rest-flex` on AWS Lambda.

## Defining a Profile

To avoid having to use `--profile your-profile` on every command, you can export the `AWS_PROFILE` environment variable as such:

```bash
export AWS_PROFILE=brunokrebs
```

## AWS Lambda

### Express.js and AWS Lambda: Coding the Solution

### Defining a AWS IAM Role

### Creating the AWS Lambda Function

```bash
zip index.zip ./**/*
```

```bash
NAME=personal-finances

ARN_ROLE=arn:aws:iam::128090157610:role/lambda-standalone

aws lambda create-function \
    --function-name "${NAME}"\
    --runtime nodejs8.10 \
    --role ${ARN_ROLE} \
    --handler index.handler \
    --zip-file fileb://index.zip
```

```bash
LAMBDA_ARN=$(aws lambda list-functions --query "Functions[?FunctionName==\`${NAME}\`].FunctionArn" --output text)
```

## Create a AWS API Gateway REST API

Having configured the profile for the current terminal session, the first step is to create a REST API:

```bash
aws apigateway create-rest-api \
    --name personal-finances
```

This will generate a response like this:

```bash
{
    "id": "kcv9d7d6nf",
    "name": "personal-finances",
    "createdDate": 1523319146,
    "apiKeySource": "HEADER",
    "endpointConfiguration": {
        "types": [
            "EDGE"
        ]
    }
}
```

As you will need the id of your new REST API a bunch of times, you will save some time if you set it to another environment variable:

```bash
API_ID=kcv9d7d6nf
```

> **Note:** When define the `AWS_PROFILE` you used `export` because otherwise the `aws` CLI tool wouldn't have access to it internally. As you will only pass `API_ID` as a parameter to the CLI tool (i.e. the tool does not reference in its own code) you don't need to export it.

## Create a AWS API Gateway Resource

When you issued the command above to create your REST API, AWS also automatically created for you a resource. This will act as your root resource (i.e. will answer to calls on `/`) and every other resource that you create will be its descendant (i.e. child, grandchild, etc).

To append resources to this parent, you will need its id. As such, issue the following command to fetch it:

```bash
aws apigateway get-resources --rest-api-id $API_ID
```

Then define an environment variable with the `id` returned:

```bash
ROOT_RESOURCE_ID=tez9g4glod
```

Now, you can start defining descendant resources. To do so, issue the following command:

```bash
aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part personal-finances
```

This command will output details about your new resource and, no wonder, you will need its `id` on the next sections. Therefore, execute the following command to create an environment variable to reference it:

```bash
PERSONAL_FINANCES_RESOURCE_ID=tqOA36
```

## Method Request

> In the Method Request section, configure the public interface of your API. This is the API definition that is exposed to your users. This API definition includes authorization and definition of the HTTP verbs that allow an input body, headers, and query string parameters.

```bash
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $PERSONAL_FINANCES_RESOURCE_ID \
    --http-method GET \
    --authorization-type "NONE"
```

## Integration Request

> In the Integration Request section, specify how API Gateway will communicate with the integration. This includes the type of back end your method is running (Lambda, HTTP, AWS service, or Mock) and how the request data should be transformed before it’s sent to your method’s back end. For example, Lambda functions cannot receive headers or query string parameters, but you can use API Gateway to build a JSON event for Lambda that contains all of the request values.

```bash
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $PERSONAL_FINANCES_RESOURCE_ID \
    --http-method GET \
    --type AWS \
    --integration-http-method POST \
    --uri arn:aws:apigateway:sa-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:sa-east-1:128090157610:function:personal-finances/invocations
```

## Integration Response

> After your method’s back end processes a request, API Gateway intercepts the response. In the Integration Response section, you can specify how response codes such as Lambda errors or HTTP status codes from your method’s back end are mapped to the status codes that you defined for your method in API Gateway. You can use the integration response to read headers from your HTTP back-end response and place them in the body of the response for your API consumers.

```bash
aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $PERSONAL_FINANCES_RESOURCE_ID \
    --http-method GET \
    --status-code 200 \
    --selection-pattern ".*"
```

## Method Response

> Similarly to the method request, you can use the Method Response section to define the public interface of your API. For example, you can specify which HTTP status codes the method supports, and, for each status code, which body model and headers the method can return. The values for the body and headers are assigned to the fields in the integration response step.

```bash
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $PERSONAL_FINANCES_RESOURCE_ID \
    --http-method GET \
    --status-code 200
```

## Deploy

```bash
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --stage-description 'Production' \
    --description 'First deployment'
```

## Permission

```bash
API_ARN=$(echo ${LAMBDA_ARN} | sed -e 's/lambda/execute-api/' -e "s/function:${NAME}/${API_ID}/")

aws lambda add-permission \
    --function-name personal-finances \
    --statement-id apigateway-personal-finances \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "${API_ARN}/*/GET/personal-finances"
```

```bash
echo "https://${API_ID}.execute-api.sa-east-1.amazonaws.com/prod/personal-finances"
```