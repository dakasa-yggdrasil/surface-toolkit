import { useMemo, useState, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TableSortLabel
} from "@mui/material";
import { EmptyState } from "./EmptyState";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: (row: T) => unknown;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  keyField: keyof T;
  pageSize?: number;
  emptyLabel?: string;
}

type Order = "asc" | "desc";

function renderCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value as ReactNode;
  return String(value);
}

export function DataTable<T>({ rows, columns, keyField, pageSize = 25, emptyLabel = "Nenhum registro" }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>("asc");

  const sorted = useMemo(() => {
    if (!sortBy) return rows;
    const col = columns.find((c) => c.id === sortBy);
    if (!col) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.accessor(a) as never;
      const bv = col.accessor(b) as never;
      if (av < bv) return order === "asc" ? -1 : 1;
      if (av > bv) return order === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, columns, sortBy, order]);

  const paged = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (rows.length === 0) {
    return <EmptyState title={emptyLabel} />;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableCell key={c.id}>
                {c.sortable ? (
                  <TableSortLabel
                    active={sortBy === c.id}
                    direction={sortBy === c.id ? order : "asc"}
                    onClick={() => {
                      if (sortBy === c.id) {
                        setOrder(order === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy(c.id);
                        setOrder("asc");
                      }
                    }}
                  >
                    {c.header}
                  </TableSortLabel>
                ) : (
                  c.header
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((row) => (
            <TableRow key={String(row[keyField])}>
              {columns.map((c) => (
                <TableCell key={c.id}>{renderCell(c.accessor(row))}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length > rowsPerPage ? (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      ) : null}
    </TableContainer>
  );
}
