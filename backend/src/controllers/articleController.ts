import { NextFunction, Request, Response } from "express";
import {
	createArticle,
	getAuthorArticles,
	updateArticle,
	softDeleteArticle,
} from "../services/articleService";
import {
	articleIdSchema,
	paginationSchema,
} from "../config/validation";
import { paginatedResponse, successResponse } from "../utils/response";

const createArticleHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const article = await createArticle(req.user!.id, req.body);
		successResponse(res, "Article created", article, 201);
	} catch (error) {
		next(error);
	}
};

const getMyArticlesHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { page, size } = paginationSchema.parse(req.query);
		const { items, total } = await getAuthorArticles(req.user!.id, page, size);
		paginatedResponse(res, "Articles fetched", items, page, size, total);
	} catch (error) {
		next(error);
	}
};

const updateArticleHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = articleIdSchema.parse(req.params);
		const article = await updateArticle(req.user!.id, id, req.body);
		successResponse(res, "Article updated", article, 200);
	} catch (error) {
		next(error);
	}
};

const deleteArticleHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = articleIdSchema.parse(req.params);
		await softDeleteArticle(req.user!.id, id);
		successResponse(res, "Article deleted", { id }, 200);
	} catch (error) {
		next(error);
	}
};

export {
	createArticleHandler,
	getMyArticlesHandler,
	updateArticleHandler,
	deleteArticleHandler,
};
