"use client";

import { useMemo, useState } from "react";
import { InspectionTable } from "@/components/history/inspection-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInspectionStore } from "@/stores/useInspectionStore";
import type { FinalStatus } from "@/types/inspection";

export default function HistoryPage() {
  const history = useInspectionStore((s) => s.inspectionHistory);
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState("ALL");
  const [result, setResult] = useState<"ALL" | FinalStatus>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const products = useMemo(
    () => ["ALL", ...new Set(history.map((h) => h.product.name))],
    [history]
  );

  const filtered = useMemo(() => {
    return history
      .filter((item) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          item.id.toLowerCase().includes(q) ||
          item.product.name.toLowerCase().includes(q) ||
          (item.product.code ?? "").toLowerCase().includes(q);
        const matchesProduct = product === "ALL" || item.product.name === product;
        const matchesResult =
          result === "ALL" || item.finalDecision.finalStatus === result;
        const ts = new Date(item.timestamp).getTime();
        const matchesFrom = !from || ts >= new Date(from).getTime();
        const matchesTo = !to || ts <= new Date(to).getTime() + 86400000;
        return matchesSearch && matchesProduct && matchesResult && matchesFrom && matchesTo;
      })
      .sort((a, b) => {
        const d = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        return sortDir === "desc" ? -d : d;
      });
  }, [history, search, product, result, from, to, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs tracking-wide uppercase">
          Inspection History
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
          <Input
            placeholder="Search sample, product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="From date"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="To date"
          />
          <Select value={product} onValueChange={(v) => setProduct(String(v))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p} value={p}>
                  {p === "ALL" ? "All products" : p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={result}
            onValueChange={(v) => setResult(v as "ALL" | FinalStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All results</SelectItem>
              <SelectItem value="PASS">PASS</SelectItem>
              <SelectItem value="DEFECT">DEFECT</SelectItem>
              <SelectItem value="FAIL">FAIL</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortDir}
            onValueChange={(v) => setSortDir(v as "asc" | "desc")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <InspectionTable items={pageItems} />
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="font-data text-sm">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
