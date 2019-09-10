import events = require('@aws-cdk/aws-events')
import cloudwatch = require('@aws-cdk/aws-cloudwatch')
import actions = require('@aws-cdk/aws-cloudwatch-actions')
import sns = require('@aws-cdk/aws-sns')
import subs = require('@aws-cdk/aws-sns-subscriptions')
import iam = require('@aws-cdk/aws-iam')
import targets = require('@aws-cdk/aws-events-targets')
import lambda = require('@aws-cdk/aws-lambda')
import cdk = require('@aws-cdk/core')
import path = require('path')

const METRIC_NAME_SPACE = 'e2e'
const DURATION = 2

export class LambdaE2EStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id)

    /**
     * Add permissions for the lambda to be able to log metrics into Cloudwatch
     */
    const statement = new iam.PolicyStatement()
    statement.addActions('cloudwatch:PutMetricData')
    statement.addResources('*')

    /**
     * Setup Lambda Function settings
     */
    const lambdaFn = new lambda.Function(this, 'LambdaFunction', {
      runtime: lambda.Runtime.NODEJS_8_10,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, 'lambda-handler/index.zip')
      ),
      memorySize: 512, //memory size needs to be at least 512, this lambda runs at an average of 480
      timeout: cdk.Duration.minutes(5),
      tracing: lambda.Tracing.ACTIVE //x-ray tracing, useful for debugging.
    })
    /**
     * Add cloudwatch policy statement to lambda
     */
    lambdaFn.addToRolePolicy(statement)

    /**
     * Create Cloudwatch rule to run every DURATION minutes on the lambda created above
     */
    const rule = new events.Rule(this, `Run every ${DURATION} minutes`, {
      schedule: events.Schedule.rate(cdk.Duration.minutes(DURATION)),
      enabled: true
    })

    rule.addTarget(new targets.LambdaFunction(lambdaFn))

    /**
     * Create a metric in Cloudwatch where the lambda with log success of failure workflows
     */
    const faliedMetric = new cloudwatch.Metric({
      namespace: METRIC_NAME_SPACE,
      metricName: 'failed-workflow'
    })

    /**
     * Configure alarm on metric data
     */
    const alarm = new cloudwatch.Alarm(this, 'Alarm', {
      alarmDescription: 'e2e critical path failed',
      metric: faliedMetric,
      threshold: 1,
      evaluationPeriods: 1,
      statistic: 'Sum',
      period: cdk.Duration.minutes(DURATION),
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    })

    /**
     * Add an sns topic to know when we are in an alarm state
     */
    const topic = new sns.Topic(this, 'Topic')
    topic.addSubscription(new subs.EmailSubscription('artromero801@gmail.com'))
    alarm.addAlarmAction(new actions.SnsAction(topic))
  }
}

const app = new cdk.App()
new LambdaE2EStack(app, 'LambdaE2EExample')
app.synth()
