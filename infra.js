"use strict";
/**
 * 1. Add deps
 * 2. Add a new stack
 * 3. Add Lambda resource
 * 4. Add PolicyStatement
 * 5. Add role to lambda
 * 6. Add rule
 * 7. Add target
 * 8. Add metric
 * 9. Add alarm
 * 10.Add topic
 */
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("@aws-cdk/aws-events");
const cloudwatch = require("@aws-cdk/aws-cloudwatch");
const actions = require("@aws-cdk/aws-cloudwatch-actions");
const sns = require("@aws-cdk/aws-sns");
const subs = require("@aws-cdk/aws-sns-subscriptions");
const iam = require("@aws-cdk/aws-iam");
const targets = require("@aws-cdk/aws-events-targets");
const lambda = require("@aws-cdk/aws-lambda");
const cdk = require("@aws-cdk/core");
const path = require("path");
const METRIC_NAME_SPACE = 'e2e';
const DURATION = 2;
class LambdaE2EStack extends cdk.Stack {
    constructor(app, id) {
        super(app, id);
        /**
         * Setup Lambda Function settings
         */
        const lambdaFn = new lambda.Function(this, 'LambdaFunction', {
            runtime: lambda.Runtime.NODEJS_8_10,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-handler/index.zip')),
            memorySize: 512,
            timeout: cdk.Duration.minutes(5),
            tracing: lambda.Tracing.ACTIVE //x-ray tracing, useful for debugging.
        });
        /**
         * Add permissions for the lambda to be able to log metrics into Cloudwatch
         */
        const statement = new iam.PolicyStatement();
        statement.addActions('cloudwatch:PutMetricData');
        statement.addResources('*');
        /**
         * Add cloudwatch policy statement to lambda
         */
        lambdaFn.addToRolePolicy(statement);
        /**
         * Create Cloudwatch rule to run every DURATION minutes on the lambda created above
         */
        const rule = new events.Rule(this, `Run every DURATION minutes`, {
            schedule: events.Schedule.rate(cdk.Duration.minutes(DURATION)),
            enabled: true
        });
        rule.addTarget(new targets.LambdaFunction(lambdaFn));
        /**
         * Create a metric in Cloudwatch where the lambda with log success of failure workflows
         */
        const failedMetric = new cloudwatch.Metric({
            namespace: METRIC_NAME_SPACE,
            metricName: 'failed-workflow'
        });
        /**
         * Configure alarm on metric data
         */
        const alarm = new cloudwatch.Alarm(this, 'Alarm', {
            alarmDescription: 'e2e critical path failed',
            metric: failedMetric,
            threshold: 1,
            evaluationPeriods: 1,
            statistic: 'Sum',
            period: cdk.Duration.minutes(DURATION),
            treatMissingData: cloudwatch.TreatMissingData.BREACHING
        });
        /**
         * Add an sns topic to know when we are in an alarm state
         */
        const topic = new sns.Topic(this, 'Topic');
        topic.addSubscription(new subs.EmailSubscription('artromero801@gmail.com'));
        alarm.addAlarmAction(new actions.SnsAction(topic));
    }
}
exports.LambdaE2EStack = LambdaE2EStack;
const app = new cdk.App();
new LambdaE2EStack(app, 'LambdaE2EExample');
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZyYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7O0dBV0c7O0FBRUgsOENBQThDO0FBQzlDLHNEQUFzRDtBQUN0RCwyREFBMkQ7QUFDM0Qsd0NBQXdDO0FBQ3hDLHVEQUF1RDtBQUN2RCx3Q0FBd0M7QUFDeEMsdURBQXVEO0FBQ3ZELDhDQUE4QztBQUM5QyxxQ0FBcUM7QUFDckMsNkJBQTZCO0FBQzdCLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFBO0FBQy9CLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQTtBQUVsQixNQUFhLGNBQWUsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMzQyxZQUFZLEdBQVksRUFBRSxFQUFVO1FBQ2xDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFZDs7V0FFRztRQUNILE1BQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDM0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLDBCQUEwQixDQUFDLENBQ2pEO1lBQ0QsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxzQ0FBc0M7U0FDdEUsQ0FBQyxDQUFBO1FBRUY7O1dBRUc7UUFDSCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUMzQyxTQUFTLENBQUMsVUFBVSxDQUFDLDBCQUEwQixDQUFDLENBQUE7UUFDaEQsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUUzQjs7V0FFRztRQUNILFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFbkM7O1dBRUc7UUFDSCxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQy9ELFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RCxPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7UUFFcEQ7O1dBRUc7UUFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDekMsU0FBUyxFQUFFLGlCQUFpQjtZQUM1QixVQUFVLEVBQUUsaUJBQWlCO1NBQzlCLENBQUMsQ0FBQTtRQUVGOztXQUVHO1FBQ0gsTUFBTSxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7WUFDaEQsZ0JBQWdCLEVBQUUsMEJBQTBCO1lBQzVDLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFNBQVMsRUFBRSxDQUFDO1lBQ1osaUJBQWlCLEVBQUUsQ0FBQztZQUNwQixTQUFTLEVBQUUsS0FBSztZQUNoQixNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ3RDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTO1NBQ3hELENBQUMsQ0FBQTtRQUVGOztXQUVHO1FBQ0gsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUMxQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQTtRQUMzRSxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ3BELENBQUM7Q0FDRjtBQXBFRCx3Q0FvRUM7QUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUN6QixJQUFJLGNBQWMsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtBQUMzQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIDEuIEFkZCBkZXBzXG4gKiAyLiBBZGQgYSBuZXcgc3RhY2tcbiAqIDMuIEFkZCBMYW1iZGEgcmVzb3VyY2VcbiAqIDQuIEFkZCBQb2xpY3lTdGF0ZW1lbnRcbiAqIDUuIEFkZCByb2xlIHRvIGxhbWJkYVxuICogNi4gQWRkIHJ1bGVcbiAqIDcuIEFkZCB0YXJnZXRcbiAqIDguIEFkZCBtZXRyaWNcbiAqIDkuIEFkZCBhbGFybVxuICogMTAuQWRkIHRvcGljXG4gKi9cblxuaW1wb3J0IGV2ZW50cyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1ldmVudHMnKVxuaW1wb3J0IGNsb3Vkd2F0Y2ggPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2xvdWR3YXRjaCcpXG5pbXBvcnQgYWN0aW9ucyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1jbG91ZHdhdGNoLWFjdGlvbnMnKVxuaW1wb3J0IHNucyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zbnMnKVxuaW1wb3J0IHN1YnMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3Mtc25zLXN1YnNjcmlwdGlvbnMnKVxuaW1wb3J0IGlhbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1pYW0nKVxuaW1wb3J0IHRhcmdldHMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtZXZlbnRzLXRhcmdldHMnKVxuaW1wb3J0IGxhbWJkYSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1sYW1iZGEnKVxuaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKVxuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IE1FVFJJQ19OQU1FX1NQQUNFID0gJ2UyZSdcbmNvbnN0IERVUkFUSU9OID0gMlxuXG5leHBvcnQgY2xhc3MgTGFtYmRhRTJFU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihhcHA6IGNkay5BcHAsIGlkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihhcHAsIGlkKVxuXG4gICAgLyoqXG4gICAgICogU2V0dXAgTGFtYmRhIEZ1bmN0aW9uIHNldHRpbmdzXG4gICAgICovXG4gICAgY29uc3QgbGFtYmRhRm4gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdMYW1iZGFGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU184XzEwLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFxuICAgICAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnbGFtYmRhLWhhbmRsZXIvaW5kZXguemlwJylcbiAgICAgICksXG4gICAgICBtZW1vcnlTaXplOiA1MTIsIC8vbWVtb3J5IHNpemUgbmVlZHMgdG8gYmUgYXQgbGVhc3QgNTEyLCB0aGlzIGxhbWJkYSBydW5zIGF0IGFuIGF2ZXJhZ2Ugb2YgNDgwXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgIHRyYWNpbmc6IGxhbWJkYS5UcmFjaW5nLkFDVElWRSAvL3gtcmF5IHRyYWNpbmcsIHVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICAgIH0pXG5cbiAgICAvKipcbiAgICAgKiBBZGQgcGVybWlzc2lvbnMgZm9yIHRoZSBsYW1iZGEgdG8gYmUgYWJsZSB0byBsb2cgbWV0cmljcyBpbnRvIENsb3Vkd2F0Y2hcbiAgICAgKi9cbiAgICBjb25zdCBzdGF0ZW1lbnQgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCgpXG4gICAgc3RhdGVtZW50LmFkZEFjdGlvbnMoJ2Nsb3Vkd2F0Y2g6UHV0TWV0cmljRGF0YScpXG4gICAgc3RhdGVtZW50LmFkZFJlc291cmNlcygnKicpXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY2xvdWR3YXRjaCBwb2xpY3kgc3RhdGVtZW50IHRvIGxhbWJkYVxuICAgICAqL1xuICAgIGxhbWJkYUZuLmFkZFRvUm9sZVBvbGljeShzdGF0ZW1lbnQpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgQ2xvdWR3YXRjaCBydWxlIHRvIHJ1biBldmVyeSBEVVJBVElPTiBtaW51dGVzIG9uIHRoZSBsYW1iZGEgY3JlYXRlZCBhYm92ZVxuICAgICAqL1xuICAgIGNvbnN0IHJ1bGUgPSBuZXcgZXZlbnRzLlJ1bGUodGhpcywgYFJ1biBldmVyeSBEVVJBVElPTiBtaW51dGVzYCwge1xuICAgICAgc2NoZWR1bGU6IGV2ZW50cy5TY2hlZHVsZS5yYXRlKGNkay5EdXJhdGlvbi5taW51dGVzKERVUkFUSU9OKSksXG4gICAgICBlbmFibGVkOiB0cnVlXG4gICAgfSlcblxuICAgIHJ1bGUuYWRkVGFyZ2V0KG5ldyB0YXJnZXRzLkxhbWJkYUZ1bmN0aW9uKGxhbWJkYUZuKSlcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG1ldHJpYyBpbiBDbG91ZHdhdGNoIHdoZXJlIHRoZSBsYW1iZGEgd2l0aCBsb2cgc3VjY2VzcyBvZiBmYWlsdXJlIHdvcmtmbG93c1xuICAgICAqL1xuICAgIGNvbnN0IGZhaWxlZE1ldHJpYyA9IG5ldyBjbG91ZHdhdGNoLk1ldHJpYyh7XG4gICAgICBuYW1lc3BhY2U6IE1FVFJJQ19OQU1FX1NQQUNFLFxuICAgICAgbWV0cmljTmFtZTogJ2ZhaWxlZC13b3JrZmxvdydcbiAgICB9KVxuXG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlIGFsYXJtIG9uIG1ldHJpYyBkYXRhXG4gICAgICovXG4gICAgY29uc3QgYWxhcm0gPSBuZXcgY2xvdWR3YXRjaC5BbGFybSh0aGlzLCAnQWxhcm0nLCB7XG4gICAgICBhbGFybURlc2NyaXB0aW9uOiAnZTJlIGNyaXRpY2FsIHBhdGggZmFpbGVkJyxcbiAgICAgIG1ldHJpYzogZmFpbGVkTWV0cmljLFxuICAgICAgdGhyZXNob2xkOiAxLFxuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDEsXG4gICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyhEVVJBVElPTiksXG4gICAgICB0cmVhdE1pc3NpbmdEYXRhOiBjbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuQlJFQUNISU5HXG4gICAgfSlcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbiBzbnMgdG9waWMgdG8ga25vdyB3aGVuIHdlIGFyZSBpbiBhbiBhbGFybSBzdGF0ZVxuICAgICAqL1xuICAgIGNvbnN0IHRvcGljID0gbmV3IHNucy5Ub3BpYyh0aGlzLCAnVG9waWMnKVxuICAgIHRvcGljLmFkZFN1YnNjcmlwdGlvbihuZXcgc3Vicy5FbWFpbFN1YnNjcmlwdGlvbignYXJ0cm9tZXJvODAxQGdtYWlsLmNvbScpKVxuICAgIGFsYXJtLmFkZEFsYXJtQWN0aW9uKG5ldyBhY3Rpb25zLlNuc0FjdGlvbih0b3BpYykpXG4gIH1cbn1cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKVxubmV3IExhbWJkYUUyRVN0YWNrKGFwcCwgJ0xhbWJkYUUyRUV4YW1wbGUnKVxuYXBwLnN5bnRoKClcbiJdfQ==