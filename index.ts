import events = require('@aws-cdk/aws-events')
import cloudwatch = require('@aws-cdk/aws-cloudwatch')
import iam = require('@aws-cdk/aws-iam')
import targets = require('@aws-cdk/aws-events-targets')
import lambda = require('@aws-cdk/aws-lambda')
import cdk = require('@aws-cdk/core')
import path = require('path')
import { METRIC_NAME_SPACE } from './utils'

const DURATION = 2

export class LambdaE2EStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id)

    const statement = new iam.PolicyStatement()
    statement.addActions('cloudwatch:PutMetricData')
    statement.addResources('*')

    const lambdaFn = new lambda.Function(this, 'LambdaFunction', {
      runtime: lambda.Runtime.NODEJS_8_10,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, 'lambda-handler/index.zip')
      ),
      memorySize: 512,
      timeout: cdk.Duration.minutes(5)
    })

    const rule = new events.Rule(this, `Run every ${DURATION} minutes`, {
      schedule: events.Schedule.rate(cdk.Duration.minutes(DURATION)),
      enabled: false
    })

    rule.addTarget(new targets.LambdaFunction(lambdaFn))

    const faliedMetric = new cloudwatch.Metric({
      namespace: METRIC_NAME_SPACE,
      metricName: 'failed-workflow'
    })

    new cloudwatch.Alarm(this, 'Alarm', {
      alarmDescription: 'e2e critical path failed',
      metric: faliedMetric,
      threshold: 100,
      evaluationPeriods: DURATION,
      statistic: 'Sum',
      period: cdk.Duration.minutes(DURATION),
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    })

    lambdaFn.addToRolePolicy(statement)
  }
}

const app = new cdk.App()
new LambdaE2EStack(app, 'LambdaE2EExample')
app.synth()
