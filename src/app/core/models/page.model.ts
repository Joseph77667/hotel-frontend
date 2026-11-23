/**
 * Shape of Spring's Page<T> JSON (WebConfig uses PageSerializationMode.VIA_DTO):
 * { "content": [...], "page": { "size": 20, "number": 0, "totalElements": 57, "totalPages": 3 } }
 */
export interface Page<T> {
  content: T[];
  page: PageInfo;
}

export interface PageInfo {
  size: number;
  number: number;          // current page, starts at 0
  totalElements: number;
  totalPages: number;
}

/** Query params for paged lists: ?page=0&size=20&sort=lastName,asc */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}
