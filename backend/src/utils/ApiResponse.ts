import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success(
    res: Response,
    data: any,
    message = 'Success',
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static created(res: Response, data: any, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(
    res: Response,
    data: any[],
    pagination: PaginationMeta,
    message = 'Success'
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}

export const getPaginationParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
