import { Request, Response, NextFunction as Next } from "express";
import PageViewStream from "../database/PageViewStream";
import DateTimeUtil from "../utils/DateTimeUtil";
import UserAgentUtil from "../utils/UserAgentUtil";
import { PageViewEventPayload, PageViewEvent } from "../types/PageViewEvent";

async function collect(req: Request, res: Response, next: Next) {
  try {
    const event = mapRequestPayload(req);
    await PageViewStream.insert(event);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
}

function mapRequestPayload(req: Request): PageViewEvent {
  const payload: PageViewEventPayload = req.body;
  const ua = req.headers["user-agent"] || "";

  validateRequestPayload(payload);

  const { projectId, path, referrer } = payload;
  const date = DateTimeUtil.getCurrentDateInUtc();
  const browserName = UserAgentUtil.getBrowserName(ua);
  const browserNameVersion = UserAgentUtil.getBrowserNameVersion(ua);

  return { projectId, path, referrer, date, browserName, browserNameVersion };
}

function validateRequestPayload(payload: PageViewEventPayload) {
  if (typeof payload.projectId !== "number") {
    throw new Error("projectId not sent");
  }

  if (typeof payload.path !== "string") {
    throw new Error("path not sent");
  }

  if (typeof payload.referrer !== "string") {
    throw new Error("referrer not sent");
  }

  if (typeof payload.ua !== "string") {
    throw new Error("projectId not sent");
  }
}

export default collect;