import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export function Animations() {
  return (
    <Box sx={{
      width: 300,
      margin: "auto",
      marginTop: "40px"
    }}>
      <Skeleton />
      <Skeleton animation="wave" />
      <Skeleton animation={false} />
    </Box>
  );
}