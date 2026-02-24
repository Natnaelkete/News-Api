import { prisma } from "../config/database";

const getUtcDateRange = (date: Date): { start: Date; end: Date } => {
	const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
	return { start, end };
};

const aggregateDailyAnalytics = async (date: Date): Promise<void> => {
	const { start, end } = getUtcDateRange(date);

	const grouped = await prisma.readLog.groupBy({
		by: ["articleId"],
		where: {
			readAt: {
				gte: start,
				lt: end,
			},
		},
		_count: {
			articleId: true,
		},
	});

	if (grouped.length === 0) {
		return;
	}

	await prisma.$transaction(
		grouped.map((item) =>
			prisma.dailyAnalytics.upsert({
				where: {
					articleId_date: {
						articleId: item.articleId,
						date: start,
					},
				},
				update: {
					viewCount: item._count.articleId,
				},
				create: {
					articleId: item.articleId,
					date: start,
					viewCount: item._count.articleId,
				},
			})
		)
	);
};

export { aggregateDailyAnalytics };
