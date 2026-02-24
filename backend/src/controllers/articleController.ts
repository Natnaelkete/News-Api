import { NextFunction, Request, Response } from "express";
import {
	createArticle,
	getAuthorArticles,
	getPublicArticles,
	getPublicArticleById,
	updateArticle,
	softDeleteArticle,
} from "../services/articleService";
import {
	articleIdSchema,
	paginationSchema,
	publicFeedSchema,
} from "../config/validation";
import { paginatedResponse, successResponse } from "../utils/response";
import { createReadLog } from "../services/readLogService";

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

const getPublicArticlesHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { page, size, category, author, q } = publicFeedSchema.parse(req.query);
		const { items, total } = await getPublicArticles(
			{ category, author, q },
			page,
			size
		);
		paginatedResponse(res, "Articles fetched", items, page, size, total);
	} catch (error) {
		next(error);
	}
};

const getPublicArticleHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = articleIdSchema.parse(req.params);
		const article = await getPublicArticleById(id);
		successResponse(res, "Article fetched", article, 200);

		const readerKey = req.user?.id || req.ip;
		void createReadLog(id, req.user?.id, readerKey).catch((error) => {
			console.error("Read log failed", error);
		});
	} catch (error) {
		next(error);
	}
};

export {
	createArticleHandler,
	getMyArticlesHandler,
	updateArticleHandler,
	deleteArticleHandler,
	getPublicArticlesHandler,
	getPublicArticleHandler,
};
