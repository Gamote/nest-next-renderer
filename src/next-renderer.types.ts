import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  PreviewData,
} from 'next/types';
import { ParsedUrlQuery } from 'querystring';
import { IncomingMessage, ServerResponse } from 'http';
import { FastifyReply, FastifyRequest } from 'fastify';

export type CustomGetServerSidePropsContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
  Query = ParsedUrlQuery,
  Request = IncomingMessage,
  Response = ServerResponse,
> = Omit<GetServerSidePropsContext<Q, D>, 'query'> & {
  req: Request;
  res: Response;
  query: Query;
};

export type CustomGetServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
  Query = ParsedUrlQuery,
  Request = IncomingMessage,
  Response = ServerResponse,
> = (
  context: CustomGetServerSidePropsContext<
    Q,
    D,
    GetServerSidePropsResult<Query>,
    Request,
    Response
  >,
) => Promise<GetServerSidePropsResult<P>>;

export type FastifyGetServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Query = P,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
> = CustomGetServerSideProps<P, Q, D, Query, FastifyRequest, FastifyReply>;

/**
 * Level of error pass-through
 */
export enum ErrorPassThroughLevel {
  /**
   * Pass through all errors
   */
  ALL = 'all',
  /**
   * Pass through 404 errors
   */
  NOT_FOUND = 'not-found',
  /**
   * Pass no errors
   */
  NONE = 'none',
}
