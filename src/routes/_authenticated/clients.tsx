import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClients, useDeleteClient, useSaveClient, type Client } from "@/lib/app-data";

const TITLE = "Clients | Reach by MarketEra";
const DESCRIPTION = "Keep every client's contact details and payment history in one place.";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsPage,
});

type Draft = Partial<Client> & { name: string };

const EMPTY: Draft = { name: "", email: "", phone: "", company: "", address: "", notes: "" };

function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const saveClient = useSaveClient();
  const removeClient = useDeleteClient();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const rows = useMemo(
    () =>
      (clients ?? []).filter((c) =>
        `${c.name} ${c.email ?? ""} ${c.company ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [clients, query],
  );

  function openNew() {
    setDraft(EMPTY);
    setOpen(true);
  }

  function openEdit(client: Client) {
    setDraft(client);
    setOpen(true);
  }

  function save() {
    if (!draft.name.trim()) return toast.error("A client needs a name.");
    saveClient.mutate(draft, {
      onSuccess: () => {
        toast.success(draft.id ? "Client updated" : "Client added");
        setOpen(false);
      },
      onError: (error: unknown) =>
        toast.error(error instanceof Error ? error.message : "Could not save client"),
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Clients</h1>
          <p className="text-muted-foreground mt-1 text-sm">{DESCRIPTION}</p>
        </div>
        <Button variant="hero" onClick={openNew}>
          <Plus /> Add client
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="space-y-5 p-5 md:p-6">
          <Input
            placeholder="Search clients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-14 text-center">
              <span className="bg-secondary text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
                <Users className="h-6 w-6" />
              </span>
              <div className="max-w-sm space-y-1">
                <h2 className="font-semibold">No clients yet</h2>
                <p className="text-muted-foreground text-sm">
                  Add a client once and reuse them on every invoice and reminder.
                </p>
              </div>
              <Button variant="hero" onClick={openNew}>
                <Plus /> Add client
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-28" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-muted-foreground">{client.company ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{client.email ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{client.phone ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${client.name}`}
                          onClick={() => openEdit(client)}
                        >
                          <Pencil className="text-muted-foreground h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${client.name}`}
                          onClick={() =>
                            removeClient.mutate(client.id, {
                              onSuccess: () => toast.success("Client deleted"),
                            })
                          }
                        >
                          <Trash2 className="text-muted-foreground h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit client" : "Add client"}</DialogTitle>
            <DialogDescription>
              Contact details are used on invoices and in reminder messages.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Company" value={draft.company ?? ""} onChange={(v) => setDraft({ ...draft, company: v })} />
            <Field label="Email" type="email" value={draft.email ?? ""} onChange={(v) => setDraft({ ...draft, email: v })} />
            <Field label="Phone" value={draft.phone ?? ""} onChange={(v) => setDraft({ ...draft, phone: v })} />
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                rows={2}
                value={draft.address ?? ""}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Textarea
                id="client-notes"
                rows={2}
                value={draft.notes ?? ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={save} disabled={saveClient.isPending}>
              {draft.id ? "Save changes" : "Add client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
