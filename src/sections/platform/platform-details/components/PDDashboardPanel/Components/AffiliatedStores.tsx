import React from "react";
import { Card, Box, Typography, Grid, Avatar, Skeleton } from "@mui/material";
import { useLocale } from "locale";

interface PropsInterface {
  loading: boolean;
  countMonth?: number;
  countToday?: number;
  countWeek?: number;
}

const AffiliatedStores = ({
  loading,
  countMonth,
  countToday,
  countWeek,
}: PropsInterface) => {
  const { text } = useLocale();

  const cardData = [
    {
      label: text("affiliate_store_day"),
      count: countToday,
      text: text("affiliate_store_day_text"),
    },
    {
      label: text("affiliate_store_week"),
      count: countWeek,
      text: text("affiliate_store_week_text"),
    },
    {
      label: text("affiliate_store_month"),
      count: countMonth,
      text: text("affiliate_store_month_text"),
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        overflow: {
          sm: "scroll",
          md: "visible",
        },
      }}
    >
      <Grid
        container
        spacing={{xs: 2, sm:2, md: 4 }}
        sx={{
          maxWidth: "1000px",
          width: {
            sm: "100%",
            md: "800px",
          },
        }}
      >
        {!loading &&
          cardData.map(({ label, count, text }) => (
            <Grid item xs={12} sm={6} md={4} key={label}>
              <Card variant="outlined" >
                <Box
                  sx={{
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    columnGap: 2,
                  }}
                >
                  <Avatar>{label.charAt(0).toUpperCase()}</Avatar>
                  <Box>
                    <Typography variant="caption">{text}</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {count}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}

        {loading &&
          Array(3)
            .fill(0)
            .map((el) => (
              <Grid item xs={4} key={el}>
                <Skeleton variant="rectangular" height={75} />
              </Grid>
            ))}
      </Grid>
    </Box>
  );
};

export default AffiliatedStores;
