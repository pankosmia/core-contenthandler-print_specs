import { Stack, Typography } from "@mui/material";

export default function SectionDialog({ titleSection, children }) {
  return (
    <Stack spacing={1}>
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        {titleSection}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Stack>
  );
}
