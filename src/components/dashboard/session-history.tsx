"use client";

import React from "react";
import type { Patient } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import FlagButton from "./flag-button";
import AIAnalysis from "./ai-analysis";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useFormattedDate } from "@/hooks/use-formatted-date";

type SessionHistoryProps = {
  patient: Patient;
};

const StatusIndicator = ({
  status,
}: {
  status: "Improvement" | "Stable" | "Decline";
}) => {
  const icon =
    status === "Improvement" ? (
      <ArrowUp className="h-4 w-4 text-green-500" />
    ) : status === "Decline" ? (
      <ArrowDown className="h-4 w-4 text-red-500" />
    ) : (
      <ArrowRight className="h-4 w-4 text-yellow-500" />
    );

  const color =
    status === "Improvement"
      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
      : status === "Decline"
      ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 border-0", color)}>
      {icon}
      {status}
    </Badge>
  );
};

const SessionRow = ({ session, patientId }: { session: import('@/lib/types').SessionWithRelations, patientId: string }) => {
  const formattedDate = useFormattedDate(session.createdAt, "MMMM d, yyyy");
  const formattedTime = useFormattedDate(session.createdAt, "h:mm a");

  return (
    <AccordionItem value={session.id} key={session.id}>
      <AccordionTrigger
        className={cn(
          "hover:no-underline rounded-lg px-4 -mx-4",
          session.isFlagged && "bg-destructive/10 hover:bg-destructive/20"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">
              {formattedDate}
            </span>
            <span className="text-muted-foreground">
              {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <StatusIndicator status={session.status as any} />
            <div className="text-right">
                <div className="font-semibold">{session.recoveryTrendScore}</div>
                <div className="text-xs text-muted-foreground">RTS</div>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Joint</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {session.rts.map((rts, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{rts.joint}</TableCell>
                        <TableCell className="text-right">{rts.score}%</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center px-4">
                <div className="text-xs text-muted-foreground">
                    Tx Hash: <span className="font-mono">{session.blockchain?.transactionHash.substring(0, 12)}...</span>
                </div>
                <div className="flex gap-2">
                    <AIAnalysis session={session as any} />
                    <FlagButton patientId={patientId} sessionId={session.id} isFlagged={session.isFlagged} />
                </div>
            </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default function SessionHistory({ patient }: SessionHistoryProps) {
  if (patient.sessions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        This patient has no session history.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {patient.sessions.map((session) => (
        <SessionRow key={session.id} session={session} patientId={patient.id} />
      ))}
    </Accordion>
  );
}
