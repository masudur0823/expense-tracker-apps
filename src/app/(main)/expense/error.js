'use client';
// pages/_error.js
import * as React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

function Error({ statusCode }) {
  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        textAlign: 'center',
      }}>
      <Typography
        variant="h1"
        sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: 25, md: 45 } }}>
        An error occurred
      </Typography>
      <Typography variant="h5" sx={{ mb: 4 }}>
        {statusCode === 404
          ? 'The page you are looking for does not exist.'
          : 'Something went wrong on our end. Please try again later.'}
      </Typography>
      <Box>
        <Link href="/" passHref>
          <Button variant="contained" color="primary">
            Go Back Home
          </Button>
        </Link>
      </Box>
    </Container>
  );
}

export default Error;
