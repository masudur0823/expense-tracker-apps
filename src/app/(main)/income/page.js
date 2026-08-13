'use client'
import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem
} from '@mui/material'
import ViewIncome from '@/app/_components/income/ViewIncome'
import axios from 'axios'

const categories = [
  'Salary',
  // "Business",
  'Freelancing',
  // "Investment",
  'Gift',
  'Other'
]

function Income () {
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    incomeName: '',
    amount: '',
    date: '',
    category: '',
    notes: ''
  })

  const handleChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }))
  }

  const handleSubmit = async () => {
    try {
      // Example API
      await axios.post('/api/income', formData)

      setOpen(false)

      setFormData({
        incomeName: '',
        amount: '',
        date: '',
        category: '',
        notes: ''
      })
    } catch (err) {
      console.error(err)
    } finally {
      window.location.reload() // Refresh the page after submission
    }
  }

  return (
    <Box p={3}>
      <Button variant='contained' onClick={() => setOpen(true)}>
        Add Income
      </Button>
      <ViewIncome />
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Add Income</DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <Grid container spacing={2} my={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Income Name'
                name='incomeName'
                value={formData.incomeName}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Amount'
                type='number'
                name='amount'
                value={formData.amount}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type='date'
                label='Date'
                name='date'
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label='Category'
                name='category'
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(item => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Notes'
                name='notes'
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>

          <Button variant='contained' onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Income
