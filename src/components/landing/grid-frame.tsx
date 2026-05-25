import { cn } from "@/lib/utils";

const gridMarkerClass =
  "pointer-events-none absolute z-10 size-[7px] border border-zinc-200 bg-background dark:border-zinc-700";

/** Corner squares aligned to a grid cell (works with uneven column widths / row heights). */
export function CellCornerMarkers({
  row,
  col,
  rowCount,
  colCount,
}: {
  row: number;
  col: number;
  rowCount: number;
  colCount: number;
}) {
  const lastRow = rowCount - 1;
  const lastCol = colCount - 1;

  return (
    <>
      <span
        className={cn(
          gridMarkerClass,
          "left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        )}
      />
      {col === lastCol && (
        <span
          className={cn(
            gridMarkerClass,
            "right-0 top-0 translate-x-1/2 -translate-y-1/2"
          )}
        />
      )}
      {row === lastRow && (
        <span
          className={cn(
            gridMarkerClass,
            "left-0 bottom-0 -translate-x-1/2 translate-y-1/2"
          )}
        />
      )}
      {row === lastRow && col === lastCol && (
        <span
          className={cn(
            gridMarkerClass,
            "right-0 bottom-0 translate-x-1/2 translate-y-1/2"
          )}
        />
      )}
    </>
  );
}

function buildGridPoints(columns: number, rows: number) {
  const xSteps = Array.from(
    { length: columns + 1 },
    (_, i) => (i / columns) * 100
  );
  const ySteps = Array.from({ length: rows + 1 }, (_, i) => (i / rows) * 100);

  return ySteps.flatMap((top) =>
    xSteps.map((left) => ({
      left: `${left}%`,
      top: `${top}%`,
    }))
  );
}

export function GridMarkers({
  columns,
  rows,
  className,
}: {
  columns: number;
  rows: number;
  className?: string;
}) {
  const points = buildGridPoints(columns, rows);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-10", className)}
      aria-hidden
    >
      {points.map((point, i) => (
        <span
          key={i}
          className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 border border-zinc-200 bg-background dark:border-zinc-700"
          style={{ left: point.left, top: point.top }}
        />
      ))}
    </div>
  );
}

export function OuterCornerMarkers() {
  const corner =
    "pointer-events-none absolute z-20 size-[7px] border border-zinc-200 bg-background dark:border-zinc-700";
  return (
    <>
      <span className={cn(corner, "-left-[3.5px] -top-[3.5px]")} />
      <span className={cn(corner, "-right-[3.5px] -top-[3.5px]")} />
      <span className={cn(corner, "-bottom-[3.5px] -left-[3.5px]")} />
      <span className={cn(corner, "-right-[3.5px] -bottom-[3.5px]")} />
    </>
  );
}
