import React from "react";
import * as Sentry from "@sentry/browser";
import { storage } from "../data/storage";
import { resetCursor } from "../utils";
import { t } from "../i18n";

interface TopErrorBoundaryState {
  hasError: boolean;
  sentryEventId: string;
  storage: string;
}

export class TopErrorBoundary extends React.Component<
  any,
  TopErrorBoundaryState
> {
  state: TopErrorBoundaryState = {
    hasError: false,
    sentryEventId: "",
    storage: "",
  };

  render() {
    return this.state.hasError ? this.errorSplash() : this.props.children;
  }

  async componentDidCatch(error: Error, errorInfo: any) {
    resetCursor();
    const _storage: any = {};
    for (const [key, value] of Object.entries(await storage.getAll())) {
      try {
        _storage[key] = JSON.parse(value);
      } catch (error) {
        _storage[key] = value;
      }
    }

    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      const eventId = Sentry.captureException(error);

      this.setState((state) => ({
        hasError: true,
        sentryEventId: eventId,
        storage: JSON.stringify(_storage),
      }));
    });
  }

  private selectTextArea(event: React.MouseEvent<HTMLTextAreaElement>) {
    if (event.target !== document.activeElement) {
      event.preventDefault();
      (event.target as HTMLTextAreaElement).select();
    }
  }

  private async createGithubIssue() {
    let body = "";
    try {
      const templateStrFn = (await import("../bug-issue-template")).default;
      body = encodeURIComponent(templateStrFn(this.state.sentryEventId));
    } catch (error) {
      console.error(error);
    }

    window.open(
      `https://github.com/excalidraw/excalidraw/issues/new?body=${body}`,
    );
  }

  private errorSplash() {
    return (
      <div className="ErrorSplash">
        <div className="ErrorSplash-messageContainer">
          <div className="ErrorSplash-paragraph bigger align-center">
            {t("errorSplash.headingMain_pre")}
            <button onClick={() => window.location.reload()}>
              {t("errorSplash.headingMain_button")}
            </button>
          </div>
          <div className="ErrorSplash-paragraph align-center">
            {t("errorSplash.clearCanvasMessage")}
            <button
              onClick={async () => {
                try {
                  await storage.clear();
                  window.location.reload();
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              {t("errorSplash.clearCanvasMessage_button")}
            </button>
            <br />
            <div className="smaller">
              <span role="img" aria-label="warning">
                ⚠️
              </span>
              {t("errorSplash.clearCanvasCaveat")}
              <span role="img" aria-hidden="true">
                ⚠️
              </span>
            </div>
          </div>
          <div>
            <div className="ErrorSplash-paragraph">
              {t("errorSplash.trackedToSentry_pre")}
              {this.state.sentryEventId}
              {t("errorSplash.trackedToSentry_post")}
            </div>
            <div className="ErrorSplash-paragraph">
              {t("errorSplash.openIssueMessage_pre")}
              <button onClick={() => this.createGithubIssue()}>
                {t("errorSplash.openIssueMessage_button")}
              </button>
              {t("errorSplash.openIssueMessage_post")}
            </div>
            <div className="ErrorSplash-paragraph">
              <div className="ErrorSplash-details">
                <label>{t("errorSplash.sceneContent")}</label>
                <textarea
                  rows={5}
                  onPointerDown={this.selectTextArea}
                  readOnly={true}
                  value={this.state.storage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
