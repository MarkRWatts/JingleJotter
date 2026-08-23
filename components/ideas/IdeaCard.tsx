import { ExternalLink, Sparkles } from "lucide-react";
import { formatPence } from "@/lib/money";
import { promoteIdea, discardIdea, restoreIdea, deleteIdea } from "@/app/actions/ideas";
import { IdeaActionButton } from "./IdeaActionButton";
import type { IdeaData } from "./types";

function formatJotted(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function IdeaStatusChip({ idea }: { idea: IdeaData }) {
  if (idea.status === "PROMOTED" && idea.purchaseId) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-pine/15 px-3 py-1 text-xs font-semibold text-pine-deep">
        <Sparkles size={12} aria-hidden />
        on this year&apos;s list
      </span>
    );
  }
  if (idea.status === "PROMOTED" && !idea.purchaseId) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-tag px-3 py-1 text-xs font-semibold text-cocoa-soft">
        was on a list once
      </span>
    );
  }
  if (idea.status === "DISCARDED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-tag px-3 py-1 text-xs font-semibold text-cocoa-soft">
        discarded
      </span>
    );
  }
  return null;
}

export function IdeaCard({ idea }: { idea: IdeaData }) {
  const isDiscarded = idea.status === "DISCARDED";
  const confirmDelete = `Delete "${idea.title}"? This can't be undone.`;

  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ${isDiscarded ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="font-medium text-cocoa">
          {idea.url ? (
            <a
              href={idea.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline decoration-cocoa-soft/40 underline-offset-2 hover:text-pine"
            >
              {idea.title}
              <ExternalLink size={13} className="shrink-0 text-cocoa-soft" aria-hidden />
            </a>
          ) : (
            idea.title
          )}
        </div>
        {idea.approxPence !== null && (
          <span className="shrink-0 font-semibold text-cocoa">
            ~{formatPence(idea.approxPence)}
          </span>
        )}
      </div>

      {idea.notes && <p className="mt-1 text-sm text-cocoa-soft">{idea.notes}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-cocoa-soft">jotted {formatJotted(idea.createdAt)}</span>
          <IdeaStatusChip idea={idea} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {idea.status === "OPEN" && (
            <>
              <IdeaActionButton
                action={promoteIdea}
                ideaId={idea.id}
                label="Promote"
                icon="promote"
                variant="solid-pine"
              />
              <IdeaActionButton
                action={discardIdea}
                ideaId={idea.id}
                label="Discard"
                icon="discard"
                variant="outline-pine"
              />
              <IdeaActionButton
                action={deleteIdea}
                ideaId={idea.id}
                label="Delete"
                icon="delete"
                variant="outline-berry"
                confirmMessage={confirmDelete}
              />
            </>
          )}

          {idea.status === "PROMOTED" && !idea.purchaseId && (
            <>
              <IdeaActionButton
                action={promoteIdea}
                ideaId={idea.id}
                label="Promote"
                icon="promote"
                variant="solid-pine"
              />
              <IdeaActionButton
                action={deleteIdea}
                ideaId={idea.id}
                label="Delete"
                icon="delete"
                variant="outline-berry"
                confirmMessage={confirmDelete}
              />
            </>
          )}

          {idea.status === "DISCARDED" && (
            <>
              <IdeaActionButton
                action={restoreIdea}
                ideaId={idea.id}
                label="Restore"
                icon="restore"
                variant="outline-pine"
              />
              <IdeaActionButton
                action={deleteIdea}
                ideaId={idea.id}
                label="Delete"
                icon="delete"
                variant="outline-berry"
                confirmMessage={confirmDelete}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
