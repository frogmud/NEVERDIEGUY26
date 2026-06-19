import { ReactNode } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Typography,
  CircularProgress,
  SxProps,
  Theme,
} from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: Record<string, ReactNode>[];
  loading?: boolean;
  emptyMessage?: string;
  sx?: SxProps<Theme>;
}

/**
 * DataTable - sortable data table with loading + empty states. Maps to the BONES
 * "DataTable" component (State=Default|Empty|Loading).
 */
export function DataTable({
  columns,
  rows,
  loading,
  emptyMessage = 'No items match your filters.',
  sx,
}: DataTableProps) {
  return (
    <Box
      sx={{
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: `${tokens.radius.md}px`,
        overflow: 'hidden',
        backgroundColor: tokens.colors.background.paper,
        ...sx,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableCell
                key={c.key}
                align={c.align}
                sx={{
                  color: tokens.colors.text.secondary,
                  fontWeight: 600,
                  borderColor: tokens.colors.border,
                }}
              >
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  align={c.align}
                  sx={{ color: tokens.colors.text.primary, borderColor: tokens.colors.border }}
                >
                  {row[c.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: tokens.colors.primary }} />
        </Box>
      )}
      {!loading && rows.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            {emptyMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
