import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  expandable?: (item: T) => React.ReactNode;
  getKey: (item: T) => string;
}

export function DataTable<T>({ data, columns, expandable, getKey }: DataTableProps<T>) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="border rounded-lg glow-cyan overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            {expandable && <TableHead className="w-8" />}
            {columns.map(col => (
              <TableHead key={col.key} className={`text-[10px] font-display uppercase tracking-widest text-muted-foreground ${col.className || ''}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(item => {
            const key = getKey(item);
            const isOpen = expanded.has(key);
            return (
              <>
                <TableRow
                  key={key}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => expandable && toggle(key)}
                >
                  {expandable && (
                    <TableCell className="w-8 p-2">
                      {isOpen ? <ChevronDown className="h-3 w-3 text-neon-cyan" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </TableCell>
                  )}
                  {columns.map(col => (
                    <TableCell key={col.key} className={`text-xs py-2.5 ${col.className || ''}`}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
                {expandable && isOpen && (
                  <TableRow key={`${key}-detail`} className="bg-muted/10">
                    <TableCell colSpan={columns.length + 1} className="p-4">
                      {expandable(item)}
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
