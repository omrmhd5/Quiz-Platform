import {
  badgeClassName,
  cn,
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableEmptyCellClassName,
  tableHeadCellClassName,
  tableHeadClassName,
  tableHeadRowClassName,
} from "@/lib/utils";

type DataTableProps = {
  columns: { key: string; label: string; className?: string }[];
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  colSpan?: number;
};

export function DataTable({
  columns,
  children,
  emptyMessage,
  isEmpty = false,
  colSpan,
}: DataTableProps) {
  const span = colSpan ?? columns.length;

  return (
    <table className={tableClassName}>
      <thead className={tableHeadClassName}>
        <tr className={tableHeadRowClassName}>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={cn(tableHeadCellClassName, column.className)}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={tableBodyClassName}>
        {isEmpty && emptyMessage ? (
          <tr>
            <td colSpan={span} className={tableEmptyCellClassName}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          children
        )}
      </tbody>
    </table>
  );
}

export function TableRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <tr className={cn("ui-table-row ui-table-body-row", className)}>
      {children}
    </tr>
  );
}

export function TableCell({
  className,
  children,
  colSpan,
}: {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn(tableCellClassName, className)}>
      {children}
    </td>
  );
}

export function StatusBadge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return <span className={cn(badgeClassName, className)}>{children}</span>;
}
