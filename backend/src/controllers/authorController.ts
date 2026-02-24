import { NextFunction, Request, Response } from "express";
import { paginationSchema } from "../config/validation";
import { getAuthorDashboard } from "../services/articleService";
import { paginatedResponse } from "../utils/response";

const getDashboardHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { page, size } = paginationSchema.parse(req.query);
		const { items, total } = await getAuthorDashboard(req.user!.id, page, size);
		paginatedResponse(res, "Dashboard fetched", items, page, size, total);
	} catch (error) {
		next(error);
	}
};

export { getDashboardHandler };
