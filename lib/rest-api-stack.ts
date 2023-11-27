import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { generateBatch } from "../shared/util";
import * as apig from "aws-cdk-lib/aws-apigateway";
import { movies, movieReviews} from "../seed/movies";


export class RestAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tables 
    const moviesTable = new dynamodb.Table(this, "MoviesTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "movieId", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Movies",
    });

    const movieReviewTable = new dynamodb.Table(this, "MovieTeviewTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "movieId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "reviewername", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "MovieReview",
    });

    movieReviewTable.addLocalSecondaryIndex({
      indexName: "roleIx",
      sortKey: { name: "roleName", type: dynamodb.AttributeType.STRING },
    });

    
    // Functions 
    const getMovieByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/getMovieById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: moviesTable.tableName,
          REGION: 'eu-west-1',
        },
      }
      );

      const getMovieReviewFn = new lambdanode.NodejsFunction(
        this,
        "GetMovieReviewFn",
        {
          architecture: lambda.Architecture.ARM_64,
          runtime: lambda.Runtime.NODEJS_16_X,
          entry: `${__dirname}/../lambdas/getReviewsbyId.ts`,
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          environment: {
            TABLE_NAME: movieReviewTable.tableName,
            REGION: "eu-west-1",
          },
        }
      );
      
      const getAllMoviesFn = new lambdanode.NodejsFunction(
        this,
        "GetAllMoviesFn",
        {
          architecture: lambda.Architecture.ARM_64,
          runtime: lambda.Runtime.NODEJS_16_X,
          entry: `${__dirname}/../lambdas/getAllMovies.ts`,
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          environment: {
            TABLE_NAME: moviesTable.tableName,
            REGION: 'eu-west-1',
          },
        }
        );

        const getAllReviewsFn = new lambdanode.NodejsFunction(
          this,
          "GetAllReviewsFn",
          {
            architecture: lambda.Architecture.ARM_64,
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: `${__dirname}/../lambdas/getAllReviews.ts`,
            timeout: cdk.Duration.seconds(10),
            memorySize: 128,
            environment: {
              TABLE_NAME: movieReviewTable.tableName,
              REGION: 'eu-west-1',
            },
          }
          );
        
        new custom.AwsCustomResource(this, "moviesddbInitData", {
          onCreate: {
            service: "DynamoDB",
            action: "batchWriteItem",
            parameters: {
              RequestItems: {
                [moviesTable.tableName]: generateBatch(movies),
                [movieReviewTable.tableName]: generateBatch(movieReviews),  
              },
            },
            physicalResourceId: custom.PhysicalResourceId.of("moviesddbInitData"), //.of(Date.now().toString()),
          },
          policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
            resources: [moviesTable.tableArn, movieReviewTable.tableArn],  // Includes movie cast
          }),
        });

        const newMovieFn = new lambdanode.NodejsFunction(this, "AddMovieFn", {
          architecture: lambda.Architecture.ARM_64,
          runtime: lambda.Runtime.NODEJS_16_X,
          entry: `${__dirname}/../lambdas/addMovie.ts`,
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          environment: {
            TABLE_NAME: moviesTable.tableName,
            REGION: "eu-west-1",
          },
        });

        const newReviewFn = new lambdanode.NodejsFunction(this, "AddReviewFn", {
          architecture: lambda.Architecture.ARM_64,
          runtime: lambda.Runtime.NODEJS_16_X,
          entry: `${__dirname}/../lambdas/addReviews.ts`,
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
          environment: {
            TABLE_NAME: movieReviewTable.tableName,
            REGION: "eu-west-1",
          },
        });

        
        // Permissions 
        moviesTable.grantReadData(getMovieByIdFn)
        moviesTable.grantReadData(getAllMoviesFn)
        moviesTable.grantReadWriteData(newMovieFn)
        movieReviewTable.grantReadData(getMovieReviewFn)
        movieReviewTable.grantReadData(getAllReviewsFn);
        moviesTable.grantReadWriteData(newReviewFn)
        
        // REST API 
        const api = new apig.RestApi(this, "RestAPI", {
          description: "demo api",
          deployOptions: {
              stageName: "dev",
          },
          // 👇 enable CORS
          defaultCorsPreflightOptions: {
              allowHeaders: ["Content-Type", "X-Amz-Date"],
              allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
              allowCredentials: true,
              allowOrigins: ["*"],
          },
      });
      
      const moviesEndpoint = api.root.addResource("movies");
      const movieEndpoint = moviesEndpoint.addResource("{movieId}");
      const movieReviewEndpoint = movieEndpoint.addResource("reviews");
      const moviesReviewEndpoint = moviesEndpoint.addResource("reviews");
      
      movieReviewEndpoint.addMethod(
          "GET",
          new apig.LambdaIntegration(getMovieReviewFn, { proxy: true })
      );

      moviesReviewEndpoint.addMethod(
        "GET",
        new apig.LambdaIntegration(getAllReviewsFn, { proxy: true })
    );
    
      
      moviesEndpoint.addMethod(
          "GET",
          new apig.LambdaIntegration(getAllMoviesFn, { proxy: true })
      );
      
    
      movieEndpoint.addMethod(
          "GET",
          new apig.LambdaIntegration(getMovieByIdFn, { proxy: true })
      );
      
      moviesEndpoint.addMethod(
          "POST",
          new apig.LambdaIntegration(newMovieFn, { proxy: true })
      );

      moviesReviewEndpoint.addMethod(
        "POST",
        new apig.LambdaIntegration(newReviewFn, { proxy: true })
    );

      }

  
    }
  
    