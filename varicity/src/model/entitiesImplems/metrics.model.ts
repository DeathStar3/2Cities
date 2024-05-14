import {MetricObject} from "./metricObject.model";

export class Metrics {

    metrics: Map<string, MetricObject>;

    constructor() {
        this.metrics = new Map<string, MetricObject>();
    }

    addMetric(metric: MetricObject) {
        return this.metrics.set(metric.name, metric);
    }

    hasMetric(metricName: string): boolean {
        return this.metrics.has(metricName);
    }

    increaseMetricValue(metricName: string, value: number) {
        if (this.hasMetric(metricName)) {
            this.metrics.get(metricName).value += 1;
        }
    }

    getMetricValue(metricName: string): number {
        if (!this.hasMetric(metricName)) {
            return 0;
        }

        const value = this.metrics.get(metricName).value;
        return value === undefined ? 0 : value;
    }
}
