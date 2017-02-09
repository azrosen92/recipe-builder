#!/usr/bin/env bash

rm index.zip
cd src
zip -X -r ../index.zip *
cd ..
aws lambda update-function-code --function-name arn:aws:lambda:us-east-1:273169222458:function:recipeBuilderFunction  --zip-file fileb://index.zip

