'use client'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import {
  Box,
  CircularProgress,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Stack,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import TuneIcon from '@mui/icons-material/Tune'
import AddIcon from '@mui/icons-material/Add'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import AddExpenseButton from '../_components/expense/AddExpenseButton'
import ExpenseDateCard from '../_components/expense/ExpenseDateCard'
import AddExpenseModal from '../_components/AddExpenseModal'
import { groupExpensesByDate } from '../_components/expense/groupByDate'
import CATEGORIES from '../staticData/category'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const FILTER_KEY = 'expense_filters'

const QUICK_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'Last month', value: 'Lastmonth' }
]

export default function ExpensePage () {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const isHydrated = useRef(false)
  const [activeQuick, setActiveQuick] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [fromDate, setFromDate] = useState(dayjs().startOf('month'))
  const [toDate, setToDate] = useState(dayjs().endOf('month'))

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expense')
      setExpenses(res.data.result || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async item => {
    try {
      await axios.delete(`/api/expense/${item.id}`)
      fetchExpenses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = async (id, values) => {
    await axios.put(`/api/expense/${id}`, values)
    fetchExpenses()
  }

  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY)
    if (saved) {
      const { search, fromDate, toDate, categories } = JSON.parse(saved)
      setSearch(search || '')
      setFromDate(fromDate ? dayjs(fromDate) : null)
      setToDate(toDate ? dayjs(toDate) : null)
      setSelectedCategories(categories || [])
    }
    isHydrated.current = true
  }, [])

  useEffect(() => {
    if (!isHydrated.current) return
    if (!search && !fromDate && !toDate && selectedCategories.length === 0) {
      localStorage.removeItem(FILTER_KEY)
      return
    }
    localStorage.setItem(
      FILTER_KEY,
      JSON.stringify({
        search,
        fromDate: fromDate ? fromDate.toISOString() : null,
        toDate: toDate ? toDate.toISOString() : null,
        categories: selectedCategories
      })
    )
  }, [search, fromDate, toDate, selectedCategories])

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleQuickRange = range => {
    const today = dayjs()
    setActiveQuick(range)
    setSelectedCategories([])
    if (range === 'today') {
      setFromDate(today)
      setToDate(today)
    } else if (range === 'yesterday') {
      const y = today.subtract(1, 'day')
      setFromDate(y)
      setToDate(y)
    } else if (range === 'week') {
      setFromDate(today.subtract(7, 'day'))
      setToDate(today)
    } else if (range === 'month') {
      setFromDate(today.startOf('month'))
      setToDate(today.endOf('month'))
    } else if (range === 'Lastmonth') {
      const lm = today.subtract(1, 'month')
      setFromDate(lm.startOf('month'))
      setToDate(lm.endOf('month'))
    }
  }

  const handleCategoryToggle = val => {
    setSelectedCategories(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    )
  }

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.expenseName
      .toLowerCase()
      .includes(search.toLowerCase())
    const expenseDate = dayjs(e.date).startOf('day')
    const from = fromDate ? dayjs(fromDate).startOf('day') : null
    const to = toDate ? dayjs(toDate).startOf('day') : null
    const inDateRange =
      (!from || expenseDate.isSameOrAfter(from)) &&
      (!to || expenseDate.isSameOrBefore(to))
    const category = e.category || 'other'
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(category)
    return matchesSearch && inDateRange && matchesCategory
  })

  const groupedData = groupExpensesByDate(filteredExpenses)
  const sortedGroupedData = [...groupedData].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  )
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const hasActiveFilters =
    search || fromDate || toDate || selectedCategories.length > 0

  const handleResetFilters = () => {
    setSearch('')
    setFromDate(null)
    setToDate(null)
    setSelectedCategories([])
    setActiveQuick(null)
    localStorage.removeItem(FILTER_KEY)
    setFilterOpen(false)
  }

  const getDateRangeLabel = () => {
    if (!fromDate && !toDate) return 'All time'
    if (fromDate && toDate) {
      if (dayjs(fromDate).isSame(dayjs(toDate), 'day'))
        return dayjs(fromDate).format('MMM D, YYYY')
      return `${dayjs(fromDate).format('MMM D')} – ${dayjs(toDate).format(
        'MMM D, YYYY'
      )}`
    }
    if (fromDate) return `From ${dayjs(fromDate).format('MMM D, YYYY')}`
    return `Until ${dayjs(toDate).format('MMM D, YYYY')}`
  }

  const getCategoryByValue = value =>
    CATEGORIES.find(cat => cat.value === value) ||
    CATEGORIES[CATEGORIES.length - 1]

  // Expenses matching search+date only (independent of category selection),
  // used to show a running total per category chip.
  const chipScopeExpenses = expenses.filter(e => {
    const matchesSearch = e.expenseName
      .toLowerCase()
      .includes(search.toLowerCase())
    const expenseDate = dayjs(e.date).startOf('day')
    const from = fromDate ? dayjs(fromDate).startOf('day') : null
    const to = toDate ? dayjs(toDate).startOf('day') : null
    return (
      matchesSearch &&
      (!from || expenseDate.isSameOrAfter(from)) &&
      (!to || expenseDate.isSameOrBefore(to))
    )
  })

  const categoryTotals = chipScopeExpenses.reduce((acc, e) => {
    const cat = e.category || 'other'
    acc[cat] = (acc[cat] || 0) + e.amount
    return acc
  }, {})

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8F7F4',
          pb: 8
        }}
      >
        {/* ─── Top Header Bar ─── */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid #ECEAE4',
            px: { xs: 2, sm: 3 },
            py: 2,
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <Box
            maxWidth='720px'
            mx='auto'
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Box display='flex' alignItems='center' gap={1.5}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  bgcolor: '#1A1A2E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ReceiptLongIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: '1.15rem',
                  fontWeight: 400,
                  color: '#1A1A2E',
                  letterSpacing: '-0.01em'
                }}
              >
                Expenses
              </Typography>
            </Box>

            <Stack direction='row' spacing={1} alignItems='center'>
              {/* Filter trigger */}
              <Button
                onClick={() => setFilterOpen(true)}
                variant='outlined'
                size='small'
                startIcon={<TuneIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  borderRadius: '8px',
                  border: '1px solid #DDDBD5',
                  color: '#555',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 1.5,
                  py: 0.6,
                  bgcolor: hasActiveFilters ? '#F0EDE6' : '#fff',
                  '&:hover': {
                    bgcolor: '#F0EDE6',
                    border: '1px solid #C8C5BE'
                  },
                  gap: 0.5
                }}
              >
                <Typography
                  component={'span'}
                  sx={{ display: { xs: 'none', sm: 'inline-block' } }}
                >
                  Filter
                </Typography>
                {hasActiveFilters && (
                  <Box
                    component='span'
                    sx={{
                      ml: 0.5,
                      bgcolor: '#1A1A2E',
                      color: '#fff',
                      borderRadius: '4px',
                      px: '5px',
                      py: '1px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      lineHeight: 1.5
                    }}
                  >
                    {[
                      search ? 1 : 0,
                      fromDate || toDate ? 1 : 0,
                      selectedCategories.length > 0 ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </Box>
                )}
              </Button>

              {/* Add button */}
              <Button
                onClick={() => setOpen(true)}
                variant='contained'
                size='small'
                startIcon={<AddIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  borderRadius: '8px',
                  bgcolor: '#1A1A2E',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: { xs: 0.5, sm: 1.5 },
                  py: 0.7,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#2E2E4A', boxShadow: 'none' }
                }}
              >
                <Typography
                  component={'span'}
                  sx={{ display: { xs: 'none', sm: 'inline-block' } }}
                >
                  Add
                </Typography>
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* ─── Summary Strip ─── */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid #ECEAE4',
            px: { xs: 2, sm: 3 },
            py: 1.5
          }}
        >
          <Box
            maxWidth='720px'
            mx='auto'
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            {/* Date range chip */}
            <Box
              display='flex'
              alignItems='center'
              gap={0.75}
              sx={{ cursor: 'pointer' }}
              onClick={() => setFilterOpen(true)}
            >
              <CalendarTodayIcon sx={{ fontSize: 13, color: '#888' }} />
              <Typography
                sx={{ fontSize: '0.78rem', color: '#777', fontWeight: 500 }}
              >
                {getDateRangeLabel()}
              </Typography>
              <ArrowDropDownIcon sx={{ fontSize: 16, color: '#aaa' }} />
            </Box>

            {/* Total */}
            <Box textAlign='right'>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1A1A2E',
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  letterSpacing: '-0.02em'
                }}
              >
                {totalAmount.toLocaleString()}
                <Typography
                  component='span'
                  sx={{
                    fontSize: '0.75rem',
                    color: '#999',
                    fontWeight: 400,
                    ml: 0.5
                  }}
                >
                  BDT
                </Typography>
              </Typography>
              <Typography
                sx={{ fontSize: '0.68rem', color: '#aaa', mt: -0.25 }}
              >
                {filteredExpenses.length} transaction
                {filteredExpenses.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>

       {/* ─── Category Quick Chips ─── */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderBottom: "1px solid #ECEAE4",
            px: { xs: 2, sm: 3 },
            py: 1.2,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box
            maxWidth="720px"
            mx="auto"
            display="flex"
            gap={0.75}
            sx={{ flexWrap: "nowrap" }}
          >
            <Chip
              label={
                <Stack alignItems="center" sx={{ py: 0.25 }}>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: selectedCategories.length === 0 ? 600 : 400, lineHeight: 1.2 }}>
                    All
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", opacity: 0.75, lineHeight: 1.2 }}>
                    {chipScopeExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                  </Typography>
                </Stack>
              }
              size="small"
              onClick={() => setSelectedCategories([])}
              sx={{
                height: "auto",
                bgcolor: selectedCategories.length === 0 ? "#1A1A2E" : "transparent",
                color: selectedCategories.length === 0 ? "#fff" : "#555",
                border: "1px solid",
                borderColor: selectedCategories.length === 0 ? "#1A1A2E" : "#DDDBD5",
                borderRadius: "6px",
                "& .MuiChip-label": { px: 1.2, py: 0.2 },
              }}
            />
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.value);
              const total = categoryTotals[cat.value] || 0;
              return (
                <Chip
                  key={cat.value}
                  label={
                    <Stack alignItems="center" sx={{ py: 0.25 }}>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: isSelected ? 600 : 400, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                        {cat.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", opacity: 0.75, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                        {total.toLocaleString()}
                      </Typography>
                    </Stack>
                  }
                  size="small"
                  onClick={() => handleCategoryToggle(cat.value)}
                  sx={{
                    height: "auto",
                    bgcolor: isSelected ? cat.color : "transparent",
                    color: isSelected ? "#fff" : "#555",
                    border: "1px solid",
                    borderColor: isSelected ? cat.color : "#DDDBD5",
                    borderRadius: "6px",
                    "& .MuiChip-label": { px: 1.2, py: 0.2 },
                    "&:hover": {
                      bgcolor: isSelected ? cat.color : `${cat.color}15`,
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
        {/* ─── Main Content ─── */}
        <Box maxWidth='720px' mx='auto' px={{ xs: 1, sm: 3 }} pt={3}>
          {loading ? (
            <Box display='flex' justifyContent='center' py={12}>
              <CircularProgress size={28} sx={{ color: '#1A1A2E' }} />
            </Box>
          ) : sortedGroupedData.length === 0 ? (
            <Box
              display='flex'
              flexDirection='column'
              alignItems='center'
              py={12}
              gap={2}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: '#ECEAE4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ReceiptLongIcon sx={{ color: '#aaa', fontSize: 26 }} />
              </Box>
              <Typography sx={{ color: '#aaa', fontSize: '0.875rem' }}>
                No expenses found for this period
              </Typography>
              {hasActiveFilters && (
                <Button
                  size='small'
                  onClick={handleResetFilters}
                  sx={{
                    color: '#1A1A2E',
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    textDecoration: 'underline'
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          ) : (
            <Stack spacing={2}>
              {sortedGroupedData.map(group => (
                <ExpenseDateCard
                  key={group.date}
                  data={group}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* ─── Filter Drawer / Dialog ─── */}
        <Dialog
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          fullWidth
          maxWidth='sm'
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.12)'
            }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
              pt: 2.5,
              px: 3
            }}
          >
            <Typography
              sx={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '1.15rem',
                fontWeight: 400,
                color: '#1A1A2E'
              }}
            >
              Filters
            </Typography>
            <IconButton
              onClick={() => setFilterOpen(false)}
              size='small'
              sx={{ color: '#aaa', '&:hover': { bgcolor: '#F0EDE6' } }}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ px: 3, py: 3, borderColor: '#ECEAE4' }}>
            <Stack spacing={3}>
              {/* Quick range */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#aaa',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    mb: 1.2
                  }}
                >
                  Quick range
                </Typography>
                <Stack direction='row' gap={0.75} flexWrap='wrap'>
                  {QUICK_RANGES.map(r => (
                    <Chip
                      key={r.value}
                      label={r.label}
                      clickable
                      onClick={() => handleQuickRange(r.value)}
                      size='small'
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: activeQuick === r.value ? 600 : 400,
                        bgcolor:
                          activeQuick === r.value ? '#1A1A2E' : 'transparent',
                        color: activeQuick === r.value ? '#fff' : '#555',
                        border: '1px solid',
                        borderColor:
                          activeQuick === r.value ? '#1A1A2E' : '#DDDBD5',
                        borderRadius: '7px',
                        height: 30,
                        '&:hover': {
                          bgcolor:
                            activeQuick === r.value ? '#2E2E4A' : '#F0EDE6'
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ borderColor: '#ECEAE4' }} />

              {/* Date range */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#aaa',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    mb: 1.5
                  }}
                >
                  Date range
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <DatePicker
                      label='From'
                      value={fromDate}
                      onChange={v => {
                        setFromDate(v)
                        setActiveQuick(null)
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                          }
                        }
                      }}
                    />
                    <DatePicker
                      label='To'
                      value={toDate}
                      onChange={v => {
                        setToDate(v)
                        setActiveQuick(null)
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                          }
                        }
                      }}
                    />
                  </Stack>
                </LocalizationProvider>
              </Box>

              <Divider sx={{ borderColor: '#ECEAE4' }} />

              {/* Search */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#aaa',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    mb: 1.2
                  }}
                >
                  Search
                </Typography>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='Search by name…'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon fontSize='small' sx={{ color: '#bbb' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Box>

              <Divider sx={{ borderColor: '#ECEAE4' }} />

              {/* Categories */}
              <Box>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  mb={1.2}
                >
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#aaa',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Categories
                  </Typography>
                  {selectedCategories.length > 0 && (
                    <Button
                      size='small'
                      onClick={() => setSelectedCategories([])}
                      sx={{
                        color: '#888',
                        textTransform: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        minWidth: 0,
                        p: '2px 6px',
                        '&:hover': { bgcolor: '#F0EDE6' }
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
                <Stack direction='row' gap={0.75} flexWrap='wrap'>
                  {CATEGORIES.map(cat => {
                    const isSelected = selectedCategories.includes(cat.value)
                    return (
                      <Chip
                        key={cat.value}
                        label={cat.label}
                        clickable
                        size='small'
                        onClick={() => handleCategoryToggle(cat.value)}
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 600 : 400,
                          bgcolor: isSelected ? cat.color : 'transparent',
                          color: isSelected ? '#fff' : '#555',
                          border: '1px solid',
                          borderColor: isSelected ? cat.color : '#DDDBD5',
                          borderRadius: '7px',
                          height: 30,
                          '& .MuiChip-icon': {
                            color: isSelected ? '#fff' : cat.color,
                            fontSize: 14
                          },
                          '&:hover': {
                            bgcolor: isSelected ? cat.color : `${cat.color}18`
                          }
                        }}
                      />
                    )
                  })}
                </Stack>
              </Box>

              {/* Summary box */}
              <Box
                sx={{
                  bgcolor: '#F8F7F4',
                  border: '1px solid #ECEAE4',
                  borderRadius: '10px',
                  p: 2
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#aaa',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    mb: 1.25
                  }}
                >
                  Summary
                </Typography>
                <Stack spacing={0.75}>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography sx={{ fontSize: '0.82rem', color: '#666' }}>
                      Transactions
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#1A1A2E'
                      }}
                    >
                      {filteredExpenses.length}
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography sx={{ fontSize: '0.82rem', color: '#666' }}>
                      Total
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#1A1A2E',
                        fontFamily: "'DM Serif Display', Georgia, serif"
                      }}
                    >
                      {totalAmount.toLocaleString()} BDT
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              gap: 1,
              borderTop: '1px solid #ECEAE4'
            }}
          >
            <Button
              onClick={handleResetFilters}
              sx={{
                color: '#888',
                textTransform: 'none',
                fontSize: '0.82rem',
                fontWeight: 500,
                borderRadius: '8px',
                px: 2,
                '&:hover': { bgcolor: '#F0EDE6' }
              }}
            >
              Reset all
            </Button>
            <Button
              variant='contained'
              onClick={() => setFilterOpen(false)}
              sx={{
                bgcolor: '#1A1A2E',
                color: '#fff',
                textTransform: 'none',
                fontSize: '0.82rem',
                fontWeight: 500,
                borderRadius: '8px',
                px: 3,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#2E2E4A', boxShadow: 'none' }
              }}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Modal */}
        <AddExpenseModal
          open={open}
          onClose={() => {
            setOpen(false)
            fetchExpenses()
          }}
        />
      </Box>
    </>
  )
}
