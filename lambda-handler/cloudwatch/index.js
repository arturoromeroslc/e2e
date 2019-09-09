const AWS = require('aws-sdk')

const cloudWatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' })
const METRIC_NAME_SPACE = 'e2e'

const getMetricObject = ({ Value, MetricName }) => ({
  Timestamp: new Date(),
  Unit: 'Count',
  Value,
  MetricName
})

const getCloudWatchParam = hasError => {
  const cloudWatchParam = {
    Namespace: METRIC_NAME_SPACE,
    MetricData: []
  }

  if (hasError) {
    cloudWatchParam.MetricData.push(
      getMetricObject({ MetricName: 'failed-workflow', Value: 1 }),
      getMetricObject({ MetricName: 'successful-workflow', Value: 0 })
    )
  } else {
    cloudWatchParam.MetricData.push(
      getMetricObject({ MetricName: 'successful-workflow', Value: 1 }),
      getMetricObject({ MetricName: 'failed-workflow', Value: 0 })
    )
  }

  return cloudWatchParam
}

exports.sendCloudWatchData = async hasError =>
  await cloudWatch.putMetricData(getCloudWatchParam(hasError)).promise()
