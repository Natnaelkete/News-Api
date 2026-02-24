import { Queue, Worker } from "bullmq";
import { getRedisClient } from "../config/redis";
import { aggregateDailyAnalytics } from "../services/analyticsService";

const QUEUE_NAME = "daily-analytics";

const getDateKey = (date: Date): string => {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const getPreviousUtcDate = (date: Date): Date => {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1));
};

const enqueueDailyJob = async (queue: Queue, runAt: Date): Promise<void> => {
	const dateToAggregate = getPreviousUtcDate(runAt);
	const dateKey = getDateKey(dateToAggregate);

	await queue.add(
		"aggregate",
		{ date: dateToAggregate.toISOString() },
		{
			jobId: `daily-analytics-${dateKey}`,
			attempts: 3,
			backoff: { type: "exponential", delay: 60_000 },
			removeOnComplete: 100,
			removeOnFail: 100,
		}
	);
};

const scheduleDailyAnalytics = (queue: Queue): void => {
	const now = new Date();
	const nextMidnightUtc = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
	);
	const delay = nextMidnightUtc.getTime() - now.getTime();

	setTimeout(async () => {
		await enqueueDailyJob(queue, new Date());

		setInterval(async () => {
			await enqueueDailyJob(queue, new Date());
		}, 24 * 60 * 60 * 1000);
	}, delay);
};

const startDailyAnalyticsJob = (): void => {
	const connection = getRedisClient();

	if (!connection) {
		console.warn("Redis not configured; analytics job disabled");
		return;
	}

	const queue = new Queue(QUEUE_NAME, { connection });

	const worker = new Worker(
		QUEUE_NAME,
		async (job) => {
			const date = job.data?.date ? new Date(job.data.date) : new Date();
			await aggregateDailyAnalytics(date);
		},
		{
			connection,
			concurrency: 1,
		}
	);

	worker.on("failed", (job, err) => {
		console.error("Daily analytics job failed", job?.id, err);
	});

	scheduleDailyAnalytics(queue);
};

export { startDailyAnalyticsJob };
