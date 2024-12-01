import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  GridRenderCellParams,
  useGridSelector,
  useGridApiContext,
  gridDetailPanelExpandedRowsContentCacheSelector,
} from '@mui/x-data-grid-pro';

export default function CustomDetailPanelToggle(props: Pick<GridRenderCellParams, 'id' | 'value'>) {
  const { id, value: isExpanded } = props;
  const apiRef = useGridApiContext();
  const contentCache:any = useGridSelector(apiRef, gridDetailPanelExpandedRowsContentCacheSelector);

  let hasDetail = false;
  try {
    const content = JSON.parse(contentCache[id]?.props?.row?.content);
    hasDetail = content?.dataChangedLogs?.length > 0;
  } catch (e) {
    return null;
    }

  if (!hasDetail) {
    return null; 
  }

  return (
    <IconButton
      size="small"
      tabIndex={-1}
      aria-label={isExpanded ? 'Close' : 'Open'}
    >
      <ExpandMoreIcon
        sx={{
          transform: `rotateZ(${isExpanded ? 0 : 270}deg)`,
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shortest,
            }),
        }}
        fontSize="inherit"
      />
    </IconButton>
  );
}
